import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ error: 'User is not authenticated!' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }; // Verify tokeVerify token and treat result as object containing idn and treat result as object containing id
    if (!decoded) {
      return res.status(401).json({ error: 'Token is invalid, login again!' });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        profilePic: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user;

    next();
  } catch (err: any) {
    console.log('Error in protect route middleware', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
