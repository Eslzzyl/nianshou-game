import { Scene } from 'phaser';
import { LEVEL_STORIES } from '../data/NarrativeData.js';
import { ParticleManager } from '../managers/ParticleManager.js';
import type { LevelType } from '../types/index.js';
import { UIComponents } from '../ui/UIComponents.js';
import { COLORS, STYLE, UI_RESOLUTION } from '../utils/constants.js';

interface StoryData {
    level: LevelType;
}

export class StoryScene extends Scene {
    private level!: LevelType;
    private uiContainer?: Phaser.GameObjects.Container;

    constructor() {
        super({ key: 'StoryScene' });
    }

    init(data: StoryData): void {
        this.level = data.level;
    }

    create(): void {
        ParticleManager.getInstance().init(this);

        this.scale.off('resize', this.onResize, this);
        this.scale.on('resize', this.onResize, this);

        this.buildLayout();

        this.input.keyboard?.on('keydown-SPACE', () => this.startGame());
        this.input.keyboard?.on('keydown-ENTER', () => this.startGame());
        this.input.on('pointerdown', () => this.startGame());
    }

    update(_time: number, delta: number): void {
        ParticleManager.getInstance().update(delta);
    }

    private buildLayout(): void {
        this.uiContainer?.destroy(true);
        this.uiContainer = this.add.container(0, 0);

        this.createBackground();
        this.createStoryPanel();
        this.createContinueHint();
    }

    private onResize(): void {
        this.buildLayout();
    }

    private createBackground(): void {
        const bgKeys = ['bg_village', 'bg_city', 'bg_palace'];

        // 渐变背景
        const bg = this.add.graphics();
        for (let y = 0; y < this.scale.height; y++) {
            const ratio = y / this.scale.height;
            const r = Math.floor(30 + ratio * 30);
            const g = Math.floor(15 + ratio * 20);
            const b = Math.floor(20 + ratio * 30);
            bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
            bg.fillRect(0, y, this.scale.width, 1);
        }

        this.uiContainer?.add(bg);

        // 背景图片
        if (this.textures.exists(bgKeys[this.level - 1])) {
            const bgImage = this.add.image(this.scale.width / 2, this.scale.height / 2, bgKeys[this.level - 1]);
            bgImage.setDisplaySize(this.scale.width, this.scale.height);
            bgImage.setAlpha(0.35);
            this.uiContainer?.add(bgImage);
        }

        // 装饰灯笼
        this.createDecorations();
    }

    private createDecorations(): void {
        // 两侧灯笼
        const leftTop = this.createLantern(80, 100);
        const rightTop = this.createLantern(this.scale.width - 80, 100);
        const leftBottom = this.createLantern(80, 250);
        const rightBottom = this.createLantern(this.scale.width - 80, 250);

        this.uiContainer?.add([leftTop, rightTop, leftBottom, rightBottom]);
    }

    private createLantern(x: number, y: number): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        const lantern = this.add.graphics();
        lantern.fillStyle(COLORS.RED_PRIMARY, 0.8);
        lantern.fillEllipse(0, 15, 35, 45);
        lantern.fillStyle(COLORS.GOLD_PRIMARY, 0.4);
        lantern.fillEllipse(0, 15, 22, 30);
        lantern.fillStyle(COLORS.GOLD_PRIMARY, 0.8);
        lantern.fillRect(-2, -18, 4, 15);

        container.add(lantern);

        // 摇摆动画
        this.tweens.add({
            targets: container,
            angle: { from: -4, to: 4 },
            duration: 2200 + Math.random() * 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        return container;
    }

    private createStoryPanel(): void {
        const centerX = this.scale.width / 2;
        const storyData = LEVEL_STORIES[this.level];

        // 卷轴面板 - 调整位置和大小，给标题留空间
        const panelY = this.scale.height / 2 + 60;
        const panelHeight = 400;
        const panel = UIComponents.createScrollPanel(this, centerX, panelY, 720, panelHeight);
        this.uiContainer?.add(panel);

        // 关卡标题 - 在面板上方
        const titleContainer = this.add.container(centerX, 130);

        const icon = this.add.text(0, 0, storyData.icon, {
            fontSize: '48px',
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        // 关卡名称
        const levelNum = this.add.text(0, 40, `第 ${this.level} 关`, {
            fontSize: '24px',
            color: '#FFD700',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        const title = this.add.text(0, 70, storyData.title, {
            fontSize: '32px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
        title.setStroke('#8B0000', 4);

        // 发光效果
        const glow = this.add.text(0, 70, storyData.title, {
            fontSize: '32px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
        glow.setStroke('#FFD700', 8);
        glow.setAlpha(0.25);

        titleContainer.add([glow, icon, levelNum, title]);
        this.uiContainer?.add(titleContainer);

        // 脉冲动画
        this.tweens.add({
            targets: [glow, title],
            scale: 1.03,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // 主题描述 - 在面板上方
        const themeText = this.add.text(centerX, 230, `—— ${storyData.theme} ——`, {
            fontSize: '16px',
            color: '#FFD700',
            fontStyle: 'italic',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
        themeText.setAlpha(0.7);
        this.uiContainer?.add(themeText);

        // 故事文字 - 在卷轴面板内部显示
        // 面板Y中心是 panelY，高度是 panelHeight
        // 面板顶部 = panelY - panelHeight/2，底部 = panelY + panelHeight/2
        const panelTop = panelY - panelHeight / 2;
        const texts = storyData.introLines;
        let yOffset = panelTop + 40; // 从面板内部顶部开始
        const lineHeight = 32;
        const panelBottom = panelY + panelHeight / 2 - 30; // 预留底部空间

        for (const text of texts) {
            if (text === '') {
                yOffset += 18;
                continue;
            }

            // 如果超出面板底部，跳过剩余文字
            if (yOffset > panelBottom) {
                break;
            }

            const txt = this.add.text(centerX, yOffset, text, {
                fontSize: '20px',
                color: '#FFFFFF',
                align: 'center',
                fontFamily: STYLE.FONT.FAMILY,
                resolution: UI_RESOLUTION,
            }).setOrigin(0.5);

            this.uiContainer?.add(txt);

            txt.setAlpha(0);

            this.tweens.add({
                targets: txt,
                alpha: 1,
                duration: 600,
                delay: (yOffset - panelTop) * 2,
            });

            yOffset += lineHeight;
        }

        // 文化小知识提示 - 固定在卷轴面板下方
        this.createCulturalNotes(centerX, panelY + panelHeight / 2 + 50, storyData.culturalNotes);
    }

    private createCulturalNotes(x: number, y: number, notes: { item: string; meaning: string }[]): void {
        const container = this.add.container(x, y);

        // 标题
        const title = this.add.text(0, 0, '📚 文化小知识', {
            fontSize: '16px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        container.add(title);

        // 显示第一条文化注释
        if (notes.length > 0) {
            const note = notes[0];
            const noteText = this.add.text(0, 28, `${note.item}：${note.meaning}`, {
                fontSize: '14px',
                color: '#AAAAAA',
                align: 'center',
                fontFamily: STYLE.FONT.FAMILY,
                resolution: UI_RESOLUTION,
            }).setOrigin(0.5);

            container.add(noteText);
        }

        container.setAlpha(0);
        this.tweens.add({
            targets: container,
            alpha: 1,
            duration: 800,
            delay: 1500,
        });

        this.uiContainer?.add(container);
    }

    private createContinueHint(): void {
        const hint = this.add.text(this.scale.width / 2, this.scale.height - 80, '点击或按空格键继续', {
            fontSize: '18px',
            color: '#FFD700',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        this.uiContainer?.add(hint);

        this.tweens.add({
            targets: hint,
            alpha: 0.4,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    private startGame(): void {
        if (this.level === 3) {
            this.scene.start('BossScene', { level: this.level });
        } else {
            this.scene.start('GameScene', { level: this.level });
        }
    }
}
