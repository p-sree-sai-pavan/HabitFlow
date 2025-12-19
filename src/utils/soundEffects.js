// Completion Sound Utility
// A subtle, satisfying completion sound using Web Audio API

let audioContext = null;

export const playCompletionSound = () => {
    try {
        // Lazy initialize AudioContext (required for browser autoplay policies)
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Resume context if suspended
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const now = audioContext.currentTime;

        // Create oscillator for the "ding" sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Configure sound - a pleasant, subtle completion tone
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, now); // Start frequency
        oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1); // Quick rise
        oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.15); // Gentle fall

        // Volume envelope - quick attack, smooth decay
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02); // Quick attack (subtle volume)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25); // Smooth decay

        // Play the sound
        oscillator.start(now);
        oscillator.stop(now + 0.25);

    } catch (error) {
        // Silently fail if audio is not available
        console.log('[HabitFlow] Audio not available:', error.message);
    }
};

// Alternative: Success chime (two-note chord)
export const playSuccessChime = () => {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const now = audioContext.currentTime;

        // First note
        const osc1 = audioContext.createOscillator();
        const gain1 = audioContext.createGain();
        osc1.connect(gain1);
        gain1.connect(audioContext.destination);
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        gain1.gain.setValueAtTime(0.1, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc1.start(now);
        osc1.stop(now + 0.3);

        // Second note (delayed)
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, now + 0.1); // E5
        gain2.gain.setValueAtTime(0.1, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.4);

    } catch (error) {
        console.log('[HabitFlow] Audio not available:', error.message);
    }
};

// Milestone celebration sound (more elaborate)
export const playMilestoneSound = () => {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const now = audioContext.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        notes.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.type = 'sine';
            const startTime = now + (i * 0.08);
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.08, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });

    } catch (error) {
        console.log('[HabitFlow] Audio not available:', error.message);
    }
};
