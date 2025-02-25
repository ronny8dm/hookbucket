import { getSession } from "@auth/express";
import { authConfig } from "../api/index.js";

export const requireAuth = async (req, res, next) => {
  try {
    const session = await getSession(req, authConfig);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    // Only attach the user data, not the whole session
    req.user = session.user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};