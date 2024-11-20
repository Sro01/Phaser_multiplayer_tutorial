var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

// 현재 게임에 있는 모든 플레이어를 추적하는 객체
var players = {};

app.use(express.static(__dirname));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

server.listen(8081, function () {
    console.log(`Listening on ${server.address().port}`);
});

io.on("connection", function (socket) {
    console.log("a user connected");

    // new player 생성 후 players object에 추가
    players[socket.id] = {
        rotation: 0,
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 500) + 50,
        playerId: socket.id,
        team: Math.floor(Math.random() * 2) == 0 ? "red" : "blue",
    };

    // players object를 new player에게 보냄
    socket.emit("currentPlayers", players);

    // new player의 모든 other players를 update
    socket.broadcast.emit("newPlayer", players[socket.id]);

    socket.on("disconnect", function () {
        console.log("user disconnected");

        // players 객체에서 player 제거
        delete players[socket.id];

        // 다른 플레이어들에게 해당 플레이어가 제거되었다는 것을 알림
        io.emit("_disconnect", socket.id);
    });

    // when a player moves, update the player data
    socket.on("playerMovement", function (movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].rotation = movementData.rotation;
        // emit a message to all players about the player that moved
        socket.broadcast.emit("playerMoved", players[socket.id]);
    });
});
