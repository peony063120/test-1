import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/auth.slice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const signOut = useCallback(() => dispatch(logout()), [dispatch]);

  return { ...auth, logout: signOut };
};
