import React, { useEffect } from "react";
import TicTacToe from "./games/TicTacToe/TicTacToe";
import Heading from "./components/Heading";
import { useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

export default function App() {
  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [playerName, setPlayerName] = useState(() => {
    const storedName = localStorage.getItem("playerName");
    return storedName ? storedName : "";
  });
  const [selectedGame, setSelectedGame] = useState(null);

  socket?.on("connect", function () {
    setPlayOnline(true);
  });

  async function handlePlayOnlineClick() {
    const newSocket = io("http://localhost:3001", {
      autoConnect: true,
    });

    newSocket?.emit("request_to_play", {
      playerName: playerName,
    });

    setSocket(newSocket);
  }

  const handleGameSelect = () => {
    // console.log(e);
    setSelectedGame("Tic-Tac-Toe");
    handlePlayOnlineClick();
  };

  useEffect(() => {
    localStorage.setItem("playerName", playerName);
  }, [playerName]);

  if (!playerName) {
    return (
      <>
        <form className="user-input">
          <input
            id="name"
            type="text"
            placeholder="enter name..."
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button
            type="submit"
            onClick={(e) => {
              setPlayerName(playerName);
            }}
          >
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </form>
      </>
    );
  }

  async function handlePlayOnline() {
    const newSocket = io("http://localhost:3001", {
      autoConnect: true,
    });

    newSocket?.emit("request_to_play", {
      playerName: playerName,
    });

    setSocket(newSocket);
  }

  useEffect(() => {
    socket?.on("userCount", (count) => {
      setOnlineCount(count);
    });
  }, [socket]);

  if (selectedGame === null) {
    return (
      <>
        <Heading text="Games" />
        <div className="games-field">
          <div className="game" onClick={() => handleGameSelect("Tic-Tac-Toe")}>
            <img src=".\src\assets\images\tictactoe.png" alt="tictactoe" />
            <div className="name">TicTacToe</div>
          </div>
          <div className="game" onClick={() => handleGameSelect("Cat & Mouse")}>
            <img src=".\src\assets\images\tictactoe.png" alt="tictactoe" />
            <div className="name">Cat & Mouse</div>
          </div>
        </div>
        <div className="show-online">
          <div
            className={onlineCount !== 1 ? "green-light" : "red-light"}
          ></div>
          <div>{onlineCount}</div>
        </div>
      </>
    );
  }

  const games = {
    "Tic-Tac-Toe": (
      <TicTacToe
        playerName={playerName}
        socket={socket}
        playOnline={playOnline}
        setPlayerName={setPlayerName}
        setSocket={setSocket}
        setPlayOnline={setPlayOnline}
      />
    ),
    "Cat & Mouse": (
      <TicTacToe
        playerName={playerName}
        socket={socket}
        playOnline={playOnline}
        setPlayerName={setPlayerName}
        setSocket={setSocket}
        setPlayOnline={setPlayOnline}
      />
    ),
  };

  return (
    <>
      <Heading text={selectedGame} />
      {games[selectedGame]}
      <div className="show-online">
        <div className={onlineCount !== 1 ? "green-light" : "red-light"}></div>
        <div>{onlineCount}</div>
      </div>
    </>
  );
}
