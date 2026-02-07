import type { Scene } from 'phaser';
import { ObjectPoolManager } from '../managers/ObjectPoolManager.js';

export abstract class Obstacle extends Phaser.Physics.Arcade.Sprite {
    protected damage = 1;
    protected isActive = true;
    protected createdTime = 0;

    declare body: Phaser.Physics.Arcade.Body;

    constructor(scene: Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setImmovable(true);
        this.body.allowGravity = false;
        this.body.moves = false;
    }

    abstract reset(x: number, y: number, config?: Record<string, unknown>): void;

    update(scrollSpeed: number, dt: number): void {
        this.x -= scrollSpeed * dt;
        this.x = Math.floor(this.x);

        if (this.x < -100) {
            ObjectPoolManager.getInstance().release(this);
        }
    }

    getDamage(): number {
        return this.damage;
    }

    isActiveObstacle(): boolean {
        return this.isActive;
    }

    deactivate(): void {
        this.isActive = false;
    }

    protected setupForReuse(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.isActive = true;
        this.createdTime = this.scene?.time.now ?? 0;
        if (this.body) {
            this.body.enable = true;
        }
    }
}
