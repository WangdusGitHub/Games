import React, { useEffect, useState } from "react";
import "./StonePaperScissor.css";

export default function StonePaperScissor({
  playerName,
  socket,
  opponentName,
  wwaitingForOpponent,
}) {
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [playerChoice, setPlayerChoice] = useState(null);
  const [score, setScore] = useState({ player: 0, opponent: 0 });

  const renderStone = <i className="fa-solid fa-hand-back-fist"></i>;
  const renderPaper = <i className="fa-solid fa-hand"></i>;
  const renderScissor = <i className="fa-solid fa-scissors"></i>;
  const renderLizard = <i className="fa-solid fa-hand-lizard"></i>;
  const renderSpock = <i className="fa-solid fa-hand-spock"></i>;

  useEffect(() => {
    if (opponentChoice && playerChoice) {
      if (opponentChoice === playerChoice) {
        console.log("It's a draw!");
      } else if (
        (opponentChoice === "stone" &&
          (playerChoice === "scissor" || playerChoice === "lizard")) ||
        (opponentChoice === "paper" &&
          (playerChoice === "stone" || playerChoice === "spock")) ||
        (opponentChoice === "scissor" &&
          (playerChoice === "paper" || playerChoice === "lizard")) ||
        (opponentChoice === "lizard" &&
          (playerChoice === "spock" || playerChoice === "stone")) ||
        (opponentChoice === "spock" &&
          (playerChoice === "scissor" || playerChoice === "paper"))
      ) {
        console.log("Opponent wins!");
        setScore((prev) => ({ ...prev, opponent: prev.opponent + 1 }));
      } else {
        console.log("You win!");
        setScore((prev) => ({ ...prev, player: prev.player + 1 }));
      }
      // setPlayerChoice(null);
      setOpponentChoice(null);
    } else {
      socket.emit("playerChoice", { playerChoice, opponentName });
    }
  }, [playerChoice, opponentChoice]);

  useEffect(() => {
    console.log(opponentChoice);
  }, [opponentChoice]);

  socket.on("opponentChoice", (data) => {
    console.log("Opponent chose:", data);
    setOpponentChoice(data);
    console.log(data);
  });
  useEffect(() => {

    socket.on("resetGame", () => {
      setScore({ player: 0, opponent: 0 });
      setPlayerChoice(null);
      setOpponentChoice(null);
    });

    return () => {
      socket.off("opponentChoice");
      socket.off("resetGame");
    };
  }, [socket]);

  const handleChoice = (choice) => {
    setPlayerChoice(choice);
  };

  const renderChoice = (choice) => {
    switch (choice) {
      case "stone":
        return renderStone;
      case "paper":
        return renderPaper;
      case "scissor":
        return renderScissor;
      case "lizard":
        return renderLizard;
      case "spock":
        return renderSpock;
      default:
        return null;
    }
  };

  return (
    <div className="game-wrapper">
      <div className="scores">
        <div className="player-score">
          {playerName}: {score.player}
        </div>
        <div className="opponent-score">
          {opponentName}: {score.opponent}
        </div>
      </div>
      <div className="board2">
        <div className="player">{renderChoice(playerChoice)}</div>
        <div className="line"></div>
        <div className="opponent">{renderChoice(opponentChoice)}</div>
      </div>
      <div className="btns">
        <button className="stone" onClick={() => handleChoice("stone")}>
          {renderStone} Stone
        </button>
        <button className="paper" onClick={() => handleChoice("paper")}>
          {renderPaper} Paper
        </button>
        <button className="scissor" onClick={() => handleChoice("scissor")}>
          {renderScissor} Scissor
        </button>
        <button className="lizard" onClick={() => handleChoice("lizard")}>
          {renderLizard} Lizard
        </button>
        <button className="spock" onClick={() => handleChoice("spock")}>
          {renderSpock} Spock
        </button>
      </div>
    </div>
  );
}
