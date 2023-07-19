var express = require("express"),
  app = express(),
  server = require("http").createServer(app),
  io = require("socket.io").listen(server),
  nicknames = [];

server.listen(3000);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index-materialize.html");
});

app.get("/static/materialize.min.css", function (req, res) {
  res.sendFile(__dirname + "/static/materialize.min.css");
});
app.get("/static/chatroomlogo.png", function (req, res) {
  res.sendFile(__dirname + "/static/chatroomlogo.png");
});

app.get("/static/materialize.min.js", function (req, res) {
  res.sendFile(__dirname + "/static/materialize.min.js");
});

app.get("/static/jquery.min.js", function (req, res) {
  res.sendFile(__dirname + "/static/jquery.min.js");
});

io.sockets.on("connection", function (socket) {
  updateNicknames();

  socket.on("new user", function (data, callback) {
    if (nicknames.indexOf(data) !== -1) callback(false);
    else {
      callback(true);
      socket.nickname = data;
      nicknames.push(socket.nickname);
      updateNicknames();
    }
  });

  function updateNicknames() {
    io.sockets.emit("usernames", nicknames);
  }

  socket.on("send message", function (data) {
    socket.broadcast.emit("new message", {
      message: data,
      nickname: socket.nickname,
    });
  });

  socket.on("disconnect", function (data) {
    if (!socket.nickname) return;
    else {
      nicknames.splice(nicknames.indexOf(socket.nickname), 1);
      updateNicknames();
    }
  });
});
