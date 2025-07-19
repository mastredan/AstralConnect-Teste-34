import type { Express, RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { insertUserSchema } from "@shared/schema";

// Login schema
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// Registration schema for OrLev
const registrationSchema = z.object({
  fullName: z.string().min(2, "Nome completo deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  denomination: z.string().min(1, "Denominação é obrigatória"),
});

// Authentication system
export function setupSimpleAuth(app: Express) {
  // Basic session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-orlev-2024',
    resave: false,
    saveUninitialized: false,
    name: 'orlev-session',
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    }
  }));

  // Registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registrationSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Usuário já existe com este email" });
      }

      // Create user ID from email
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const newUser = await storage.upsertUser({
        id: userId,
        email: validatedData.email,
        password: hashedPassword,
        fullName: validatedData.fullName,
        birthDate: validatedData.birthDate,
        city: validatedData.city,
        state: validatedData.state,
        denomination: validatedData.denomination,
        profileImageUrl: null,
      });

      // Store user in session (without password)
      const userWithoutPassword = { ...newUser };
      delete userWithoutPassword.password;
      (req.session as any).user = userWithoutPassword;
      
      res.json({ message: "Conta criada com sucesso", user: userWithoutPassword });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user in database
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Email ou senha incorretos" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Email ou senha incorretos" });
      }

      // Store user in session (without password)
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      (req.session as any).user = userWithoutPassword;
      
      // Save session explicitly
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
        }
      });
      
      res.json({ message: "Login realizado com sucesso", user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos" });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // User endpoint for getting current user
  app.get('/api/auth/user', (req: any, res) => {
    if (!(req.session as any).user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json((req.session as any).user);
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

// Helper function to calculate zodiac sign
function calculateZodiacSign(birthDate: string): string {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const signs = [
    { name: "Capricórnio", start: [12, 22], end: [1, 19] },
    { name: "Aquário", start: [1, 20], end: [2, 18] },
    { name: "Peixes", start: [2, 19], end: [3, 20] },
    { name: "Áries", start: [3, 21], end: [4, 19] },
    { name: "Touro", start: [4, 20], end: [5, 20] },
    { name: "Gêmeos", start: [5, 21], end: [6, 20] },
    { name: "Câncer", start: [6, 21], end: [7, 22] },
    { name: "Leão", start: [7, 23], end: [8, 22] },
    { name: "Virgem", start: [8, 23], end: [9, 22] },
    { name: "Libra", start: [9, 23], end: [10, 22] },
    { name: "Escorpião", start: [10, 23], end: [11, 21] },
    { name: "Sagitário", start: [11, 22], end: [12, 21] },
  ];

  for (const sign of signs) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;
    
    if (
      (month === startMonth && day >= startDay) ||
      (month === endMonth && day <= endDay)
    ) {
      return sign.name;
    }
  }
  
  return "Capricórnio"; // Default fallback
}