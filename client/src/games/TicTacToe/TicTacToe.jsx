import React from "react";
import "./TicTacToe.css";
import Square from "./Square";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Swal from "sweetalert2";

export default function TecTacToe({
  playerName,
  setPlayerName,
  socket,
  setSocket,
  playOnline,
  setPlayOnline,
}) {
  const renderSquares = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  const [gameState, setGameState] = useState(renderSquares);
  const [currPlayer, setCurrPlayer] = useState("circle");
  const [finishState, setFinishState] = useState(false);
  const [winnerLine, setWinnerLine] = useState([]);
  // const [playOnline, setPlayOnline] = useState(playerOnline); // marked
  // const [socket, setSocket] = useState(socket); // marked
  // const [playerName, setPlayerName] = useState(playerName); // marked
  const [opponent, setOpponent] = useState(null);
  const [playingAs, setPlayingAs] = useState(null);

  const checkWinner = () => {
    if (finishState) return;

    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2]
      ) {
        setWinnerLine([row * 3 + 0, row * 3 + 1, row * 3 + 2]);
        return gameState[row][0];
      }
    }
    for (let col = 0; col < gameState.length; col++) {
      if (
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        setWinnerLine([0 * 3 + col, 1 * 3 + col, 2 * 3 + col]);
        return gameState[0][col];
      }
    }
    if (
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      setWinnerLine([0, 4, 8]);
      return gameState[1][1];
    }
    if (
      (gameState[0][2] === gameState[1][1] && gameState[1][1]) ===
      gameState[2][0]
    ) {
      setWinnerLine([2, 4, 6]);
      return gameState[1][1];
    }

    const isDraw = gameState.flat().every((e) => {
      if (e === "circle" || e === "cross") {
        return true;
      }
    });
    if (isDraw) return "draw";

    return null;
  };

  // const resetGame = () => {
  //   setGameState(renderSquares);
  //   setCurrPlayer(currPlayer === "circle" ? "cross" : "circle");
  //   setFinishState(false);
  //   setWinnerLine([]);
  //   setOpponent(currPlayer === "circle" ? "cross" : "circle");
  //   setPlayingAs(currPlayer === "circle" ? "cross" : "circle");
  // };

  useEffect(() => {
    const winner = checkWinner();
    if (winner) {
      setFinishState(winner);
    }
  }, [gameState]);

  // const takePlayerName = async () => {
  //   const result = await Swal.fire({
  //     title: "Enter your Name",
  //     input: "text",
  //     showCancelButton: true,
  //     inputValidator: (value) => {
  //       if (!value) {
  //         return "you need to enter your name";
  //       }
  //     },
  //   });
  //   return result;
  // };

  socket?.on("playerMoveFromServer", (data) => {
    const id = data.state.id;
    setGameState((prevState) => {
      let newState = [...prevState];
      const rowIndex = Math.floor(id / 3);
      const colIndex = id % 3;
      newState[rowIndex][colIndex] = data.state.sign;
      return newState;
    });
    setCurrPlayer(data.state.sign === "circle" ? "cross" : "circle");
  });

  socket?.on("OpponentNotFound", function () {
    setOpponent(false);
  });
  socket?.on("OpponentFound", function (data) {
    setPlayingAs(data.Symbol);
    setOpponent(data.opponent);
  });

  async function handlePlayOnlineClick() {
    const result = await takePlayerName();
    if (!result.isConfirmed) {
      return;
    }
    const userName = result.value;
    setPlayerName(userName);

    const newSocket = io("http://localhost:3001", {
      autoConnect: true,
    });

    newSocket?.emit("request_to_play", {
      playerName: userName,
    });

    setSocket(newSocket);
  }

  // if (!playOnline) {
  //   return (
  //     <>
  //       <div className="game-wrapper">
  //         <button className="btn" onClick={handlePlayOnlineClick}>
  //           Play Online
  //         </button>
  //       </div>
  //     </>
  //   );
  // }

  if (playOnline && !opponent) {
    return (
      <div className="game-wrapper">
        <p className="waiting">waiting for opponent. </p>
      </div>
    );
  }

  return (
    <>
      <div className="game-wrapper">
        <div className="players">
          <div className={`${currPlayer === playingAs ? "highlight" : ""}`}>
            {playerName}
          </div>
          <div className={`${currPlayer !== playingAs ? "highlight" : ""}`}>
            {opponent}
          </div>
        </div>

        <div className="board">
          {gameState.map((arr, rowIndex) =>
            arr.map((e, colIndex) => {
              return (
                <Square
                  socket={socket}
                  gameState={gameState}
                  winnerLine={winnerLine}
                  finishState={finishState}
                  currPlayer={currPlayer}
                  setGameState={setGameState}
                  setCurrPlayer={setCurrPlayer}
                  id={rowIndex * 3 + colIndex}
                  key={rowIndex * 3 + colIndex}
                  currElement={e}
                  playingAs={playingAs}
                />
              );
            })
          )}
        </div>

        <h2 className="finishstate">
          {finishState && finishState !== "draw"
            ? `"${finishState}" won the game!`
            : ""}

          {finishState && finishState === "draw"
            ? `It's a "${finishState}"`
            : ""}

          {!finishState
            ? opponent && currPlayer === playingAs
              ? "your turn"
              : `${opponent}'s turn`
            : ""}
        </h2>

        {/* <button
          className={`${finishState ? "" : "not-visible"}`}
          onClick={resetGame}
        >
          reset
        </button> */}
      </div>
    </>
  );
}
