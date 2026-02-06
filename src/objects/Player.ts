import type { Scene } from 'phaser';
import { AudioManager } from '../managers/AudioManager.js';
import { ScoreManager } from '../managers/ScoreManager.js';
import type { PlayerState } from '../types/index.js';
import { PLAYER } from '../utils/constants.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
    private currentState: PlayerState = 'RUNNING';
    private grounded = false;
    private coyoteTimer = 0;
    private invincibleTimer = 0;
    private flyTimer = 0;
    private wingSprite?: Phaser.GameObjects.Sprite;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, 'nianshou_run');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        const body = this.body as Phaser.Physics.Arcade.Body;
        this.setCollideWorldBounds(true);
        this.setGravityY(PLAYER.GRAVITY);
        body.setSize(PLAYER.WIDTH, PLAYER.HEIGHT, true);

        this.createAnimations();
    }

    private createAnimations(): void {
        const anims = this.scene.anims;

        // 奔跑动画
        if (!anims.exists('run')) {
            const frames = this.getAnimationFrames('nianshou_run', 4);
            if (frames.length > 0) {
                try {
                    anims.create({
                        key: 'run',
                        frames: frames,
                        frameRate: 10,
                        repeat: -1,
                    });
                } catch (e) {
                    console.warn('无法创建奔跑动画:', e);
                }
            }
        }

        // 跳跃动画
        if (!anims.exists('jump')) {
            const frames = this.getAnimationFrames('nianshou_jump', 1);
            if (frames.length > 0) {
                try {
                    anims.create({
                        key: 'jump',
                        frames: frames,
                        frameRate: 1,
                    });
                } catch (e) {
                    console.warn('无法创建跳跃动画:', e);
                }
            }
        }

        // 下蹲动画
        if (!anims.exists('duck')) {
            const frames = this.getAnimationFrames('nianshou_duck', 2);
            if (frames.length > 0) {
                try {
                    anims.create({
                        key: 'duck',
                        frames: frames,
                        frameRate: 10,
                    });
                } catch (e) {
                    console.warn('无法创建下蹲动画:', e);
                }
            }
        }

        // 受伤动画
        if (!anims.exists('hurt')) {
            const frames = this.getAnimationFrames('nianshou_hurt', 2);
            if (frames.length > 0) {
                try {
                    anims.create({
                        key: 'hurt',
                        frames: frames,
                        frameRate: 5,
                        repeat: 2,
                    });
                } catch (e) {
                    console.warn('无法创建受伤动画:', e);
                }
            }
        }

        // 安全地播放动画
        this.safePlay('run');
    }

    private getAnimationFrames(key: string, maxFrames: number): Phaser.Types.Animations.AnimationFrame[] {
        if (!this.scene.textures.exists(key)) {
            return [];
        }

        const texture = this.scene.textures.get(key);
        // frameTotal 包含帧数（单帧图片为1）
        const frameCount = texture.frameTotal;
        const frames: Phaser.Types.Animations.AnimationFrame[] = [];

        // 只使用实际存在的帧
        for (let i = 0; i < Math.min(maxFrames, frameCount); i++) {
            frames.push({
                key: key,
                frame: i,
            } as Phaser.Types.Animations.AnimationFrame);
        }

        return frames;
    }

    private safePlay(animKey: string): void {
        try {
            if (this.scene.anims.exists(animKey)) {
                this.play(animKey);
            }
        } catch (e) {
            console.warn(`无法播放动画 ${animKey}:`, e);
        }
    }

    update(delta: number): void {
        this.grounded = this.body?.touching.down || false;

        if (this.grounded) {
            this.coyoteTimer = PLAYER.COYOTE_TIME;
        } else {
            this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
        }

        if (this.currentState === 'INVINCIBLE') {
            this.invincibleTimer -= delta;
            if (this.invincibleTimer <= 0) {
                this.setPlayerState('RUNNING');
                this.clearTint();
            } else {
                this.setTint(0xFFD700);
            }
        }

        if (this.currentState === 'FLYING') {
            this.flyTimer -= delta;
            if (this.flyTimer <= 0) {
                this.deactivateFly();
            } else {
                // 飞行模式下的平滑悬浮
                this.y += Math.sin(Date.now() * 0.005) * 1.2;
                if (this.wingSprite) {
                    this.wingSprite.setPosition(this.x, this.y - 10);
                }
            }
        }

        // 边界检查
        this.clampPosition();

        this.handleStateAnimation();
    }

    private clampPosition(): void {
        const minX = 32;
        const maxX = this.scene.scale.width - 32;
        this.x = Phaser.Math.Clamp(this.x, minX, maxX);
    }

    private handleStateAnimation(): void {
        // 只有在动画存在时才播放
        switch (this.currentState) {
            case 'RUNNING':
            case 'INVINCIBLE':
                if (this.grounded && this.scene.anims.exists('run')) {
                    const currentAnim = this.anims.currentAnim;
                    if (!currentAnim || currentAnim.key !== 'run') {
                        this.safePlay('run');
                    }
                }
                break;
            case 'JUMPING':
            case 'FALLING':
                if (this.scene.anims.exists('jump')) {
                    this.safePlay('jump');
                }
                break;
            case 'DUCKING':
                if (this.scene.anims.exists('duck')) {
                    this.safePlay('duck');
                }
                break;
        }
    }

    jump(): boolean {
        if (this.currentState === 'FLYING') {
            this.setVelocityY(-350);
            return true;
        }

        if (this.coyoteTimer > 0 || this.grounded) {
            this.setVelocityY(PLAYER.JUMP_VELOCITY);
            this.setPlayerState('JUMPING');
            this.coyoteTimer = 0;
            AudioManager.getInstance().play('jump');
            return true;
        }
        return false;
    }

    duck(): void {
        if (this.currentState === 'FLYING') return;

        if (this.grounded && this.currentState !== 'DUCKING') {
            this.setPlayerState('DUCKING');
            this.setSize(PLAYER.WIDTH, PLAYER.DUCK_HEIGHT);
            this.setOffset(0, PLAYER.HEIGHT - PLAYER.DUCK_HEIGHT);
        }
    }

    stopDuck(): void {
        if (this.currentState === 'DUCKING') {
            this.setPlayerState('RUNNING');
            this.setSize(PLAYER.WIDTH, PLAYER.HEIGHT);
            this.setOffset(0, 0);
        }
    }

    moveLeft(): void {
        const speed = this.grounded ? PLAYER.MOVE_SPEED : PLAYER.AIR_MOVE_SPEED;
        this.setVelocityX(-speed);
        this.setFlipX(true);
    }

    moveRight(): void {
        const speed = this.grounded ? PLAYER.MOVE_SPEED : PLAYER.AIR_MOVE_SPEED;
        this.setVelocityX(speed);
        this.setFlipX(false);
    }

    stopMoveX(): void {
        this.setVelocityX(0);
    }

    takeDamage(): boolean {
        if (this.currentState === 'INVINCIBLE' || this.currentState === 'FLYING') {
            return false;
        }

        ScoreManager.getInstance().takeDamage();
        AudioManager.getInstance().play('hurt');

        if (ScoreManager.getInstance().isDead()) {
            return true;
        }

        this.setPlayerState('HURT');
        if (this.scene.anims.exists('hurt')) {
            this.safePlay('hurt');
        }
        this.setVelocityY(-200);

        this.scene.time.delayedCall(500, () => {
            if (this.currentState === 'HURT') {
                this.setPlayerState('RUNNING');
            }
        });

        return true;
    }

    activateInvincible(): void {
        if (ScoreManager.getInstance().activateInvincible()) {
            this.setPlayerState('INVINCIBLE');
            this.invincibleTimer = PLAYER.INVINCIBLE_DURATION;
            AudioManager.getInstance().play('powerup');
        }
    }

    activateFly(): void {
        this.setPlayerState('FLYING');
        this.flyTimer = PLAYER.FLY_DURATION;
        this.setGravityY(0);
        this.setVelocityY(0);

        if (this.scene.textures.exists('spring_word')) {
            this.wingSprite = this.scene.add.sprite(this.x, this.y, 'spring_word');
            if (this.scene.anims.exists('spring_spin')) {
                this.wingSprite.play('spring_spin');
            }
        }

        AudioManager.getInstance().play('powerup');
    }

    deactivateFly(): void {
        this.setPlayerState('FALLING');
        this.setGravityY(PLAYER.GRAVITY);
        this.wingSprite?.destroy();
        this.wingSprite = undefined;
    }

    private setPlayerState(state: PlayerState): void {
        this.currentState = state;
    }

    getPlayerState(): PlayerState {
        return this.currentState;
    }

    isInvincible(): boolean {
        return this.currentState === 'INVINCIBLE' || this.currentState === 'FLYING';
    }

    destroy(fromScene?: boolean): void {
        this.wingSprite?.destroy();
        super.destroy(fromScene);
    }
}
