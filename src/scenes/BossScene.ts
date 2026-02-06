import { AudioManager } from '../managers/AudioManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { ScoreManager } from '../managers/ScoreManager.js';
import { Firecracker } from '../objects/Firecracker.js';
import { Lantern } from '../objects/Lantern.js';
import { UI_RESOLUTION } from '../utils/constants.js';
import { GameScene } from './GameScene.js';

export class BossScene extends GameScene {
    private bossPhase = 1;
    private phaseTimer = 0;
    private rainIntensity = 1000;
    private lastRainTime = 0;
    private lanternCtor: typeof Lantern;

    constructor() {
        super({ key: 'BossScene' });
        this.lanternCtor = Lantern;
    }

    create(): void {
        super.create();

        this.bossPhase = 1;
        this.phaseTimer = 0;
        this.rainIntensity = 1000;

        this.showBossWarning();
    }

    private showBossWarning(): void {
        const warning = this.add.text(this.scale.width / 2, this.scale.height / 2, '⚠️ BOSS战开始 ⚠️', {
            fontSize: '48px',
            color: '#FF0000',
            fontStyle: 'bold',
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: warning,
            scale: 1.2,
            duration: 500,
            yoyo: true,
            repeat: 3,
            onComplete: () => warning.destroy(),
        });
    }

    update(time: number, delta: number): void {
        super.update(time, delta);

        if (this.isPaused || this.isGameOver) return;

        this.phaseTimer += delta;

        if (this.bossPhase === 1 && this.phaseTimer > 30000) {
            this.bossPhase = 2;
            this.phaseTimer = 0;
            this.showPhaseText('第二波：波浪攻势');
        } else if (this.bossPhase === 2 && this.phaseTimer > 30000) {
            this.bossPhase = 3;
            this.phaseTimer = 0;
            this.showPhaseText('最终波：极限冲刺');
        }

        this.spawnBossObstacles(time);
    }

    private showPhaseText(text: string): void {
        const phaseText = this.add.text(this.scale.width / 2, this.scale.height / 2, text, {
            fontSize: '36px',
            color: '#FFD700',
            fontStyle: 'bold',
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: phaseText,
            alpha: 0,
            y: this.scale.height / 2 - 50,
            duration: 2000,
            onComplete: () => phaseText.destroy(),
        });
    }

    private spawnBossObstacles(time: number): void {
        if (time - this.lastRainTime < this.rainIntensity) return;

        switch (this.bossPhase) {
            case 1:
                this.spawnRandomRain();
                this.rainIntensity = Math.max(300, 1000 - this.phaseTimer * 0.02);
                break;
            case 2:
                this.spawnWavePattern();
                this.rainIntensity = 400;
                break;
            case 3:
                this.spawnFinalBurst();
                this.rainIntensity = 200;
                break;
        }

        this.lastRainTime = time;
    }

    private spawnRandomRain(): void {
        const count = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < count; i++) {
            const x = this.scale.width + Math.random() * 300;
            const y = 200 + Math.random() * 300;

            const firecracker = new Firecracker(this, x, y, {
                type: 'air',
                movePattern: 'bounce',
                warningTime: 0,
            });

            this.obstacles.add(firecracker);
        }
    }

    private spawnWavePattern(): void {
        const startY = 200;
        const count = 5;

        for (let i = 0; i < count; i++) {
            const x = this.scale.width + i * 100;
            const y = startY + Math.sin(i) * 100;

            const firecracker = new Firecracker(this, x, y, {
                type: 'air',
                movePattern: 'static',
                warningTime: 300,
            });

            this.obstacles.add(firecracker);
        }
    }

    private spawnFinalBurst(): void {
        const patterns = [
            () => this.spawnRandomRain(),
            () => this.spawnWavePattern(),
            () => this.spawnLanternRow(),
        ];

        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        pattern();
    }

    private spawnLanternRow(): void {
        const heights: Array<'low' | 'mid' | 'high'> = ['low', 'mid', 'high'];

        for (const height of heights) {
            const lantern = new this.lanternCtor(this, this.scale.width + 100, 0, { height });
            this.obstacles.add(lantern);
        }
    }

    protected checkLevelComplete(): void {
        const distance = ScoreManager.getInstance().getDistance();
        if (distance >= 2000) {
            this.levelComplete();
        }
    }

    protected levelComplete(): void {
        this.isGameOver = true;

        ScoreManager.getInstance().checkAchievements();
        SaveManager.getInstance().setHighScore(ScoreManager.getInstance().getScore());
        SaveManager.getInstance().unlockAchievement('nianshou_deliverer');

        AudioManager.getInstance().play('level_complete');

        this.scene.start('VictoryScene');
    }
}
