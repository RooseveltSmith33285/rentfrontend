import { createContext, useRef, useEffect, useState } from "react";
import io from "socket.io-client";
import { BASE_URL } from "../baseUrl";
import React from 'react'

export const SocketContext = createContext();

export default function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(BASE_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      
      const userToken = localStorage.getItem('token');
      const vendorToken = localStorage.getItem('vendorToken');
      
      if (userToken) {
        const userId = localStorage.getItem('userId');
        console.log('Auto-joining as user:', userId);
        socket.emit('join', {
          userId: userId,
          userType: 'user'
        });
      } else if (vendorToken) {
        const vendorId = localStorage.getItem('vendorId');
        console.log('Auto-joining as vendor:', vendorId);
        socket.emit('join', {
          userId: vendorId,
          userType: 'vendor'
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}