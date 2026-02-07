import type { Scene } from 'phaser';
import type { LanternConfig } from '../types/index.js';
import { GROUND_HEIGHT } from '../utils/constants.js';
import { Obstacle } from './Obstacle.js';

export class Lantern extends Obstacle {
    private config!: LanternConfig;
    private startY = 0;
    private glowStartTime = 0;
    private glowSprite?: Phaser.GameObjects.Sprite;

    constructor(scene: Scene, x: number, y: number, config: Partial<LanternConfig> = {}) {
        super(scene, x, y, 'lantern');
        this.init(x, y, config);
    }

    reset(x: number, y: number, config: Partial<LanternConfig> = {}): void {
        this.init(x, y, config);
    }

    private init(x: number, _unusedY: number, config: Partial<LanternConfig>): void {
        this.config = {
            height: 'mid',
            swingAmplitude: 20,
            swingSpeed: 0.002,
            ...config,
        };

        this.setupHeight();
        this.setupForReuse(x, this.y);
        this.startY = this.y;
        this.glowStartTime = this.scene?.time.now ?? 0;

        this.setSize(60, 80);
        this.setupGlow();
    }

    private setupHeight(): void {
        if (!this.scene) return;

        const groundTop = (this.scene.scale.height - GROUND_HEIGHT);
        const offsets = {
            low: 130,
            mid: 230,
            high: 330,
        } as const;

        const offset = offsets[this.config.height ?? 'mid'] ?? offsets.mid;
        this.y = groundTop - offset;
    }

    private setupGlow(): void {
        if (!this.glowSprite) {
            if (!this.scene.textures.exists('lantern_glow')) {
                const glow = this.scene.add.graphics();
                glow.fillStyle(0xFFD700, 0.3);
                glow.fillCircle(0, 0, 50);
                glow.generateTexture('lantern_glow', 100, 100);
                glow.destroy();
            }

            this.glowSprite = this.scene.add.sprite(this.x, this.y, 'lantern_glow');
            this.glowSprite.setBlendMode(Phaser.BlendModes.ADD);
        }

        this.glowSprite.setVisible(true);
        this.glowSprite.setPosition(this.x, this.y);
    }

    update(scrollSpeed: number, dt: number): void {
        super.update(scrollSpeed, dt);

        const sceneTime = this.scene?.time.now ?? 0;
        const elapsed = sceneTime - this.createdTime;
        this.y = this.startY + Math.sin(elapsed * this.config.swingSpeed) * this.config.swingAmplitude;

        if (this.glowSprite) {
            this.glowSprite.x = this.x;
            this.glowSprite.y = this.y;

            const glowElapsed = sceneTime - this.glowStartTime;
            this.glowSprite.alpha = 0.3 + Math.sin(glowElapsed * 0.003) * 0.2;
        }
    }

    setVisible(value: boolean): this {
        super.setVisible(value);
        this.glowSprite?.setVisible(value);
        return this;
    }

    setActive(value: boolean): this {
        super.setActive(value);
        if (!value) {
            this.glowSprite?.setVisible(false);
        }
        return this;
    }

    destroy(fromScene?: boolean): void {
        if (this.glowSprite) {
            this.glowSprite.destroy();
            this.glowSprite = undefined;
        }
        super.destroy(fromScene);
    }
}
