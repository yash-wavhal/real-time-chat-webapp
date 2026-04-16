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
            email: true,
            lastSeen: true,
            username: true,
            fullName: true,
            profilePic: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            sender: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const formattedChats = chats.map((chat) => {
      const lastMessage = chat.messages[0] || null;

      if (!chat.isGroup) {
        const otherUser = chat.users.find((u) => u.id !== userId);

        return {
          id: chat.id,
          createdAt: chat.createdAt,
          isGroup: false,
          otherUser,
          updatedAt: chat.updatedAt,
          lastMessage,
        };
      }

      const otherUsers = chat.users.filter((u) => u.id !== userId);

      return {
        id: chat.id,
        createdAt: chat.createdAt,
        isGroup: true,
        name: chat.name,
        members: otherUsers,
        updatedAt: chat.updatedAt,
        lastMessage,
      };
    });

    res.status(200).json({ msg: 'Chats fetched successfully!', formattedChats });
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

    if (!otherUserId) {
      return res.status(400).json({ error: 'otherUserId is required' });
    }

    const userId = currUser.id;

    if (userId === otherUserId) {
      return res.status(400).json({ error: 'Cannot chat with yourself' });
    }

    // Check if other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        profilePic: true,
      },
    });

    if (!otherUser) {
      return res.status(404).json({ error: 'Other user does not exist!' });
    }

    // ✅ Check if chat already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        AND: [{ users: { some: { id: userId } } }, { users: { some: { id: otherUserId } } }],
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
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            sender: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    // Formatter (same as getAllChats)
    const formatChat = (chat: any) => {
      const lastMessage = chat.messages?.[0] || null;

      if (!chat.isGroup) {
        const otherUser = chat.users.find((u: any) => u.id !== userId);

        return {
          id: chat.id,
          createdAt: chat.createdAt,
          isGroup: false,
          otherUser,
          updatedAt: chat.updatedAt,
          lastMessage,
        };
      }

      const members = chat.users.filter((u: any) => u.id !== userId);

      return {
        id: chat.id,
        createdAt: chat.createdAt,
        isGroup: true,
        name: chat.name,
        members,
        updatedAt: chat.updatedAt,
        lastMessage,
      };
    };

    // If chat exists → return formatted
    if (existingChat) {
      return res.status(200).json({
        msg: 'Chat already exists',
        chat: formatChat(existingChat),
        isNewChat: false,
      });
    }

    // Create new chat
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
            username: true,
            fullName: true,
            profilePic: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            sender: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      msg: 'Chat created successfully!',
      chat: formatChat(newChat),
      isNewChat: true,
    });
  } catch (err: any) {
    console.log('Error in creating new chat', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
