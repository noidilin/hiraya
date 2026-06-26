// Demo middleware - no authentication required
export const demoAuth = (req: any, res: any, next: any) => {
  // Set a demo user for all requests
  req.user = {
    id: 'f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6',
    email: 'demo@hirayavintage.test',
    firstName: 'Demo',
    lastName: 'User',
    role: 'customer'
  };
  next();
};

export const requireAuth = demoAuth; // Alias for consistency