import type { Scene } from 'phaser';
import { Obstacle } from './Obstacle.js';
import type { LanternConfig } from '../types/index.js';

export class Lantern extends Obstacle {
    private config: LanternConfig;
    private startY = 0;
    private startTime = 0;
    private glowSprite?: Phaser.GameObjects.Sprite;
    private glowStartTime = 0;

    constructor(scene: Scene, x: number, y: number, config: Partial<LanternConfig> = {}) {
        super(scene, x, y, 'lantern');

        this.config = {
            height: 'mid',
            swingAmplitude: 20,
            swingSpeed: 0.002,
            ...config,
        };

        this.setupHeight();
        this.startY = this.y;
        this.startTime = Date.now();
        this.glowStartTime = Date.now();

        this.setSize(60, 80);
        this.createGlow();
    }

    private setupHeight(): void {
        switch (this.config.height) {
            case 'low':
                this.y = 450;
                break;
            case 'mid':
                this.y = 350;
                break;
            case 'high':
                this.y = 250;
                break;
        }
    }

    private createGlow(): void {
        const glow = this.scene.add.graphics();
        glow.fillStyle(0xFFD700, 0.3);
        glow.fillCircle(0, 0, 50);

        glow.generateTexture('lantern_glow', 100, 100);
        glow.destroy();

        this.glowSprite = this.scene.add.sprite(this.x, this.y, 'lantern_glow');
        this.glowSprite.setBlendMode(Phaser.BlendModes.ADD);
    }

    update(scrollSpeed: number, dt: number): void {
        super.update(scrollSpeed, dt);

        const elapsed = Date.now() - this.startTime;
        this.y = this.startY + Math.sin(elapsed * this.config.swingSpeed) * this.config.swingAmplitude;

        // 更新发光效果的 alpha
        if (this.glowSprite) {
            this.glowSprite.x = this.x;
            this.glowSprite.y = this.y;

            const glowElapsed = Date.now() - this.glowStartTime;
            this.glowSprite.alpha = 0.3 + Math.sin(glowElapsed * 0.003) * 0.2;
        }
    }

    destroy(fromScene?: boolean): void {
        this.glowSprite?.destroy();
        super.destroy(fromScene);
    }
}
