import { Scene } from "phaser";

export class Preloader extends Scene {
    constructor() {
        super("Preloader");
    }

    init() {
        this.add.image(512, 384, "backgroundImg");

        //  간단한 진행 바입니다. 이것은 바의 외곽선입니다.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  이것은 진행 바 자체입니다. 진행률에 따라 왼쪽에서부터 크기가 증가합니다.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        //  로더 플러그인에서 발생하는 'progress' 이벤트를 사용하여 로딩 바를 업데이트합니다.
        this.load.on("progress", (progress) => {
            //  진행 바를 업데이트합니다 (우리의 바는 464px 너비이므로 100% = 464px).
            bar.width = 4 + 460 * progress;
        });
    }

    preloade() {
        this.load.setPath("public/assets/");

        // Images
        this.load.image("backgroundImg", "images/background.jpeg");
        this.load.image("rabbitImg", "images/rabbit.png");
        this.load.image("dogImg", "images/dog.png");
        this.load.image("bulletImg", "images/bullet.png");
    }

    create() {
        this.scene.start("Game");
    }
}
