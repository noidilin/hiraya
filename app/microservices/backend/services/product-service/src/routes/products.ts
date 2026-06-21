import express from 'express';
import { query as defaultQuery } from '../database/connection';
import { ServiceResponse } from '../types';

export type QueryFn = (text: string, params?: any[]) => Promise<{ rows: any[]; rowCount?: number }>;

export interface ProductRouteDependencies {
  database?: {
    query: QueryFn;
  };
}

function failure(res: express.Response, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}

const SORT_COLUMNS: Record<string, string> = {
  created_at: 'p.created_at',
  updated_at: 'p.updated_at',
  name: 'p.name',
  price: 'p.price',
};

function getPagination(page: unknown, limit: unknown) {
  const parsedPage = Number(page);
  const parsedLimit = Number(limit);
  const pageNum = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limitNum = Number.isInteger(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 12;
  const offset = (pageNum - 1) * limitNum;

  return { pageNum, limitNum, offset };
}

export function createProductRoutes(dependencies: ProductRouteDependencies = {}): express.Router {
  const router: express.Router = express.Router();
  const dbQuery = dependencies.database?.query ?? defaultQuery;

  router.get('/', async (req, res) => {
    try {
      const {
        page = '1',
        limit = '12',
        sortBy = 'created_at',
        category,
        search,
        minPrice,
        maxPrice,
      } = req.query;

      const { pageNum, limitNum, offset } = getPagination(page, limit);
      const sortColumn = SORT_COLUMNS[String(sortBy)] ?? SORT_COLUMNS.created_at;

      let whereClause = 'WHERE 1=1';
      const filterParams: any[] = [];
      let paramIndex = 1;

      if (category) {
        whereClause += ' AND c.name = $' + paramIndex;
        filterParams.push(category);
        paramIndex++;
      }

      if (search) {
        whereClause += ' AND (p.name ILIKE $' + paramIndex + ' OR p.description ILIKE $' + (paramIndex + 1) + ')';
        filterParams.push(`%${search}%`, `%${search}%`);
        paramIndex += 2;
      }

      if (minPrice) {
        whereClause += ' AND p.price >= $' + paramIndex;
        filterParams.push(minPrice);
        paramIndex++;
      }

      if (maxPrice) {
        whereClause += ' AND p.price <= $' + paramIndex;
        filterParams.push(maxPrice);
        paramIndex++;
      }

      const countQuery = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereClause}`;
      const productsQuery = `
        SELECT p.id, p.name, p.description, p.price, p.compare_price, 
               p.brand, p.inventory_quantity, p.is_featured, p.created_at, p.updated_at,
               COALESCE(c.name, 'Uncategorized') as category,
               CASE 
                 WHEN p.name ILIKE '%prairie%' OR p.name ILIKE '%dress%' THEN '/product-images/1970s-prairie-midi-dress.jpg'
                 WHEN p.name ILIKE '%blazer%' OR p.name ILIKE '%wool%' THEN '/product-images/1980s-wool-blazer.jpg'
                 WHEN p.name ILIKE '%shoulder bag%' OR p.name ILIKE '%bag%' THEN '/product-images/1990s-leather-shoulder-bag.jpg'
                 WHEN p.name ILIKE '%art deco%' OR p.name ILIKE '%necklace%' THEN '/product-images/art-deco-pendant-necklace.jpg'
                 WHEN p.name ILIKE '%boots%' OR p.name ILIKE '%heel%' THEN '/product-images/suede-block-heel-boots.jpg'
                 ELSE '/product-images/placeholder.jpg'
               END as image_url
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ${whereClause}
        ORDER BY ${sortColumn}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const allParams = [...filterParams, limitNum, offset];

      const [countResult, productsResult] = await Promise.all([
        dbQuery(countQuery, filterParams),
        dbQuery(productsQuery, allParams),
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limitNum);

      const response = {
        success: true,
        data: {
          products: productsResult.rows,
          pagination: {
            currentPage: pageNum,
            totalPages,
            total,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1,
          },
        },
      };

      res.json(response);
    } catch (error: any) {
      console.error('Get products error:', error);
      failure(res, 500, 'Failed to get products');
    }
  });

  router.get('/categories', async (req, res) => {
    try {
      const result = await dbQuery(`
        SELECT c.*, COUNT(p.id) as product_count 
        FROM categories c 
        LEFT JOIN products p ON p.category_id = c.id 
        GROUP BY c.id, c.name, c.description, c.image_url
        ORDER BY c.name
      `);

      const response: ServiceResponse<any[]> = {
        success: true,
        data: result.rows,
      };

      res.json(response);
    } catch (error) {
      console.error('Get categories error:', error);
      failure(res, 500, 'Failed to get categories');
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await dbQuery(`
        SELECT p.id, p.name, p.description, p.price, p.compare_price, 
               p.brand, p.inventory_quantity, p.is_featured, p.created_at, p.updated_at,
               COALESCE(c.name, 'Uncategorized') as category,
               CASE 
                 WHEN p.name ILIKE '%prairie%' OR p.name ILIKE '%dress%' THEN '/product-images/1970s-prairie-midi-dress.jpg'
                 WHEN p.name ILIKE '%blazer%' OR p.name ILIKE '%wool%' THEN '/product-images/1980s-wool-blazer.jpg'
                 WHEN p.name ILIKE '%shoulder bag%' OR p.name ILIKE '%bag%' THEN '/product-images/1990s-leather-shoulder-bag.jpg'
                 WHEN p.name ILIKE '%art deco%' OR p.name ILIKE '%necklace%' THEN '/product-images/art-deco-pendant-necklace.jpg'
                 WHEN p.name ILIKE '%boots%' OR p.name ILIKE '%heel%' THEN '/product-images/suede-block-heel-boots.jpg'
                 ELSE '/product-images/placeholder.jpg'
               END as image_url
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return failure(res, 404, 'Product not found');
      }

      const response = {
        success: true,
        data: result.rows[0],
      };

      res.json(response);
    } catch (error) {
      console.error('Get product error:', error);
      failure(res, 500, 'Failed to get product');
    }
  });

  return router;
}

export const productRoutes = createProductRoutes();
