const express = require("express");
const cors = require("cors");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = 8000;

app.use(express());
app.use(cors());

//EVENT LISTENERS

let clientArray = [];
const users = {};

io.on("connection", (socket) => {
  // io.sockets.on("connect", (cl) => {
  //   clientArray.push(cl.id);
  //   console.log(clientArray);
  // });
  socket.on("new-user", (newUserData) => {
    users[socket.id] = newUserData;
    let isPresent = false;
    if (clientArray.length === 0) {
      clientArray.push(newUserData);
    }
    for (let i = 0; i < clientArray.length; i++) {
      if (newUserData.name === clientArray[i].name) {
        isPresent = true;
      }
    }
    if (!isPresent) {
      clientArray.push(newUserData);
    }

    // newUserData[socket.id] = users;
    let data = {
      data: newUserData,
      usersList: clientArray,
    };
    io.emit("user-connected", data);
    io.emit("user-count", clientArray);
  });

  let data = { id: socket.id };
  socket.emit("set_id", data);
  socket.on("send_message", (body) => {
    io.emit("message", body);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");
    clientArray = clientArray.filter(
      (item) => users[socket.id].name !== item.name
    );
    delete users[socket.id];
    io.emit("user-disconnected", clientArray);
  });
});

server.listen(port, () => {
  console.log("Server Started at port: " + port);
});
