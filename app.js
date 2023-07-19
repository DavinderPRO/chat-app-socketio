let express = require("express"),
  app = express(),
  server = require("http").createServer(app),
  io = require("socket.io").listen(server),
  nicknames = [], messages = [];

server.listen(3000);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index-materialize.html");
});
app.use('/static', express.static('static'))

io.sockets.on("connection", function (socket) {
  updateState();

  socket.on("new user", function (data, callback) {
    if (nicknames.indexOf(data) !== -1) callback(false);
    else {
      callback(true);
      socket.nickname = data;
      nicknames.push(socket.nickname);
      updateState();
    }
  });

  function updateState() {
    io.sockets.emit("usernames", nicknames);
    io.sockets.emit("all messages", messages);
  }


  socket.on("send message", function (data) {
    const transaction = {
      message: data,
      nickname: socket.nickname,
    }
    messages.push(transaction)
    socket.broadcast.emit("new message", transaction);
  });

  socket.on("disconnect", function (data) {
    if (!socket.nickname) return;
    else {
      nicknames.splice(nicknames.indexOf(socket.nickname), 1);
      updateState();
    }
  });
});
