import { Request, Response, NextFunction } from 'express';
import { verifyToken, ITokenPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access token required' });
    return;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(403).json({ message: 'Invalid or expired token' });
    return;
  }

  req.user = decoded;
  next();
};

export const authorizeRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }
    next();
  };
};
