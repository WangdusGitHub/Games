const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: "*",
});

const allUsers = {};

io.on("connection", (socket) => {
  allUsers[socket.id] = {
    socket: socket,
    online: true,
    playing: false,
  };
  BroadcastUserCount();

  socket.on("request_to_play", (data) => {
    const currUser = allUsers[socket.id];
    currUser.playerName = data.playerName;

    let opponentPlayer;

    for (const key in allUsers) {
      const user = allUsers[key];
      if (user.online && !user.playing && socket.id !== key) {
        opponentPlayer = user;
        break;
      }
    }
    if (opponentPlayer) {
      currUser.socket.emit("OpponentFound", {
        opponent: opponentPlayer.playerName,
        Symbol: "circle",
      });

      opponentPlayer.socket.emit("OpponentFound", {
        opponent: currUser.playerName,
        Symbol: "cross",
      });

      currUser.socket.on("playerMoveFromClient", (data) => {
        opponentPlayer.socket.emit("playerMoveFromServer", {
          ...data,
        });
      });
      opponentPlayer.socket.on("playerMoveFromClient", (data) => {
        currUser.socket.emit("playerMoveFromServer", {
          ...data,
        });

        // socket?.on("resetGame", () => {
        //   resetGame();
        // });
        // currUser.socket.on("resetGame", (data) => {
        //   opponentPlayer.socket.emit(
        //     "resetGame",
        //     data === "circle" ? "cross" : "circle"
        //   );
        // });
        // opponentPlayer.socket.on("resetGame", () => {
        //   currUser.socket.emit(
        //     "resetGame",
        //     data === "circle" ? "cross" : "circle"
        //   );
        // });
      });
    } else {
      currUser.socket.emit("opponentNotFound");
    }
  });

  socket.on("resetGame", (newPlayingAs) => {
    const currUser = allUsers[socket.id];
    const opponentPlayer = currUser.opponent;

    if (currUser && opponentPlayer) {
      // Broadcast the resetGame event to both players with the new roles
      currUser.socket.emit("resetGame", newPlayingAs);
      opponentPlayer.socket.emit(
        "resetGame",
        newPlayingAs === "circle" ? "cross" : "circle"
      );
    }
  });

  socket.on("disconnect", function () {
    // const currUser = allUsers[socket.id];
    // currUser.online = false;
    delete allUsers[socket.id];
    BroadcastUserCount();
  });
});

const BroadcastUserCount = () => {
  const userCount = Object.keys(allUsers).length;
  io.emit("userCount", Math.floor(userCount));
};

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT);
