import { Navigate, Outlet } from "react-router-dom"


const ProtectedRoutes = () => {
  const isAuth = localStorage.getItem('game-room');

  return (
    isAuth ? <Outlet /> : <Navigate to='/login' />
  );
}

export default ProtectedRoutes