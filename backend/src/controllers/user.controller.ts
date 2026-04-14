import express, {Request, Response} from "express";

export const getMe = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json(req.user);
};
