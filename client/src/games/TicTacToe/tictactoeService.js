// tictactoeService.js

const setupTicTacToeSocket = (
  socket,
  gameState,
  setGameState,
  currPlayer,
  setCurrPlayer,
  symbol,
  setFinishState,
  setWinnerLine
) => {
  if (socket) {
    socket.on("playerMoveFromServer", (data) => {
      const newGameState = gameState.map((arr) => [...arr]);
      newGameState[Math.floor(data.state.id / 3)][data.state.id % 3] =
        data.state.sign;
      setGameState(newGameState);
      setCurrPlayer(symbol === "circle" ? "circle" : "cross");
    });

    socket.on("resetGame", () => {
      setGameState([
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ]);
      setCurrPlayer("circle");
      setFinishState(null);
      setWinnerLine([]);
    });
  }

  return () => {
    if (socket) {
      socket.off("playerMoveFromServer");
      socket.off("resetGame");
    }
  };
};

const emitPlayerMove = (socket, index, symbol) => {
  if (socket) {
    socket.emit("playerMoveFromClient", { state: { id: index, sign: symbol } });
  }
};

const emitResetGame = (socket) => {
  if (socket) {
    socket.emit("resetGame");
  }
};

export { setupTicTacToeSocket, emitPlayerMove, emitResetGame };
