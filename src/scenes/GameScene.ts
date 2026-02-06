import { Scene } from 'phaser';
import type { LevelType } from '../types/index.js';
import { LEVELS, PLAYER } from '../utils/constants.js';
import { Player } from '../objects/Player.js';
import { Obstacle } from '../objects/Obstacle.js';
import { Item } from '../objects/Item.js';
import { Firecracker } from '../objects/Firecracker.js';
import { Lantern } from '../objects/Lantern.js';
import { FuCharacter } from '../objects/FuCharacter.js';
import { RedPacket } from '../objects/RedPacket.js';
import { SpringWord } from '../objects/SpringWord.js';
import { InputManager } from '../managers/InputManager.js';
import { ScoreManager } from '../managers/ScoreManager.js';
import { AudioManager } from '../managers/AudioManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { HUD } from '../ui/HUD.js';

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
    backgrounds: Phaser.GameObjects.TileSprite[] = [];
    hud!: HUD;
    
    lastObstacleTime = 0;
    obstacleInterval = 2000;
    isPaused = false;
    isGameOver = false;

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
        
        ScoreManager.getInstance().resetLevel(this.level);
        ScoreManager.getInstance().setCurrentLevel(this.level);
    }

    create(): void {
        AudioManager.getInstance().init(this);
        InputManager.getInstance().init(this);
        
        this.createBackgrounds();
        this.createPlayer();
        this.createGroups();
        this.createCollisions();
        this.createInput();
        this.createHUD();
        
        this.setupPauseHandler();
    }

    private createBackgrounds(): void {
        const bgKeys = ['bg_sky', 'bg_mountains', 'bg_buildings', 'bg_ground'];
        const yPositions = [0, 100, 200, 580]; // 地面在Y=580
        
        for (let i = 0; i < bgKeys.length; i++) {
            const bg = this.add.tileSprite(
                this.scale.width / 2,
                yPositions[i],
                this.scale.width,
                this.scale.height,
                bgKeys[i]
            );
            bg.setOrigin(0.5, 0);
            this.backgrounds.push(bg);
        }
    }

    private createPlayer(): void {
        this.player = new Player(this, PLAYER.X, PLAYER.Y);
    }

    private createGroups(): void {
        this.obstacles = this.physics.add.group({
            classType: Firecracker,
        });
        
        this.items = this.physics.add.group({
        });
    }

    private createCollisions(): void {
        // 创建地面碰撞器
        const ground = this.physics.add.staticGroup();
        const groundTop = 580; // 地面顶部位置
        const groundHeight = 200;
        const groundY = groundTop + groundHeight / 2;
        const groundSprite = this.add.rectangle(this.scale.width / 2, groundY, this.scale.width, groundHeight, 0x000000, 0);
        this.physics.add.existing(groundSprite, true);
        ground.add(groundSprite);
        
        this.physics.add.collider(this.player, ground);
        
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
        
        InputManager.getInstance().onActivate(() => {
            if (!this.isPaused && !this.isGameOver) {
                this.player.activateInvincible();
            }
        });
        
        this.input.keyboard?.on('keyup-DOWN', () => {
            this.player.stopDuck();
        });
        
        this.input.keyboard?.on('keyup-S', () => {
            this.player.stopDuck();
        });
    }

    private createHUD(): void {
        this.hud = new HUD(this);
    }

    private setupPauseHandler(): void {
        this.input.keyboard?.on('keydown-ESC', () => {
            this.togglePause();
        });
    }

    private togglePause(): void {
        if (this.isGameOver) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.scene.launch('PauseScene');
            this.scene.pause();
        }
    }

    update(time: number, delta: number): void {
        if (this.isPaused || this.isGameOver) return;
        
        const dt = delta / 1000;
        
        this.player.update(delta);
        InputManager.getInstance().update();
        
        this.updateScroll(delta);
        this.updateBackgrounds(delta);
        this.updateObstacles(dt);
        this.updateItems(dt);
        this.spawnObjects(time);
        this.checkLevelComplete();
        this.updateHUD();
    }

    private updateObstacles(dt: number): void {
        this.obstacles.getChildren().forEach((child) => {
            (child as Obstacle).update(this.scrollSpeed, dt);
        });
    }

    private updateItems(dt: number): void {
        this.items.getChildren().forEach((child) => {
            (child as Item).update(this.scrollSpeed, dt);
        });
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
            this.backgrounds[i].tilePositionX += this.scrollSpeed * speeds[i] * (delta / 1000);
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
        
        if (type < 0.6) {
            const firecrackerType = Math.random() < 0.7 ? 'ground' : 'air';
            const movePattern = Math.random() < 0.5 ? 'static' : 'bounce';
            
            const firecracker = new Firecracker(this, x, 600, {
                type: firecrackerType,
                movePattern,
            });
            this.obstacles.add(firecracker);
        } else {
            const heights: Array<'low' | 'mid' | 'high'> = ['low', 'mid', 'high'];
            const height = heights[Math.floor(Math.random() * heights.length)];
            
            const lantern = new Lantern(this, x, 0, { height });
            this.obstacles.add(lantern);
        }
    }

    private spawnItem(): void {
        const x = this.scale.width + 100 + Math.random() * 200;
        const type = Math.random();
        
        let item;
        if (type < 0.5) {
            const fuTypes: Array<'fu_copper' | 'fu_silver' | 'fu_gold'> = ['fu_copper', 'fu_copper', 'fu_copper', 'fu_silver', 'fu_gold'];
            const fuType = fuTypes[Math.floor(Math.random() * fuTypes.length)];
            item = new FuCharacter(this, x, 300 + Math.random() * 200, fuType);
        } else if (type < 0.8) {
            item = new RedPacket(this, x, 300 + Math.random() * 200);
        } else {
            item = new SpringWord(this, x, 300 + Math.random() * 200);
        }
        
        this.items.add(item);
    }

    private onHitObstacle(player: Player, obstacle: Firecracker | Lantern): void {
        if (!obstacle.isActiveObstacle()) return;
        
        if (player.isInvincible()) {
            obstacle.deactivate();
            ScoreManager.getInstance().addScore(50);
            AudioManager.getInstance().play('explosion');
            
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

    private onCollectItem(_player: Player, item: FuCharacter | RedPacket | SpringWord): void {
        if (item.isCollected()) return;
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
        
        if (this.level < 3) {
            this.scene.start('StoryScene', { level: (this.level + 1) as LevelType });
        } else {
            this.scene.start('VictoryScene');
        }
    }

    private gameOver(): void {
        this.isGameOver = true;
        AudioManager.getInstance().play('game_over');
        
        this.scene.start('GameOverScene', {
            score: ScoreManager.getInstance().getScore(),
            distance: Math.floor(this.distance),
        });
    }
}
