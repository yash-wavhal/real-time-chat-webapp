'use client';

import { api } from '@/lib/axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface Data {
  username: string;
  email: string;
  password: string;
}

export default function Page() {
  const [form, setForm] = useState<Data>({
    username: '',
    email: '',
    password: '',
  });

    const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
        // console.log('res data', res.data);
        router.push('/');
    } catch (err: any) {
      console.log('Error in registering user', err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex h-screen">
      {/* LEFT SIDE (BLACK) */}
      <div className="w-1/2 bg-black text-white flex items-center justify-center">
        <h1 className="text-4xl font-bold">Chat App</h1>
      </div>

      {/* RIGHT SIDE (FORM) */}
      <div className="w-1/2 bg-white flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-120 space-y-4">
          <h2 className="text-2xl font-semibold text-black">Login</h2>

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full p-2 rounded border-2 border-black text-black"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 rounded border-2 border-black text-black"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 rounded border-2 border-black text-black"
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:opacity-90 cursor-pointer"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
