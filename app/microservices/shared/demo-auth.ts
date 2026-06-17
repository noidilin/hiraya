// Demo middleware - no authentication required
export const demoAuth = (req: any, res: any, next: any) => {
  // Set a demo user for all requests
  req.user = {
    id: 'demo-user-id',
    email: 'demo@hirayavintage.test',
    firstName: 'Demo',
    lastName: 'User',
    role: 'customer'
  };
  next();
};

export const requireAuth = demoAuth; // Alias for consistency