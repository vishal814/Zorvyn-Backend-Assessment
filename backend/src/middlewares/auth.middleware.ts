import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
         res.status(401).json({ message: 'Not authorized, user not found' });
         return;
      }
      
      if (!user.isActive) {
        res.status(403).json({ message: 'User is inactive' });
        return;
      }
      
      req.user = user;
      next();
    } catch (error) {
       res.status(401).json({ message: 'Not authorized, token failed' });
       return;
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }
};
