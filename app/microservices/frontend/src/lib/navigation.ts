import { Archive, Home, Info, ReceiptText, ShoppingBag, UserRound } from 'lucide-react';

export const primaryNavigation = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Archive', to: '/products', icon: Archive },
  { label: 'Manifesto', to: '/manifesto', icon: Info },
] as const;

export const utilityNavigation = [
  { label: 'Orders', to: '/orders', icon: ReceiptText },
  { label: 'Cart', to: '/cart', icon: ShoppingBag },
  { label: 'Account', to: '/auth', icon: UserRound },
] as const;
