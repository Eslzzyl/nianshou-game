import type { Scene } from 'phaser';
import { UI_RESOLUTION } from '../utils/constants.js';
import { isMobile } from '../utils/helpers.js';

export class VirtualButtons {
    private scene: Scene;
    private jumpBtn!: Phaser.GameObjects.Container;
    private duckBtn!: Phaser.GameObjects.Container;
    private activateBtn!: Phaser.GameObjects.Container;
    private joystickBase!: Phaser.GameObjects.Graphics;
    private joystickKnob!: Phaser.GameObjects.Graphics;
    private joystickActive = false;
    private joystickPointerId: number | null = null;
    private joystickCenterX = 0;
    private joystickCenterY = 0;
    private joystickRadius = 80;
    private onJoystickMoveCallback: ((x: number, y: number) => void) | null = null;
    private onJoystickReleaseCallback: (() => void) | null = null;

    constructor(scene: Scene) {
        this.scene = scene;

        if (isMobile()) {
            this.create();
        }
    }

    private create(): void {
        this.createJoystick();
        this.createJumpButton();
        this.createDuckButton();
        this.createActivateButton();
    }

    hasJoystick(): boolean {
        return this.joystickBase !== undefined;
    }

    private createJoystick(): void {
        const x = 120;
        const y = this.scene.scale.height - 120;
        this.joystickCenterX = x;
        this.joystickCenterY = y;

        // 摇杆底座
        this.joystickBase = this.scene.add.graphics();
        this.joystickBase.fillStyle(0xFFFFFF, 0.2);
        this.joystickBase.fillCircle(0, 0, this.joystickRadius);
        this.joystickBase.lineStyle(3, 0xFFFFFF, 0.5);
        this.joystickBase.strokeCircle(0, 0, this.joystickRadius);
        this.joystickBase.setPosition(x, y);

        // 摇杆手柄
        this.joystickKnob = this.scene.add.graphics();
        this.joystickKnob.fillStyle(0xFFFFFF, 0.6);
        this.joystickKnob.fillCircle(0, 0, 35);
        this.joystickKnob.lineStyle(3, 0xFFFFFF, 0.8);
        this.joystickKnob.strokeCircle(0, 0, 35);
        this.joystickKnob.setPosition(x, y);

        // 设置交互区域
        const hitArea = new Phaser.Geom.Circle(0, 0, this.joystickRadius);
        this.joystickBase.setInteractive(hitArea, Phaser.Geom.Circle.Contains);

        // 触摸事件
        this.joystickBase.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.joystickActive = true;
            this.joystickPointerId = pointer.id;
            this.updateJoystickPosition(pointer.x, pointer.y);
        });

        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.joystickActive && pointer.id === this.joystickPointerId) {
                this.updateJoystickPosition(pointer.x, pointer.y);
            }
        });

        this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (pointer.id === this.joystickPointerId) {
                this.resetJoystick();
            }
        });
    }

    private updateJoystickPosition(pointerX: number, pointerY: number): void {
        const dx = pointerX - this.joystickCenterX;
        const dy = pointerY - this.joystickCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = this.joystickRadius - 35;

        let knobX = this.joystickCenterX;
        let knobY = this.joystickCenterY;
        let normalizedX = 0;
        let normalizedY = 0;

        if (distance > 0) {
            const clampedDistance = Math.min(distance, maxDistance);
            const angle = Math.atan2(dy, dx);
            knobX = this.joystickCenterX + Math.cos(angle) * clampedDistance;
            knobY = this.joystickCenterY + Math.sin(angle) * clampedDistance;
            normalizedX = dx / distance;
            normalizedY = dy / distance;
        }

        this.joystickKnob.setPosition(knobX, knobY);

        // 触发回调
        if (this.onJoystickMoveCallback) {
            this.onJoystickMoveCallback(normalizedX, normalizedY);
        }
    }

    private resetJoystick(): void {
        this.joystickActive = false;
        this.joystickPointerId = null;
        this.joystickKnob.setPosition(this.joystickCenterX, this.joystickCenterY);

        if (this.onJoystickReleaseCallback) {
            this.onJoystickReleaseCallback();
        }
    }

    onJoystickMove(callback: (x: number, y: number) => void): void {
        this.onJoystickMoveCallback = callback;
    }

    onJoystickRelease(callback: () => void): void {
        this.onJoystickReleaseCallback = callback;
    }

    private createJumpButton(): void {
        const x = 100;
        const y = this.scene.scale.height - 100;

        this.jumpBtn = this.scene.add.container(x, y);

        const bg = this.scene.add.circle(0, 0, 60, 0xFFFFFF, 0.3);
        bg.setStrokeStyle(3, 0xFFFFFF);

        const icon = this.scene.add.text(0, 0, '⬆️', {
            fontSize: '36px',
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        this.jumpBtn.add([bg, icon]);

        const hitArea = new Phaser.Geom.Circle(0, 0, 60);
        bg.setInteractive(hitArea, Phaser.Geom.Circle.Contains);

        bg.on('pointerdown', () => {
            bg.setFillStyle(0xFFFFFF, 0.5);
        });

        bg.on('pointerup', () => {
            bg.setFillStyle(0xFFFFFF, 0.3);
        });
    }

    private createDuckButton(): void {
        const x = this.scene.scale.width - 100;
        const y = this.scene.scale.height - 100;

        this.duckBtn = this.scene.add.container(x, y);

        const bg = this.scene.add.circle(0, 0, 60, 0xFFFFFF, 0.3);
        bg.setStrokeStyle(3, 0xFFFFFF);

        const icon = this.scene.add.text(0, 0, '⬇️', {
            fontSize: '36px',
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        this.duckBtn.add([bg, icon]);

        const hitArea = new Phaser.Geom.Circle(0, 0, 60);
        bg.setInteractive(hitArea, Phaser.Geom.Circle.Contains);

        bg.on('pointerdown', () => {
            bg.setFillStyle(0xFFFFFF, 0.5);
        });

        bg.on('pointerup', () => {
            bg.setFillStyle(0xFFFFFF, 0.3);
        });
    }

    private createActivateButton(): void {
        const x = this.scene.scale.width / 2;
        const y = this.scene.scale.height - 180;

        this.activateBtn = this.scene.add.container(x, y);
        this.activateBtn.setVisible(false);

        const bg = this.scene.add.circle(0, 0, 50, 0xFFD700, 0.5);
        bg.setStrokeStyle(3, 0xFFD700);

        const icon = this.scene.add.text(0, 0, '✨', {
            fontSize: '32px',
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        this.activateBtn.add([bg, icon]);

        const hitArea = new Phaser.Geom.Circle(0, 0, 50);
        bg.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
    }

    showActivateButton(show: boolean): void {
        this.activateBtn.setVisible(show);
    }

    resize(width: number, height: number): void {
        if (!this.hasJoystick()) return;

        // 摇杆固定在左下
        this.joystickCenterX = 120;
        this.joystickCenterY = height - 120;
        this.joystickBase.setPosition(this.joystickCenterX, this.joystickCenterY);
        this.joystickKnob.setPosition(this.joystickCenterX, this.joystickCenterY);

        // 按钮固定在底部
        this.jumpBtn?.setPosition(100, height - 100);
        this.duckBtn?.setPosition(width - 100, height - 100);
        this.activateBtn?.setPosition(width / 2, height - 180);
    }

    destroy(): void {
        // 移除事件监听
        this.joystickBase?.off('pointerdown');
        this.scene?.input.off('pointermove');
        this.scene?.input.off('pointerup');

        // 清理回调
        this.onJoystickMoveCallback = null;
        this.onJoystickReleaseCallback = null;

        // 销毁游戏对象
        this.jumpBtn?.destroy();
        this.duckBtn?.destroy();
        this.activateBtn?.destroy();
        this.joystickBase?.destroy();
        this.joystickKnob?.destroy();
    }
}
