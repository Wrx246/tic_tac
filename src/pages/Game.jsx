import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Game.css";

const Game = ({ socket }) => {
  const navigate = useNavigate();
  const [turn, setTurn] = useState("x");
  const [users, setUsers] = useState([]);
  const [cells, setCells] = useState(Array(9).fill(""));
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    socket.on("confirm_restart", (data) => {
      setCells(data.cells)
    });
  }, [socket]);

  useEffect(() => {
    socket.on("getUsers", (users) => {
      setUsers(users);
      console.log(users);
    });
  }, [socket]);

  useEffect(()=> {
    socket.on("receive_step", (data) => {
        setTimeout(()=> setCells(data), 1000)
        // setCells(data)
        console.log(data)
    })
  }, [socket])

  useEffect(()=> {
    const room = JSON.parse(localStorage.getItem("game-room") || "");
    socket.emit("send_step", { cells: cells, room: room });
  },[socket, cells])

  const checkForWinner = (squares) => {
    let combos = {
      across: [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
      ],
      down: [
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
      ],
      diagnol: [
        [0, 4, 8],
        [2, 4, 6],
      ],
    };

    for (let combo in combos) {
      combos[combo].forEach((pattern) => {
        if (
          squares[pattern[0]] === "" ||
          squares[pattern[1]] === "" ||
          squares[pattern[2]] === ""
        ) {
          // do nothing
        } else if (
          squares[pattern[0]] === squares[pattern[1]] &&
          squares[pattern[1]] === squares[pattern[2]]
        ) {
          setWinner(squares[pattern[0]]);
        }
      });
    }
  };

  const handleClick = async (num) => {
    if (cells[num] !== "") {
      alert("already clicked");
      return;
    }

    let squares = [...cells];

    if (turn === "x") {
      squares[num] = "x";
      setTurn("o");
    } else {
      squares[num] = "o";
      setTurn("x");
    }

    checkForWinner(squares);
    setCells(squares);
    
  };

  const handleRestart = async (e) => {
    e.preventDefault();
    const room = JSON.parse(localStorage.getItem("game-room") || "");
    await socket.emit("restart", {
      cells: Array(9).fill(""),
      winner: null,
      room: room,
    });
    setWinner(null);
    setCells(Array(9).fill(""));
  };

  const handleLeave = (e) => {
    e.preventDefault();
    const room = JSON.parse(localStorage.getItem("game-room") || "");
    socket.emit("leave_room", room);
    localStorage.removeItem("game-room");
    localStorage.removeItem("game-name");
    navigate("/login");
  };

  const Cell = ({ num }) => {
    return (
      <td className="cell" onClick={() => handleClick(num)}>
        <span>{cells[num]}</span>
      </td>
    );
  };

  return (
    <div className="container">
      <h2 className="container-title">Turn: {turn}</h2>
      <span>Users in room: </span>
      <table>
        <tbody>
          <tr>
            <Cell num={0} />
            <Cell num={1} />
            <Cell num={2} />
          </tr>
          <tr>
            <Cell num={3} />
            <Cell num={4} />
            <Cell num={5} />
          </tr>
          <tr>
            <Cell num={6} />
            <Cell num={7} />
            <Cell num={8} />
          </tr>
        </tbody>
      </table>
      {winner && (
        <>
          <p className="container-winner">{winner} is the winner!</p>
          <button className="button button-reload" onClick={handleRestart}>
            Play Again
          </button>
        </>
      )}
      <button className="button button-leave" onClick={handleLeave}>
        Leave room
      </button>
    </div>
  );
};

export default Game;
