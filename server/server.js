const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: "*",
});

const clients = new Set();
const clientData = new Map();
const waitingPlayers = new Map();

function broadcastPlayerCount() {
  const playerCount = clients.size;
  io.emit("playerCount", playerCount);
  // console.log(`Broadcasted player count: ${playerCount}`);
}

function findOpponentSocket(socket) {
  const currentUserData = clientData.get(socket);
  if (currentUserData && currentUserData.opponent) {
    for (const client of clients) {
      if (client.id === currentUserData.opponent) {
        return client;
      }
    }
  }
  return null;
}

function determineStonePaperScissorWinner(p1, p2) {
  if (p1 === p2) return "tie";
  if (
    (p1 === "rock" && p2 === "scissors") ||
    (p1 === "paper" && p2 === "rock") ||
    (p1 === "scissors" && p2 === "paper")
  ) {
    return "player1";
  } else {
    return "player2";
  }
}

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  clients.add(socket);
  clientData.set(socket, {
    online: true,
    playing: false,
    waiting: false,
    gameSelected: null,
    playerName: null,
    opponent: null,
    choice: null,
  });
  broadcastPlayerCount();

  socket.on("updatePlayerName", (data) => {
    const currUser = clientData.get(socket);
    if (currUser) {
      currUser.playerName = data.playerName;
      // console.log(`Player name updated for ${socket.id}: ${data.playerName}`);
    }
  });

  socket.on("playerChoice", (data) => {
    const playerData = clientData.get(socket);
    playerData.choice = data.playerChoice;
    const opponentSocket = playerData.opponent;
    console.log("got opponent socket: ", opponentSocket);
    if (opponentSocket) {
      const opponentData = clientData.get(opponentSocket);
      console.log("got opponent data: ",clientData.get(opponentSocket) 
);
      // if (opponentData.choice) {
      //   socket.emit("opponentChoice", opponentData.choice);
      //   opponentSocket.emit("opponentChoice", playerData.choice);

      //   playerData.choice = null;
      //   opponentData.choice = null;
      // }
    }
  });

  socket.on("gameSelected", (data) => {
    const currUser = clientData.get(socket);
    if (currUser) {
      currUser.gameSelected = data.gameName;
      // console.log(
      //   `${data.playerName} (${socket.id}) selected game: ${data.gameName}`
      // );

      if (!waitingPlayers.has(data.gameName)) {
        waitingPlayers.set(data.gameName, new Set());
      }
      waitingPlayers.get(data.gameName).add(socket);
      currUser.waiting = true;
      socket.emit("waitingForOpponent", { gameName: data.gameName });
      // console.log(
      //   `${data.playerName} added to waiting list for ${
      //     data.gameName
      //   }. Current waiting: ${waitingPlayers.get(data.gameName)?.size}`
      // );

      const waitingList = waitingPlayers.get(data.gameName);
      if (waitingList && waitingList.size >= 2) {
        const player1 = waitingList.values().next().value;
        waitingList.delete(player1);
        const player2 = waitingList.values().next().value;
        waitingList.delete(player2);

        const player1Data = clientData.get(player1);
        const player2Data = clientData.get(player2);

        if (player1Data && player2Data) {
          player1Data.playing = true;
          player1Data.waiting = false;
          player1Data.opponent = player2.id;

          player2Data.playing = true;
          player2Data.waiting = false;
          player2Data.opponent = player1.id;

          player1.emit("OpponentFound", {
            opponent: player2Data.playerName,
            Symbol: "circle",
            gameStarted: true,
            gameName: data.gameName,
          });

          player2.emit("OpponentFound", {
            opponent: player1Data.playerName,
            Symbol: "cross",
            gameStarted: true,
            gameName: data.gameName,
          });

          // console.log(
          //   `Game started between ${player1Data.playerName} (${player1.id}) and ${player2Data.playerName} (${player2.id}) for ${data.gameName}`
          // );
          setupGameEventListeners(player1, player2, data.gameName);
        } else if (player1) {
          waitingPlayers.get(data.gameName)?.add(player1);
        } else if (player2) {
          waitingPlayers.get(data.gameName)?.add(player2);
        }
      }
    }
  });

  socket.on("playerMoveFromClient", (data) => {
    const opponentSocket = findOpponentSocket(socket);
    if (opponentSocket) {
      opponentSocket.emit("playerMoveFromServer", data);
      // console.log(
      //   `Move from ${socket.id} relayed to ${opponentSocket.id}:`,
      //   data
      // );
    } else {
      console.log(`Opponent not found for ${socket.id}`);
    }
  });

  socket.on("playAgain", () => {
    const currentUserData = clientData.get(socket);
    if (currentUserData && currentUserData.gameSelected) {
      const gameName = currentUserData.gameSelected;
      if (!waitingPlayers.has(gameName)) {
        waitingPlayers.set(gameName, new Set());
      }
      waitingPlayers.get(gameName).add(socket);
      currentUserData.playing = false;
      currentUserData.waiting = true;
      currentUserData.opponent = null; // Clear the opponent
      // console.log(
      //   `${currentUserData.playerName} (${
      //     socket.id
      //   }) requested to play again and added to waiting list for ${gameName}. Current waiting: ${
      //     waitingPlayers.get(gameName)?.size
      //   }`
      // );

      // Check if there are now enough players to start a new game
      const waitingList = waitingPlayers.get(gameName);
      if (waitingList && waitingList.size >= 2) {
        const player1 = waitingList.values().next().value;
        waitingList.delete(player1);
        const player2 = waitingList.values().next().value;
        waitingList.delete(player2);

        const player1Data = clientData.get(player1);
        const player2Data = clientData.get(player2);

        if (player1Data && player2Data) {
          player1Data.playing = true;
          player1Data.waiting = false;
          player1Data.opponent = player2.id;

          player2Data.playing = true;
          player2Data.waiting = false;
          player2Data.opponent = player1.id;

          player1.emit("OpponentFound", {
            opponent: player2Data.playerName,
            Symbol: "circle",
            gameStarted: true,
            gameName: gameName,
          });

          player2.emit("OpponentFound", {
            opponent: player1Data.playerName,
            Symbol: "cross",
            gameStarted: true,
            gameName: gameName,
          });

          // console.log(
          //   `New game started between ${player1Data.playerName} (${player1.id}) and ${player2Data.playerName} (${player2.id}) for ${gameName} after play again.`
          // );
          setupGameEventListeners(player1, player2, gameName);
        } else if (player1) {
          waitingPlayers.get(gameName)?.add(player1);
        } else if (player2) {
          waitingPlayers.get(gameName)?.add(player2);
        }
      }
    }
  });

  socket.on("disconnect", () => {
    // console.log(`Client disconnected: ${socket.id}`);
    clients.delete(socket);
    clientData.delete(socket);

    for (const [game, waitingList] of waitingPlayers) {
      if (waitingList.has(socket)) {
        waitingList.delete(socket);
        console.log(
          `Removed ${
            clientData.get(socket)?.playerName
          } from waiting list for ${game}. Current waiting: ${waitingList.size}`
        );
      }
    }

    for (const [clientSocket, data] of clientData) {
      if (data.opponent === socket.id) {
        data.opponent = null;
        data.playing = false;
        clientSocket.emit("opponentDisconnected");
      }
    }
    broadcastPlayerCount();
  });
});

function setupGameEventListeners(player1, player2, gameName) {
  // No specific game event listeners needed here as moves are handled directly
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
