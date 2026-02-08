import { Scene } from 'phaser';
import { ACHIEVEMENT_STORIES, VICTORY_STORY } from '../data/NarrativeData.js';
import { ParticleManager } from '../managers/ParticleManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { ScoreManager } from '../managers/ScoreManager.js';
import type { Achievement } from '../types/index.js';
import { UIComponents } from '../ui/UIComponents.js';
import { COLORS, STYLE, UI_RESOLUTION } from '../utils/constants.js';

interface VictoryData {
    achievements?: Achievement[];
}

export class VictoryScene extends Scene {
    private newAchievements: Achievement[] = [];
    private uiContainer?: Phaser.GameObjects.Container;
    private fireworksLoop?: Phaser.Time.TimerEvent;

    constructor() {
        super({ key: 'VictoryScene' });
    }

    init(data: VictoryData): void {
        this.newAchievements = data.achievements || [];
    }

    create(): void {
        ParticleManager.getInstance().init(this);

        this.scale.off('resize', this.onResize, this);
        this.scale.on('resize', this.onResize, this);

        this.buildLayout();

        this.input.keyboard?.on('keydown-SPACE', () => this.returnToMenu());
        this.input.keyboard?.on('keydown-ENTER', () => this.returnToMenu());
    }

    update(_time: number, delta: number): void {
        ParticleManager.getInstance().update(delta);
    }

    private buildLayout(): void {
        this.uiContainer?.destroy(true);
        this.uiContainer = this.add.container(0, 0);

        if (this.fireworksLoop) {
            this.fireworksLoop.remove();
            this.fireworksLoop = undefined;
        }

        this.createBackground();
        this.createVictoryText();
        this.createStats();
        this.createAchievements();
        this.createButtons();
        this.createDecorations();
    }

    private onResize(): void {
        this.buildLayout();
    }

    private createBackground(): void {
        // 渐变背景
        const bg = this.add.graphics();
        for (let y = 0; y < this.scale.height; y++) {
            const ratio = y / this.scale.height;
            const r = Math.floor(40 + ratio * 40);
            const g = Math.floor(20 + ratio * 20);
            const b = Math.floor(60 + ratio * 40);
            bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
            bg.fillRect(0, y, this.scale.width, 1);
        }

        this.uiContainer?.add(bg);

        // 背景图片
        if (this.textures.exists('bg_palace')) {
            const bgImage = this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg_palace');
            bgImage.setDisplaySize(this.scale.width, this.scale.height);
            bgImage.setAlpha(0.4);
            this.uiContainer?.add(bgImage);
        }

        // 庆祝烟花
        this.createFireworks();
    }

    private createFireworks(): void {
        for (let i = 0; i < 5; i++) {
            this.time.delayedCall(i * 400, () => {
                const x = 150 + Math.random() * (this.scale.width - 300);
                const y = 80 + Math.random() * 250;
                ParticleManager.getInstance().spawnFirework(x, y);
            });
        }

        this.fireworksLoop = this.time.addEvent({
            delay: 1800,
            callback: () => {
                const x = 150 + Math.random() * (this.scale.width - 300);
                const y = 80 + Math.random() * 250;
                ParticleManager.getInstance().spawnFirework(x, y);
            },
            callbackScope: this,
            loop: true,
        });
    }

    private createVictoryText(): void {
        const centerX = this.scale.width / 2;

        // 发光层
        const glow = this.add.text(centerX, 90, VICTORY_STORY.title, {
            fontSize: '56px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
        glow.setStroke('#FFD700', 10);
        glow.setAlpha(0.3);

        // 主文字
        const text = this.add.text(centerX, 90, VICTORY_STORY.title, {
            fontSize: '56px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
        text.setStroke('#8B0000', 6);

        // 脉冲动画
        this.tweens.add({
            targets: [glow, text],
            scale: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // 故事内容面板
        this.createStoryPanel(centerX, 200);

        // 祝福语
        const blessing = this.add.text(centerX, this.scale.height - 120, VICTORY_STORY.blessing, {
            fontSize: '22px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: blessing,
            alpha: 0.6,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.uiContainer?.add([glow, text, blessing]);
    }

    private createStoryPanel(centerX: number, startY: number): void {
        const panel = UIComponents.createScrollPanel(this, centerX, startY + 70, 700, 180);
        this.uiContainer?.add(panel);

        // 故事文本
        let yOffset = startY;
        VICTORY_STORY.story.forEach((line, index) => {
            if (line === '') {
                yOffset += 15;
                return;
            }

            const text = this.add.text(centerX, yOffset, line, {
                fontSize: '18px',
                color: '#FFFFFF',
                align: 'center',
                fontFamily: STYLE.FONT.FAMILY,
                resolution: UI_RESOLUTION,
            }).setOrigin(0.5);

            text.setAlpha(0);
            this.uiContainer?.add(text);

            this.tweens.add({
                targets: text,
                alpha: 1,
                duration: 600,
                delay: 500 + index * 300,
            });

            yOffset += 26;
        });

        // 诗句
        const quote = this.add.text(centerX, yOffset + 15, `「${VICTORY_STORY.quote}」`, {
            fontSize: '16px',
            color: '#AAAAAA',
            fontStyle: 'italic',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        quote.setAlpha(0);
        this.uiContainer?.add(quote);

        this.tweens.add({
            targets: quote,
            alpha: 0.8,
            duration: 800,
            delay: 2500,
        });
    }

    private createStats(): void {
        const centerX = this.scale.width / 2;
        const yOffset = 300;
        const score = ScoreManager.getInstance().getScore();

        // 分数面板
        const panel = UIComponents.createScrollPanel(this, centerX, yOffset + 30, 350, 120);
        this.uiContainer?.add(panel);

        const scoreText = this.add.text(centerX, yOffset, `🏆 最终分数: ${score}`, {
            fontSize: '32px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        this.uiContainer?.add(scoreText);

        const highScore = SaveManager.getInstance().getHighScore();
        if (score >= highScore) {
            const recordText = this.add.text(centerX, yOffset + 55, '⭐ 新纪录! ⭐', {
                fontSize: '24px',
                color: '#FF6B35',
                fontStyle: 'bold',
                fontFamily: STYLE.FONT.FAMILY,
                resolution: UI_RESOLUTION,
            }).setOrigin(0.5);

            this.uiContainer?.add(recordText);
        }
    }

    private createAchievements(): void {
        if (this.newAchievements.length === 0) return;

        const centerX = this.scale.width / 2;
        const yOffset = 400;

        const title = this.add.text(centerX, yOffset, '✨ 新解锁成就', {
            fontSize: '22px',
            color: '#AAAAAA',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        this.uiContainer?.add(title);

        let achievementY = yOffset + 40;
        for (const achievement of this.newAchievements) {
            const story = ACHIEVEMENT_STORIES[achievement.id];
            
            // 成就名称
            const achName = this.add.text(centerX, achievementY, `🏅 ${achievement.name}`, {
                fontSize: '18px',
                color: '#FFD700',
                fontFamily: STYLE.FONT.FAMILY,
                resolution: UI_RESOLUTION,
            }).setOrigin(0.5);

            this.uiContainer?.add(achName);
            achievementY += 28;

            // 成就故事
            if (story) {
                const storyLines = story.story.split('\n');
                storyLines.forEach((line) => {
                    if (line) {
                        const storyText = this.add.text(centerX, achievementY, line, {
                            fontSize: '13px',
                            color: '#CCCCCC',
                            align: 'center',
                            fontFamily: STYLE.FONT.FAMILY,
                            resolution: UI_RESOLUTION,
                        }).setOrigin(0.5);

                        this.uiContainer?.add(storyText);
                        achievementY += 20;
                    }
                });

                // 风味文本
                const flavorText = this.add.text(centerX, achievementY, `💭 ${story.flavorText}`, {
                    fontSize: '12px',
                    color: '#888888',
                    fontStyle: 'italic',
                    fontFamily: STYLE.FONT.FAMILY,
                    resolution: UI_RESOLUTION,
                }).setOrigin(0.5);

                this.uiContainer?.add(flavorText);
                achievementY += 28;
            }

            achievementY += 15;
        }
    }

    private createButtons(): void {
        const menuBtn = UIComponents.createModernButton(
            this,
            this.scale.width / 2,
            580,
            '🏠 返回主菜单',
            () => this.returnToMenu(),
            { width: 300 }
        );

        this.uiContainer?.add(menuBtn);
    }

    private createDecorations(): void {
        // 两侧灯笼
        const left = this.createLantern(100, 120);
        const right = this.createLantern(this.scale.width - 100, 120);

        this.uiContainer?.add([left, right]);
    }

    private createLantern(x: number, y: number): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        const lantern = this.add.graphics();
        lantern.fillStyle(COLORS.RED_PRIMARY, 1);
        lantern.fillEllipse(0, 20, 45, 55);
        lantern.fillStyle(COLORS.GOLD_PRIMARY, 0.5);
        lantern.fillEllipse(0, 20, 30, 38);
        lantern.fillStyle(COLORS.GOLD_PRIMARY, 1);
        lantern.fillRect(-3, -15, 6, 12);

        container.add(lantern);

        // 摇摆动画
        this.tweens.add({
            targets: container,
            angle: { from: -5, to: 5 },
            duration: 2000 + Math.random() * 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        return container;
    }

    private returnToMenu(): void {
        this.scene.start('MenuScene');
    }
}
