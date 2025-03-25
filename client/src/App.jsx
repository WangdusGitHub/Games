import React, { useEffect } from "react";
import TicTacToe from "./games/TicTacToe/TicTacToe";
import Heading from "./components/Heading";
import { useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

export default function App() {
  const [playOnline, setPlayOnline] = useState(true);
  const [socket, setSocket] = useState(null);
  const [online, setOnline] = useState();
  const [playerName, setPlayerName] = useState(() => {
    const storedName = localStorage.getItem("playerName");
    return storedName ? storedName : "";
  });
  const [game, setGame] = useState(null);

  socket?.on("connect", function () {
    setPlayOnline(true);
  });

  const handleGameSelect = () => {
    // console.log(e);
    setGame("tictactoe");
    handlePlayOnlineClick();
  };
  useEffect(() => {
    localStorage.setItem("playerName", playerName);
  }, [playerName]);

  if (!playerName) {
    let playerName = "";
    return (
      <>
        <form className="user-input">
          <input
            id="name"
            type="text"
            placeholder="enter name..."
            onChange={(e) => (playerName = e.target.value)}
          />
          <button
            // className="btn"
            type="submit"
            onClick={() => {
              setPlayer(playerName);
            }}
          >
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </form>
      </>
    );
  }
  async function handlePlayOnlineClick() {
    const newSocket = io("http://localhost:3001", {
      autoConnect: true,
    });

    newSocket?.emit("request_to_play", {
      playerName: playerName,
    });

    setSocket(newSocket);
  }
  if (game == null) {
    return (
      <>
        <Heading text="Games" />
        <div className="games-field">
          <div className="game" onClick={handleGameSelect}>
            <img src=".\src\assets\images\tictactoe.png" alt="tictactoe" />
            <div className="name">TicTacToe</div>
          </div>
          <div className="game" onClick={handleGameSelect}>
            <img src=".\src\assets\images\tictactoe.png" alt="tictactoe" />
            <div className="name">Cat & Mouse</div>
          </div>
        </div>
        ;
      </>
    );
  }

  return (
    <>
      <Heading text="TicTacToe" />
      <TicTacToe
        playerName={playerName}
        socket={socket}
        playOnline={playOnline}
        setPlayerName={setPlayerName}
        setSocket={setSocket}
        setPlayOnline
      />
      <div className="show-online">
        <div className={online !== 1 ? "green-light" : "red-light"}></div>
        <div>{online}</div>
      </div>
    </>
  );
}
