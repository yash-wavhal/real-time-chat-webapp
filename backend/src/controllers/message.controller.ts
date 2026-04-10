import express, { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getAllMsgs = async (req: Request, res: Response) => {
  try {
    const currUser = req.user;
    const { chatId } = req.body;

    if (!currUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!chatId) {
      return res.status(400).json({ error: 'chatId is required' });
    }

    const userId = currUser.id;

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        users: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!chat) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profilePic: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.status(200).json({ msg: 'Messages fetched successfully', messages });
  } catch (err: any) {
    console.log('Error in getting all msgs', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createNewMsg = async (req: Request, res: Response) => {
  try {
    const currUser = req.user;
    const { chatId, content } = req.body;

    if (!currUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!chatId) {
      return res.status(400).json({ error: 'chatId is required' });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const userId = currUser.id;

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        users: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!chat) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const newMsg = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        chatId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profilePic: true,
          },
        },
      },
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: {},
    });

    res.status(201).json({ msg: 'Message created successfully', newMsg });
  } catch (err: any) {
    console.log('Error in creating message', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
