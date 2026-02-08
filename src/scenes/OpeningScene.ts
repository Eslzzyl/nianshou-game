import { Scene } from 'phaser';
import { ParticleManager } from '../managers/ParticleManager.js';
import { OPENING_STORY } from '../data/NarrativeData.js';
import { UIComponents } from '../ui/UIComponents.js';
import { STYLE, UI_RESOLUTION } from '../utils/constants.js';

export class OpeningScene extends Scene {
    private currentPage = 0;
    private uiContainer?: Phaser.GameObjects.Container;
    private storyTexts: Phaser.GameObjects.Text[] = [];
    private pageIndicators: Phaser.GameObjects.Container[] = [];
    private isAnimating = false;

    constructor() {
        super({ key: 'OpeningScene' });
    }

    create(): void {
        ParticleManager.getInstance().init(this);

        this.scale.off('resize', this.onResize, this);
        this.scale.on('resize', this.onResize, this);

        this.buildLayout();

        // 输入控制
        this.input.keyboard?.on('keydown-SPACE', () => this.nextPage());
        this.input.keyboard?.on('keydown-ENTER', () => this.nextPage());
        this.input.keyboard?.on('keydown-RIGHT', () => this.nextPage());
        this.input.keyboard?.on('keydown-LEFT', () => this.prevPage());
        this.input.on('pointerdown', () => this.nextPage());
    }

    update(_time: number, delta: number): void {
        ParticleManager.getInstance().update(delta);
    }

    private buildLayout(): void {
        this.uiContainer?.destroy(true);
        this.uiContainer = this.add.container(0, 0);
        this.storyTexts = [];
        this.pageIndicators = [];

        this.createBackground();
        this.createTitle();
        this.createStoryPanel();
        this.createPageIndicators();
        this.createNavigationHint();
        this.showPage(0);
    }

    private onResize(): void {
        this.buildLayout();
    }

    private createBackground(): void {
        // 渐变背景 - 深色神秘感
        const bg = this.add.graphics();
        for (let y = 0; y < this.scale.height; y++) {
            const ratio = y / this.scale.height;
            const r = Math.floor(20 + ratio * 25);
            const g = Math.floor(10 + ratio * 15);
            const b = Math.floor(15 + ratio * 25);
            bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
            bg.fillRect(0, y, this.scale.width, 1);
        }

        this.uiContainer?.add(bg);

        // 装饰粒子
        this.createAmbientParticles();
    }

    private createAmbientParticles(): void {
        // 添加漂浮的光点
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * this.scale.width;
            const y = Math.random() * this.scale.height;
            const size = 2 + Math.random() * 3;
            
            const particle = this.add.circle(x, y, size, 0xFFD700, 0.3 + Math.random() * 0.4);
            
            this.tweens.add({
                targets: particle,
                alpha: { from: 0.2, to: 0.6 },
                scale: { from: 0.8, to: 1.2 },
                duration: 1500 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });

            this.tweens.add({
                targets: particle,
                y: y - 50 - Math.random() * 50,
                duration: 8000 + Math.random() * 4000,
                repeat: -1,
                ease: 'Linear',
            });

            this.uiContainer?.add(particle);
        }
    }

    private createTitle(): void {
        const centerX = this.scale.width / 2;
        
        // 主标题
        const title = this.add.text(centerX, 80, OPENING_STORY.title, {
            fontSize: '56px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
        title.setStroke('#8B0000', 5);

        // 发光效果
        const glow = this.add.text(centerX, 80, OPENING_STORY.title, {
            fontSize: '56px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
        glow.setStroke('#FFD700', 10);
        glow.setAlpha(0.2);

        this.uiContainer?.add([glow, title]);

        // 标题脉冲动画
        this.tweens.add({
            targets: [glow, title],
            scale: 1.02,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    private createStoryPanel(): void {
        const centerX = this.scale.width / 2;
        const panelY = this.scale.height / 2;

        // 卷轴面板
        const panel = UIComponents.createScrollPanel(this, centerX, panelY, 720, 380);
        this.uiContainer?.add(panel);

        // 创建每页的文本（初始隐藏）
        OPENING_STORY.pages.forEach((page) => {
            const pageContainer = this.add.container(centerX, panelY);
            
            // 图标
            const icon = this.add.text(0, -80, page.icon, {
                fontSize: '72px',
                resolution: UI_RESOLUTION,
            }).setOrigin(0.5);

            // 文字
            const textLines = page.text.split('\n');
            const textContainer = this.add.container(0, 20);
            
            textLines.forEach((line, lineIndex) => {
                if (line === '') {
                    return;
                }
                const lineText = this.add.text(0, lineIndex * 40, line, {
                    fontSize: '26px',
                    color: '#FFFFFF',
                    align: 'center',
                    fontFamily: STYLE.FONT.FAMILY,
                    resolution: UI_RESOLUTION,
                }).setOrigin(0.5);
                textContainer.add(lineText);
            });

            pageContainer.add([icon, textContainer]);
            pageContainer.setVisible(false);
            pageContainer.setAlpha(0);
            
            this.uiContainer?.add(pageContainer);
            this.storyTexts.push(pageContainer as unknown as Phaser.GameObjects.Text);
        });
    }

    private createPageIndicators(): void {
        const centerX = this.scale.width / 2;
        const startY = this.scale.height / 2 + 180;
        const totalPages = OPENING_STORY.pages.length;
        const spacing = 40;
        const totalWidth = (totalPages - 1) * spacing;
        const startX = centerX - totalWidth / 2;

        for (let i = 0; i < totalPages; i++) {
            const indicator = this.add.container(startX + i * spacing, startY);
            
            const circle = this.add.circle(0, 0, 8, 0x666666);
            indicator.add(circle);
            
            this.uiContainer?.add(indicator);
            this.pageIndicators.push(indicator);
        }
    }

    private createNavigationHint(): void {
        const hint = this.add.text(this.scale.width / 2, this.scale.height - 60, '点击或按空格键继续 →', {
            fontSize: '18px',
            color: '#AAAAAA',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        this.uiContainer?.add(hint);

        this.tweens.add({
            targets: hint,
            alpha: 0.4,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    private showPage(pageIndex: number): void {
        if (pageIndex < 0 || pageIndex >= OPENING_STORY.pages.length) return;

        this.isAnimating = true;

        // 隐藏所有页面
        this.storyTexts.forEach((text) => {
            text.setVisible(false);
            text.setAlpha(0);
        });

        // 更新页码指示器
        this.pageIndicators.forEach((indicator, index) => {
            const circle = indicator.getAt(0) as Phaser.GameObjects.Arc;
            if (index === pageIndex) {
                circle.setFillStyle(0xFFD700);
                this.tweens.add({
                    targets: indicator,
                    scale: 1.3,
                    duration: 200,
                    ease: 'Back.easeOut',
                });
            } else {
                circle.setFillStyle(0x666666);
                this.tweens.add({
                    targets: indicator,
                    scale: 1,
                    duration: 200,
                    ease: 'Back.easeOut',
                });
            }
        });

        // 显示当前页面并播放打字机动画
        const currentPage = this.storyTexts[pageIndex];
        currentPage.setVisible(true);

        // 淡入动画
        this.tweens.add({
            targets: currentPage,
            alpha: 1,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.isAnimating = false;
            },
        });

        this.currentPage = pageIndex;
    }

    private nextPage(): void {
        if (this.isAnimating) return;

        if (this.currentPage < OPENING_STORY.pages.length - 1) {
            // 翻到下一页
            this.tweens.add({
                targets: this.storyTexts[this.currentPage],
                alpha: 0,
                x: this.scale.width / 2 - 100,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    this.showPage(this.currentPage + 1);
                    this.storyTexts[this.currentPage].setX(this.scale.width / 2 + 100);
                    this.tweens.add({
                        targets: this.storyTexts[this.currentPage],
                        x: this.scale.width / 2,
                        duration: 300,
                        ease: 'Power2',
                    });
                },
            });
        } else {
            // 最后一页，进入菜单
            this.gotoMenu();
        }
    }

    private prevPage(): void {
        if (this.isAnimating || this.currentPage <= 0) return;
        
        this.tweens.add({
            targets: this.storyTexts[this.currentPage],
            alpha: 0,
            x: this.scale.width / 2 + 100,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.showPage(this.currentPage - 1);
                this.storyTexts[this.currentPage].setX(this.scale.width / 2 - 100);
                this.tweens.add({
                    targets: this.storyTexts[this.currentPage],
                    x: this.scale.width / 2,
                    duration: 300,
                    ease: 'Power2',
                });
            },
        });
    }

    private gotoMenu(): void {
        // 保存已看过开场故事的标记
        localStorage.setItem('nianshou_story_seen', 'true');
        
        // 淡出效果
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MenuScene');
        });
    }
}
