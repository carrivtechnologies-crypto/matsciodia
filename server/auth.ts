import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// --- Extend express-session type so `req.session.user` can include an id ---
declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      email?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      role?: "super_admin" | "teacher" | "sales" | "support" | null;
      profileImageUrl?: string | null;
    };
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Simple authentication middleware for development
  app.use((req, res, next) => {
    if (!req.session.user && process.env.NODE_ENV === "development") {
      req.session.user = {
        id: "dev-user",
        email: "dev@example.com",
        firstName: "Development",
        lastName: "User",
        role: "super_admin",
      };
    }
    next();
  });
}

export function isAuthenticated(req: any, res: any, next: any) {
  if (req.session.user) {
    req.user = req.session.user;
    next();
  } else {
    res.status(401).json({ message: "Authentication required" });
  }
}

export async function login(req: any, res: any) {
  try {
    const { email, password } = req.body;

    if (process.env.NODE_ENV === "development") {
      // storage.upsertUser type likely didn't have "id", so extend it here
      const user = await storage.upsertUser({
        id: "dev-user",
        email: email || "dev@example.com",
        firstName: "Development",
        lastName: "User",
        role: "super_admin",
      } as any); // 👈 if your storage type still doesn't allow "id"

      req.session.user = user;
      res.json({ user });
    } else {
      res
        .status(501)
        .json({ message: "Authentication not implemented for production" });
    }
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
}

export async function logout(req: any, res: any) {
  req.session.destroy((err: any) => {
    if (err) {
      res.status(500).json({ message: "Logout failed" });
    } else {
      res.json({ message: "Logged out successfully" });
    }
  });
}
