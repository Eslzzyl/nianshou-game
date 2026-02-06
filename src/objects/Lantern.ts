import type { Scene } from 'phaser';
import { Obstacle } from './Obstacle.js';
import type { LanternConfig } from '../types/index.js';

export class Lantern extends Obstacle {
    private config: LanternConfig;
    private startY = 0;
    private startTime = 0;

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
        
        const glowSprite = this.scene.add.sprite(this.x, this.y, 'lantern_glow');
        glowSprite.setBlendMode(Phaser.BlendModes.ADD);
        
        this.scene.tweens.add({
            targets: glowSprite,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            onUpdate: () => {
                glowSprite.x = this.x;
                glowSprite.y = this.y;
            },
        });
    }

    update(scrollSpeed: number, dt: number): void {
        super.update(scrollSpeed, dt);
        
        const elapsed = Date.now() - this.startTime;
        this.y = this.startY + Math.sin(elapsed * this.config.swingSpeed) * this.config.swingAmplitude;
    }
}
