import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { refreshSession } from '@/store/slices/auth.slice';

const App = () => {
  const dispatch = useAppDispatch();
  const { accessToken, user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (accessToken && !user && !isLoading) {
      void dispatch(refreshSession());
    }
  }, [accessToken, user, isLoading, dispatch]);

  return <RouterProvider router={router} />;
};

export default App;
