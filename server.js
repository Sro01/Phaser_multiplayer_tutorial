var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

/** 현재 게임에 있는 모든 플레이어를 추적하는 객체 */
const players = {};

/** 총알 */
let bullets = [];
let bulletId = 0;
const MAX_BULLET_DISTANCE = 1000; // 총알 최대 이동 거리

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
        hp: 100,
    };

    // players object를 new player에게 보냄
    socket.emit("currentPlayers", players);

    // new player의 모든 other players를 update
    socket.broadcast.emit("newPlayer", players[socket.id]);

    // 플레이어 이동 처리
    socket.on("playerMovement", function (movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].rotation = movementData.rotation;

        // 이동한 플레이어를 모든 클라이언트에 업데이트
        socket.broadcast.emit("playerMoved", players[socket.id]);
    });

    // 총알 발사 처리
    socket.on("fireBullet", function (bulletData) {
        // 총알 생성
        const newBullet = {
            id: bulletId++,
            x: bulletData.x,
            y: bulletData.y,
            startX: bulletData.x, // 총알 시작 위치
            startY: bulletData.y,
            distanceTraveled: 0, // 총알 이동 거리
            velocityX: bulletData.velocityX,
            velocityY: bulletData.velocityY,
            playerId: socket.id, // 총알을 발사한 플레이어 ID 저장
        };

        bullets.push(newBullet);

        // 총알 정보를 모든 클라이언트에게 전달
        io.emit("bulletFired", newBullet);
    });

    // 연결 해제
    socket.on("disconnect", function () {
        console.log("user disconnected");

        // players 객체에서 player 제거
        delete players[socket.id];

        // 다른 플레이어들에게 해당 플레이어가 제거되었다는 것을 알림
        io.emit("_disconnect", socket.id);
    });
});

setInterval(function () {
    bullets.forEach((bullet, bulletIndex) => {
        // 총알 이동 업데이트
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;

        // 이동 거리 계산
        const dx = bullet.x - bullet.startX;
        const dy = bullet.y - bullet.startY;
        bullet.distanceTraveled = Math.sqrt(dx * dx + dy * dy);

        // 최대 이동 거리 도달 시 제거
        if (bullet.distanceTraveled > MAX_BULLET_DISTANCE) {
            bullet.splice(bulletIndex, 1);
            io.emit("removeBullet", bullet.id);
            return;
        }

        // 총알과 플레이어 충돌 확인
        for (const playerId in players) {
            const player = players[playerId];

            if (bullet.distanceTraveled < 25 && bullet.playerId !== playerId) {
                // 충돌 거리 && 발사자는 타격 받지 않도록 발사자 확인
                player.hp -= 10; // 체력 감소

                // 체력이 0 이하이면 플레이어 제거
                if (player.hp <= 0) {
                    delete players[playerId];
                    io.emit("playerKilled", playerId);
                }

                // 충돌한 총알 제거
                bullets.splice(bulletIndex, 1);
                io.emit("removeBullet", bullet.id);
                break;
            }
        }
    });

    io.emit("updatePlayers", players);
}, 16);
