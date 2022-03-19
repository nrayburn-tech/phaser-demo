import Phaser from "phaser";
import {useLayoutEffect, useRef} from "react";


class DemoGame extends Phaser.Game {
    constructor(parent: HTMLElement, canvas: HTMLCanvasElement) {
        super({
            scene: undefined,
            parent: parent,
            canvas: canvas,
            backgroundColor: '#000000',
            physics: {
                default: 'arcade',
                arcade: {
                    debug: true,
                    debugShowBody: true,
                    debugShowStaticBody: true
                }
            },
            scale: {
                mode: Phaser.Scale.NONE,
                autoCenter: Phaser.Scale.NO_CENTER
            },
            width: 936,
            height: 526,
            type: Phaser.WEBGL
        });
        this.scene.add('demo-scene', new DemoScene('demo-scene'), true);
    }
}

class DemoScene extends Phaser.Scene {
    declare game: DemoGame;
    private BACKGROUND_KEY = 'background';
    private background!: Phaser.GameObjects.TileSprite;


    constructor(key: string) {
        super(key);
    }

    preload() {
        this.load.image(this.BACKGROUND_KEY, '/Background.png');
    }

    create() {
        this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
        this.cameras.resize(this.scale.width, this.scale.height);
        this.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, this.BACKGROUND_KEY).setOrigin(0);
    }
}

export function Game() {
    const gameRef = useRef<DemoGame | null>(null);
    const parentRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useLayoutEffect(() => {
        if (parentRef.current && canvasRef.current) {
            gameRef.current = new DemoGame(parentRef.current, canvasRef.current);
        }
    }, []);

    return <div style={{height: '100%', width: '100%'}} ref={parentRef}>
        <canvas ref={canvasRef}/>
    </div>

}
