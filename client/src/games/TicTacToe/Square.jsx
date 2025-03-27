import React from "react";
import { useState } from "react";

export default function Square({
  socket,
  gameState,
  winnerLine,
  setFinishState,
  finishState,
  setGameState,
  id,
  currPlayer,
  setCurrPlayer,
  currElement,
  playingAs,
}) {
  const [icon, setIcon] = useState(null);

  const renderCircle = <i className="fa-regular fa-circle"></i>;
  const renderCross = <i className="fa-solid fa-xmark"></i>;

  const handleClick = () => {
    if (!icon) {
      if (currPlayer === "circle") {
        setIcon(renderCircle);
      } else {
        setIcon(renderCross);
      }

      const myCurrPlayer = currPlayer;
      socket.emit("playerMoveFromClient", {
        state: {
          id,
          sign: myCurrPlayer,
        },
      });
      setCurrPlayer(currPlayer === "circle" ? "cross" : "circle");

      setGameState((prevState) => {
        let newState = [...prevState];
        const rowIndex = Math.floor(id / 3);
        const colIndex = id % 3;
        newState[rowIndex][colIndex] = currPlayer;
        return newState;
      });
    }
  };
  return (
    <div
      className={`square 
        ${winnerLine.includes(id) ? "highlight" : ""} 
        ${currPlayer !== playingAs ? "not-allowed" : ""}`}
      onClick={finishState ? null : handleClick}
    >
      {currElement === "circle"
        ? renderCircle
        : currElement === "cross"
        ? renderCross
        : ""}
    </div>
  );
}
