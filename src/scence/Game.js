import { Scene } from "phaser";
import Config from "../Config";
import { Player } from "./Player";
import { Bullet } from "./Bullet";
import { state } from "./State";
import { Preloader } from "./Preloader";

export class Game extends Scene {
    constructor() {
        super("Game");
    }

    create() {
        this.socket = io();

        const playerId = this.socket.id;
        const player = new (Player(
            playerid,
            Math.floor(Math.random() * 700) + 50
        ))();
    }
}
