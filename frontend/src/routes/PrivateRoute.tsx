import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import type { AppRole } from '@/constants/rbac';
import { hasAnyRole } from '@/constants/rbac';
import { getDefaultRouteForUser } from '@/utils/auth-routing';

interface Props {
  allowedRoles?: AppRole[];
}

const PrivateRoute = ({ allowedRoles }: Props) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !hasAnyRole(user, allowedRoles)) {
    return <Navigate to={getDefaultRouteForUser(user)} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
