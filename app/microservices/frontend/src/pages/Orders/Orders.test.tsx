import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import { AuthProvider } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import apiClient from '../../services/api';
import Orders from './Orders';

vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

vi.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
  },
}));

vi.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => <div>Redirected to {to}</div>,
  useLocation: () => ({ pathname: '/orders' }),
  useNavigate: () => vi.fn(),
}));

const mockedAuthService = vi.mocked(authService);
const mockedApiClient = vi.mocked(apiClient);

const demoUser = {
  id: 'f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6',
  email: 'demo@hirayavintage.test',
  firstName: 'Demo',
  lastName: 'User',
  role: 'customer' as const,
  createdAt: '2026-02-07T13:04:03.836Z',
  updatedAt: '2026-02-07T13:04:03.836Z',
};

const orderEnvelope = {
  success: true,
  data: {
    orders: [
      {
        id: '8d46347c-43db-4f01-b6c7-d5d3288f0ecb',
        userId: demoUser.id,
        status: 'delivered',
        totalAmount: '402.00',
        paymentStatus: 'paid',
        createdAt: '2026-02-14T10:22:31.000Z',
        updatedAt: '2026-02-16T15:12:04.000Z',
        items: [
          {
            id: 'b9460644-95f4-47ac-853d-9579ac793f0b',
            orderId: '8d46347c-43db-4f01-b6c7-d5d3288f0ecb',
            productId: '4ee72b27-86fb-47c1-8212-74fbe0b4a7ae',
            quantity: 2,
            price: '201.00',
            product: {
              id: '4ee72b27-86fb-47c1-8212-74fbe0b4a7ae',
              name: 'Vintage Wool Coat',
              description: 'A warm wool coat from the 1970s.',
              price: '201.00',
              image_url: '/product-images/vintage-wool-coat.jpg',
              category: 'Outerwear',
              inventory_quantity: 4,
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-02T00:00:00.000Z',
            },
          },
        ],
      },
    ],
  },
};

const renderAuthenticatedOrdersRoute = () => {
  localStorage.setItem('accessToken', 'demo-access-token');
  mockedAuthService.getCurrentUser.mockResolvedValueOnce(demoUser);

  render(
    <AuthProvider>
      <ProtectedRoute>
        <Orders />
      </ProtectedRoute>
    </AuthProvider>
  );
};

describe('Orders route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders a clear empty state from an empty order-history envelope', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: { success: true, data: { orders: [] } },
    });

    renderAuthenticatedOrdersRoute();

    expect(await screen.findByRole('heading', { name: /my orders/i })).toBeInTheDocument();
    expect(screen.getByText(/0 orders/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /you haven't placed any orders yet/i })).toBeInTheDocument();
    expect(mockedApiClient.get).toHaveBeenCalledWith('/orders/my-orders');
  });

  it('renders a non-empty order state from normalized enveloped order data', async () => {
    mockedApiClient.get.mockResolvedValueOnce({ data: orderEnvelope });

    renderAuthenticatedOrdersRoute();

    expect(await screen.findByText('Order #288f0ecb')).toBeInTheDocument();
    expect(screen.getByText(/1 order/i)).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
    expect(screen.getAllByText('$402.00')).toHaveLength(2);

    const orderItems = screen.getByRole('button', { name: /1 item \$402\.00/i });
    expect(orderItems).toBeInTheDocument();
    expect(within(orderItems).getByText(/1 item/i)).toBeInTheDocument();
  });
});
