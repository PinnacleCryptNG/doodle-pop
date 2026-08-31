import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import os from "os";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fullstack-notes-app-secret-key-2026";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_URL.startsWith("http") &&
  SUPABASE_ANON_KEY.length > 10
);

// Fallback embedded persistent store when Supabase env variables are not yet entered
export interface UserRecord {
  id: string;
  email: string;
  name?: string;
  passwordHash: string;
  emailVerified?: boolean;
  verificationCode?: string;
  verificationExpiresAt?: number;
  createdAt: string;
}

export interface NoteRecord {
  id: string;
  user_id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  color_tag: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

function getFallbackDataFilePath(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), ".local_notes_db.json");
  }
  return path.join(process.cwd(), ".local_notes_db.json");
}

const FALLBACK_DATA_FILE = getFallbackDataFilePath();

interface FallbackDatabase {
  users: Record<string, UserRecord>;
  notes: Record<string, NoteRecord>;
}

let fallbackDb: FallbackDatabase = {
  users: {},
  notes: {},
};

function loadFallbackDb() {
  try {
    if (fs.existsSync(FALLBACK_DATA_FILE)) {
      const data = fs.readFileSync(FALLBACK_DATA_FILE, "utf-8");
      fallbackDb = JSON.parse(data);
    }
  } catch (err) {
    console.warn("Could not load local fallback database file, using in-memory store:", err);
  }
}

function saveFallbackDb() {
  try {
    fs.writeFileSync(FALLBACK_DATA_FILE, JSON.stringify(fallbackDb, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not save local fallback database file:", err);
  }
}

loadFallbackDb();

// Initialize master Supabase client if available
let supabaseAdmin: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  try {
    supabaseAdmin = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
    console.log("Connected to Supabase backend at:", SUPABASE_URL);
  } catch (err) {
    console.error("Failed to initialize Supabase client, falling back to local engine:", err);
  }
} else {
  console.log("Running with server-side secure fallback database. Add SUPABASE_URL & SUPABASE_ANON_KEY to .env to connect to live Supabase.");
}

// User context attached to authenticated requests
export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  supabaseToken?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// Authentication middleware
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith("Bearer "))
    ? authHeader.substring(7)
    : req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // 1. Try Supabase verification if configured
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data?.user) {
        req.user = {
          id: data.user.id,
          email: data.user.email || "",
          supabaseToken: token,
        };
        return next();
      }
    } catch (e) {
      // If token is a JWT from fallback or invalid supabase token, proceed to local JWT verify
    }
  }

  // 2. Verify local JWT token
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name?: string };
    if (decoded && decoded.id) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
      };
      return next();
    }
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session token" });
  }

  return res.status(401).json({ error: "Unauthorized access" });
}

export function createServerApp() {
  const app = express();

  app.use(express.json({ limit: "5mb" }));
  app.use(cookieParser());

  // Health check & environment status
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      backend: isSupabaseConfigured ? "supabase" : "local-embedded",
      supabaseConfigured: isSupabaseConfigured,
      time: new Date().toISOString(),
    });
  });

  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================

  // Sign up
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, fullName } = req.body;
      if (!email || !password || typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanName = typeof fullName === "string" ? fullName.trim() : "";
      if (!cleanEmail.includes("@") || cleanEmail.length < 5) {
        return res.status(400).json({ error: "Please enter a valid email address" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }

      // If Supabase is configured, use Supabase Auth
      if (isSupabaseConfigured && supabaseAdmin) {
        const { data, error } = await supabaseAdmin.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              full_name: cleanName,
            },
          },
        });

        if (error) {
          return res.status(400).json({ error: error.message });
        }

        if (data.user) {
          if (data.session) {
            const token = data.session.access_token;
            res.cookie("token", token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            return res.status(201).json({
              user: { id: data.user.id, email: cleanEmail, name: cleanName },
              token,
              requiresVerification: false,
              message: "Account created successfully",
            });
          } else {
            return res.status(201).json({
              requiresVerification: true,
              email: cleanEmail,
              message: "Please confirm your email address to complete registration.",
            });
          }
        }
      }

      // Fallback local auth engine
      const existingUser = Object.values(fallbackDb.users).find((u) => u.email === cleanEmail);
      if (existingUser) {
        if (existingUser.emailVerified) {
          return res.status(400).json({ error: "An account with this email already exists" });
        } else {
          // Unverified user signing up again - update password and generate new code
          const salt = await bcrypt.genSalt(10);
          existingUser.passwordHash = await bcrypt.hash(password, salt);
          existingUser.name = cleanName || existingUser.name;
          const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
          existingUser.verificationCode = verificationCode;
          existingUser.verificationExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
          saveFallbackDb();

          console.log(`[Email Confirmation Code for ${cleanEmail}]: ${verificationCode}`);

          return res.status(200).json({
            success: true,
            requiresVerification: true,
            email: cleanEmail,
            verificationCode,
            message: "A 6-digit confirmation code has been sent to your email address. Please enter it to complete account creation.",
          });
        }
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      const newUser: UserRecord = {
        id: userId,
        email: cleanEmail,
        name: cleanName || undefined,
        passwordHash,
        emailVerified: false,
        verificationCode,
        verificationExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
        createdAt: new Date().toISOString(),
      };

      fallbackDb.users[userId] = newUser;
      saveFallbackDb();

      console.log(`[Email Confirmation Code for ${cleanEmail}]: ${verificationCode}`);

      return res.status(201).json({
        success: true,
        requiresVerification: true,
        email: cleanEmail,
        verificationCode,
        message: "A 6-digit confirmation code has been sent to your email address. Please enter it to confirm your email and complete account creation.",
      });
    } catch (err: any) {
      console.error("Signup error:", err);
      return res.status(500).json({ error: err.message || "Internal server error during registration" });
    }
  });

  // Verify Email with 6-digit code
  app.post("/api/auth/verify-email", async (req: Request, res: Response) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ error: "Email and verification code are required" });
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanCode = String(code).trim();

      // If Supabase configured
      if (isSupabaseConfigured && supabaseAdmin) {
        const client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
        const { data, error } = await client.auth.verifyOtp({
          email: cleanEmail,
          token: cleanCode,
          type: "signup",
        });

        if (error) {
          return res.status(400).json({ error: error.message });
        }

        if (data.session && data.user) {
          const token = data.session.access_token;
          res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });

          return res.json({
            success: true,
            user: { id: data.user.id, email: cleanEmail },
            token,
            message: "Email confirmed successfully! Your account is now active.",
          });
        }
      }

      // Local engine
      const user = Object.values(fallbackDb.users).find((u) => u.email === cleanEmail);
      if (!user) {
        return res.status(404).json({ error: "User not found with this email" });
      }

      if (user.emailVerified) {
        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
          expiresIn: "7d",
        });
        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({
          success: true,
          user: { id: user.id, email: user.email, name: user.name },
          token,
          message: "Email already verified. You are now signed in.",
        });
      }

      // Verify code
      if (!user.verificationCode || user.verificationCode !== cleanCode) {
        return res.status(400).json({ error: "Invalid verification code. Please check your code and try again." });
      }

      if (user.verificationExpiresAt && Date.now() > user.verificationExpiresAt) {
        return res.status(400).json({ error: "Verification code has expired. Please request a new code." });
      }

      user.emailVerified = true;
      user.verificationCode = undefined;
      user.verificationExpiresAt = undefined;
      saveFallbackDb();

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name },
        token,
        message: "Email confirmed successfully! Your account is now active.",
      });
    } catch (err: any) {
      console.error("Verify email error:", err);
      return res.status(500).json({ error: err.message || "Failed to verify email" });
    }
  });

  // Resend confirmation code
  app.post("/api/auth/resend-code", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const cleanEmail = email.trim().toLowerCase();

      if (isSupabaseConfigured && supabaseAdmin) {
        const client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
        const { error } = await client.auth.resend({
          type: "signup",
          email: cleanEmail,
        });

        if (error) {
          return res.status(400).json({ error: error.message });
        }

        return res.json({
          success: true,
          email: cleanEmail,
          message: "A new confirmation email has been sent.",
        });
      }

      const user = Object.values(fallbackDb.users).find((u) => u.email === cleanEmail);
      if (!user) {
        return res.status(404).json({ error: "Account not found with this email" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ error: "This email address is already confirmed. Please sign in." });
      }

      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationCode = newCode;
      user.verificationExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
      saveFallbackDb();

      console.log(`[Resent Email Confirmation Code for ${cleanEmail}]: ${newCode}`);

      return res.json({
        success: true,
        email: cleanEmail,
        verificationCode: newCode,
        message: "A new 6-digit confirmation code has been sent to your email.",
      });
    } catch (err: any) {
      console.error("Resend code error:", err);
      return res.status(500).json({ error: err.message || "Failed to resend confirmation code" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const cleanEmail = email.trim().toLowerCase();

      // If Supabase configured, verify via Supabase
      if (isSupabaseConfigured && supabaseAdmin) {
        const client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
        const { data, error } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (error) {
          if (error.message.toLowerCase().includes("email not confirmed")) {
            return res.status(403).json({
              error: "Please confirm your email address first before signing in.",
              requiresVerification: true,
              email: cleanEmail,
            });
          }
          return res.status(401).json({ error: error.message });
        }

        if (data.user && data.session) {
          const token = data.session.access_token;
          res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });

          return res.json({
            user: { id: data.user.id, email: cleanEmail },
            token,
            message: "Logged in successfully",
          });
        }
      }

      // Fallback local auth engine
      const user = Object.values(fallbackDb.users).find((u) => u.email === cleanEmail);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      if (user.emailVerified === false) {
        if (!user.verificationCode) {
          user.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
          user.verificationExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
          saveFallbackDb();
        }

        return res.status(403).json({
          error: "Please confirm your email address first to activate your account.",
          requiresVerification: true,
          email: cleanEmail,
          verificationCode: user.verificationCode,
        });
      }

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        user: { id: user.id, email: user.email, name: user.name },
        token,
        message: "Logged in successfully",
      });
    } catch (err: any) {
      console.error("Login error:", err);
      return res.status(500).json({ error: err.message || "Internal server error during login" });
    }
  });

  // Get current user session
  app.get("/api/auth/me", authenticateToken, (req: Request, res: Response) => {
    const localUser = fallbackDb.users[req.user!.id];
    res.json({
      user: {
        id: req.user!.id,
        email: req.user!.email,
        name: req.user!.name || localUser?.name,
      },
      backend: isSupabaseConfigured ? "supabase" : "local-embedded",
    });
  });

  // Logout
  app.post("/api/auth/logout", (_req: Request, res: Response) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  });

  // ==========================================
  // NOTES CRUD ENDPOINTS (Strict User Isolation)
  // ==========================================

  function getUserSupabaseClient(req: Request) {
    if (!isSupabaseConfigured) return null;
    const token = req.user?.supabaseToken;
    return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    });
  }

  // 1. GET ALL NOTES
  app.get("/api/notes", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      if (isSupabaseConfigured) {
        const client = getUserSupabaseClient(req) || supabaseAdmin!;
        const { data, error } = await client
          .from("notes")
          .select("*")
          .eq("user_id", userId)
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase select error:", error);
        } else if (data) {
          return res.json({ notes: data });
        }
      }

      const userNotes = Object.values(fallbackDb.notes)
        .filter((n) => n.user_id === userId)
        .sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) {
            return a.is_pinned ? -1 : 1;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      return res.json({ notes: userNotes });
    } catch (err: any) {
      console.error("Fetch notes error:", err);
      return res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  // 2. CREATE A NOTE
  app.post("/api/notes", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { title = "", body = "", is_pinned = false, color_tag = "default", tags = [] } = req.body;

      const now = new Date().toISOString();
      const newNoteData: NoteRecord = {
        id: req.body.id || `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        user_id: userId,
        title: typeof title === "string" ? title : "",
        body: typeof body === "string" ? body : "",
        is_pinned: Boolean(is_pinned),
        color_tag: typeof color_tag === "string" ? color_tag : "default",
        tags: Array.isArray(tags) ? tags : [],
        created_at: req.body.created_at || now,
        updated_at: now,
      };

      if (isSupabaseConfigured) {
        const client = getUserSupabaseClient(req) || supabaseAdmin!;
        const { data, error } = await client
          .from("notes")
          .insert([newNoteData])
          .select()
          .single();

        if (error) {
          console.error("Supabase insert error:", error);
        } else if (data) {
          return res.status(201).json({ note: data });
        }
      }

      fallbackDb.notes[newNoteData.id] = newNoteData;
      saveFallbackDb();

      return res.status(201).json({ note: newNoteData });
    } catch (err: any) {
      console.error("Create note error:", err);
      return res.status(500).json({ error: "Failed to create note" });
    }
  });

  // 3. UPDATE A NOTE
  app.put("/api/notes/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { title, body, is_pinned, color_tag, tags } = req.body;

      const now = new Date().toISOString();

      if (isSupabaseConfigured) {
        const client = getUserSupabaseClient(req) || supabaseAdmin!;
        const updates: any = { updated_at: now };
        if (title !== undefined) updates.title = title;
        if (body !== undefined) updates.body = body;
        if (is_pinned !== undefined) updates.is_pinned = is_pinned;
        if (color_tag !== undefined) updates.color_tag = color_tag;
        if (tags !== undefined) updates.tags = tags;

        const { data, error } = await client
          .from("notes")
          .update(updates)
          .eq("id", id)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) {
          console.error("Supabase update error:", error);
        } else if (data) {
          return res.json({ note: data });
        }
      }

      const existing = fallbackDb.notes[id];
      if (!existing) {
        return res.status(404).json({ error: "Note not found" });
      }

      if (existing.user_id !== userId) {
        return res.status(403).json({ error: "Access denied: You do not own this note" });
      }

      if (title !== undefined) existing.title = title;
      if (body !== undefined) existing.body = body;
      if (is_pinned !== undefined) existing.is_pinned = is_pinned;
      if (color_tag !== undefined) existing.color_tag = color_tag;
      if (tags !== undefined) existing.tags = tags;
      existing.updated_at = now;

      fallbackDb.notes[id] = existing;
      saveFallbackDb();

      return res.json({ note: existing });
    } catch (err: any) {
      console.error("Update note error:", err);
      return res.status(500).json({ error: "Failed to update note" });
    }
  });

  // 4. DELETE A NOTE
  app.delete("/api/notes/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      if (isSupabaseConfigured) {
        const client = getUserSupabaseClient(req) || supabaseAdmin!;
        const { error } = await client
          .from("notes")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);

        if (error) {
          console.error("Supabase delete error:", error);
        } else {
          return res.json({ success: true, id, message: "Note deleted successfully" });
        }
      }

      const existing = fallbackDb.notes[id];
      if (!existing) {
        return res.json({ success: true, id, message: "Note already deleted" });
      }

      if (existing.user_id !== userId) {
        return res.status(403).json({ error: "Access denied: You do not own this note" });
      }

      delete fallbackDb.notes[id];
      saveFallbackDb();

      return res.json({ success: true, id, message: "Note deleted successfully" });
    } catch (err: any) {
      console.error("Delete note error:", err);
      return res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // 5. BATCH SYNC ENDPOINT
  app.post("/api/notes/sync", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { clientNotes = [], deletedIds = [] } = req.body as {
        clientNotes: NoteRecord[];
        deletedIds: string[];
      };

      for (const delId of deletedIds) {
        if (isSupabaseConfigured) {
          const client = getUserSupabaseClient(req) || supabaseAdmin!;
          await client.from("notes").delete().eq("id", delId).eq("user_id", userId);
        }
        if (fallbackDb.notes[delId] && fallbackDb.notes[delId].user_id === userId) {
          delete fallbackDb.notes[delId];
        }
      }

      for (const clientNote of clientNotes) {
        clientNote.user_id = userId;

        if (isSupabaseConfigured) {
          const client = getUserSupabaseClient(req) || supabaseAdmin!;
          await client.from("notes").upsert([clientNote]);
        }

        const existing = fallbackDb.notes[clientNote.id];
        if (!existing || new Date(clientNote.updated_at).getTime() >= new Date(existing.updated_at).getTime()) {
          fallbackDb.notes[clientNote.id] = clientNote;
        }
      }

      saveFallbackDb();

      let serverNotes: NoteRecord[] = [];
      if (isSupabaseConfigured) {
        const client = getUserSupabaseClient(req) || supabaseAdmin!;
        const { data } = await client
          .from("notes")
          .select("*")
          .eq("user_id", userId)
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false });

        if (data) serverNotes = data;
      } else {
        serverNotes = Object.values(fallbackDb.notes)
          .filter((n) => n.user_id === userId)
          .sort((a, b) => {
            if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
      }

      return res.json({
        success: true,
        notes: serverNotes,
        syncedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("Sync notes error:", err);
      return res.status(500).json({ error: "Failed to synchronize notes" });
    }
  });

  return app;
}

const defaultApp = createServerApp();
export default defaultApp;
