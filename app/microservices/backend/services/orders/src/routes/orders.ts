import express from 'express';
import axios from 'axios';
import { query as defaultQuery } from '../database/connection';
import { Address, CreateOrderRequest, Product, ServiceResponse } from '../types';

export type QueryFn = (text: string, params?: any[]) => Promise<{ rows: any[]; rowCount?: number }>;
export type ProductLookupFn = (productId: string) => Promise<Product | null>;

export interface OrderRouteDependencies {
  database?: {
    query: QueryFn;
  };
  products?: {
    getProduct: ProductLookupFn;
  };
}

const PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3003';

async function defaultGetProduct(productId: string): Promise<Product | null> {
  const productResponse = await axios.get(`${PRODUCTS_SERVICE_URL}/${productId}`, {
    timeout: Number(process.env.PRODUCTS_SERVICE_TIMEOUT_MS) || 2000,
    validateStatus: (status) => status === 200 || status === 404,
  });

  if (productResponse.status === 404) {
    return null;
  }

  return productResponse.data.data ?? null;
}

function money(value: unknown): string {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }

  return String(value);
}

function timestamp(value: unknown): string {
  return value instanceof Date ? value.toISOString() : String(value);
}

function parseItems(value: unknown): any[] {
  if (!value) {
    return [];
  }

  if (typeof value === 'string') {
    return JSON.parse(value);
  }

  return Array.isArray(value) ? value : [];
}

async function mapOrderDetail(order: any, items: any[], getProduct: ProductLookupFn) {
  const mappedItems = await Promise.all(
    items.map(async (item) => {
      const productId = item.productId ?? item.product_id;
      const product = item.product ?? (await getProduct(productId));

      return {
        id: item.id,
        orderId: item.orderId ?? item.order_id ?? order.id,
        productId,
        quantity: item.quantity,
        price: money(item.price),
        product,
      };
    })
  );

  return {
    id: order.id,
    userId: order.userId ?? order.user_id,
    items: mappedItems,
    totalAmount: money(order.totalAmount ?? order.total_amount),
    status: order.status,
    paymentStatus: order.paymentStatus ?? order.payment_status,
    createdAt: timestamp(order.createdAt ?? order.created_at),
    updatedAt: timestamp(order.updatedAt ?? order.updated_at),
  };
}

function mapOrderStatus(order: any) {
  return {
    id: order.id,
    userId: order.userId ?? order.user_id,
    totalAmount: money(order.totalAmount ?? order.total_amount),
    status: order.status,
    paymentStatus: order.paymentStatus ?? order.payment_status,
    createdAt: timestamp(order.createdAt ?? order.created_at),
    updatedAt: timestamp(order.updatedAt ?? order.updated_at),
  };
}

function failure(res: express.Response, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}

const ORDER_STATUSES = new Set(['pending', 'processing', 'shipped', 'delivered', 'cancelled']);

export function createOrderRoutes(dependencies: OrderRouteDependencies = {}): express.Router {
  const router: express.Router = express.Router();
  const dbQuery = dependencies.database?.query ?? defaultQuery;
  const getProduct = dependencies.products?.getProduct ?? defaultGetProduct;

  router.post('/', async (req, res) => {
    try {
      // Demo mode - use a fixed user ID or get from request
      const { items, shippingAddress, userId = 'demo-user-id' } = req.body as CreateOrderRequest & { userId?: string };

      if (!Array.isArray(items) || items.length === 0) {
        return failure(res, 400, 'Order requires at least one item');
      }

      let totalAmount = 0;
      const orderItems: any[] = [];

      for (const item of items) {
        const quantity = Number(item.quantity);

        if (!item.productId || !Number.isInteger(quantity) || quantity <= 0) {
          return failure(res, 400, 'Order items require a productId and positive integer quantity');
        }

        const product = await getProduct(item.productId);

        if (!product) {
          return failure(res, 400, 'Product not found');
        }

        const productPrice = Number(product.price);
        if (!Number.isFinite(productPrice) || productPrice < 0) {
          return failure(res, 502, 'Invalid product price');
        }

        totalAmount += productPrice * quantity;

        orderItems.push({
          product_id: item.productId,
          quantity,
          price: product.price,
          product,
        });
      }

      const result = await dbQuery(`
        INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `, [userId, totalAmount.toFixed(2), 'pending', JSON.stringify(shippingAddress as Address), 'pending']);

      const order = result.rows[0];

      const insertedItems: any[] = [];
      for (const item of orderItems) {
        const itemResult = await dbQuery(`
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `, [order.id, item.product_id, item.quantity, item.price]);
        insertedItems.push({ ...item, id: itemResult.rows[0].id });
      }

      const response: ServiceResponse = {
        success: true,
        data: await mapOrderDetail(order, insertedItems, getProduct),
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ success: false, error: 'Failed to create order' });
    }
  });

  router.get('/my-orders', async (req, res) => {
    try {
      // Demo mode - use a fixed user ID or get from query
      const userId = req.query.userId as string || 'demo-user-id';

      const result = await dbQuery(`
        SELECT o.*,
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'id', oi.id,
                   'orderId', o.id,
                   'productId', oi.product_id,
                   'quantity', oi.quantity,
                   'price', oi.price
                 )
               ) FILTER (WHERE oi.id IS NOT NULL) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = $1
        GROUP BY o.id, o.user_id, o.total_amount, o.status, o.shipping_address, o.payment_status, o.created_at, o.updated_at
        ORDER BY o.created_at DESC
      `, [userId]);

      const orders = await Promise.all(
        result.rows.map((order: any) => mapOrderDetail(order, parseItems(order.items), getProduct))
      );

      const response: ServiceResponse = {
        success: true,
        data: { orders },
      };

      res.json(response);
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ success: false, error: 'Failed to get orders' });
    }
  });

  router.patch('/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      const { id } = req.params;

      if (!ORDER_STATUSES.has(status)) {
        return failure(res, 400, 'Invalid order status');
      }

      const result = await dbQuery(
        'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, id]
      );

      if (result.rows.length === 0) {
        return failure(res, 404, 'Order not found');
      }

      const response: ServiceResponse = {
        success: true,
        data: mapOrderStatus(result.rows[0]),
      };

      res.json(response);
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ success: false, error: 'Failed to update order status' });
    }
  });

  return router;
}

export const orderRoutes = createOrderRoutes();
