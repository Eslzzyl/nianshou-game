import type { Scene } from 'phaser';
import type { FirecrackerConfig } from '../types/index.js';
import { Obstacle } from './Obstacle.js';

export class Firecracker extends Obstacle {
    private config: FirecrackerConfig;
    private startTime = 0;
    private warningSprite?: Phaser.GameObjects.Sprite;

    constructor(scene: Scene, x: number, y: number, config: Partial<FirecrackerConfig> = {}) {
        super(scene, x, y, 'firecracker');

        this.config = {
            type: 'ground',
            movePattern: 'static',
            damage: 1,
            warningTime: 500,
            ...config,
        };

        this.damage = this.config.damage;
        this.startTime = Date.now();

        this.setupPhysics();
        this.createAnimations();

        if (this.config.warningTime > 0) {
            this.showWarning();
        }
    }

    private setupPhysics(): void {
        if (this.config.type === 'ground') {
            this.y = 600;
            this.setSize(40, 60);
        } else {
            this.setSize(40, 40);
        }
    }

    private createAnimations(): void {
        const anims = this.scene.anims;

        if (!anims.exists('firecracker_idle')) {
            const frames = this.getAnimationFrames('firecracker', 4);
            if (frames.length > 0) {
                try {
                    anims.create({
                        key: 'firecracker_idle',
                        frames: frames,
                        frameRate: 8,
                        repeat: -1,
                    });
                } catch (e) {
                    console.warn('无法创建爆竹动画:', e);
                }
            }
        }

        if (anims.exists('firecracker_idle')) {
            try {
                this.play('firecracker_idle');
            } catch (e) {
                console.warn('无法播放爆竹动画:', e);
            }
        }
    }

    private getAnimationFrames(key: string, maxFrames: number): Phaser.Types.Animations.AnimationFrame[] {
        if (!this.scene.textures.exists(key)) {
            return [];
        }

        const texture = this.scene.textures.get(key);
        const frameCount = texture.frameTotal;
        const frames: Phaser.Types.Animations.AnimationFrame[] = [];

        for (let i = 0; i < Math.min(maxFrames, frameCount); i++) {
            frames.push({
                key: key,
                frame: i,
            } as Phaser.Types.Animations.AnimationFrame);
        }

        return frames;
    }

    private showWarning(): void {
        this.warningSprite = this.scene.add.sprite(this.x, this.y - 60, 'firecracker');
        this.warningSprite.setTint(0xFFFF00);
        this.warningSprite.setAlpha(0.5);
        this.warningSprite.setScale(0.5);

        this.scene.tweens.add({
            targets: this.warningSprite,
            alpha: 0,
            duration: this.config.warningTime,
            onComplete: () => {
                this.warningSprite?.destroy();
                this.warningSprite = undefined;
            },
        });

        this.setVisible(false);
        if (this.body) {
            this.body.enable = false;
        }

        this.scene.time.delayedCall(this.config.warningTime, () => {
            this.setVisible(true);
            if (this.body) {
                this.body.enable = true;
            }
        });
    }

    update(scrollSpeed: number, dt: number): void {
        const elapsed = Date.now() - this.startTime;

        // 始终更新位置，即使在预警期
        super.update(scrollSpeed, dt);

        if (elapsed < this.config.warningTime) {
            if (this.warningSprite) {
                this.warningSprite.x = this.x;
            }
        } else {
            if (this.config.movePattern === 'bounce' && this.config.type === 'air') {
                this.y += Math.sin(elapsed * 0.003) * 2;
            }
        }
    }

    destroy(fromScene?: boolean): void {
        this.warningSprite?.destroy();
        super.destroy(fromScene);
    }
}
