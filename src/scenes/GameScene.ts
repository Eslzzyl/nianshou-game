import { Scene } from 'phaser';
import { AudioManager } from '../managers/AudioManager.js';
import { InputManager } from '../managers/InputManager.js';
import { ObjectPoolManager } from '../managers/ObjectPoolManager.js';
import { ParticleManager } from '../managers/ParticleManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { ScoreManager } from '../managers/ScoreManager.js';
import type { Item } from '../objects/Item.js';
import type { Obstacle } from '../objects/Obstacle.js';
import { Player } from '../objects/Player.js';
import type { LevelType } from '../types/index.js';
import { HUD } from '../ui/HUD.js';
import { VirtualButtons } from '../ui/VirtualButtons.js';
import { COLORS, GROUND_HEIGHT, LEVELS, PLAYER } from '../utils/constants.js';
import { computeJumpApexDelta } from '../utils/physics.js';

interface GameData {
    level: LevelType;
}

export class GameScene extends Scene {
    level!: LevelType;
    levelConfig = LEVELS[0];
    scrollSpeed = LEVELS[0].baseSpeed;
    distance = 0;

    player!: Player;
    obstacles!: Phaser.Physics.Arcade.Group;
    items!: Phaser.Physics.Arcade.Group;
    petals: Phaser.GameObjects.Graphics[] = [];
    backgrounds: Phaser.GameObjects.TileSprite[] = [];
    hud!: HUD;
    virtualButtons!: VirtualButtons;

    lastObstacleTime = 0;
    obstacleInterval = 2000;
    isPaused = false;
    isGameOver = false;

    private ground?: Phaser.Physics.Arcade.StaticGroup;
    private groundSprite?: Phaser.GameObjects.Rectangle;

    constructor(config?: Phaser.Types.Scenes.SettingsConfig) {
        super(config || { key: 'GameScene' });
    }

    init(data: GameData): void {
        this.level = data.level;
        this.levelConfig = LEVELS[this.level - 1];
        this.scrollSpeed = this.levelConfig.baseSpeed;
        this.distance = 0;
        this.isGameOver = false;
        this.isPaused = false;

        // 场景可能会被 restart() 复用：清理数组引用，避免二次进入后索引越界导致 NaN。
        this.petals = [];
        this.backgrounds = [];

        ScoreManager.getInstance().resetLevel(this.level);
        ScoreManager.getInstance().setCurrentLevel(this.level);
    }

    create(): void {
        AudioManager.getInstance().init(this);
        InputManager.getInstance().init(this);
        ObjectPoolManager.getInstance().init();
        ParticleManager.getInstance().init(this);

        // 自适应窗口尺寸（Scale.RESIZE）
        this.scale.off('resize', this.onResize, this);
        this.scale.on('resize', this.onResize, this);

        // 当从暂停场景恢复时，确保逻辑层的暂停标记同步。
        this.events.off(Phaser.Scenes.Events.RESUME);
        this.events.on(Phaser.Scenes.Events.RESUME, () => {
            this.isPaused = false;
        });

        this.createBackgrounds();
        this.createPlayer();
        this.createGroups();
        this.createCollisions();
        this.createInput();
        this.createHUD();
        this.createVirtualButtons();
        this.createDecorations();

        this.setupPauseHandler();

        // 首次创建后同步一次尺寸
        this.onResize({ width: this.scale.width, height: this.scale.height } as Phaser.Structs.Size);

        // 注册场景关闭时的清理
        this.events.once('shutdown', this.shutdown, this);
    }

    shutdown(): void {
        // 清理事件监听
        this.scale.off('resize', this.onResize, this);
        this.events.off(Phaser.Scenes.Events.RESUME);

        // 清理键盘事件
        if (this.input.keyboard) {
            this.input.keyboard.off('keydown-ESC');
            this.input.keyboard.off('keyup-DOWN');
            this.input.keyboard.off('keyup-S');
            this.input.keyboard.off('keyup-W');
            this.input.keyboard.off('keyup-A');
            this.input.keyboard.off('keyup-D');
            this.input.keyboard.off('keyup-LEFT');
            this.input.keyboard.off('keyup-RIGHT');
            this.input.keyboard.off('keyup-UP');
        }

        // 清理回调
        InputManager.getInstance().destroy();

        // 清理对象池
        ObjectPoolManager.getInstance().clearAll();

        // 清理粒子管理器
        ParticleManager.getInstance().destroy();

        // 清理HUD
        this.hud?.destroy();

        // 清理虚拟按键
        this.virtualButtons?.destroy();

        // 清理花瓣装饰
        for (const petal of this.petals) {
            petal.destroy();
        }
        this.petals = [];
    }

    private createBackgrounds(): void {
        const bgKeys = this.levelConfig.bgLayers;
        const layout = this.getBackgroundLayout(this.scale.width, this.scale.height);

        for (let i = 0; i < bgKeys.length; i++) {
            const layerLayout = layout[i];
            const bg = this.add.tileSprite(
                this.scale.width / 2,
                layerLayout?.y ?? 0,
                this.scale.width,
                layerLayout?.height ?? this.scale.height,
                bgKeys[i]
            );
            bg.setOrigin(0.5, 0);
            // ensure visual size matches target (TileSprite rendering needs setDisplaySize when resizing)
            bg.setDisplaySize(this.scale.width, layerLayout?.height ?? this.scale.height);
            this.backgrounds.push(bg);
        }
    }

    private getBackgroundLayout(width: number, height: number): Array<{ y: number; height: number }> {
        const safeWidth = Math.max(1, Math.floor(width));
        const safeHeight = Math.max(1, Math.floor(height));
        const groundHeight = Math.min(GROUND_HEIGHT, safeHeight);
        const groundY = Math.max(0, safeHeight - groundHeight);
        const baseHeights = this.levelConfig.bgLayerBaseHeights;
        const scale = Math.max(0.4, safeHeight / 720);
        const layout: Array<{ y: number; height: number }> = [];

        for (let i = 0; i < this.levelConfig.bgLayers.length; i++) {
            if (i === 0) {
                layout.push({ y: 0, height: Math.max(1, groundY) });
                continue;
            }

            if (i === this.levelConfig.bgLayers.length - 1) {
                layout.push({ y: groundY, height: groundHeight });
                continue;
            }

            const baseHeight = baseHeights[i] ?? Math.round(safeHeight * 0.25);
            const layerHeight = Math.min(Math.round(baseHeight * scale), groundY);
            const y = Math.max(0, groundY - layerHeight);
            layout.push({ y, height: Math.max(1, layerHeight) });
        }

        if (layout.length > 0 && safeWidth > 0) {
            // Ensure layout exists for all layers even in edge cases.
            while (layout.length < this.levelConfig.bgLayers.length) {
                layout.push({ y: 0, height: Math.max(1, groundY) });
            }
        }

        return layout;
    }

    private createDecorations(): void {
        // 添加节日装饰粒子效果
        this.createFallingPetals();
    }

    private createFallingPetals(): void {
        // 飘落的花瓣/红包效果
        const colors = [COLORS.RED_PRIMARY, COLORS.GOLD_PRIMARY, COLORS.CORAL];

        for (let i = 0; i < 15; i++) {
            const graphics = this.add.graphics();
            const color = colors[Math.floor(Math.random() * colors.length)];
            graphics.fillStyle(color, 0.6);

            const size = 3 + Math.random() * 4;
            graphics.fillCircle(0, 0, size);

            const petal = {
                graphics,
                x: Math.random() * this.scale.width,
                y: Math.random() * this.scale.height * 0.6,
                speedY: 15 + Math.random() * 25,
                speedX: (Math.random() - 0.5) * 8,
                wobble: Math.random() * Math.PI * 2,
            };

            graphics.setPosition(petal.x, petal.y);
            graphics.setData('petal', petal);
            this.petals.push(graphics);
        }
    }

    private createPlayer(): void {
        const playerY = this.scale.height - GROUND_HEIGHT - PLAYER.HEIGHT / 2;
        this.player = new Player(this, PLAYER.X, playerY);
    }

    private createGroups(): void {
        this.obstacles = this.physics.add.group();
        this.items = this.physics.add.group();
    }

    private createCollisions(): void {
        this.ground = this.physics.add.staticGroup();
        const groundTop = this.scale.height - GROUND_HEIGHT;
        const groundHeight = GROUND_HEIGHT;
        const groundY = groundTop + groundHeight / 2;
        this.groundSprite = this.add.rectangle(
            this.scale.width / 2,
            groundY,
            this.scale.width,
            groundHeight,
            0x000000,
            0
        );
        this.physics.add.existing(this.groundSprite, true);
        this.ground.add(this.groundSprite);

        this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);

        this.physics.add.collider(this.player, this.ground);

        this.physics.add.overlap(
            this.player,
            this.obstacles,
            this.onHitObstacle as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.items,
            this.onCollectItem as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this
        );
    }

    private createInput(): void {
        InputManager.getInstance().onJump(() => {
            if (!this.isPaused && !this.isGameOver) {
                this.player.jump();
            }
        });

        InputManager.getInstance().onDuck(() => {
            if (!this.isPaused && !this.isGameOver) {
                this.player.duck();
            }
        });

        InputManager.getInstance().onUp(() => {
            if (!this.isPaused && !this.isGameOver) {
                this.player.flyUp();
            }
        });

        InputManager.getInstance().onActivate(() => {
            if (!this.isPaused && !this.isGameOver) {
                this.player.activateInvincible();
            }
        });

        InputManager.getInstance().onLeft(() => {
            if (!this.isPaused && !this.isGameOver) {
                this.player.moveLeft();
            }
        });

        InputManager.getInstance().onRight(() => {
            if (!this.isPaused && !this.isGameOver) {
                this.player.moveRight();
            }
        });

        this.input.keyboard?.on('keyup-DOWN', () => {
            this.player.stopDuck();
        });

        this.input.keyboard?.on('keyup-S', () => {
            this.player.stopDuck();
        });

        this.input.keyboard?.on('keyup-W', () => {
            this.player.stopFlyVertical();
        });

        this.input.keyboard?.on('keyup-A', () => {
            this.player.stopMoveX();
        });

        this.input.keyboard?.on('keyup-D', () => {
            this.player.stopMoveX();
        });

        this.input.keyboard?.on('keyup-LEFT', () => {
            this.player.stopMoveX();
        });

        this.input.keyboard?.on('keyup-RIGHT', () => {
            this.player.stopMoveX();
        });

        this.input.keyboard?.on('keyup-UP', () => {
            this.player.stopFlyVertical();
        });
    }

    private createHUD(): void {
        this.hud = new HUD(this);
    }

    private createVirtualButtons(): void {
        this.virtualButtons = new VirtualButtons(this);

        if (this.virtualButtons.hasJoystick()) {
            this.virtualButtons.onJoystickMove((x: number, y: number) => {
                if (this.isPaused || this.isGameOver) return;

                const threshold = 0.3;

                if (y < -threshold) {
                    this.player.jump();
                } else if (y > threshold) {
                    this.player.duck();
                } else {
                    this.player.stopDuck();
                }

                if (x < -threshold) {
                    this.player.moveLeft();
                } else if (x > threshold) {
                    this.player.moveRight();
                } else {
                    this.player.stopMoveX();
                }
            });

            this.virtualButtons.onJoystickRelease(() => {
                if (this.isPaused || this.isGameOver) return;
                this.player.stopMoveX();
                this.player.stopDuck();
            });
        }
    }

    private setupPauseHandler(): void {
        this.input.keyboard?.on('keydown-ESC', () => {
            this.togglePause();
        });
    }

    private togglePause(): void {
        if (this.isGameOver) return;

        // 支持从 ESC 进入/退出暂停
        if (!this.isPaused) {
            this.isPaused = true;
            this.scene.launch('PauseScene');
            this.scene.pause();
        } else {
            this.isPaused = false;
            this.scene.stop('PauseScene');
            this.scene.resume();
        }
    }

    update(time: number, delta: number): void {
        if (this.isPaused || this.isGameOver) return;

        const dt = delta / 1000;

        this.player.update(delta);
        InputManager.getInstance().update();
        ScoreManager.getInstance().updateInvincibleEnergy(delta);

        this.updateScroll(delta);
        this.updateBackgrounds(delta);
        this.updateObstacles(dt);
        this.updateItems(dt);
        this.updateDecorations();
        this.spawnObjects(time);
        this.checkLevelComplete();
        this.updateHUD();

        ParticleManager.getInstance().update(delta);
    }

    private updateDecorations(): void {
        // 更新飘落的花瓣
        const time = this.time.now / 1000;
        const dt = this.game.loop.delta / 1000;

        for (const graphics of this.petals) {
            const petal = graphics.getData('petal');
            if (petal) {
                petal.y += petal.speedY * dt;
                petal.x += petal.speedX * dt + Math.sin(time + petal.wobble) * 0.3;

                if (petal.y > this.scale.height) {
                    petal.y = -10;
                    petal.x = Math.random() * this.scale.width;
                }

                if (petal.x < -10) petal.x = this.scale.width + 10;
                if (petal.x > this.scale.width + 10) petal.x = -10;

                graphics.setPosition(petal.x, petal.y);
            }
        }
    }

    private updateObstacles(dt: number): void {
        const children = this.obstacles.getChildren();
        for (let i = 0; i < children.length; i++) {
            (children[i] as Obstacle).update(this.scrollSpeed, dt);
        }
    }

    private updateItems(dt: number): void {
        const children = this.items.getChildren();
        for (let i = 0; i < children.length; i++) {
            (children[i] as Item).update(this.scrollSpeed, dt);
        }
    }

    private updateScroll(delta: number): void {
        const dt = delta / 1000;
        this.distance += this.scrollSpeed * dt;

        if (this.scrollSpeed < this.levelConfig.maxSpeed) {
            this.scrollSpeed += 5 * dt;
        }

        ScoreManager.getInstance().updateDistance(this.scrollSpeed * dt);
    }

    private updateBackgrounds(delta: number): void {
        const speeds = [0.1, 0.3, 0.6, 1.0];

        for (let i = 0; i < this.backgrounds.length; i++) {
            const speed = speeds[i] ?? speeds[speeds.length - 1];
            this.backgrounds[i].tilePositionX += this.scrollSpeed * speed * (delta / 1000);
        }
    }

    private spawnObjects(time: number): void {
        if (time - this.lastObstacleTime > this.obstacleInterval) {
            this.spawnObstacle();
            this.spawnItem();

            this.lastObstacleTime = time;
            this.obstacleInterval = Math.max(800, 2000 - this.distance * 0.5);
        }
    }

    private spawnObstacle(): void {
        const x = this.scale.width + 100;
        const type = Math.random();
        const groundTop = this.scale.height - GROUND_HEIGHT;

        if (type < 0.6) {
            const firecrackerType = Math.random() < 0.7 ? 'ground' : 'air';
            const movePattern = Math.random() < 0.5 ? 'static' : 'bounce';

            const firecracker = ObjectPoolManager.getInstance().getFirecracker(this, x, groundTop + 20, {
                type: firecrackerType,
                movePattern,
            });
            this.obstacles.add(firecracker);
        } else {
            const heights: Array<'low' | 'mid' | 'high'> = ['low', 'mid', 'high'];
            const height = heights[Math.floor(Math.random() * heights.length)];

            const lantern = ObjectPoolManager.getInstance().getLantern(this, x, 0, { height });
            this.obstacles.add(lantern);
        }
    }

    private spawnItem(): void {
        const x = this.scale.width + 100 + Math.random() * 200;
        const type = Math.random();

        // Compute safe spawn Y based on player's jump apex and ground
        const groundTop = this.scale.height - GROUND_HEIGHT;
        const jumpDelta = computeJumpApexDelta(PLAYER.JUMP_VELOCITY, PLAYER.GRAVITY);
        const apexY = this.player ? (this.player.y - jumpDelta) : Math.max(50, groundTop - 300);
        const reserve = 32; // margin below apex to ensure collect overlap
        const allowedMinY = Math.max(50, apexY + reserve);
        const allowedMaxY = Math.max(allowedMinY + 10, groundTop - 40);

        const desiredY = 300 + Math.random() * 200;
        const spawnY = Phaser.Math.Clamp(desiredY, allowedMinY, allowedMaxY);

        let item;
        if (type < 0.5) {
            const fuTypes: Array<'fu_copper' | 'fu_silver' | 'fu_gold'> = ['fu_copper', 'fu_copper', 'fu_copper', 'fu_silver', 'fu_gold'];
            const fuType = fuTypes[Math.floor(Math.random() * fuTypes.length)];
            item = ObjectPoolManager.getInstance().getFuCharacter(this, x, spawnY, fuType);
        } else if (type < 0.8) {
            item = ObjectPoolManager.getInstance().getRedPacket(this, x, spawnY);
        } else {
            item = ObjectPoolManager.getInstance().getSpringWord(this, x, spawnY);
        }

        this.items.add(item);
    }

    private onHitObstacle(player: Player, obstacle: Obstacle): void {
        if (!obstacle.isActiveObstacle()) return;

        if (player.isInvincible()) {
            obstacle.deactivate();
            ScoreManager.getInstance().addScore(50);
            AudioManager.getInstance().play('explosion');

            // 添加爆炸粒子效果
            ParticleManager.getInstance().spawnFirework(obstacle.x, obstacle.y);

            this.tweens.add({
                targets: obstacle,
                alpha: 0,
                scale: 1.5,
                duration: 200,
                onComplete: () => obstacle.destroy(),
            });
        } else {
            const isDead = player.takeDamage();
            obstacle.deactivate();

            if (isDead || ScoreManager.getInstance().isDead()) {
                this.gameOver();
            }
        }
    }

    private onCollectItem(_player: Player, item: Item): void {
        if (item.isCollected()) return;

        // 添加收集特效
        ParticleManager.getInstance().spawnCollectEffect(item.x, item.y, COLORS.GOLD_PRIMARY);

        item.collect();
    }

    protected checkLevelComplete(): void {
        if (this.distance >= this.levelConfig.length) {
            this.levelComplete();
        }
    }

    private updateHUD(): void {
        this.hud.update(
            ScoreManager.getInstance().getScore(),
            ScoreManager.getInstance().getLives(),
            ScoreManager.getInstance().getRedPackets(),
            Math.floor(this.distance),
            this.levelConfig.length
        );
    }

    protected levelComplete(): void {
        this.isGameOver = true;

        ScoreManager.getInstance().checkAchievements();
        SaveManager.getInstance().setHighScore(ScoreManager.getInstance().getScore());
        SaveManager.getInstance().unlockLevel(this.level + 1);

        AudioManager.getInstance().play('level_complete');

        // 庆祝烟花
        for (let i = 0; i < 5; i++) {
            this.time.delayedCall(i * 300, () => {
                const x = 100 + Math.random() * (this.scale.width - 200);
                const y = 50 + Math.random() * 200;
                ParticleManager.getInstance().spawnFirework(x, y);
            });
        }

        this.time.delayedCall(1500, () => {
            if (this.level < 3) {
                this.scene.start('StoryScene', { level: (this.level + 1) as LevelType });
            } else {
                this.scene.start('VictoryScene');
            }
        });
    }

    private gameOver(): void {
        this.isGameOver = true;
        AudioManager.getInstance().play('game_over');

        this.scene.start('GameOverScene', {
            score: ScoreManager.getInstance().getScore(),
            distance: Math.floor(this.distance),
            level: this.level,
            fromSceneKey: this.sys.settings.key,
        });
    }

    private onResize(gameSize: Phaser.Structs.Size): void {
        const width = Math.max(1, Math.floor(gameSize.width));
        const height = Math.max(1, Math.floor(gameSize.height));

        this.physics.world.setBounds(0, 0, width, height);

        // 更新背景
        const layout = this.getBackgroundLayout(width, height);
        for (let i = 0; i < this.backgrounds.length; i++) {
            const bg = this.backgrounds[i];
            const layerLayout = layout[i];
            bg.setPosition(width / 2, layerLayout?.y ?? 0);
            bg.setDisplaySize(width, layerLayout?.height ?? height);
        }

        // 更新地面碰撞体
        if (this.groundSprite?.body) {
            const groundHeight = GROUND_HEIGHT;
            const groundYCenter = (height - groundHeight) + groundHeight / 2;
            this.groundSprite.setPosition(width / 2, groundYCenter);
            this.groundSprite.setSize(width, groundHeight);
            (this.groundSprite.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
        }

        // HUD/虚拟按键
        this.hud?.resize(width, height);
        this.virtualButtons?.resize(width, height);

        // 玩家位置防溢出
        if (this.player) {
            const minX = 32;
            const maxX = width - 32;
            this.player.x = Phaser.Math.Clamp(this.player.x, minX, maxX);
            if (this.player.getPlayerState() !== 'FLYING') {
                const playerY = height - GROUND_HEIGHT - PLAYER.HEIGHT / 2;
                this.player.y = Math.min(this.player.y, playerY);
            }
        }
    }
}
