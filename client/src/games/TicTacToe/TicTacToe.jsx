import React, { useState, useEffect } from "react";
import "./TicTacToe.css";
import { setupTicTacToeSocket, emitPlayerMove } from "./tictactoeService";

export default function TicTacToe({
  playerName,
  socket,
  opponentName,
  symbol,
  waitingForOpponent,
  setWaitingForOpponent, // Receive the setWaitingForOpponent function as a prop
}) {
  const renderSquares = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
  ];

  const [gameState, setGameState] = useState([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]);
  const [currPlayer, setCurrPlayer] = useState("circle");
  const [finishState, setFinishState] = useState(null);
  const [winnerLine, setWinnerLine] = useState([]);

  const renderCircle = <i className="fa-regular fa-circle"></i>;
  const renderCross = <i className="fa-solid fa-xmark"></i>;

  const checkWinner = (board) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        board[Math.floor(a / 3)][a % 3] &&
        board[Math.floor(a / 3)][a % 3] === board[Math.floor(b / 3)][b % 3] &&
        board[Math.floor(a / 3)][a % 3] === board[Math.floor(c / 3)][c % 3]
      ) {
        setWinnerLine(lines[i]);
        return board[Math.floor(a / 3)][a % 3];
      }
    }

    if (board.flat().every((square) => square !== null)) {
      return "draw";
    }

    return null;
  };

  const handleSquareClick = (index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    if (
      finishState ||
      !socket ||
      currPlayer !== symbol ||
      gameState[row][col] ||
      waitingForOpponent // Disable clicks while waiting
    ) {
      return;
    }

    const newGameState = gameState.map((arr) => [...arr]);
    newGameState[row][col] = symbol;
    setGameState(newGameState);
    setCurrPlayer(symbol === "circle" ? "cross" : "circle");
    emitPlayerMove(socket, index, symbol);
  };

  const handleReset = () => {
    if (socket && finishState) {
      socket.emit("playAgain");
      setWaitingForOpponent(true); // Set the waiting state in App.jsx
      setGameState([
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ]);
      setCurrPlayer("circle");
      setFinishState(null);
      setWinnerLine([]);
    }
  };

  useEffect(() => {
    const winner = checkWinner(gameState);
    if (winner) {
      setFinishState(winner);
    }
  }, [gameState]);

  useEffect(() => {
    const cleanup = setupTicTacToeSocket(
      socket,
      gameState,
      setGameState,
      currPlayer,
      setCurrPlayer,
      symbol,
      setFinishState,
      setWinnerLine
    );
    return cleanup;
  }, [
    socket,
    gameState,
    setGameState,
    currPlayer,
    setCurrPlayer,
    symbol,
    setFinishState,
    setWinnerLine,
  ]);

  const renderSquare = (index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const value = gameState[row][col];
    const isWinner = winnerLine.includes(index);
    const notAllowed = currPlayer !== symbol || waitingForOpponent;

    let icon = null;
    if (value === "circle") {
      icon = renderCircle;
    } else if (value === "cross") {
      icon = renderCross;
    }

    return (
      <div
        key={index}
        className={`square ${isWinner ? "highlight" : ""} ${
          notAllowed ? "not-allowed" : ""
        }`}
        onClick={() => handleSquareClick(index)}
      >
        {icon}
      </div>
    );
  };

  return (
    <div className="game-wrapper">
      <div className="players">
        <div className={`${currPlayer === symbol ? "highlight" : ""}`}>
          {playerName} ({symbol})
        </div>
        <div className={`${currPlayer !== symbol ? "highlight" : ""}`}>
          {opponentName} ({symbol === "circle" ? "cross" : "circle"})
        </div>
      </div>

      <div className="board">
        {renderSquares.flat().map((index) => renderSquare(index))}
      </div>

      <h2 className="finishstate">
        {finishState === "circle" ? "Circle won!" : ""}
        {finishState === "cross" ? "Cross won!" : ""}
        {finishState === "draw" ? "It's a draw!" : ""}
      </h2>

      {finishState && (
        <button
          className=""
          onClick={handleReset}
          disabled={waitingForOpponent}
        >
          Play Again
        </button>
      )}
    </div>
  );
}
