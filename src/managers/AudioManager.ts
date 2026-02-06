import type { Scene } from 'phaser';

type SoundKey = 
    | 'jump'
    | 'collect_fu'
    | 'collect_packet'
    | 'powerup'
    | 'hurt'
    | 'explosion'
    | 'level_complete'
    | 'game_over'
    | 'bgm_chunjie';

export class AudioManager {
    private static instance: AudioManager;
    private scene: Scene | null = null;
    private sounds: Map<SoundKey, Phaser.Sound.BaseSound> = new Map();
    private music: Phaser.Sound.BaseSound | null = null;
    private muted = false;
    private volume = 1;

    private constructor() {}

    static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    init(scene: Scene): void {
        this.scene = scene;
    }

    preload(): void {
        if (!this.scene) return;
        const basePath = 'assets/audio/';
        this.scene.load.audio('jump', `${basePath}jump.mp3`);
        this.scene.load.audio('collect_fu', `${basePath}collect_fu.mp3`);
        this.scene.load.audio('collect_packet', `${basePath}collect_packet.mp3`);
        this.scene.load.audio('powerup', `${basePath}powerup.mp3`);
        this.scene.load.audio('hurt', `${basePath}hurt.mp3`);
        this.scene.load.audio('explosion', `${basePath}explosion.mp3`);
        this.scene.load.audio('level_complete', `${basePath}level_complete.mp3`);
        this.scene.load.audio('game_over', `${basePath}game_over.mp3`);
        this.scene.load.audio('bgm_chunjie', `${basePath}bgm_chunjie.mp3`);
    }

    create(): void {
        if (!this.scene) return;
        
        const soundKeys: SoundKey[] = [
            'jump', 'collect_fu', 'collect_packet', 'powerup', 
            'hurt', 'explosion', 'level_complete', 'game_over', 'bgm_chunjie'
        ];
        
        for (const key of soundKeys) {
            if (this.scene.cache.audio.exists(key)) {
                this.sounds.set(key, this.scene.sound.add(key));
            }
        }
    }

    play(key: SoundKey, config?: Phaser.Types.Sound.SoundConfig): void {
        if (this.muted) return;
        const sound = this.sounds.get(key);
        if (sound && this.scene) {
            sound.play({ ...config, volume: this.volume });
        }
    }

    playMusic(key: SoundKey = 'bgm_chunjie'): void {
        if (this.muted) return;
        if (this.music?.isPlaying) {
            this.music.stop();
        }
        this.music = this.sounds.get(key) || null;
        if (this.music) {
            this.music.play({ loop: true, volume: this.volume * 0.5 });
        }
    }

    stopMusic(): void {
        if (this.music?.isPlaying) {
            this.music.stop();
        }
    }

    pauseMusic(): void {
        if (this.music?.isPlaying) {
            this.music.pause();
        }
    }

    resumeMusic(): void {
        if (this.music?.isPaused) {
            this.music.resume();
        }
    }

    setMuted(muted: boolean): void {
        this.muted = muted;
        if (this.scene) {
            this.scene.sound.mute = muted;
        }
    }

    isMuted(): boolean {
        return this.muted;
    }

    setVolume(volume: number): void {
        this.volume = clamp(volume, 0, 1);
        if (this.scene) {
            this.scene.sound.volume = this.volume;
        }
    }

    getVolume(): number {
        return this.volume;
    }
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
