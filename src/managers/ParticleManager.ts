import type { Scene } from 'phaser';
import { STYLE } from '../utils/constants.js';

export class ParticleManager {
    private static instance: ParticleManager;
    private scene?: Scene;
    private snowEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
    private fireworksEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
    private fireworkTimer = 0;
    private isActive = false;

    private constructor() { }

    static getInstance(): ParticleManager {
        if (!ParticleManager.instance) {
            ParticleManager.instance = new ParticleManager();
        }
        return ParticleManager.instance;
    }

    init(scene: Scene): void {
        this.scene = scene;
        this.isActive = true;
        this.createSnowEffect();
        this.createFireworksEffect();
    }

    destroy(): void {
        this.isActive = false;
        this.snowEmitter?.destroy();
        this.snowEmitter = undefined;
        this.fireworksEmitter?.destroy();
        this.fireworksEmitter = undefined;
        this.scene = undefined;
    }

    update(delta: number): void {
        if (!this.isActive || !this.scene) return;

        this.fireworkTimer += delta;
        if (this.fireworkTimer > STYLE.PARTICLES.FIREWORK_INTERVAL) {
            this.fireworkTimer = 0;
            if (Math.random() > 0.5) {
                const x = 100 + Math.random() * (this.scene.scale.width - 200);
                const y = 50 + Math.random() * 200;
                this.spawnFirework(x, y);
            }
        }
    }

    private createSnowEffect(): void {
        if (!this.scene || !this.scene.textures.exists('p_white')) return;

        this.snowEmitter = this.scene.add.particles(0, 0, 'p_white', {
            x: { min: 0, max: this.scene.scale.width },
            y: -10,
            lifespan: 10000,
            speedY: { min: 20, max: 50 },
            speedX: { min: -10, max: 10 },
            scale: { min: 0.2, max: 0.6 },
            alpha: { start: 0.6, end: 0 },
            frequency: 200,
            reserve: STYLE.PARTICLES.SNOW_COUNT,
        });
        this.snowEmitter.setDepth(-1);
    }

    private createFireworksEffect(): void {
        if (!this.scene || !this.scene.textures.exists('p_gold')) return;

        this.fireworksEmitter = this.scene.add.particles(0, 0, 'p_gold', {
            lifespan: { min: 600, max: 1200 },
            speed: { min: 100, max: 250 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 1, end: 0 },
            gravityY: 150,
            blendMode: 'ADD',
            emitting: false,
        });
    }

    spawnFirework(x: number, y: number): void {
        if (!this.fireworksEmitter) return;

        const colors = [0xFF0000, 0xFFD700, 0xFF6B6B, 0xFFF8DC];
        const color = colors[Math.floor(Math.random() * colors.length)];

        this.fireworksEmitter.setParticleTint(color);
        this.fireworksEmitter.explode(40, x, y);

        // 闪光效果只需一个 Graphics
        this.createFlash(x, y);
    }

    private createFlash(x: number, y: number): void {
        if (!this.scene) return;
        const flash = this.scene.add.graphics();
        flash.fillStyle(0xFFF8DC, 0.4);
        flash.fillCircle(0, 0, 40);
        flash.setPosition(x, y);
        this.scene.tweens.add({
            targets: flash,
            scale: 2,
            alpha: 0,
            duration: 250,
            onComplete: () => flash.destroy(),
        });
    }

    spawnCollectEffect(x: number, y: number, color: number): void {
        if (!this.scene || !this.scene.textures.exists('p_gold')) return;

        const emitter = this.scene.add.particles(x, y, 'p_gold', {
            speed: { min: 50, max: 100 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 500,
            tint: color,
            emitting: false
        });

        emitter.explode(12);
        this.scene.time.delayedCall(600, () => emitter.destroy());

        const flash = this.scene.add.graphics();
        flash.fillStyle(0xFFF8DC, 0.6);
        flash.fillCircle(0, 0, 15);
        flash.setPosition(x, y);
        this.scene.tweens.add({
            targets: flash,
            scale: 2,
            alpha: 0,
            duration: 300,
            onComplete: () => flash.destroy(),
        });
    }

    createGlowEffect(x: number, y: number, radius: number, color: number): Phaser.GameObjects.Graphics {
        if (!this.scene) throw new Error('ParticleManager not initialized');

        const graphics = this.scene.add.graphics();
        // 简化发光，不再使用多重循环
        graphics.fillStyle(color, 0.3);
        graphics.fillCircle(0, 0, radius);
        graphics.setPosition(x, y);

        this.scene.tweens.add({
            targets: graphics,
            scale: 1.2,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        return graphics;
    }

    createButtonHoverEffect(container: Phaser.GameObjects.Container): void {
        if (!this.scene) return;
        this.scene.tweens.add({
            targets: container,
            scale: 1.05,
            duration: 150,
            ease: 'Back.easeOut',
        });
    }

    removeButtonHoverEffect(container: Phaser.GameObjects.Container): void {
        if (!this.scene) return;
        this.scene.tweens.add({
            targets: container,
            scale: 1,
            duration: 150,
            ease: 'Power2',
        });
    }

    createFloatAnimation(target: Phaser.GameObjects.GameObject, amplitude: number = 10): void {
        if (!this.scene) return;
        this.scene.tweens.add({
            targets: target,
            y: `+=${amplitude}`,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    createFlowingLight(_graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number): void {
        // 简化流光
        if (!this.scene) return;
        const light = this.scene.add.graphics();
        light.fillStyle(0xFFFFFF, 0.3);
        light.fillRect(0, 0, width * 0.2, height);
        light.setPosition(x, y);
        this.scene.tweens.add({
            targets: light,
            x: x + width,
            duration: 1000,
            repeat: -1,
            ease: 'Linear',
        });
    }
}
