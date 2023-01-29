import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cell from "../components/Cell";
import "../styles/Game.css";

const Game = ({ socket }) => {
  const navigate = useNavigate();
  const [turn, setTurn] = useState("");
  const [cells, setCells] = useState(Array(9).fill(""));
  const [winner, setWinner] = useState(null);
  const [step, setStep] = useState(true);
  const [opponent, setOpponent] = useState("");

  const name = localStorage.getItem("game-name");

  useEffect(() => {
    socket.on("confirm_restart", (data) => {
      setCells(data.cells);
      setWinner(data.winner);
    });
  }, [socket]);

  useEffect(() => {
    socket.on("receive_step", (data) => {
      if (data.name !== name) {
        setStep(true);
        setOpponent(data.name);
      }
      setCells(data.cells);
    });
    return () => socket.off("receive_step");
  }, [socket]);

  useEffect(() => {
    socket.on("winner_emit", (data) => {
      setWinner(data.winner);
    });
  }, [socket]);

  useEffect(() => {
    if (cells.join("").length === 9) {
      socket.emit("winner", {
        winner: "draw",
        room: JSON.parse(localStorage.getItem("game-room")),
      });
    }
  }, [socket, cells]);

  useEffect(() => {
    socket.on("leave_opponent", (data) => {
      alert(data);
    });
  }, [socket]);

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
          //
        } else if (
          squares[pattern[0]] === squares[pattern[1]] &&
          squares[pattern[1]] === squares[pattern[2]]
        ) {
          setWinner(squares[pattern[0]]);
          socket.emit("winner", {
            winner: squares[pattern[0]] + "is the winner!",
            room: JSON.parse(localStorage.getItem("game-room")),
          });
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

    if (step === true) {
      squares[num] = turn;
    }

    checkForWinner(squares);
    setCells(squares);
    setStep(false);
    await socket.emit("send_step", {
      cells: squares,
      room: JSON.parse(localStorage.getItem("game-room")),
      name: name,
      step: false,
      turn: turn,
    });
  };

  const handleRestart = async (e) => {
    e.preventDefault();
    const room = JSON.parse(localStorage.getItem("game-room"));
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
    const room = JSON.parse(localStorage.getItem("game-room"));
    socket.emit("leave_room", room);
    localStorage.removeItem("game-room");
    localStorage.removeItem("game-name");
    navigate("/login");
  };

  const handleMark = ( e, mark ) => {
    e.preventDefault();
    setTurn(mark);
  };

  return (
    <div className="container">
      <h2 style={{ color: "white" }}>
        {opponent.length
          ? `You playing against ${opponent}`
          : "Waiting for your opponent"}
      </h2>
      <h3 className="container-title">Turn: {!step ? opponent : name}</h3>
      {!turn.length && (
        <div className="button-bar">
          <button
            className="button button-reload"
            onClick={(e) => handleMark(e, "X")}
          >
            Play X
          </button>
          <button
            className="button button-reload"
            onClick={(e) => handleMark(e, "O")}
          >
            Play O
          </button>
        </div>
      )}
      <table>
        <tbody>
          <tr>
            <Cell step={step} cells={cells} handleClick={handleClick} num={0} />
            <Cell step={step} cells={cells} handleClick={handleClick} num={1} />
            <Cell step={step} cells={cells} handleClick={handleClick} num={2} />
          </tr>
          <tr>
            <Cell step={step} cells={cells} handleClick={handleClick} num={3} />
            <Cell step={step} cells={cells} handleClick={handleClick} num={4} />
            <Cell step={step} cells={cells} handleClick={handleClick} num={5} />
          </tr>
          <tr>
            <Cell step={step} cells={cells} handleClick={handleClick} num={6} />
            <Cell step={step} cells={cells} handleClick={handleClick} num={7} />
            <Cell step={step} cells={cells} handleClick={handleClick} num={8} />
          </tr>
        </tbody>
      </table>
      {winner && (
        <>
          <p className="container-winner">{winner}</p>
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
