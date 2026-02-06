import type { SaveData, Achievement } from '../types/index.js';
import { ACHIEVEMENTS } from '../utils/constants.js';

const STORAGE_KEY = 'nianshou_game_save';

export class SaveManager {
    private static instance: SaveManager;
    private data: SaveData;

    private constructor() {
        this.data = this.loadData();
    }

    static getInstance(): SaveManager {
        if (!SaveManager.instance) {
            SaveManager.instance = new SaveManager();
        }
        return SaveManager.instance;
    }

    private loadData(): SaveData {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return { ...this.getDefaultData(), ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Failed to load save data:', e);
        }
        return this.getDefaultData();
    }

    private getDefaultData(): SaveData {
        return {
            highScore: 0,
            achievements: {},
            totalFuCollected: 0,
            totalRedPackets: 0,
            totalFlyTime: 0,
            levelsUnlocked: [true, false, false],
        };
    }

    save(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Failed to save data:', e);
        }
    }

    getHighScore(): number {
        return this.data.highScore;
    }

    setHighScore(score: number): void {
        if (score > this.data.highScore) {
            this.data.highScore = score;
            this.save();
        }
    }

    isAchievementUnlocked(id: string): boolean {
        return (this.data.achievements[id] || 0) >= this.getAchievementTarget(id);
    }

    getAchievementProgress(id: string): number {
        return this.data.achievements[id] || 0;
    }

    unlockAchievement(id: string): void {
        const target = this.getAchievementTarget(id);
        this.data.achievements[id] = target;
        this.save();
    }

    private getAchievementTarget(id: string): number {
        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        return achievement?.target || 1;
    }

    addStat(key: keyof Omit<SaveData, 'achievements' | 'levelsUnlocked'>, value: number): void {
        (this.data[key] as number) += value;
        this.save();
    }

    getStat(key: keyof Omit<SaveData, 'achievements' | 'levelsUnlocked'>): number {
        return this.data[key] as number;
    }

    unlockLevel(level: number): void {
        if (level > 0 && level <= this.data.levelsUnlocked.length) {
            this.data.levelsUnlocked[level - 1] = true;
            this.save();
        }
    }

    isLevelUnlocked(level: number): boolean {
        return this.data.levelsUnlocked[level - 1] || false;
    }

    getAllAchievements(): Achievement[] {
        return ACHIEVEMENTS.map(a => ({
            ...a,
            current: this.data.achievements[a.id] || 0,
            unlocked: this.isAchievementUnlocked(a.id),
        }));
    }

    reset(): void {
        this.data = this.getDefaultData();
        this.save();
    }
}
