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

function preload() {}

function create() {
    this.socket = io();

    socket.on("connect", function () {
        console.log("Connected to server");
    });
}

function update() {}
