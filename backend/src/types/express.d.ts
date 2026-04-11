// declare global {
  // Modify global types available everywhere
declare namespace Express {
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
