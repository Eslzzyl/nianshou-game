import type { Scene } from 'phaser';

export class InputManager {
    private static instance: InputManager;
    private scene: Scene | null = null;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    private jumpKey: Phaser.Input.Keyboard.Key | null = null;
    private duckKey: Phaser.Input.Keyboard.Key | null = null;
    private activateKey: Phaser.Input.Keyboard.Key | null = null;
    private leftKey: Phaser.Input.Keyboard.Key | null = null;
    private rightKey: Phaser.Input.Keyboard.Key | null = null;
    
    private jumpPressed = false;
    private duckPressed = false;
    private activatePressed = false;
    private leftPressed = false;
    private rightPressed = false;
    
    private onJumpCallback: (() => void) | null = null;
    private onDuckCallback: (() => void) | null = null;
    private onActivateCallback: (() => void) | null = null;
    private onLeftCallback: (() => void) | null = null;
    private onRightCallback: (() => void) | null = null;

    private constructor() {}

    static getInstance(): InputManager {
        if (!InputManager.instance) {
            InputManager.instance = new InputManager();
        }
        return InputManager.instance;
    }

    init(scene: Scene): void {
        this.scene = scene;
        
        if (scene.input.keyboard) {
            this.cursors = scene.input.keyboard.createCursorKeys();
            this.jumpKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            this.duckKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            this.activateKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
            this.leftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            this.rightKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        }
        
        this.setupTouchInput();
    }

    private setupTouchInput(): void {
        if (!this.scene) return;
        
        const width = this.scene.scale.width;
        
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.x < width / 2) {
                this.jumpPressed = true;
                this.onJumpCallback?.();
            } else {
                this.duckPressed = true;
                this.onDuckCallback?.();
            }
        });
        
        this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (pointer.x < width / 2) {
                this.jumpPressed = false;
            } else {
                this.duckPressed = false;
            }
        });
        
        let lastClickTime = 0;
        this.scene.input.on('pointerdown', () => {
            const currentTime = Date.now();
            if (currentTime - lastClickTime < 300) {
                this.activatePressed = true;
                this.onActivateCallback?.();
            }
            lastClickTime = currentTime;
        });
    }

    update(): void {
        if (!this.scene) return;
        
        const wasJumpPressed = this.jumpPressed;
        const wasDuckPressed = this.duckPressed;
        const wasLeftPressed = this.leftPressed;
        const wasRightPressed = this.rightPressed;
        
        if (this.cursors) {
            this.jumpPressed = this.cursors.up.isDown || this.cursors.space.isDown || this.jumpKey?.isDown || false;
            this.duckPressed = this.cursors.down.isDown || this.duckKey?.isDown || false;
            this.activatePressed = this.activateKey?.isDown || false;
            this.leftPressed = this.cursors.left.isDown || this.leftKey?.isDown || false;
            this.rightPressed = this.cursors.right.isDown || this.rightKey?.isDown || false;
        }
        
        if (this.jumpPressed && !wasJumpPressed) {
            this.onJumpCallback?.();
        }
        
        if (this.duckPressed && !wasDuckPressed) {
            this.onDuckCallback?.();
        }
        
        if (this.leftPressed && !wasLeftPressed) {
            this.onLeftCallback?.();
        }
        
        if (this.rightPressed && !wasRightPressed) {
            this.onRightCallback?.();
        }
    }

    isJumpPressed(): boolean {
        return this.jumpPressed;
    }

    isDuckPressed(): boolean {
        return this.duckPressed;
    }

    isActivatePressed(): boolean {
        return this.activatePressed;
    }

    isLeftPressed(): boolean {
        return this.leftPressed;
    }

    isRightPressed(): boolean {
        return this.rightPressed;
    }

    onJump(callback: () => void): void {
        this.onJumpCallback = callback;
    }

    onDuck(callback: () => void): void {
        this.onDuckCallback = callback;
    }

    onActivate(callback: () => void): void {
        this.onActivateCallback = callback;
    }

    onLeft(callback: () => void): void {
        this.onLeftCallback = callback;
    }

    onRight(callback: () => void): void {
        this.onRightCallback = callback;
    }

    clearCallbacks(): void {
        this.onJumpCallback = null;
        this.onDuckCallback = null;
        this.onActivateCallback = null;
        this.onLeftCallback = null;
        this.onRightCallback = null;
    }
}
