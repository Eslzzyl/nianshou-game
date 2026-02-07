import type { Scene } from 'phaser';
import type { ItemConfig, ItemType } from '../types/index.js';
import { ITEMS } from '../utils/constants.js';
import { ObjectPoolManager } from '../managers/ObjectPoolManager.js';

export abstract class Item extends Phaser.Physics.Arcade.Sprite {
    protected itemType!: ItemType;
    protected config!: ItemConfig;
    protected collected = false;
    private startY = 0;
    private startTime = 0;

    declare body: Phaser.Physics.Arcade.Body;

    constructor(scene: Scene, x: number, y: number, texture: string, type: ItemType) {
        super(scene, x, y, texture);

        this.itemType = type;
        this.config = this.getConfig();

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.allowGravity = false;
        this.body.moves = false;
        this.body.setSize(40, 40, true);

        this.startY = y;
        this.startTime = scene.time.now;
    }

    abstract reset(x: number, y: number, ...args: unknown[]): void;

    protected getConfig(): ItemConfig {
        switch (this.itemType) {
            case 'fu_copper':
                return ITEMS.FU_COPPER;
            case 'fu_silver':
                return ITEMS.FU_SILVER;
            case 'fu_gold':
                return ITEMS.FU_GOLD;
            case 'redpacket':
                return ITEMS.REDPACKET;
            case 'spring_word':
                return ITEMS.SPRING_WORD;
            default:
                return { score: 10, type: 'fu_copper' };
        }
    }

    update(scrollSpeed: number, dt: number): void {
        this.x -= scrollSpeed * dt;

        // 使用整数坐标可以减少亚像素模糊引起的闪烁
        this.x = Math.floor(this.x);

        // 计算浮动效果，使用正弦函数
        const elapsed = (this.scene?.time.now ?? 0) - this.startTime;
        this.y = this.startY + Math.sin(elapsed * 0.003) * 10;

        if (this.x < -50) {
            ObjectPoolManager.getInstance().release(this);
        }
    }

    collect(): void {
        if (this.collected) return;
        this.collected = true;

        this.onCollect();

        this.scene.tweens.add({
            targets: this,
            scale: 1.5,
            alpha: 0,
            y: this.y - 50,
            duration: 250,
            ease: 'Back.easeIn',
            onComplete: () => {
                ObjectPoolManager.getInstance().release(this);
            },
        });
    }

    protected abstract onCollect(): void;

    isCollected(): boolean {
        return this.collected;
    }

    protected setupForReuse(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.startY = y;
        this.collected = false;
        this.startTime = this.scene?.time.now ?? 0;
        this.alpha = 1;
        this.scale = 1;
        this.body.enable = true;
    }
}
