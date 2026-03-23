import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && !user?.isAdmin) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;