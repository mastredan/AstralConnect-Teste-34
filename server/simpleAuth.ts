import type { Express, RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage";

// Simple authentication system for development
export function setupSimpleAuth(app: Express) {
  // Basic session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Mock login endpoint for development
  app.get('/api/login', (req, res) => {
    // Create a mock user for development
    const mockUser = {
      id: 'dev-user-123',
      email: 'dev@example.com',
      firstName: 'Dev',
      lastName: 'User',
      profileImageUrl: 'https://via.placeholder.com/150'
    };

    // Store user in session
    (req.session as any).user = mockUser;
    
    // Store user in database
    storage.upsertUser(mockUser);
    
    res.redirect('/');
  });

  // Logout endpoint
  app.get('/api/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });
}

// Simple authentication middleware
export const isAuthenticated: RequestHandler = (req, res, next) => {
  const user = (req.session as any)?.user;
  
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Add user to request object
  (req as any).user = { claims: { sub: user.id } };
  next();
};