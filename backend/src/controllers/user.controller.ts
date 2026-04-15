import express, {Request, Response} from "express";
import prisma from "../lib/prisma";

export const getMe = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json(req.user);
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const currUser = req.user;

    if (!currUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: currUser.id,
        },
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        profilePic: true,
      },
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
