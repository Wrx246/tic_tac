import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoutes from './pages/ProtectedRoutes'
import Game from './pages/Game'
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function App() {
  return (
    <>
    <Routes>
        <Route path="/login" element={<Login socket={socket} />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Game socket={socket} />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
