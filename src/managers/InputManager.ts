import type { Scene } from 'phaser';

export class InputManager {
    private static instance: InputManager;
    private scene: Scene | null = null;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    private jumpKey: Phaser.Input.Keyboard.Key | null = null;
    private duckKey: Phaser.Input.Keyboard.Key | null = null;
    private upKey: Phaser.Input.Keyboard.Key | null = null;
    private activateKey: Phaser.Input.Keyboard.Key | null = null;
    private leftKey: Phaser.Input.Keyboard.Key | null = null;
    private rightKey: Phaser.Input.Keyboard.Key | null = null;

    private jumpPressed = false;
    private duckPressed = false;
    private upPressed = false;
    private activatePressed = false;
    private leftPressed = false;
    private rightPressed = false;

    private onJumpCallback: (() => void) | null = null;
    private onDuckCallback: (() => void) | null = null;
    private onUpCallback: (() => void) | null = null;
    private onActivateCallback: (() => void) | null = null;
    private onLeftCallback: (() => void) | null = null;
    private onRightCallback: (() => void) | null = null;

    private constructor() { }

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
            this.upKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.activateKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
            this.leftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            this.rightKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        }

        this.setupTouchInput();
    }

    private setupTouchInput(): void {
        if (!this.scene) return;

        let lastClickTime = 0;
        let lastClickX = 0;
        let clickCount = 0;
        let clickTimer: Phaser.Time.TimerEvent | null = null;

        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const width = this.scene?.scale.width ?? 0;

            // 左半屏跳跃 / 右半屏下蹲
            if (pointer.x < width / 2) {
                this.jumpPressed = true;
                this.onJumpCallback?.();
            } else {
                this.duckPressed = true;
                this.onDuckCallback?.();
            }

            // 双击激活
            const currentTime = Date.now();
            const timeDiff = currentTime - lastClickTime;
            const distance = Math.abs(pointer.x - lastClickX);

            if (timeDiff < 300 && distance < 50) {
                clickCount++;
                if (clickCount >= 2) {
                    this.activatePressed = true;
                    this.onActivateCallback?.();
                    clickCount = 0;
                    if (clickTimer) {
                        clickTimer.destroy();
                        clickTimer = null;
                    }
                }
            } else {
                clickCount = 1;
            }

            lastClickTime = currentTime;
            lastClickX = pointer.x;

            if (clickTimer) {
                clickTimer.destroy();
            }
            clickTimer = this.scene?.time.delayedCall(300, () => {
                clickCount = 0;
            }) || null;
        });

        this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            const width = this.scene?.scale.width ?? 0;
            if (pointer.x < width / 2) {
                this.jumpPressed = false;
            } else {
                this.duckPressed = false;
            }
        });
    }

    update(): void {
        if (!this.scene) return;

        const wasJumpPressed = this.jumpPressed;
        const wasDuckPressed = this.duckPressed;
        const wasUpPressed = this.upPressed;
        const wasActivatePressed = this.activatePressed;
        const wasLeftPressed = this.leftPressed;
        const wasRightPressed = this.rightPressed;

        if (this.cursors) {
            this.jumpPressed = this.cursors.up.isDown || this.cursors.space.isDown || this.jumpKey?.isDown || false;
            this.duckPressed = this.cursors.down.isDown || this.duckKey?.isDown || false;
            this.upPressed = this.upKey?.isDown || false;
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

        if (this.upPressed && !wasUpPressed) {
            this.onUpCallback?.();
        }

        if (this.activatePressed && !wasActivatePressed) {
            this.onActivateCallback?.();
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

    isUpPressed(): boolean {
        return this.upPressed;
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

    onUp(callback: () => void): void {
        this.onUpCallback = callback;
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
        this.onUpCallback = null;
        this.onActivateCallback = null;
        this.onLeftCallback = null;
        this.onRightCallback = null;
    }

    destroy(): void {
        // 移除所有键盘按键监听
        if (this.cursors) {
            this.cursors.up.removeAllListeners();
            this.cursors.down.removeAllListeners();
            this.cursors.left.removeAllListeners();
            this.cursors.right.removeAllListeners();
            this.cursors.space?.removeAllListeners();
        }

        this.jumpKey?.removeAllListeners();
        this.duckKey?.removeAllListeners();
        this.upKey?.removeAllListeners();
        this.activateKey?.removeAllListeners();
        this.leftKey?.removeAllListeners();
        this.rightKey?.removeAllListeners();

        // 清理触摸事件
        if (this.scene) {
            this.scene.input.off('pointerdown');
            this.scene.input.off('pointerup');
        }

        // 清理回调
        this.clearCallbacks();

        // 清理场景引用
        this.scene = null;
        this.cursors = null;
        this.jumpKey = null;
        this.duckKey = null;
        this.upKey = null;
        this.activateKey = null;
        this.leftKey = null;
        this.rightKey = null;
    }
}
