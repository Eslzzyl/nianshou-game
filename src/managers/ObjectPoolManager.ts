import type { Scene } from 'phaser';
import type { FirecrackerConfig, LanternConfig } from '../types/index.js';
import { Firecracker } from '../objects/Firecracker.js';
import { Lantern } from '../objects/Lantern.js';
import { FuCharacter } from '../objects/FuCharacter.js';
import { RedPacket } from '../objects/RedPacket.js';
import { SpringWord } from '../objects/SpringWord.js';

interface PoolableObject {
    active: boolean;
    visible: boolean;
    body?: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | null;
    setActive(active: boolean): unknown;
    setVisible(visible: boolean): unknown;
    destroy(fromScene?: boolean): void;
}

export class ObjectPoolManager {
    private static instance: ObjectPoolManager;
    private pools: Map<string, PoolableObject[]> = new Map();
    private maxPoolSize = 50;

    private constructor() {}

    static getInstance(): ObjectPoolManager {
        if (!ObjectPoolManager.instance) {
            ObjectPoolManager.instance = new ObjectPoolManager();
        }
        return ObjectPoolManager.instance;
    }

    init(): void {
        this.clearAll();
    }

    clearAll(): void {
        for (const pool of this.pools.values()) {
            for (const obj of pool) {
                if (obj.active) {
                    obj.destroy();
                }
            }
        }
        this.pools.clear();
    }

    private getPool<T extends PoolableObject>(key: string): T[] {
        if (!this.pools.has(key)) {
            this.pools.set(key, []);
        }
        return this.pools.get(key) as T[];
    }

    getFirecracker(
        scene: Scene,
        x: number,
        y: number,
        config: Partial<FirecrackerConfig> = {}
    ): Firecracker {
        const pool = this.getPool<Firecracker>('firecracker');
        
        for (const obj of pool) {
            if (!obj.active) {
                obj.setActive(true);
                obj.setVisible(true);
                obj.reset(x, y, config);
                return obj;
            }
        }

        const firecracker = new Firecracker(scene, x, y, config);
        
        if (pool.length < this.maxPoolSize) {
            pool.push(firecracker);
        }

        return firecracker;
    }

    getLantern(
        scene: Scene,
        x: number,
        y: number,
        config: Partial<LanternConfig> = {}
    ): Lantern {
        const pool = this.getPool<Lantern>('lantern');
        
        for (const obj of pool) {
            if (!obj.active) {
                obj.setActive(true);
                obj.setVisible(true);
                obj.reset(x, y, config);
                return obj;
            }
        }

        const lantern = new Lantern(scene, x, y, config);
        
        if (pool.length < this.maxPoolSize) {
            pool.push(lantern);
        }

        return lantern;
    }

    getFuCharacter(
        scene: Scene,
        x: number,
        y: number,
        type: 'fu_copper' | 'fu_silver' | 'fu_gold'
    ): FuCharacter {
        const poolKey = `fu_${type}`;
        const pool = this.getPool<FuCharacter>(poolKey);
        
        for (const obj of pool) {
            if (!obj.active) {
                obj.setActive(true);
                obj.setVisible(true);
                obj.reset(x, y, type);
                return obj;
            }
        }

        const fu = new FuCharacter(scene, x, y, type);
        
        if (pool.length < this.maxPoolSize) {
            pool.push(fu);
        }

        return fu;
    }

    getRedPacket(scene: Scene, x: number, y: number): RedPacket {
        const pool = this.getPool<RedPacket>('redpacket');
        
        for (const obj of pool) {
            if (!obj.active) {
                obj.setActive(true);
                obj.setVisible(true);
                obj.reset(x, y);
                return obj;
            }
        }

        const packet = new RedPacket(scene, x, y);
        
        if (pool.length < this.maxPoolSize) {
            pool.push(packet);
        }

        return packet;
    }

    getSpringWord(scene: Scene, x: number, y: number): SpringWord {
        const pool = this.getPool<SpringWord>('springword');
        
        for (const obj of pool) {
            if (!obj.active) {
                obj.setActive(true);
                obj.setVisible(true);
                obj.reset(x, y);
                return obj;
            }
        }

        const word = new SpringWord(scene, x, y);
        
        if (pool.length < this.maxPoolSize) {
            pool.push(word);
        }

        return word;
    }

    release(obj: PoolableObject): void {
        obj.setActive(false);
        obj.setVisible(false);
        
        if (obj.body) {
            obj.body.enable = false;
        }
    }

    destroy(): void {
        this.clearAll();
    }
}
