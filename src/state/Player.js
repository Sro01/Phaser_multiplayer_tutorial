export class Player {
    constructor(playerId, x, y, rotation = 0, hp = 100) {
        this.playerId = playerId; // 플레이어의 고유 ID
        this.x = x; // X 좌표
        this.y = y; // Y 좌표
        this.rotation = rotation; // 회전 각도
        this.hp = hp; // 체력
        this.me = false;
    }

    setPosition(newX, newY) {
        this.x = newX;
        this.y = newY;
    }

    setRotation(mouseX, mouseY) {
        this.rotation = Phaser.Math.Angle.Between(
            mouseX,
            mouseY,
            this.x,
            this.y
        );
    }

    setMe() {
        this.me = true;
    }

    setOther() {
        this.me = false;
    }

    takeDamage(amount) {
        this.hp = Math.max(this.hp - amount, 0); // 체력 감소 (0 이하로 내려가지 않음)
    }

    isAlive() {
        return this.hp > 0; // 플레이어 생존 여부
    }

    isMe() {
        return this.me;
    }
}

// export class thisPlayer extends Player {
//     constructor(playerId, x, y, rotation = 0, hp = 100) {
//         super(playerId, x, y, rotation, hp);
//         this.input = {};
//     }

//     // 키 입력 업데이트
//     updateInput(input) {
//         this.input = input;
//         this.updateDirection();
//     }

//     updateDirection() {
//         this.direction = {};
//     }
// }
