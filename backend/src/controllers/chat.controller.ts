import express, { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getAllChats = async (req: Request, res: Response) => {
  try {
    const currUser = req.user;

    if (!currUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = currUser.id;

    const chats = await prisma.chat.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePic: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.status(200).json({ msg: 'Chats fetched successfully!', chats });
  } catch (err: any) {
    console.log('Error in getting all chats', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createNewChat = async (req: Request, res: Response) => {
  try {
    const currUser = req.user;
    const { otherUserId } = req.body;

    if (!currUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const doesOtherExists = await prisma.user.findUnique({
      where: {
        id: otherUserId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        profilePic: true,
      },
    });
    if (!doesOtherExists) {
      return res.status(404).json({ error: 'Other user does not exists!' });
    }

    const userId = currUser.id;

    if (userId === otherUserId) {
      return res.status(400).json({ error: 'Cannot chat with yourself' });
    }

    const chat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        AND: [
          {
            users: {
              some: {
                id: userId,
              },
            },
          },
          {
            users: {
              some: {
                id: otherUserId,
              },
            },
          },
        ],
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
            profilePic: true,
          },
        },
      },
    });

    if (chat) {
      return res.status(200).json({ msg: 'Chat already exists', chat });
    }

    const newChat = await prisma.chat.create({
      data: {
        isGroup: false,
        users: {
          connect: [{ id: userId }, { id: otherUserId }],
        },
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            fullName: true,
            profilePic: true,
            username: true,
          },
        },
      },
    });

    res.status(200).json({ msg: 'Chat created successfully!', newChat });
  } catch (err: any) {
    console.log('Error in creating new chat', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
