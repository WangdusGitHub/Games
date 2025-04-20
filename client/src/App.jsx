import React, { useEffect, useState } from "react";
import TicTacToe from "./games/TicTacToe/TicTacToe";
import CatAndMouse from "./games/CatAndMouse/CatAndMouse";
import StonePaperScissor from "./games/StonePaperScissor/StonePaperScissor";
import Heading from "./components/Heading";
import { io } from "socket.io-client";
import "./App.css";

export default function App() {
  const [socket, setSocket] = useState(null);
  const [online, setOnline] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [playerName, setPlayerName] = useState(() => {
    const storedName = localStorage.getItem("playerName");
    return storedName ? storedName : "";
  });
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameSelectionMade, setGameSelectionMade] = useState(false);
  const [opponentName, setOpponentName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);

  useEffect(() => {
    const newSocket = io("http://localhost:3001");

    newSocket.on("connect", () => {
      setOnline(true);
      console.log("Connected to server");
    });

    newSocket.on("disconnect", () => {
      setOnline(false);
      console.log("Disconnected from server");
    });

    newSocket.on("playerCount", (count) => {
      setOnlineCount(count);
    });

    newSocket.on("OpponentFound", (data) => {
      setOpponentName(data.opponent);
      setSymbol(data.Symbol);
      setWaitingForOpponent(false);
      console.log(
        `Opponent found: ${data.opponent}, playing as ${data.Symbol}`
      );
      // if (!selectedGame) {
      //   setSelectedGame("Tic-Tac-Toe");
      // }
    });

    newSocket.on("opponentNotFound", () => {
      console.log("No opponent found, waiting...");
      setWaitingForOpponent(true);
    });

    newSocket.on("opponentDisconnected", () => {
      console.log("Opponent disconnected. Game ended.");
      setOpponentName("");
      setWaitingForOpponent(false);
      // Optionally reset game state or UI
    });

    newSocket.on("resetGame", (opponentSymbol) => {
      console.log(`Game reset. You are now playing as: ${opponentSymbol}`);
      setSymbol(opponentSymbol);
    });

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && playerName) {
      socket.emit("updatePlayerName", { playerName });
    }
    localStorage.setItem("playerName", playerName);
  }, [playerName, socket]);

  const handlePlayOnline = () => {
    console.log("in handleplayonline");
    console.log("socket", socket);
    console.log("playerName", playerName);
    console.log("selectedGame", selectedGame);
    if (socket && playerName && selectedGame) {
      socket.emit("request_to_play", { playerName });
      setWaitingForOpponent(true);
    }
  };

  const handleGameSelect = (gameName) => {
    setSelectedGame(gameName);
    setGameSelectionMade(true);
    console.log("Game selected:", gameName);
  };
  useEffect(() => {
    if (gameSelectionMade && selectedGame) {
      console.log("selectedGame state is now:", selectedGame);
      handlePlayOnline();
      socket?.emit("gameSelected", { gameName: selectedGame });
      setGameSelectionMade(false);
    }
  }, [gameSelectionMade, selectedGame, socket, handlePlayOnline]);
  const renderGame = () => {
    switch (selectedGame) {
      case "Tic-Tac-Toe":
        return (
          <TicTacToe
            playerName={playerName}
            socket={socket}
            online={online}
            opponentName={opponentName}
            symbol={symbol}
            waitingForOpponent={waitingForOpponent}
            setWaitingForOpponent={setWaitingForOpponent}
          />
        );
      case "Cat & Mouse":
        return (
          <CatAndMouse
            playerName={playerName}
            socket={socket}
            online={online}
            opponentName={opponentName}
            symbol={symbol}
          />
        );
      case "Stone Paper Scissor":
        return (
          <StonePaperScissor
            playerName={playerName}
            socket={socket}
            online={online}
            opponentName={opponentName}
            symbol={symbol}
          />
        );
      default:
        return null;
    }
  };

  if (!playerName) {
    let UserName = "";
    return (
      <form className="user-input">
        <input
          id="name"
          type="text"
          placeholder="enter name..."
          onChange={(e) => (UserName = e.target.value)}
        />
        <button
          type="submit"
          onClick={(e) => {
            e.preventDefault(); // Prevent default form submission
            setPlayerName(UserName);
          }}
        >
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </form>
    );
  }

  if (selectedGame === null) {
    return (
      <>
        <Heading text="Games" />
        <div className="games-field">
          <div className="game" onClick={() => handleGameSelect("Tic-Tac-Toe")}>
            <img src="./src/assets/images/tictactoe.png" alt="tictactoe" />
            <div className="name">TicTacToe</div>
          </div>
          <div className="game" onClick={() => handleGameSelect("Cat & Mouse")}>
            <img src="./src/assets/images/catandmouse.png" alt="catandmouse" />
            <div className="name">Cat & Mouse</div>
          </div>
          <div
            className="game"
            onClick={() => handleGameSelect("Stone Paper Scissor")}
          >
            <img
              src="./src/assets/images/stonepaperscissor.png"
              alt="stonepaperscissor"
            />
            <div className="name">Stone Paper Scissor</div>
          </div>
        </div>
        <div className="show-online">
          <div
            className={onlineCount !== 0 ? "green-light" : "red-light"}
          ></div>
          <div>{online ? onlineCount : "Offline"}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Heading text={selectedGame} />
      {waitingForOpponent ? <p>Waiting for an opponent...</p> : renderGame()}
      {opponentName && (
        <p>
          Playing against: {opponentName} ({symbol})
        </p>
      )}
      <div className="show-online">
        <div className={online ? "green-light" : "red-light"}></div>
        <div>{online ? onlineCount : "Offline"}</div>
      </div>
    </>
  );
}
