import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cell from "../components/Cell";
import "../styles/Game.css";

const Game = ({ socket }) => {
  const navigate = useNavigate();
  const [turn, setTurn] = useState("");
  const [cells, setCells] = useState(Array(9).fill(""));
  const [winner, setWinner] = useState(null);
  const [step, setStep] = useState(true);
  const [disableX, setDisableX] = useState(false);
  const [disableO, setDisableO] = useState(false);

  useEffect(() => {
    socket.on("confirm_restart", (data) => {
      setCells(data.cells);
    });
  }, [socket]);

  useEffect(() => {
    socket.on("receive_step", (data) => {
      console.log(data);
      if(data.name !== localStorage.getItem("game-name")) {
        setStep(true);
      }
      // if (data.cells.join("").length > cells.join("")) {
        setCells(data.cells);
      // }
    });
    return () => socket.off("receive_step");
  }, []);

  // useEffect(() => {
  //   socket.emit("send_step", {
  //     cells: cells,
  //     room: JSON.parse(localStorage.getItem("game-room")),
  //     name: localStorage.getItem("game-name"),
  //     step: step,
  //     turn: false,
  //   });
  // }, [socket, cells, step, turn]);

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

    if (step === true) {
      squares[num] = turn;
    }

    checkForWinner(squares);
    setCells(squares);
    setStep(false);
    await socket.emit("send_step", {
      cells: squares,
      room: JSON.parse(localStorage.getItem("game-room")),
      name: localStorage.getItem("game-name"),
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

  const playX = (e) => {
    e.preventDefault();
    setTurn("X");
    setDisableO(true);
  };

  const playO = (e) => {
    e.preventDefault();
    setTurn("O");
    setDisableX(true);
  };

  return (
    <div className="container">
      <h2 className="container-title">Turn: {turn}</h2>
      <button
        className="button button-reload"
        disabled={disableX}
        onClick={playX}
      >
        Play X
      </button>
      <button
        className="button button-reload"
        disabled={disableO}
        onClick={playO}
      >
        Play O
      </button>
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
