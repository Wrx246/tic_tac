import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = ({ socket }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    socket.on("getUsers", (users) => {
      setUsers(users);
    });
  }, [socket]);

  useEffect(() => {
    if (users.length) {
      navigate("/");
    }
  }, [users]);

  const handleRoom = (e) => {
    setRoom(e.target.value);
  };

  const handleName = (e) => {
    setName(e.target.value);
  };

  const submitData = async (e) => {
    e.preventDefault();
    if (room !== "" && name !== "") {
      await socket.emit("join_room", room);
      await socket.emit("addUser", name);
      localStorage.setItem("game-name", name);
      localStorage.setItem("game-room", room);
    }
  };

  return (
    <div className="login-wrapper">
      <h1>Login</h1>
      <form className="form-wrapper" onSubmit={submitData}>
        <span>Name</span>
        <input
          type="text"
          value={name}
          onChange={handleName}
          placeholder="Enter name"
        />
        <span>Room id</span>
        <input
          type="text"
          value={room}
          onChange={handleRoom}
          placeholder="Enter room id"
        />
        <button className="form-button" type="submit">
          Enter
        </button>
      </form>
    </div>
  );
};

export default Login;
