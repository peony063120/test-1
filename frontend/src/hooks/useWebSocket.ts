import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import type { AppNotification } from '@/api/endpoints/notification.api';

export const useWebSocket = (enabled = true) => {
  const socketRef = useRef<Socket>();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only connect if explicitly enabled AND a socket URL is configured
    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (!enabled || !socketUrl) return;

    const token = localStorage.getItem('accessToken');
    const socket = io(socketUrl, {
      auth: token ? { token } : undefined,
      transports: ['websocket', 'polling'],
      reconnection: false,
      timeout: 5000,
    });
    socketRef.current = socket;

    socket.on('connect_error', () => {
      socket.disconnect();
    });

    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('notification', (_notification: AppNotification) => refresh());
    socket.on('notification:read', refresh);

    return () => {
      socket.disconnect();
      socketRef.current = undefined;
    };
  }, [enabled, queryClient]);

  return socketRef;
};
