var config = {
    type: Phaser.AUTO,
    parent: "pahser-example",
    width: 800,
    height: 600,
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            gravity: { y: 0 },
        },
    },
    scence: {
        preload: preload,
        create: create,
        update: update,
    },
};

var game = new Phaser.Game(config);

function preload() {}

function create() {}

function update() {}

this.socket = io();
