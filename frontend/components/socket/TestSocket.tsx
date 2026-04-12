'use client';

import React, { useEffect } from 'react';
import { socket } from '@/lib/socket';
import { api } from '@/lib/axios';

export const TestSocket = () => {
  const sendMessage = async () => {
    await api.post('/message', {
      content: 'Hello',
      receiverId: 'u4',
      chatId: 'chat-id',
    });
  };

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected: ', socket.id);
    });

    socket.on('newMessage', (data) => {
      console.log('Message received from backend: ', data);
    });

    return () => {
      socket.off('connect');
      socket.off('newMessage');
    };
  }, []);

  return (
    <div>
      <button onClick={sendMessage}>Send Message</button>
    </div>
  );
};
