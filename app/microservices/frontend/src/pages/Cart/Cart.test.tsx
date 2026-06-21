import { describe, expect, it } from 'vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '../../contexts/CartContext';
import { Product } from '../../types';
import Cart from './Cart';

const demoProduct: Product = {
  id: 'vintage-bag-1',
  name: '1990s Leather Shoulder Bag',
  description: 'A structured vintage leather shoulder bag.',
  price: 120,
  imageUrl: '/product-images/1990s-leather-shoulder-bag.jpg',
  category: 'Accessories',
  inventory: 3,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const CartSeeder = () => {
  const { addItem } = useCart();

  return <button onClick={() => addItem(demoProduct)}>Add demo item</button>;
};

const renderCartScenario = () => {
  render(
    <CartProvider>
      <CartSeeder />
      <Cart />
    </CartProvider>
  );
};

describe('Cart', () => {
  it('updates quantities and totals, then clears to an empty state', () => {
    renderCartScenario();

    userEvent.click(screen.getByRole('button', { name: /add demo item/i }));

    expect(screen.getByRole('heading', { name: /shopping cart/i })).toBeInTheDocument();
    expect(screen.getByText(/1 item in your cart/i)).toBeInTheDocument();
    expect(screen.getByText('$120.00 each')).toBeInTheDocument();
    expect(screen.getByText('$144.60')).toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: /increase quantity for 1990s leather shoulder bag/i }));

    expect(screen.getByText(/2 items in your cart/i)).toBeInTheDocument();
    expect(screen.getByText('$274.20')).toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: /decrease quantity for 1990s leather shoulder bag/i }));

    expect(screen.getByText(/1 item in your cart/i)).toBeInTheDocument();
    expect(screen.getByText('$144.60')).toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: /clear cart/i }));

    expect(screen.getByRole('heading', { name: /your cart is empty/i })).toBeInTheDocument();
    expect(screen.getByText(/looks like you haven't added any products/i)).toBeInTheDocument();
  });

  it('presents checkout as coming soon without navigating to a missing route', () => {
    renderCartScenario();

    userEvent.click(screen.getByRole('button', { name: /add demo item/i }));

    const summary = screen.getByRole('region', { name: /order summary/i });
    const checkoutButton = within(summary).getByRole('button', { name: /checkout coming soon/i });

    expect(checkoutButton).toBeDisabled();
    expect(screen.getByText(/checkout is coming soon/i)).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /shopping cart/i })).toBeInTheDocument();
  });
});
