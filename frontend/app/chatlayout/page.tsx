"use client"

import { api } from '@/lib/axios';
import React, { useEffect, useState } from 'react'

function page() {
    const [chats, setChats] = useState([]);
    useEffect(() => {
        const fetchChats = async () => {
            const res = await api.get(`/chat`);
            console.log(res.data.chats);
        }
        fetchChats();
    }, []);
    return (
        <div>page</div>
    );
}

export default page;
