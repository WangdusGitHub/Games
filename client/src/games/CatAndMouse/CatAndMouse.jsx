import React, { useState } from "react";
import "./CatAndMouse.css";
// import "../src/App.css";
import { useEffect } from "react";

function GamePath({ playerName, socket, playOnline }) {
  const [initialPlayer, setInitialPlayer] = useState("cat");
  const [catPosition, setCatPosition] = useState(3);
  const [mousePosition, setMousePosition] = useState(2);
  const [selectedAnimal, setSelectedAnimal] = useState(initialPlayer);
  const [gameOver, setGameOver] = useState(false);

  // Valid posiitons to move w.r.t. current position
  const possiblePath = {
    0: [1, 4, 5],
    1: [0, 2, 3],
    2: [1, 4],
    3: [1, 5],
    4: [0, 2, 5],
    5: [0, 3, 4],
  };

  // To let player move once and give other player chance to move
  const isMoveAllowed = (currentPosition, newPosition) => {
    return possiblePath[currentPosition].includes(newPosition);
  };

  // To drag cat
  const handleCatDragStart = (e) => {
    if (selectedAnimal === "cat") {
      // console.log(catPosition);
      e.dataTransfer.setData("catPosition", catPosition);
    } else {
      e.preventDefault();
    }
  };

  // To drag mouse
  const handleMouseDragStart = (e) => {
    if (selectedAnimal === "mouse") {
      e.dataTransfer.setData("mousePosition", mousePosition);
    } else {
      e.preventDefault();
    }
  };

  // To handle cat drop
  const handleCatDrop = (e, newPosition) => {
    e.preventDefault();
    const draggedPosition = e.dataTransfer.getData("catPosition");

    // To check if move is allowed!
    if (isMoveAllowed(parseInt(draggedPosition), newPosition)) {
      setCatPosition(newPosition);
      switchSelectedAnimal();
    }
  };

  // To handle mouse drop
  const handleMouseDrop = (e, newPosition) => {
    e.preventDefault();
    const draggedPosition = e.dataTransfer.getData("mousePosition");

    // To check if move is allowed
    if (isMoveAllowed(parseInt(draggedPosition), newPosition)) {
      setMousePosition(newPosition);
      switchSelectedAnimal();
    }
  };

  // To switch players
  const switchSelectedAnimal = () => {
    setSelectedAnimal(selectedAnimal === "cat" ? "mouse" : "cat");
  };

  // Define game-over
  useEffect(() => {
    if (catPosition === mousePosition) {
      setGameOver(true);
      alert("GameOver! Cat caught the mouse!");
      handleRestart();
    }
  }, [catPosition, mousePosition]);

  // To reset the game
  const handleRestart = () => {
    setCatPosition(3); // Reset cat position
    setMousePosition(2); // Reset mouse position
    setGameOver(false); // Reset game over state
    setInitialPlayer(initialPlayer === "cat" ? "mouse" : "cat"); // Switch player
  };

  // cat
  const renderCat = () => (
    <img
      className="draggable"
      id="cat"
      src="../src/assets/cat.png"
      alt="cat"
      draggable
      onDragStart={handleCatDragStart}
    />
  );

  // mouse
  const renderMouse = () => (
    <img
      className="draggable"
      id="mouse"
      src="../src/assets/mouse.png"
      alt="mouse"
      draggable
      onDragStart={handleMouseDragStart}
    />
  );

  return (
    <>
      <div className="game-wrapper">
        <div id="circle">
          <div id="vertices">
            {/* Create 6 points */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                id={`vertex${i}`}
                key={i}
                // On drag functions:
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  if (e.dataTransfer.getData("catPosition")) {
                    handleCatDrop(e, i);
                  }
                  if (e.dataTransfer.getData("mousePosition")) {
                    handleMouseDrop(e, i);
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent click from triggering parent's onClick
                  // move(player, position);

                  if (
                    selectedAnimal === "cat" &&
                    isMoveAllowed(catPosition, i)
                  ) {
                    setCatPosition(i);
                    switchSelectedAnimal();
                  }

                  if (
                    selectedAnimal === "mouse" &&
                    isMoveAllowed(mousePosition, i)
                  ) {
                    setMousePosition(i);
                    switchSelectedAnimal();
                  }
                }}
              >
                {catPosition === i ? renderCat() : null}
                {mousePosition === i ? renderMouse() : null}
                <button id={`btn${i}`} className="btn"></button>
              </div>
            ))}
          </div>
          <div id="edges">
            <div id="edge1"></div>

            <div id="edge4"></div>

            <div id="edge5"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default GamePath;
