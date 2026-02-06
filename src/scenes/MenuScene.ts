import { Scene } from 'phaser';
import { AudioManager } from '../managers/AudioManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { isMobile } from '../utils/helpers.js';

export class MenuScene extends Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create(): void {
        AudioManager.getInstance().init(this);
        AudioManager.getInstance().playMusic();
        
        this.createBackground();
        this.createTitle();
        this.createButtons();
        this.createVersion();
        
        if (isMobile()) {
            this.createMobileNotice();
        }
    }

    private createBackground(): void {
        const bg = this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg_village');
        bg.setDisplaySize(this.scale.width, this.scale.height);
        
        this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.3
        );
    }

    private createTitle(): void {
        const title = this.add.text(this.scale.width / 2, 150, '年兽送福', {
            fontSize: '72px',
            color: '#FFD700',
            fontStyle: 'bold',
            stroke: '#8B0000',
            strokeThickness: 8,
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: title,
            scale: 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
        
        this.add.text(this.scale.width / 2, 230, '帮助年兽躲避爆竹，收集福气！', {
            fontSize: '24px',
            color: '#FFFFFF',
        }).setOrigin(0.5);
    }

    private createButtons(): void {
        const buttonY = 350;
        const buttonSpacing = 80;
        
        this.createButton(this.scale.width / 2, buttonY, '开始游戏', () => {
            this.scene.start('StoryScene', { level: 1 });
        });
        
        this.createButton(this.scale.width / 2, buttonY + buttonSpacing, '选择关卡', () => {
            this.showLevelSelect();
        });
        
        this.createButton(this.scale.width / 2, buttonY + buttonSpacing * 2, '成就', () => {
            this.showAchievements();
        });
        
        this.createButton(this.scale.width / 2, buttonY + buttonSpacing * 3, '设置', () => {
            this.showSettings();
        });
    }

    private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 250, 60, 0x8B0000, 0.9);
        bg.setStrokeStyle(3, 0xFFD700);
        bg.setInteractive({ useHandCursor: true });
        
        const label = this.add.text(0, 0, text, {
            fontSize: '28px',
            color: '#FFFFFF',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        container.add([bg, label]);
        
        bg.on('pointerover', () => {
            bg.setFillStyle(0xA52A2A);
            container.setScale(1.05);
        });
        
        bg.on('pointerout', () => {
            bg.setFillStyle(0x8B0000);
            container.setScale(1);
        });
        
        bg.on('pointerdown', () => {
            AudioManager.getInstance().play('collect_fu');
            callback();
        });
        
        return container;
    }

    private createVersion(): void {
        this.add.text(10, this.scale.height - 30, 'v1.0.0', {
            fontSize: '16px',
            color: '#888888',
        });
        
        const highScore = SaveManager.getInstance().getHighScore();
        this.add.text(this.scale.width - 10, this.scale.height - 30, `最高分: ${highScore}`, {
            fontSize: '16px',
            color: '#FFD700',
        }).setOrigin(1, 0);
    }

    private createMobileNotice(): void {
        this.add.text(this.scale.width / 2, this.scale.height - 80, '检测到移动设备，请横屏游玩', {
            fontSize: '18px',
            color: '#FFD700',
        }).setOrigin(0.5);
    }

    private showLevelSelect(): void {
        const overlay = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.8
        );
        
        const panel = this.add.container(this.scale.width / 2, this.scale.height / 2);
        
        const bg = this.add.rectangle(0, 0, 500, 400, 0x333333, 0.95);
        bg.setStrokeStyle(3, 0xFFD700);
        
        this.add.text(0, -150, '选择关卡', {
            fontSize: '36px',
            color: '#FFD700',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        panel.add([bg]);
        
        const levels = [
            { level: 1, name: '第一关：乡村街道', y: -50 },
            { level: 2, name: '第二关：城市夜景', y: 20 },
            { level: 3, name: '第三关：最终冲刺', y: 90 },
        ];
        
        for (const lvl of levels) {
            const saveManager = SaveManager.getInstance();
            const unlocked = saveManager.isLevelUnlocked(lvl.level);
            
            const btn = this.add.rectangle(0, lvl.y, 350, 50, unlocked ? 0x8B0000 : 0x444444);
            btn.setStrokeStyle(2, unlocked ? 0xFFD700 : 0x666666);
            
            const text = this.add.text(0, lvl.y, unlocked ? lvl.name : '🔒 锁定', {
                fontSize: '22px',
                color: unlocked ? '#FFFFFF' : '#888888',
            }).setOrigin(0.5);
            
            panel.add([btn, text]);
            
            if (unlocked) {
                btn.setInteractive({ useHandCursor: true });
                btn.on('pointerdown', () => {
                    overlay.destroy();
                    panel.destroy();
                    this.scene.start('StoryScene', { level: lvl.level });
                });
            }
        }
        
        const closeBtn = this.add.text(200, -170, '✕', {
            fontSize: '32px',
            color: '#FFFFFF',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => {
            overlay.destroy();
            panel.destroy();
        });
        
        panel.add(closeBtn);
    }

    private showAchievements(): void {
        const overlay = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.8
        );
        
        const panel = this.add.container(this.scale.width / 2, this.scale.height / 2);
        
        const bg = this.add.rectangle(0, 0, 600, 500, 0x333333, 0.95);
        bg.setStrokeStyle(3, 0xFFD700);
        
        this.add.text(0, -220, '成就', {
            fontSize: '36px',
            color: '#FFD700',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        panel.add([bg]);
        
        const achievements = SaveManager.getInstance().getAllAchievements();
        let yOffset = -150;
        
        for (const ach of achievements) {
            const color = ach.unlocked ? '#FFD700' : '#888888';
            const icon = ach.unlocked ? '✓' : '○';
            
            const text = this.add.text(-250, yOffset, `${icon} ${ach.name}`, {
                fontSize: '18px',
                color: color,
            });
            
            const desc = this.add.text(-250, yOffset + 22, `   ${ach.desc}`, {
                fontSize: '14px',
                color: '#AAAAAA',
            });
            
            panel.add([text, desc]);
            yOffset += 55;
        }
        
        const closeBtn = this.add.text(270, -230, '✕', {
            fontSize: '32px',
            color: '#FFFFFF',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => {
            overlay.destroy();
            panel.destroy();
        });
        
        panel.add(closeBtn);
    }

    private showSettings(): void {
        const overlay = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.8
        );
        
        const panel = this.add.container(this.scale.width / 2, this.scale.height / 2);
        
        const bg = this.add.rectangle(0, 0, 400, 300, 0x333333, 0.95);
        bg.setStrokeStyle(3, 0xFFD700);
        
        this.add.text(0, -120, '设置', {
            fontSize: '36px',
            color: '#FFD700',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        panel.add([bg]);
        
        const audioManager = AudioManager.getInstance();
        
        const muteText = this.add.text(-100, -40, '音效:', {
            fontSize: '22px',
            color: '#FFFFFF',
        });
        
        const muteBtn = this.add.text(50, -40, audioManager.isMuted() ? '关' : '开', {
            fontSize: '22px',
            color: audioManager.isMuted() ? '#888888' : '#00FF00',
        }).setInteractive({ useHandCursor: true });
        
        muteBtn.on('pointerdown', () => {
            audioManager.setMuted(!audioManager.isMuted());
            muteBtn.text = audioManager.isMuted() ? '关' : '开';
            muteBtn.setColor(audioManager.isMuted() ? '#888888' : '#00FF00');
        });
        
        panel.add([muteText, muteBtn]);
        
        const closeBtn = this.add.text(170, -130, '✕', {
            fontSize: '32px',
            color: '#FFFFFF',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => {
            overlay.destroy();
            panel.destroy();
        });
        
        panel.add(closeBtn);
    }
}
