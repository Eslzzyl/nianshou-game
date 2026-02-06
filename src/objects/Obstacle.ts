import type { Scene } from 'phaser';

export abstract class Obstacle extends Phaser.Physics.Arcade.Sprite {
    protected damage = 1;
    protected isActive = true;

    constructor(scene: Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setImmovable(true);
        if (this.body) {
            (this.body as Phaser.Physics.Arcade.Body).allowGravity = false;
            (this.body as Phaser.Physics.Arcade.Body).moves = false;
        }
    }

    update(scrollSpeed: number, dt: number): void {
        this.x -= scrollSpeed * dt;
        this.x = Math.floor(this.x);

        if (this.x < -100) {
            this.destroy();
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
}
