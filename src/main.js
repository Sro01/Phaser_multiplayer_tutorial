// import { Socket } from "socket.io";
// import Config from "./Config";

// const game = new Phaser.Game(Config);

// export default game;

var config = {
    type: Phaser.AUTO,
    parent: "game-container",
    width: 8000,
    height: 6000,
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
    this.load.image("rabbit", "images/rabbit.png");
    this.load.image("dog", "images/dog.png");
}

function create() {
    var self = this;
    this.socket = io();
    this.otherPlayers = this.physics.add.group();

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
    this.socket.on("newPlayer", function (playerInfo) {
        addOtherPlayers(self, playerInfo);
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

function update() {
    if (this.rabbit) {
        if (this.cursors.left.isDown) {
            this.rabbit.setAngularVelocity(-150);
        } else if (this.cursors.right.isDown) {
            this.rabbit.setAngularVelocity(150);
        } else {
            this.rabbit.setAngularVelocity(0);
        }

        if (this.cursors.up.isDown) {
            this.physics.velocityFromRotation(
                this.rabbit.rotation + 1.5,
                100,
                this.rabbit.body.acceleration
            );
        } else {
            this.rabbit.setAcceleration(0);
        }
        // this.physics.world.wrap(this.rabbit, 5);

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
        // save old position data
        this.rabbit.oldPosition = {
            x: this.rabbit.x,
            y: this.rabbit.y,
            rotation: this.rabbit.rotation,
        };
    }

    this.socket.on("playerMoved", function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {
                otherPlayer.setRotation(playerInfo.rotation);
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            }
        });
    });
}

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
