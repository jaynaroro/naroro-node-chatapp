const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./utils/message");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

//call the express function to startup an express application
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New Web Socket Connection Detected");

  //join a room//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  socket.on("join", ({ username, room }, callback) => {
    //add the user to the users array
    const { error, user } = addUser({
      id: socket.id,
      username: username,
      room: room,
    });

    //check what comes back from the function
    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessage("System", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("System", `${user.username} has joined the room`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    //acknowledge that everything worked fine
    callback();
  });

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed in this chat");
    }

    const user = getUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", generateMessage(user.username, message));
      callback();
    }
  });

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    //confirm if the user was actually in a room
    if (user) {
      //let the occupants know the user has left
      io.to(user.room).emit(
        "message",
        generateMessage("System", `${user.username} has left the room`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //

  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "locationMessage",
        generateLocationMessage(
          user.username,
          `https://google.com/maps?q=${coords.Latitude},${coords.Longitude}`
        )
      );
      callback();
    }
  });
});

server.listen(port, () => {
  console.log("App is running in port " + port);
});
