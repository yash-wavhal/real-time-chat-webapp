import express, { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcryptjs from 'bcryptjs';
import generateToken from '../utils/generateToken';

const signup = async (req: Request, res: Response) => {
  try {
    const { username, fullName, email, password, gender } = req.body;
    if (!username || !fullName || !email || !password || !gender) {
      return res.status(400).json({ error: 'Please fill all fields' });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const profilePic = `https://ui-avatars.com/api/?background=random&name=${fullName}`;

    const newUser = await prisma.user.create({
      data: {
        fullName,
        username,
        email,
        password: hashedPassword,
        gender,
        profilePic: profilePic,
      },
    });

    if (newUser) {
      generateToken(newUser.id, res);
      res.status(201).json({
        id: newUser.id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (err: any) {
    console.log('Error in signup controller', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Please fill all fields' });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'User does not exists' });
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    generateToken(user.id, res);

    res.status(200).json({
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (err: any) {
    console.log('Error in login controller', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    res.cookie('jwt', '', { maxAge: 0 });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.log('Error in logout controller', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export { signup, login, logout };
