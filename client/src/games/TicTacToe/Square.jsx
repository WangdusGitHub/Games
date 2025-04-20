import React, { useState, useEffect } from "react";

export default function Square({
  socket,
  winnerLine,
  finishState,
  setGameState,
  id,
  currPlayer,
  setCurrPlayer,
  currElement,
  playingAs,
  symbol,
  gameState,
}) {
  const [icon, setIcon] = useState(null);
  const renderCircle = <i className="fa-regular fa-circle"></i>;
  const renderCross = <i className="fa-solid fa-xmark"></i>;

  useEffect(() => {
    if (gameState) {
      const rowIndex = Math.floor(id / 3);
      const colIndex = id % 3;
      const value = gameState[rowIndex][colIndex];
      if (value === "circle") {
        setIcon(renderCircle);
      } else if (value === "cross") {
        setIcon(renderCross);
      } else {
        setIcon(null);
      }
    }
  }, [gameState, id, renderCircle, renderCross]);

  const handleClick = () => {
    if (!icon && socket && !finishState && currPlayer === symbol) {
      const sign = symbol;
      socket.emit("playerMoveFromClient", {
        state: {
          id,
          sign,
        },
      });
      setCurrPlayer(symbol === "circle" ? "cross" : "circle");
    }
  };

  return (
    <div
      className={`square 
        ${winnerLine.includes(id) ? "highlight" : ""} 
        ${currPlayer !== playingAs ? "not-allowed" : ""}`}
      onClick={handleClick}
    >
      {icon}
    </div>
  );
}
