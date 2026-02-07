import { Scene } from 'phaser';
import { AudioManager } from '../managers/AudioManager.js';
import { ParticleManager } from '../managers/ParticleManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { UIComponents } from '../ui/UIComponents.js';
import { COLORS, STYLE, UI_RESOLUTION } from '../utils/constants.js';
import { isMobile } from '../utils/helpers.js';

export class MenuScene extends Scene {
    private uiContainer?: Phaser.GameObjects.Container;
    private modalContainer?: Phaser.GameObjects.Container;
    private activeModal: 'level' | 'achievements' | 'settings' | 'guide' | null = null;

    private fpsText?: Phaser.GameObjects.Text;
    private versionText?: Phaser.GameObjects.Text;
    private highScoreText?: Phaser.GameObjects.Text;
    private mobileNotice?: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'MenuScene' });
    }

    create(): void {
        AudioManager.getInstance().init(this);
        AudioManager.getInstance().playMusic();

        ParticleManager.getInstance().init(this);

        this.scale.off('resize', this.onResize, this);
        this.scale.on('resize', this.onResize, this);

        this.buildLayout();
    }

    private buildLayout(): void {
        this.uiContainer?.destroy(true);
        this.uiContainer = this.add.container(0, 0);

        this.createBackground();
        this.createTitle();
        this.createButtons();
        this.createVersion();
        this.createDecorations();
        this.createFPS();

        if (isMobile()) {
            this.createMobileNotice();
        }

        this.rebuildModal();
    }

    private onResize(): void {
        this.buildLayout();
    }

    private createFPS(): void {
        this.fpsText = this.add.text(this.scale.width - 10, this.scale.height - 10, '', {
            fontSize: '12px',
            color: '#00FF00',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(1, 1);

        this.uiContainer?.add(this.fpsText);
    }

    update(_time: number, delta: number): void {
        ParticleManager.getInstance().update(delta);
        if (this.fpsText) {
            const fps = Math.round(this.game.loop.actualFps);
            this.fpsText.setText(`${fps} FPS`);
        }
    }

    private createBackground(): void {
        // 渐变背景
        const bg = this.add.graphics();
        const width = this.scale.width;
        const height = this.scale.height;

        for (let y = 0; y < height; y++) {
            const ratio = y / height;
            const r = Math.floor(26 + ratio * 30);
            const g = Math.floor(10 + ratio * 15);
            const b = Math.floor(10 + ratio * 10);
            bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
            bg.fillRect(0, y, width, 1);
        }

        this.uiContainer?.add(bg);

        // 添加背景图片（如果存在）
        if (this.textures.exists('bg_village')) {
            const bgImage = this.add.image(width / 2, height / 2, 'bg_village');
            bgImage.setDisplaySize(width, height);
            bgImage.setAlpha(0.3);
            this.uiContainer?.add(bgImage);
        }
    }

    private createTitle(): void {
        const centerX = this.scale.width / 2;
        const titleY = 140;

        // 发光层
        const glow = this.add.text(centerX, titleY, '年兽送福', {
            fontSize: '84px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
        glow.setStroke('#FFD700', 12);
        glow.setAlpha(0.25);

        // 主标题
        const title = this.add.text(centerX, titleY, '年兽送福', {
            fontSize: '84px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
        title.setStroke('#8B0000', 6);

        // 副标题
        const subtitle = this.add.text(centerX, 220, '🧧 帮助年兽躲避爆竹，收集福气！ 🧧', {
            fontSize: '22px',
            color: '#FFFFFF',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        this.uiContainer?.add([glow, title, subtitle]);
    }

    private createButtons(): void {
        const centerX = this.scale.width / 2;
        const startY = 290;
        const spacing = 72;

        // 开始游戏
        const startBtn = UIComponents.createModernButton(this, centerX, startY, '🎮 开始游戏', () => {
            AudioManager.getInstance().play('collect_fu');
            this.scene.start('StoryScene', { level: 1 });
        });

        // 选择关卡
        const levelBtn = UIComponents.createModernButton(this, centerX, startY + spacing, '📜 选择关卡', () => {
            AudioManager.getInstance().play('collect_fu');
            this.showLevelSelect();
        });

        // 成就
        const achievementsBtn = UIComponents.createModernButton(this, centerX, startY + spacing * 2, '🏆 成就', () => {
            AudioManager.getInstance().play('collect_fu');
            this.showAchievements();
        });

        // 设置
        const settingsBtn = UIComponents.createModernButton(this, centerX, startY + spacing * 3, '⚙️ 设置', () => {
            AudioManager.getInstance().play('collect_fu');
            this.showSettings();
        });

        // 游戏指南
        const guideBtn = UIComponents.createModernButton(this, centerX, startY + spacing * 4, '📖 游戏指南', () => {
            AudioManager.getInstance().play('collect_fu');
            this.showGuide();
        });

        this.uiContainer?.add([startBtn, levelBtn, achievementsBtn, settingsBtn, guideBtn]);
    }

    private createDecorations(): void {
        // 左侧灯笼
        const leftTop = this.createLantern(80, 100);
        const leftBottom = this.createLantern(80, 250);

        // 右侧灯笼
        const rightTop = this.createLantern(this.scale.width - 80, 100);
        const rightBottom = this.createLantern(this.scale.width - 80, 250);

        // 底部装饰
        const bottomDecor = this.add.graphics();
        bottomDecor.fillStyle(COLORS.GOLD_PRIMARY, 0.3);
        bottomDecor.fillRect(0, this.scale.height - 60, this.scale.width, 60);

        this.uiContainer?.add([leftTop, leftBottom, rightTop, rightBottom, bottomDecor]);

        // 祥云图案（简化版）
        for (let x = 0; x < this.scale.width; x += 200) {
            const cloud = this.createCloud(x + 100, this.scale.height - 40);
            this.uiContainer?.add(cloud);
        }
    }

    private createLantern(x: number, y: number): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        // 灯笼主体
        const lantern = this.add.graphics();

        // 外圈红色主体
        lantern.fillStyle(COLORS.RED_PRIMARY, 1);
        lantern.fillEllipse(0, 20, 60, 50);

        // 内部发光效果 - 红色亮部
        lantern.fillStyle(COLORS.RED_LIGHT, 0.6);
        lantern.fillEllipse(0, 20, 45, 38);

        // 中心金色亮光
        lantern.fillStyle(COLORS.GOLD_PRIMARY, 0.4);
        lantern.fillEllipse(0, 20, 28, 24);

        // 顶部悬挂杆
        lantern.fillStyle(COLORS.GOLD_DARK, 1);
        lantern.fillRect(-4, -12, 8, 15);

        // 顶部圆形装饰
        lantern.fillStyle(COLORS.GOLD_PRIMARY, 1);
        lantern.fillCircle(0, -8, 6);

        // 底部流苏 - 多根线条
        lantern.fillStyle(COLORS.GOLD_PRIMARY, 1);
        for (let i = -1; i <= 1; i++) {
            const length = 15 + Math.abs(i) * 3;
            lantern.fillRect(i * 5 - 1.5, 48, 3, length);
        }

        // 中心装饰图案 - 金色圆环
        lantern.fillStyle(COLORS.GOLD_PRIMARY, 1);
        lantern.fillCircle(0, 20, 12);
        lantern.fillStyle(COLORS.RED_PRIMARY, 1);
        lantern.fillCircle(0, 20, 8);

        container.add(lantern);

        // 摇摆动画
        this.tweens.add({
            targets: container,
            angle: { from: -5, to: 5 },
            duration: 2000 + Math.random() * 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        return container;
    }

    private createCloud(x: number, y: number): Phaser.GameObjects.Graphics {
        const cloud = this.add.graphics();
        cloud.fillStyle(COLORS.GOLD_PRIMARY, 0.4);
        cloud.fillCircle(x, y, 25);
        cloud.fillCircle(x - 20, y + 5, 20);
        cloud.fillCircle(x + 20, y + 5, 20);

        return cloud;
    }

    private createVersion(): void {
        const y = this.scale.height - 25;

        this.versionText = this.add.text(20, y, 'v1.0.0', {
            fontSize: '14px',
            color: '#888888',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        });

        const highScore = SaveManager.getInstance().getHighScore();
        this.highScoreText = this.add.text(this.scale.width - 20, y, `🏆 最高分: ${highScore}`, {
            fontSize: '14px',
            color: '#FFD700',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(1, 0);

        this.uiContainer?.add([this.versionText, this.highScoreText]);
    }

    private createMobileNotice(): void {
        this.mobileNotice = this.add.text(this.scale.width / 2, this.scale.height - 90, '📱 检测到移动设备，请横屏游玩', {
            fontSize: '16px',
            color: '#FFD700',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: this.mobileNotice,
            alpha: 0.6,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.uiContainer?.add(this.mobileNotice);
    }

    private showLevelSelect(): void {
        this.openModal('level');
    }

    private showAchievements(): void {
        this.openModal('achievements');
    }

    private showSettings(): void {
        this.openModal('settings');
    }

    private showGuide(): void {
        this.openModal('guide');
    }

    private openModal(type: 'level' | 'achievements' | 'settings' | 'guide'): void {
        this.modalContainer?.destroy(true);
        this.activeModal = type;

        switch (type) {
            case 'level':
                this.modalContainer = this.buildLevelSelectModal();
                break;
            case 'achievements':
                this.modalContainer = this.buildAchievementsModal();
                break;
            case 'settings':
                this.modalContainer = this.buildSettingsModal();
                break;
            case 'guide':
                this.modalContainer = this.buildGuideModal();
                break;
        }
    }

    private closeModal(): void {
        this.modalContainer?.destroy(true);
        this.modalContainer = undefined;
        this.activeModal = null;
    }

    private rebuildModal(): void {
        if (!this.activeModal) return;
        const type = this.activeModal;
        this.modalContainer?.destroy(true);
        this.activeModal = null;
        this.openModal(type);
    }

    private buildLevelSelectModal(): Phaser.GameObjects.Container {
        const menuContainer = this.add.container(0, 0);
        const overlay = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.85
        );
        overlay.setInteractive();

        // 使用卷轴面板
        const panel = UIComponents.createScrollPanel(this, this.scale.width / 2, this.scale.height / 2, 520, 450);

        // 标题
        const title = this.add.text(this.scale.width / 2, this.scale.height / 2 - 180, '📜 选择关卡', {
            fontSize: '36px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        menuContainer.add([overlay, panel, title]);

        // 关卡按钮
        const levels = [
            { level: 1, name: '🏘️ 第一关：乡村街道', y: -70 },
            { level: 2, name: '🌃 第二关：城市夜景', y: 10 },
            { level: 3, name: '🏯 第三关：最终冲刺', y: 90 },
        ];

        for (const lvl of levels) {
            const saveManager = SaveManager.getInstance();
            const unlocked = saveManager.isLevelUnlocked(lvl.level);

            const btn = UIComponents.createModernButton(
                this,
                this.scale.width / 2,
                this.scale.height / 2 + lvl.y,
                unlocked ? lvl.name : '🔒 锁定',
                () => {
                    this.closeModal();
                    this.scene.start('StoryScene', { level: lvl.level });
                },
                { width: 380, height: 55, disabled: !unlocked }
            );
            menuContainer.add(btn);
        }

        // 关闭按钮
        const closeBtn = this.add.text(this.scale.width / 2 + 230, this.scale.height / 2 - 200, '✕', {
            fontSize: '32px',
            color: '#FFFFFF',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerover', () => closeBtn.setColor('#FFD700'));
        closeBtn.on('pointerout', () => closeBtn.setColor('#FFFFFF'));
        closeBtn.on('pointerdown', () => {
            this.closeModal();
        });

        overlay.on('pointerdown', () => {
            this.closeModal();
        });

        menuContainer.add(closeBtn);

        return menuContainer;
    }

    private buildAchievementsModal(): Phaser.GameObjects.Container {
        const menuContainer = this.add.container(0, 0);

        const overlay = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.85
        );
        overlay.setInteractive();

        // 使用卷轴面板
        const panel = UIComponents.createScrollPanel(this, this.scale.width / 2, this.scale.height / 2, 620, 550);

        // 标题
        const title = this.add.text(this.scale.width / 2, this.scale.height / 2 - 230, '🏆 成就', {
            fontSize: '36px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        menuContainer.add([overlay, panel, title]);

        // 成就列表
        const achievements = SaveManager.getInstance().getAllAchievements();
        let yOffset = -170;

        // 限制显示的成就数量或添加滚动逻辑（这里先简单剪裁，防止溢出）
        const maxDisplay = 6;
        achievements.slice(0, maxDisplay).forEach((ach) => {
            const color = ach.unlocked ? '#FFD700' : '#888888';
            const icon = ach.unlocked ? '✓' : '○';
            const bgAlpha = ach.unlocked ? 0.2 : 0.05;

            // 背景条
            const rowBg = this.add.graphics();
            rowBg.fillStyle(ach.unlocked ? COLORS.GOLD_PRIMARY : 0x666666, bgAlpha);
            rowBg.fillRoundedRect(-280, yOffset - 5, 560, 55, 8);
            rowBg.setPosition(this.scale.width / 2, this.scale.height / 2);

            // 图标和名称
            const nameText = this.add.text(this.scale.width / 2 - 260, this.scale.height / 2 + yOffset, `${icon} ${ach.name}`, {
                fontSize: '18px',
                color: color,
                fontFamily: STYLE.FONT.FAMILY,
                resolution: UI_RESOLUTION,
            });

            // 描述
            const descText = this.add.text(this.scale.width / 2 - 260, this.scale.height / 2 + yOffset + 22, `   ${ach.desc}`, {
                fontSize: '13px',
                color: ach.unlocked ? '#AAAAAA' : '#666666',
                fontFamily: STYLE.FONT.FAMILY,
                resolution: UI_RESOLUTION,
            });

            menuContainer.add([rowBg, nameText, descText]);
            yOffset += 62;
        });

        // 关闭按钮
        const closeBtn = this.add.text(this.scale.width / 2 + 280, this.scale.height / 2 - 250, '✕', {
            fontSize: '32px',
            color: '#FFFFFF',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerover', () => closeBtn.setColor('#FFD700'));
        closeBtn.on('pointerout', () => closeBtn.setColor('#FFFFFF'));
        closeBtn.on('pointerdown', () => {
            this.closeModal();
        });

        overlay.on('pointerdown', () => {
            this.closeModal();
        });

        menuContainer.add(closeBtn);

        return menuContainer;
    }

    private buildSettingsModal(): Phaser.GameObjects.Container {
        const menuContainer = this.add.container(0, 0);

        const overlay = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.85
        );
        overlay.setInteractive();

        // 使用卷轴面板
        const panel = UIComponents.createScrollPanel(this, this.scale.width / 2, this.scale.height / 2, 420, 350);

        // 标题
        const title = this.add.text(this.scale.width / 2, this.scale.height / 2 - 130, '⚙️ 设置', {
            fontSize: '36px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        menuContainer.add([overlay, panel, title]);

        const audioManager = AudioManager.getInstance();

        // 音效开关
        const audioLabel = this.add.text(this.scale.width / 2 - 80, this.scale.height / 2 - 40, '🔊 音效:', {
            fontSize: '22px',
            color: '#FFFFFF',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        });

        const muteBtn = this.add.text(this.scale.width / 2 + 40, this.scale.height / 2 - 40, audioManager.isMuted() ? '关闭' : '开启', {
            fontSize: '22px',
            color: audioManager.isMuted() ? '#888888' : '#00FF00',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setInteractive({ useHandCursor: true });

        muteBtn.on('pointerover', () => muteBtn.setScale(1.1));
        muteBtn.on('pointerout', () => muteBtn.setScale(1));
        muteBtn.on('pointerdown', () => {
            audioManager.setMuted(!audioManager.isMuted());
            muteBtn.text = audioManager.isMuted() ? '关闭' : '开启';
            muteBtn.setColor(audioManager.isMuted() ? '#888888' : '#00FF00');
        });

        menuContainer.add([audioLabel, muteBtn]);

        // 关闭按钮
        const closeBtn = this.add.text(this.scale.width / 2 + 180, this.scale.height / 2 - 150, '✕', {
            fontSize: '32px',
            color: '#FFFFFF',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerover', () => closeBtn.setColor('#FFD700'));
        closeBtn.on('pointerout', () => closeBtn.setColor('#FFFFFF'));
        closeBtn.on('pointerdown', () => {
            this.closeModal();
        });

        overlay.on('pointerdown', () => {
            this.closeModal();
        });

        menuContainer.add(closeBtn);

        return menuContainer;
    }

    private buildGuideModal(): Phaser.GameObjects.Container {
        const menuContainer = this.add.container(0, 0);

        const overlay = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.85
        );
        overlay.setInteractive();

        // 使用卷轴面板
        const panel = UIComponents.createScrollPanel(this, this.scale.width / 2, this.scale.height / 2, 640, 560);

        // 标题
        const title = this.add.text(this.scale.width / 2, this.scale.height / 2 - 240, '📖 游戏指南', {
            fontSize: '36px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        // 内容区域起始位置
        const contentX = this.scale.width / 2 - 300;
        const contentY = this.scale.height / 2 - 200;

        const contentElements: Phaser.GameObjects.GameObject[] = [];

        // ========== 物品图鉴 ==========
        const itemsTitle = this.add.text(contentX, contentY, '🎁 可收集物品', {
            fontSize: '20px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        });
        contentElements.push(itemsTitle);

        // 福字物品
        const fuItems = [
            { icon: '🟫', name: '铜福', desc: '+10分', color: '#CD7F32' },
            { icon: '⬜', name: '银福', desc: '+25分', color: '#C0C0C0' },
            { icon: '🟨', name: '金福', desc: '+50分', color: '#FFD700' },
        ];

        let rowY = contentY + 35;
        fuItems.forEach((item) => {
            const icon = this.add.text(contentX + 10, rowY, item.icon, {
                fontSize: '18px',
                resolution: UI_RESOLUTION,
            });
            const name = this.add.text(contentX + 40, rowY, item.name, {
                fontSize: '16px',
                color: item.color,
                fontFamily: STYLE.FONT.FAMILY,
                resolution: UI_RESOLUTION,
            });
            const desc = this.add.text(contentX + 100, rowY, item.desc, {
                fontSize: '14px',
                color: '#AAAAAA',
                fontFamily: STYLE.FONT.FAMILY,
                resolution: UI_RESOLUTION,
            });
            contentElements.push(icon, name, desc);
            rowY += 28;
        });

        // 红包
        rowY += 5;
        const packetIcon = this.add.text(contentX + 10, rowY, '🧧', {
            fontSize: '18px',
            resolution: UI_RESOLUTION,
        });
        const packetName = this.add.text(contentX + 40, rowY, '红包', {
            fontSize: '16px',
            color: '#FF4444',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        });
        const packetDesc = this.add.text(contentX + 100, rowY, '收集5个可激活无敌护盾（3秒）', {
            fontSize: '14px',
            color: '#AAAAAA',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        });
        contentElements.push(packetIcon, packetName, packetDesc);

        // 春字
        rowY += 28;
        const springIcon = this.add.text(contentX + 10, rowY, '🌸', {
            fontSize: '18px',
            resolution: UI_RESOLUTION,
        });
        const springName = this.add.text(contentX + 40, rowY, '春字', {
            fontSize: '16px',
            color: '#00FF00',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        });
        const springDesc = this.add.text(contentX + 100, rowY, '激活飞行模式5秒，可自由移动', {
            fontSize: '14px',
            color: '#AAAAAA',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        });
        contentElements.push(springIcon, springName, springDesc);

        // ========== 障碍物图鉴 ==========
        rowY += 45;
        const obstacleTitle = this.add.text(contentX, rowY, '⚠️ 障碍物（接触会受伤）', {
            fontSize: '20px',
            color: '#FF4444',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        });
        contentElements.push(obstacleTitle);

        rowY += 35;
        const firecrackerIcon = this.add.text(contentX + 10, rowY, '🧨', {
            fontSize: '18px',
            resolution: UI_RESOLUTION,
        });
        const firecrackerName = this.add.text(contentX + 40, rowY, '爆竹', {
            fontSize: '16px',
            color: '#FF4444',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        });
        const firecrackerDesc = this.add.text(contentX + 100, rowY, '地面/空中，静止或弹跳', {
            fontSize: '14px',
            color: '#AAAAAA',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        });
        contentElements.push(firecrackerIcon, firecrackerName, firecrackerDesc);

        rowY += 28;
        const lanternIcon = this.add.text(contentX + 10, rowY, '🏮', {
            fontSize: '18px',
            resolution: UI_RESOLUTION,
        });
        const lanternName = this.add.text(contentX + 40, rowY, '灯笼', {
            fontSize: '16px',
            color: '#FF4444',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        });
        const lanternDesc = this.add.text(contentX + 100, rowY, '悬挂摆动，不同高度', {
            fontSize: '14px',
            color: '#AAAAAA',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        });
        contentElements.push(lanternIcon, lanternName, lanternDesc);

        // ========== 操作说明 ==========
        rowY += 45;
        const controlTitle = this.add.text(contentX, rowY, '🎮 操作说明', {
            fontSize: '20px',
            color: '#00AAFF',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        });
        contentElements.push(controlTitle);

        const controls = [
            { key: '空格 / W / ↑', action: '跳跃（空中可二段跳）' },
            { key: 'S / ↓', action: '下蹲（降低高度）' },
            { key: 'A / ←  D / →', action: '左右移动' },
            { key: 'E / 点击按钮', action: '激活护盾（需5个红包）' },
        ];

        rowY += 35;
        controls.forEach((ctrl) => {
            const keyText = this.add.text(contentX + 10, rowY, ctrl.key, {
                fontSize: '14px',
                color: '#FFD700',
                fontFamily: STYLE.FONT.FAMILY,
                resolution: UI_RESOLUTION,
            });
            const actionText = this.add.text(contentX + 180, rowY, ctrl.action, {
                fontSize: '14px',
                color: '#AAAAAA',
                fontFamily: STYLE.FONT.FAMILY,
                resolution: UI_RESOLUTION,
            });
            contentElements.push(keyText, actionText);
            rowY += 26;
        });

        // 关闭按钮
        const closeBtn = this.add.text(this.scale.width / 2 + 300, this.scale.height / 2 - 250, '✕', {
            fontSize: '32px',
            color: '#FFFFFF',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerover', () => closeBtn.setColor('#FFD700'));
        closeBtn.on('pointerout', () => closeBtn.setColor('#FFFFFF'));
        closeBtn.on('pointerdown', () => {
            this.closeModal();
        });

        overlay.on('pointerdown', () => {
            this.closeModal();
        });

        menuContainer.add([overlay, panel, title, closeBtn, ...contentElements]);

        return menuContainer;
    }
}
