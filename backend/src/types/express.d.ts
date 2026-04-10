import { User } from '@prisma/client';

declare global {
  // Modify global types available everywhere
  namespace Express {
    // TypeScript already has built-in types for Express
    interface Request {
      user?: {
        id: string;
        fullName: string;
        username: string;
        email: string;
        profilePic: string | null;
      };
    }
  }
}
