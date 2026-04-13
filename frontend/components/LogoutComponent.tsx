'use client';

import { api } from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      router.replace('/login');
    } catch (err: any) {
      console.log('Error in logging out', err.message);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-black text-white px-4 py-2 rounded hover:opacity-80"
    >
      Logout
    </button>
  );
}
