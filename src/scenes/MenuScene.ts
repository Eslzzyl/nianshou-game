import { Scene } from 'phaser';
import { AudioManager } from '../managers/AudioManager.js';
import { ParticleManager } from '../managers/ParticleManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { UIComponents } from '../ui/UIComponents.js';
import { COLORS, STYLE } from '../utils/constants.js';
import { isMobile } from '../utils/helpers.js';

export class MenuScene extends Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create(): void {
        AudioManager.getInstance().init(this);
        AudioManager.getInstance().playMusic();

        ParticleManager.getInstance().init(this);

        this.createBackground();
        this.createTitle();
        this.createButtons();
        this.createVersion();
        this.createDecorations();
        this.createFPS();

        if (isMobile()) {
            this.createMobileNotice();
        }
    }

    private fpsText?: Phaser.GameObjects.Text;

    private createFPS(): void {
        this.fpsText = this.add.text(this.scale.width - 10, this.scale.height - 10, '', {
            fontSize: '12px',
            color: '#00FF00',
            fontFamily: STYLE.FONT.FAMILY,
        }).setOrigin(1, 1);
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

        // 添加背景图片（如果存在）
        if (this.textures.exists('bg_village')) {
            const bgImage = this.add.image(width / 2, height / 2, 'bg_village');
            bgImage.setDisplaySize(width, height);
            bgImage.setAlpha(0.3);
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
        }).setOrigin(0.5);
        glow.setStroke('#FFD700', 12);
        glow.setAlpha(0.25);

        // 主标题
        const title = this.add.text(centerX, titleY, '年兽送福', {
            fontSize: '84px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
        }).setOrigin(0.5);
        title.setStroke('#8B0000', 6);

        // 副标题
        this.add.text(centerX, 220, '🧧 帮助年兽躲避爆竹，收集福气！ 🧧', {
            fontSize: '22px',
            color: '#FFFFFF',
            fontFamily: STYLE.FONT.FAMILY,
        }).setOrigin(0.5);
    }

    private createButtons(): void {
        const centerX = this.scale.width / 2;
        const startY = 320;
        const spacing = 85;

        // 开始游戏
        UIComponents.createModernButton(this, centerX, startY, '🎮 开始游戏', () => {
            AudioManager.getInstance().play('collect_fu');
            this.scene.start('StoryScene', { level: 1 });
        });

        // 选择关卡
        UIComponents.createModernButton(this, centerX, startY + spacing, '📜 选择关卡', () => {
            AudioManager.getInstance().play('collect_fu');
            this.showLevelSelect();
        });

        // 成就
        UIComponents.createModernButton(this, centerX, startY + spacing * 2, '🏆 成就', () => {
            AudioManager.getInstance().play('collect_fu');
            this.showAchievements();
        });

        // 设置
        UIComponents.createModernButton(this, centerX, startY + spacing * 3, '⚙️ 设置', () => {
            AudioManager.getInstance().play('collect_fu');
            this.showSettings();
        });
    }

    private createDecorations(): void {
        // 左侧灯笼
        this.createLantern(80, 100);
        this.createLantern(80, 250);

        // 右侧灯笼
        this.createLantern(this.scale.width - 80, 100);
        this.createLantern(this.scale.width - 80, 250);

        // 底部装饰
        const bottomDecor = this.add.graphics();
        bottomDecor.fillStyle(COLORS.GOLD_PRIMARY, 0.3);
        bottomDecor.fillRect(0, this.scale.height - 60, this.scale.width, 60);

        // 祥云图案（简化版）
        for (let x = 0; x < this.scale.width; x += 200) {
            this.createCloud(x + 100, this.scale.height - 40);
        }
    }

    private createLantern(x: number, y: number): void {
        const container = this.add.container(x, y);

        // 灯笼主体
        const lantern = this.add.graphics();
        lantern.fillStyle(COLORS.RED_PRIMARY, 1);
        lantern.fillEllipse(0, 20, 50, 60);
        lantern.fillStyle(COLORS.GOLD_PRIMARY, 1);
        lantern.fillEllipse(0, 20, 35, 45);
        lantern.fillStyle(COLORS.RED_PRIMARY, 1);
        lantern.fillEllipse(0, 20, 20, 30);

        // 顶部
        lantern.fillStyle(COLORS.GOLD_DARK, 1);
        lantern.fillRect(-8, -15, 16, 15);

        // 流苏
        lantern.fillStyle(COLORS.GOLD_PRIMARY, 1);
        lantern.fillRect(-2, 50, 4, 20);

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
    }

    private createCloud(x: number, y: number): void {
        const cloud = this.add.graphics();
        cloud.fillStyle(COLORS.GOLD_PRIMARY, 0.4);
        cloud.fillCircle(x, y, 25);
        cloud.fillCircle(x - 20, y + 5, 20);
        cloud.fillCircle(x + 20, y + 5, 20);
    }

    private createVersion(): void {
        const y = this.scale.height - 25;

        this.add.text(20, y, 'v1.0.0', {
            fontSize: '14px',
            color: '#888888',
            fontFamily: STYLE.FONT.FAMILY,
        });

        const highScore = SaveManager.getInstance().getHighScore();
        this.add.text(this.scale.width - 20, y, `🏆 最高分: ${highScore}`, {
            fontSize: '14px',
            color: '#FFD700',
            fontFamily: STYLE.FONT.FAMILY,
        }).setOrigin(1, 0);
    }

    private createMobileNotice(): void {
        const notice = this.add.text(this.scale.width / 2, this.scale.height - 90, '📱 检测到移动设备，请横屏游玩', {
            fontSize: '16px',
            color: '#FFD700',
            fontFamily: STYLE.FONT.FAMILY,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: notice,
            alpha: 0.6,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    private showLevelSelect(): void {
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
                    menuContainer.destroy();
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
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerover', () => closeBtn.setColor('#FFD700'));
        closeBtn.on('pointerout', () => closeBtn.setColor('#FFFFFF'));
        closeBtn.on('pointerdown', () => {
            menuContainer.destroy();
        });

        overlay.on('pointerdown', () => {
            menuContainer.destroy();
        });

        menuContainer.add(closeBtn);
    }

    private showAchievements(): void {
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
            });

            // 描述
            const descText = this.add.text(this.scale.width / 2 - 260, this.scale.height / 2 + yOffset + 22, `   ${ach.desc}`, {
                fontSize: '13px',
                color: ach.unlocked ? '#AAAAAA' : '#666666',
                fontFamily: STYLE.FONT.FAMILY,
            });

            menuContainer.add([rowBg, nameText, descText]);
            yOffset += 62;
        });

        // 关闭按钮
        const closeBtn = this.add.text(this.scale.width / 2 + 280, this.scale.height / 2 - 250, '✕', {
            fontSize: '32px',
            color: '#FFFFFF',
            fontFamily: STYLE.FONT.FAMILY,
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerover', () => closeBtn.setColor('#FFD700'));
        closeBtn.on('pointerout', () => closeBtn.setColor('#FFFFFF'));
        closeBtn.on('pointerdown', () => {
            menuContainer.destroy();
        });

        overlay.on('pointerdown', () => {
            menuContainer.destroy();
        });

        menuContainer.add(closeBtn);
    }

    private showSettings(): void {
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
        }).setOrigin(0.5);

        menuContainer.add([overlay, panel, title]);

        const audioManager = AudioManager.getInstance();

        // 音效开关
        const audioLabel = this.add.text(this.scale.width / 2 - 80, this.scale.height / 2 - 40, '🔊 音效:', {
            fontSize: '22px',
            color: '#FFFFFF',
            fontFamily: STYLE.FONT.FAMILY,
        });

        const muteBtn = this.add.text(this.scale.width / 2 + 40, this.scale.height / 2 - 40, audioManager.isMuted() ? '关闭' : '开启', {
            fontSize: '22px',
            color: audioManager.isMuted() ? '#888888' : '#00FF00',
            fontFamily: STYLE.FONT.FAMILY,
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
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerover', () => closeBtn.setColor('#FFD700'));
        closeBtn.on('pointerout', () => closeBtn.setColor('#FFFFFF'));
        closeBtn.on('pointerdown', () => {
            menuContainer.destroy();
        });

        overlay.on('pointerdown', () => {
            menuContainer.destroy();
        });

        menuContainer.add(closeBtn);
    }
}
