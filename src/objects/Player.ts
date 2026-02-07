import type { Scene } from 'phaser';
import { AudioManager } from '../managers/AudioManager.js';
import { InputManager } from '../managers/InputManager.js';
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
    private jumpCount = 0;  // 跳跃次数计数器（0=在地面上，1=一段跳，2=二段跳）

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
        if (!this.scene) {
            console.warn('Player: scene is undefined in createAnimations');
            return;
        }
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
        if (!this.scene || !this.scene.textures.exists(key)) {
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
            this.jumpCount = 0;  // 重置跳跃次数
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
                // 飞行模式下持续检测按键
                const inputManager = InputManager.getInstance();

                // 垂直方向
                if (inputManager.isUpPressed()) {
                    this.setVelocityY(-PLAYER.FLY_SPEED);
                } else if (inputManager.isDuckPressed()) {
                    this.setVelocityY(PLAYER.FLY_SPEED);
                } else {
                    this.setVelocityY(0);
                }

                // 水平方向
                if (inputManager.isLeftPressed()) {
                    this.setVelocityX(-PLAYER.FLY_SPEED);
                    this.setFlipX(true);
                } else if (inputManager.isRightPressed()) {
                    this.setVelocityX(PLAYER.FLY_SPEED);
                    this.setFlipX(false);
                } else {
                    this.setVelocityX(0);
                }

                // 飞行模式下翅膀跟随
                if (this.wingSprite) {
                    this.wingSprite.setPosition(this.x, this.y - 10);
                }
            }
        }

        // 地面/空中模式下也需要持续响应水平按键（避免只转向不移动、必须松开再按）。
        if (this.currentState !== 'FLYING') {
            const inputManager = InputManager.getInstance();
            const leftPressed = inputManager.isLeftPressed();
            const rightPressed = inputManager.isRightPressed();

            if (leftPressed && !rightPressed) {
                this.moveLeft();
            } else if (rightPressed && !leftPressed) {
                this.moveRight();
            } else {
                this.stopMoveX();
            }
        }

        // 边界检查
        this.clampPosition();

        this.handleStateAnimation();
    }

    private clampPosition(): void {
        // 只在飞行模式下进行额外的边界限制
        // 普通模式下依赖物理引擎的 setCollideWorldBounds
        if (this.currentState === 'FLYING') {
            const minX = 32;
            const maxX = this.scene.scale.width - 32;
            this.x = Phaser.Math.Clamp(this.x, minX, maxX);

            const minY = 50;
            const maxY = this.scene.scale.height - 150;
            this.y = Phaser.Math.Clamp(this.y, minY, maxY);
        }
    }

    private handleStateAnimation(): void {
        // 只有在动画存在时才播放
        if (!this.scene) return;
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
            // 飞行模式：W键控制向上，这里不处理
            return true;
        }

        // 一段跳：地面或土狼时间
        if (this.coyoteTimer > 0 || this.grounded) {
            this.setVelocityY(PLAYER.JUMP_VELOCITY);
            this.setPlayerState('JUMPING');
            this.coyoteTimer = 0;
            this.jumpCount = 1;
            AudioManager.getInstance().play('jump');
            return true;
        }

        // 二段跳：已经在空中且只跳过一次
        if (this.jumpCount === 1) {
            this.setVelocityY(PLAYER.JUMP_VELOCITY);
            this.setPlayerState('JUMPING');
            this.jumpCount = 2;
            AudioManager.getInstance().play('jump');
            return true;
        }

        return false;
    }

    flyUp(): void {
        if (this.currentState === 'FLYING') {
            this.setVelocityY(-PLAYER.FLY_SPEED);
        }
    }

    flyDown(): void {
        if (this.currentState === 'FLYING') {
            this.setVelocityY(PLAYER.FLY_SPEED);
        }
    }

    stopFlyVertical(): void {
        if (this.currentState === 'FLYING') {
            this.setVelocityY(0);
        }
    }

    duck(): void {
        if (this.currentState === 'FLYING') {
            // 飞行模式：S键控制向下
            this.flyDown();
            return;
        }

        if (this.grounded && this.currentState !== 'DUCKING') {
            this.setPlayerState('DUCKING');
            this.setSize(PLAYER.WIDTH, PLAYER.DUCK_HEIGHT);
            this.setOffset(0, PLAYER.HEIGHT - PLAYER.DUCK_HEIGHT);
        }
    }

    stopDuck(): void {
        if (this.currentState === 'FLYING') {
            // 飞行模式：停止向下
            this.stopFlyVertical();
            return;
        }

        if (this.currentState === 'DUCKING') {
            this.setPlayerState('RUNNING');
            this.setSize(PLAYER.WIDTH, PLAYER.HEIGHT);
            this.setOffset(0, 0);
        }
    }

    moveLeft(): void {
        const speed = this.currentState === 'FLYING'
            ? PLAYER.FLY_SPEED
            : (this.grounded ? PLAYER.MOVE_SPEED : PLAYER.AIR_MOVE_SPEED);
        this.setVelocityX(-speed);
        this.setFlipX(true);
    }

    moveRight(): void {
        const speed = this.currentState === 'FLYING'
            ? PLAYER.FLY_SPEED
            : (this.grounded ? PLAYER.MOVE_SPEED : PLAYER.AIR_MOVE_SPEED);
        this.setVelocityX(speed);
        this.setFlipX(false);
    }

    stopMoveX(): void {
        if (this.currentState === 'FLYING') {
            this.setVelocityX(0);
        } else {
            this.setVelocityX(0);
        }
    }

    takeDamage(): boolean {
        if (this.currentState === 'INVINCIBLE' || this.currentState === 'FLYING' || this.currentState === 'HURT') {
            return false;
        }

        ScoreManager.getInstance().takeDamage();
        AudioManager.getInstance().play('hurt');

        if (ScoreManager.getInstance().isDead()) {
            return true;
        }

        this.setPlayerState('HURT');
        if (this.scene?.anims.exists('hurt')) {
            this.safePlay('hurt');
        }
        this.setVelocityY(-200);

        this.scene?.time.delayedCall(500, () => {
            if (this.currentState === 'HURT') {
                this.setPlayerState('RUNNING');
            }
        });

        return false;
    }

    activateInvincible(): void {
        if (ScoreManager.getInstance().activateInvincible()) {
            this.setPlayerState('INVINCIBLE');
            this.invincibleTimer = PLAYER.INVINCIBLE_DURATION;
            AudioManager.getInstance().play('powerup');
        }
    }

    activateFly(): void {
        // 可能在飞行模式下再次拾取：先清理旧翅膀，避免残留在原地。
        this.wingSprite?.destroy();
        this.wingSprite = undefined;

        this.setPlayerState('FLYING');
        this.flyTimer = PLAYER.FLY_DURATION;
        this.setGravityY(0);
        this.setVelocityY(0);

        if (this.scene?.textures.exists('spring_word')) {
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
