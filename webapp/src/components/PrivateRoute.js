import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import useAuth from '../hooks/useAuth';
import useAxios from '../hooks/useAxios';

const PrivateRoute = () => {
  const axios = useAxios();
  const { auth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (auth) {
      const isAdmin = async () => {
        try {
          const response = await axios.get("/isAdmin/" + auth.username);
          if (response.data.isAdmin) {
            return window.location.href = `${process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000"}/admin/monitoring/`;
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
        }
      }

      isAdmin();
    }
  }, [auth]);

  return auth?.username ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;