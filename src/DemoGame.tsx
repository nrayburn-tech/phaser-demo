import Phaser from "phaser";
import {useLayoutEffect, useRef, useState} from "react";


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
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private cursorText!: Phaser.GameObjects.Text;
    private background!: Phaser.GameObjects.TileSprite;
    private originalSize!: { width: number; height: number };

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
        this.cursorText = this.add.text(0, 0, '', {color: 'black', fontSize: '2rem'});
        this.originalSize = {width: this.scale.width, height: this.scale.height};
        this.cursors = this.input.keyboard.createCursorKeys();

        this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
            const width = gameSize.width;
            const height = gameSize.height;
            this.cameras.resize(width, height);
            this.background.setScale(width / this.originalSize.width, height / this.originalSize.height);
        })

        const resize = (changeX: number, changeY: number, lastKey: string) => {
            this.game.scale.resize(this.game.canvas.width + changeX, this.game.canvas.height + changeY);
            this.cursorText.text = lastKey;
        }

        this.cursors.up.on('up', () => {
            resize(0, -100, 'up');
        })
        this.cursors.down.on('up', () => {
            resize(0, 100, 'down');
        })
        this.cursors.left.on('up', () => {
            resize(-100, 0, 'left');
        })
        this.cursors.right.on('up', () => {
            resize(100, 0, 'right');
        })
        this.cursors.space.on('up', () => {
            this.game.scale.resize(this.originalSize.width, this.originalSize.height);
            this.background.setScale(1, 1);
            this.cursorText.text = '';
        })
    }
}

export function Game() {
    const gameRef = useRef<DemoGame | null>(null);
    const originalSize = useRef<{ width: number; height: number } | null>(null)
    const parentRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [useObserver, setUseObserver] = useState(false);

    useLayoutEffect(() => {
        if (parentRef.current && canvasRef.current) {
            gameRef.current = new DemoGame(parentRef.current, canvasRef.current);
            originalSize.current = {width: gameRef.current.scale.width, height: gameRef.current.scale.height};
        }
    }, []);

    useLayoutEffect(() => {
        const resizeListener = () => {
            if (useObserver && parentRef.current && gameRef.current) {
                const size = parentRef.current.getBoundingClientRect();
                gameRef.current.scale.resize(size.width - 10, size.height - 10);
            }
        }
        window.addEventListener('resize', resizeListener)
        if (useObserver) {
            resizeListener();
        } else {
            if (gameRef.current && originalSize.current) {
                gameRef.current.scale.resize(originalSize.current.width, originalSize.current.height);
            }
        }

        return () => {
            window.removeEventListener('resize', resizeListener);
        }
    }, [useObserver]);

    return <div style={{height: '100%', width: '100%', display: 'flex', flexDirection: 'column'}}>
        <button onClick={() => setUseObserver((prev) => !prev)}>{useObserver ? 'Disable' : 'Enable'} Resize
            Observer
        </button>
        <div ref={parentRef} style={{height: '100%', width: '100%'}}>
            <canvas ref={canvasRef}/>
        </div>
    </div>


}
