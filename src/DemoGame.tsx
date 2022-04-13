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
    private CHARACTER_KEY = 'character';
    private background!: Phaser.GameObjects.TileSprite;
    private character!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private cursorText!: Phaser.GameObjects.Text;
    private originalSize!: { width: number; height: number };

    constructor(key: string) {
        super(key);
    }

    preload() {
        this.load.image(this.BACKGROUND_KEY, '/Background.png');
        this.load.spritesheet(this.CHARACTER_KEY, '/Fish.png', {
            frameWidth: 256,
            frameHeight: 256,
        });
    }

    create() {
        // Setup, nothing really special here.
        this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
        this.cameras.resize(this.scale.width, this.scale.height);
        this.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, this.BACKGROUND_KEY).setOrigin(0);
        this.character = this.physics.add.sprite(150, this.scale.height / 3, this.CHARACTER_KEY).setOrigin(0);
        this.cursorText = this.add.text(0, 0, '', {color: 'black', fontSize: '2rem'});
        this.cursors = this.input.keyboard.createCursorKeys();
        this.character.anims.create({
            key: 'move',
            repeat: -1,
            frames: this.anims.generateFrameNumbers(this.CHARACTER_KEY, {})
        });
        this.character.anims.play('move', true);

        // Store the original size of the game, so that the correct scaling can be calculated
        // when resizing.
        this.originalSize = {width: this.scale.width, height: this.scale.height};

        // On game resize, this event is triggered.
        // This is done when this.game.scale.resize is called, but Phaser also
        // seems to call it automatically in some cases.
        this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
            const width = gameSize.width;
            const height = gameSize.height;

            // A single camera is used that is the same size of the game,
            // so it can be resized and not scaled.
            this.cameras.resize(width, height);

            // Update the scale for every sprite/background/etc.
            this.background.setScale(width / this.originalSize.width, height / this.originalSize.height);
            this.character.setScale(width / this.originalSize.width, height / this.originalSize.height);

            // Likely some additional logic, so that any existing items are not
            // moved offscreen when resizing.
            if (this.character.y + this.character.displayHeight >= height) {
                this.character.setY(height - this.character.displayHeight);
            }
        })

        const resize = (changeX: number, changeY: number, lastKey: string) => {
            this.game.scale.resize(this.game.canvas.width + changeX, this.game.canvas.height + changeY);
            this.cursorText.text = lastKey;
        }

        // When the arrow keys are used, resize the game.
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

        // Pushing space will reset the size and scale.
        this.cursors.space.on('up', () => {
            this.game.scale.resize(this.originalSize.width, this.originalSize.height);
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
