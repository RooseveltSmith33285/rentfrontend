import { createContext, useRef, useEffect, useState } from "react";
import io from "socket.io-client";
import { BASE_URL } from "../baseUrl";
import React from 'react'
import axios from 'axios'

export const AdminSocketContext = createContext();

export default function AdminSocketProvider({ children }) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [adminId, setAdminId] = useState(null);

 
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        const adminEmail = JSON.parse(adminToken)?.email;
        
        if (!adminEmail) {
          console.error('No admin email found');
          return;
        }

        const response = await axios.get(`${BASE_URL}/getCurrentAdmin`, {
          params: { email: adminEmail }, 
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        });

        if (response.data.currentAdmin) {
          setAdminId(response.data.currentAdmin._id);
        
          localStorage.setItem('adminId', response.data.currentAdmin._id);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };

    fetchAdminData();
  }, []);

 
  useEffect(() => {
    if (!adminId) return;

    const socket = io(BASE_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      
   
      socket.emit('join', {
        userId: adminId,
        userType: 'admin'
      });
      
      socket.emit('joinAdminRoom');
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
  }, [adminId]); 

  return (
    <AdminSocketContext.Provider value={{ socket: socketRef.current, isConnected, adminId }}>
      {children}
    </AdminSocketContext.Provider>
  );
}