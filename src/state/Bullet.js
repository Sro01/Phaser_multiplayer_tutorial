export class Bullet {
    constructor(x, y, rotation) {
        this.x = x;
        this, (y = y);
        this.rotation = rotation;
        this.speed = 600; // 이동속도
        this.lifespan = 1000; // 총알 수명 (ms)
    }

    update(delta) {
        this.lifespan -= delta;
        this.x += Math.cos(this.rotation) * this.speed * (delta / 1000);
        this.y += Math.sin(this.rotation) * this.speed * (delta / 1000);

        return this.lifespan > 0; // 수명이 남아있으면 true, 아니면 false
    }
}
