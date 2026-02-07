import type { LevelType, Achievement } from '../types/index.js';
import { ACHIEVEMENTS, PLAYER, REDPACKET_THRESHOLD } from '../utils/constants.js';

export class ScoreManager {
    private static instance: ScoreManager;
    private score = 0;
    private lives = 3;
    private redPackets = 0;
    private currentLevel: LevelType = 1;
    private distance = 0;
    private startTime = 0;
    private levelStartTime = 0;
    private damageTaken = 0;
    private invincibleEnergy = 0;
    private isInvincibleActive = false;

    private constructor() {}

    static getInstance(): ScoreManager {
        if (!ScoreManager.instance) {
            ScoreManager.instance = new ScoreManager();
        }
        return ScoreManager.instance;
    }

    init(): void {
        this.resetAll();
    }

    resetAll(): void {
        this.score = 0;
        this.lives = 3;
        this.redPackets = 0;
        this.currentLevel = 1;
        this.distance = 0;
        this.startTime = Date.now();
        this.levelStartTime = Date.now();
        this.damageTaken = 0;
        this.invincibleEnergy = 0;
        this.isInvincibleActive = false;
    }

    resetLevel(level: LevelType): void {
        this.currentLevel = level;
        this.levelStartTime = Date.now();
        this.damageTaken = 0;
        this.distance = 0;
        this.invincibleEnergy = 0;
        this.isInvincibleActive = false;
        this.lives = 3;
        this.score = 0;
        this.redPackets = 0;
    }

    addScore(points: number): void {
        this.score += points;
    }

    getScore(): number {
        return this.score;
    }

    takeDamage(amount = 1): void {
        this.lives = Math.max(0, this.lives - amount);
        this.damageTaken += amount;
    }

    heal(amount = 1): void {
        this.lives = Math.min(3, this.lives + amount);
    }

    getLives(): number {
        return this.lives;
    }

    isDead(): boolean {
        return this.lives <= 0;
    }

    addRedPacket(): void {
        this.redPackets++;
    }

    getRedPackets(): number {
        return this.redPackets;
    }

    canActivateInvincible(): boolean {
        return this.redPackets >= REDPACKET_THRESHOLD;
    }

    activateInvincible(): boolean {
        if (this.canActivateInvincible()) {
            this.invincibleEnergy = REDPACKET_THRESHOLD;
            this.isInvincibleActive = true;
            return true;
        }
        return false;
    }

    updateInvincibleEnergy(delta: number): void {
        if (this.isInvincibleActive && this.invincibleEnergy > 0) {
            const energyDecreaseRate = REDPACKET_THRESHOLD / PLAYER.INVINCIBLE_DURATION;
            this.invincibleEnergy -= energyDecreaseRate * delta;
            if (this.invincibleEnergy <= 0) {
                this.invincibleEnergy = 0;
                this.isInvincibleActive = false;
            }
        }
    }

    getInvincibleEnergy(): number {
        return this.invincibleEnergy;
    }

    isInvincibleStateActive(): boolean {
        return this.isInvincibleActive;
    }

    getCurrentLevel(): LevelType {
        return this.currentLevel;
    }

    setCurrentLevel(level: LevelType): void {
        this.currentLevel = level;
    }

    updateDistance(deltaDistance: number): void {
        this.distance += deltaDistance;
    }

    getDistance(): number {
        return this.distance;
    }

    getLevelTime(): number {
        return (Date.now() - this.levelStartTime) / 1000;
    }

    getTotalTime(): number {
        return (Date.now() - this.startTime) / 1000;
    }

    getDamageTaken(): number {
        return this.damageTaken;
    }

    isNoDamage(): boolean {
        return this.damageTaken === 0;
    }

    checkAchievements(): Achievement[] {
        const saveManager = SaveManager.getInstance();
        const unlocked: Achievement[] = [];

        for (const achievement of ACHIEVEMENTS) {
            if (!saveManager.isAchievementUnlocked(achievement.id)) {
                let progress = 0;
                
                switch (achievement.id) {
                    case 'fu_master':
                        progress = saveManager.getStat('totalFuCollected');
                        break;
                    case 'packet_saver':
                        if (this.redPackets >= achievement.target) {
                            progress = achievement.target;
                        }
                        break;
                    case 'firecracker_proof':
                        if (this.currentLevel === 3 && this.isNoDamage()) {
                            progress = 1;
                        }
                        break;
                    case 'speed_demon':
                        if (this.currentLevel === 1 && this.getLevelTime() <= achievement.target) {
                            progress = 1;
                        }
                        break;
                    case 'no_damage_1':
                        if (this.currentLevel === 1 && this.isNoDamage()) {
                            progress = 1;
                        }
                        break;
                    case 'no_damage_2':
                        if (this.currentLevel === 2 && this.isNoDamage()) {
                            progress = 1;
                        }
                        break;
                    case 'spring_flyer':
                        progress = saveManager.getStat('totalFlyTime');
                        break;
                    case 'nianshou_deliverer':
                        if (this.currentLevel === 3) {
                            progress = 1;
                        }
                        break;
                }

                if (progress >= achievement.target) {
                    saveManager.unlockAchievement(achievement.id);
                    unlocked.push(achievement);
                }
            }
        }

        return unlocked;
    }
}

import { SaveManager } from './SaveManager.js';
