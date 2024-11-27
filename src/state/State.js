// class Rabbit {
//     angle: 0,
//     x: 0,
//     y: 0,
//     rotation: 0,
//     direction: 0,
// };
import { Player } from "./Player";
export const state = {
    players: {},
    bullets: [],

    addPlayer(player) {
        this.players[player.id] = player;
    },

    updatePlayer(id, data) {
        if (this.player[id]) {
            Object.assign(this.players[id], date);
        }
    },

    removePlayer(id) {
        delete this.players[id];
    },

    addBullet(bullet) {
        this.bullets.push(bullet);
    },

    updateBullets(delta) {
        this.bullets = this.bullets.filter((bullet) => bullet.update(delta));
    },
};
