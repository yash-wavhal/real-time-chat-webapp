'use client';

import { api } from '@/lib/axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface Data {
  username: string;
  fullName: string;
  email: string;
  password: string;
  gender: 'male' | 'female' | '';
}

export default function Page() {
  const [form, setForm] = useState<Data>({
    username: '',
    fullName: '',
    email: '',
    password: '',
    gender: '',
  });

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const signupRes = await api.post('/auth/signup', form);
      const loginRes = await api.post('/auth/login', {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      router.push('/');

    //   console.log('Signup:', signupRes.data);
    //   console.log('Login:', loginRes.data);
    } catch (err: any) {
      console.log('Error:', err.response?.data || err.message);
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
        <form onSubmit={handleSubmit} className="w-150 space-y-4">
          <h2 className="text-2xl font-semibold text-black">Register</h2>

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full p-2 rounded border-2 border-black text-black"
          />

          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
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

          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full p-2 rounded border-2 border-black text-black"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:opacity-90 cursor-pointer"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
