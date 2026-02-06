import type { Scene } from 'phaser';

export class InputManager {
    private static instance: InputManager;
    private scene: Scene | null = null;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    private jumpKey: Phaser.Input.Keyboard.Key | null = null;
    private duckKey: Phaser.Input.Keyboard.Key | null = null;
    private activateKey: Phaser.Input.Keyboard.Key | null = null;
    
    private jumpPressed = false;
    private duckPressed = false;
    private activatePressed = false;
    
    private onJumpCallback: (() => void) | null = null;
    private onDuckCallback: (() => void) | null = null;
    private onActivateCallback: (() => void) | null = null;

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
        
        if (this.cursors) {
            this.jumpPressed = this.cursors.up.isDown || this.cursors.space.isDown || this.jumpKey?.isDown || false;
            this.duckPressed = this.cursors.down.isDown || this.duckKey?.isDown || false;
            this.activatePressed = this.activateKey?.isDown || false;
        }
        
        if (this.jumpPressed && !wasJumpPressed) {
            this.onJumpCallback?.();
        }
        
        if (this.duckPressed && !wasDuckPressed) {
            this.onDuckCallback?.();
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

    onJump(callback: () => void): void {
        this.onJumpCallback = callback;
    }

    onDuck(callback: () => void): void {
        this.onDuckCallback = callback;
    }

    onActivate(callback: () => void): void {
        this.onActivateCallback = callback;
    }

    clearCallbacks(): void {
        this.onJumpCallback = null;
        this.onDuckCallback = null;
        this.onActivateCallback = null;
    }
}
