// import { Socket } from "socket.io";
// import Config from "./Config";

// const game = new Phaser.Game(Config);

// export default game;

var config = {
    type: Phaser.AUTO,
    parent: "game-container",
    width: 800,
    height: 600,
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            gravity: { y: 0 },
        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

var game = new Phaser.Game(config);

function preload() {
    this.load.setPath("public/assets/");
    this.load.image("rabbit_v", "images/rabbit.png");
    this.load.image("dog", "images/dog.png");
    this.load.image("bullet", "images/bullet.png");
}

function create() {
    var self = this;
    this.socket = io();
    this.otherPlayers = this.physics.add.group();
    this.bullets = this.physics.add.group(); // 총알 그룹 추가

    // 플레이어 생성
    this.socket.on("currentPlayers", function (players) {
        console.log("currentPlayers!!!");
        // players의 keys(socket.id) 배열을 순회
        console.log(players);
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                addPlayer(self, players[id]);
            } else {
                addOtherPlayers(self, players[id]);
            }
        });
    });

    // 새로운 플레이어 생성 시 다른 플레이어에게도 업데이트
    this.socket.on("newPlayer", function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });

    // 마우스 클릭 이벤트
    this.input.on("pointerdown", function (pointer) {
        if (self.rabbit) {
            console.log("pointerdown");
            // const angle = Phaser.Math.Angle.Between(
            //     self.rabbit.x,
            //     self.rabbit.y,
            //     pointer.worldX,
            //     pointer.worldY
            // // );
            // const velocityX = Math.cos(angle) * 300;
            // const velocityY = Math.sin(angle) * 300;

            self.socket.emit("fireBullet", {
                x: self.rabbit.x,
                y: self.rabbit.y,
                velocityX: velocityX,
                velocityY: velocityY,
            });
        }
    });

    // 서버로부터 총알 정보를 받으면 클라이언트에 렌더링
    this.socket.on("bulletFired", function (bulletInfo) {
        const bullet = self.add.image(bulletInfo.x, bulletInfo.y, "bullet");
        bullet.id = bulletInfo.id;
        bullet.velocityX = bulletInfo.velocityX;
        bullet.velocityY = bulletInfo.velocityY;
        self.bullets.add(bullet);
    });

    // 총알 제거 이벤트
    this.socket.on("removeBullet", function (bulletId) {
        self.bullets.getChildren().forEach(function (bullet) {
            if (bullet.id === bulletId) {
                bullet.destroy();
            }
        });
    });

    this.socket.on("_disconnect", function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
            }
        });
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.socket.on("playerMoved", function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {
                otherPlayer.setRotation(playerInfo.rotation);
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            }
        });
    });
}

function input() {
    if (this.rabbit) {
        /** Input */
        if (this.cursors.left.isDown) {
            // rabbit.angle = -150;
            // this.rabbit.setAngularVelocity(-150);
            this.rabbbit.rotation += 10;
        } else if (this.cursors.right.isDown) {
            // this.rabbit.setAngularVelocity(150);
        } else {
            // this.rabbit.setAngularVelocity(0);
        }

        if (this.cursors.up.isDown) {
            rabbit.rotation += 1.5;
            // this.physics.velocityFromRotation(
            //     this.rabbit.rotation + 1.5,
            //     100,
            //     this.rabbit.body.acceleration
            // );
        } else {
            // this.rabbit.setAcceleration(0);
        }
        // this.physics.world.wrap(this.rabbit, 5);
    }
}

function output() {
    /** OUTPUT */

    this.rabbit_v.setAngularVelocity(rabbit.angle);

    this.physics.velocityFromRotation(
        rabbit.rotation,
        100,
        this.rabbit_v.body.acceleration
    );

    // save old position data
    this.rabbit.oldPosition = {
        x: this.rabbit.x,
        y: this.rabbit.y,
        rotation: this.rabbit.rotation,
    };

    /** HP */
    this.rabbit.hpText.setPosition(this.rabbit.x - 40, this.rabbit.y - 60);
    this.rabbit.hpText.setText(`HP: ${this.rabbit.hp}`);

    // 총알 이동 업데이트
    this.bullets.getChildren().forEach(function (bullet) {
        bullet.x += bullet.velocityX / 60; // 60FPS 기준
        bullet.y += bullet.velocityY / 60;
    });
}

// View (그리기) && Input
function update() {
    // 16ms 마다 실행
    input();
    output();
}

this.socket.on("playerMoved", function (playerInfo) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
            // otherPlayer.setRotation(playerInfo.rotation);
            otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        }
    });
});

setInterval(function () {
    /** Timer로 옮기기 */
    // emit player movement
    var x = this.rabbit.x;
    var y = this.rabbit.y;
    var r = this.rabbit.rotation;
    if (
        this.rabbit.oldPosition &&
        (x !== this.rabbit.oldPosition.x ||
            y !== this.rabbit.oldPosition.y ||
            r !== this.rabbit.oldPosition.rotation)
    ) {
        this.socket.emit("playerMovement", {
            x: this.rabbit.x,
            y: this.rabbit.y,
            rotation: this.rabbit.rotation,
        });
    }
}, 16);

function addPlayer(self, playerInfo) {
    console.log("currentPlayers!!!");

    console.log(playerInfo);
    self.rabbit = self.physics.add
        .image(playerInfo.x, playerInfo.y, "rabbit")
        .setOrigin(0.5, 0.5)
        .setDisplaySize(530, 400);
    if (playerInfo.team === "blue") {
        self.rabbit.setTint(0x0000ff);
    } else {
        self.rabbit.setTint(0xff0000);
    }
    self.rabbit.setDrag(100);
    self.rabbit.setAngularDrag(100);
    self.rabbit.setMaxVelocity(200);

    // HP 표시
    self.rabbit.hp = playerInfo.hp;
    self.rabbit.hpText = self.add.text(
        playerInfo.x - 40,
        playerInfo.y - 60,
        `HP: ${playerInfo.hp}`,
        { fontSize: "20px", fill: "#fff" }
    );
}

function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.add
        .sprite(playerInfo.x, playerInfo.y, "dog")
        .setOrigin(0.5, 0.5)
        .setDisplaySize(530, 400);
    if (playerInfo.team === "blue") {
        otherPlayer.setTint(0x0000ff);
    } else {
        otherPlayer.setTint(0xff0000);
    }
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}
