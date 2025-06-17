class Stopwatch {
    constructor() {
        this.time = 0;
        this.isRunning = false;
        this.lapTimes = [];
        this.splitTimes = [];
        this.sessions = [];
        this.intervalId = null;
        this.startTime = null;
        
        // Settings
        this.soundEnabled = true;
        this.showMilliseconds = true;
        this.autoLap = 0;
        
        // Audio
        this.tickAudio = null;
        
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.setupAudio();
        this.loadSettings();
        this.updateDisplay();
        this.updateSessionsDisplay();
    }

    setupElements() {
        // Main elements
        this.mainDisplay = document.getElementById('mainDisplay');
        this.timerTitle = document.getElementById('timerTitle');
        
        // Buttons
        this.startPauseBtn = document.getElementById('startPauseBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.lapBtn = document.getElementById('lapBtn');
        this.splitBtn = document.getElementById('splitBtn');
        
        // Controls
        this.settingsToggle = document.getElementById('settingsToggle');
        this.exportCsv = document.getElementById('exportCsv');
        this.exportJson = document.getElementById('exportJson');
        
        // Settings
        this.settingsPanel = document.getElementById('settingsPanel');
        this.soundToggle = document.getElementById('soundToggle');
        this.millisecondsToggle = document.getElementById('millisecondsToggle');
        this.autoLapInput = document.getElementById('autoLapInput');
        
        // Session
        this.sessionNameInput = document.getElementById('sessionNameInput');
        this.saveSessionBtn = document.getElementById('saveSessionBtn');
        
        // Panels
        this.statisticsPanel = document.getElementById('statisticsPanel');
        this.lapTimesPanel = document.getElementById('lapTimesPanel');
        this.splitTimesPanel = document.getElementById('splitTimesPanel');
        this.sessionsPanel = document.getElementById('sessionsPanel');
        
        // Lists
        this.lapTimesList = document.getElementById('lapTimesList');
        this.splitTimesList = document.getElementById('splitTimesList');
        this.sessionsList = document.getElementById('sessionsList');
        
        // Counts
        this.lapCount = document.getElementById('lapCount');
        this.splitCount = document.getElementById('splitCount');
        this.sessionCount = document.getElementById('sessionCount');
        
        // Stats
        this.totalLaps = document.getElementById('totalLaps');
        this.fastestLap = document.getElementById('fastestLap');
        this.slowestLap = document.getElementById('slowestLap');
        this.averageLap = document.getElementById('averageLap');
        this.totalTimeSpan = document.getElementById('totalTime');
    }

    setupAudio() {
        // Create tick sound
        this.tickAudio = new Audio();
        this.tickAudio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';
        this.tickAudio.loop = true;
        this.tickAudio.volume = 0.2;
    }

    setupEventListeners() {
        // Main controls
        this.startPauseBtn.addEventListener('click', () => this.handleStartPause());
        this.stopBtn.addEventListener('click', () => this.handleStop());
        this.resetBtn.addEventListener('click', () => this.handleReset());
        this.lapBtn.addEventListener('click', () => this.handleLap());
        this.splitBtn.addEventListener('click', () => this.handleSplit());
        
        // Header controls
        this.settingsToggle.addEventListener('click', () => this.toggleSettings());
        this.exportCsv.addEventListener('click', () => this.exportData('csv'));
        this.exportJson.addEventListener('click', () => this.exportData('json'));
        
        // Settings
        this.soundToggle.addEventListener('click', () => this.toggleSound());
        this.millisecondsToggle.addEventListener('click', () => this.toggleMilliseconds());
        this.autoLapInput.addEventListener('input', (e) => this.setAutoLap(e.target.value));
        
        // Session
        this.saveSessionBtn.addEventListener('click', () => this.saveSession());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    loadSettings() {
        const settings = localStorage.getItem('stopwatch-settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.soundEnabled = parsed.soundEnabled ?? true;
            this.showMilliseconds = parsed.showMilliseconds ?? true;
            this.autoLap = parsed.autoLap ?? 0;
        }
        
        const sessions = localStorage.getItem('stopwatch-sessions');
        if (sessions) {
            this.sessions = JSON.parse(sessions);
        }
        
        this.updateSettingsDisplay();
    }

    saveSettings() {
        const settings = {
            soundEnabled: this.soundEnabled,
            showMilliseconds: this.showMilliseconds,
            autoLap: this.autoLap
        };
        localStorage.setItem('stopwatch-settings', JSON.stringify(settings));
    }

    updateSettingsDisplay() {
        this.soundToggle.textContent = this.soundEnabled ? 'ON' : 'OFF';
        this.soundToggle.classList.toggle('active', this.soundEnabled);
        
        this.millisecondsToggle.textContent = this.showMilliseconds ? 'ON' : 'OFF';
        this.millisecondsToggle.classList.toggle('active', this.showMilliseconds);
        
        this.autoLapInput.value = this.autoLap || '';
    }

    formatTime(milliseconds, showMs = this.showMilliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((milliseconds % 1000) / 10);
        
        if (hours > 0) {
            return showMs 
                ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
                : `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        return showMs 
            ? `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
            : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateDisplay() {
        this.mainDisplay.textContent = this.formatTime(this.time);
        this.updateButtons();
        this.updateStats();
    }

    updateButtons() {
        const isActive = this.isRunning;
        const hasTime = this.time > 0;
        
        // Start/Pause button
        this.startPauseBtn.innerHTML = `<span class="button-icon">${isActive ? '⏸️' : '▶️'}</span>`;
        this.startPauseBtn.classList.toggle('active', isActive);
        this.startPauseBtn.nextElementSibling.textContent = isActive ? 'START' : 'START';
        
        // Stop button
        this.stopBtn.disabled = !isActive;
        this.stopBtn.nextElementSibling.classList.toggle('button-label', !isActive);
        
        // Lap and Split buttons
        this.lapBtn.disabled = !isActive || !hasTime;
        this.splitBtn.disabled = !isActive || !hasTime;
        
        // Save session button
        this.saveSessionBtn.disabled = this.lapTimes.length === 0;
        
        // Export buttons
        this.exportCsv.disabled = this.lapTimes.length === 0;
        this.exportJson.disabled = this.lapTimes.length === 0;
    }

    toggleSettings() {
        this.settingsPanel.classList.toggle('hidden');
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.updateSettingsDisplay();
        this.saveSettings();
    }

    toggleMilliseconds() {
        this.showMilliseconds = !this.showMilliseconds;
        this.updateSettingsDisplay();
        this.saveSettings();
        this.updateDisplay();
        this.updateLapDisplay();
        this.updateSplitDisplay();
    }

    setAutoLap(value) {
        this.autoLap = parseInt(value) || 0;
        this.saveSettings();
    }

    playSound() {
        if (this.soundEnabled) {
            try {
                // Play a simple beep sound
                const beep = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0Y...');
                beep.volume = 0.2;
                beep.play().catch(() => {});
            } catch (error) {
                console.log('Could not play sound');
            }
        }
    }

    startTick() {
        if (this.soundEnabled && this.tickAudio) {
            this.tickAudio.play().catch(() => {});
        }
    }

    stopTick() {
        if (this.tickAudio) {
            this.tickAudio.pause();
            this.tickAudio.currentTime = 0;
        }
    }

    handleStartPause() {
        this.isRunning = !this.isRunning;
        if (this.isRunning) {
            this.startStopwatch();
        } else {
            this.stopStopwatch();
        }
        
        this.playSound();
        this.updateDisplay();
    }

    handleStop() {
        this.isRunning = false;
        this.stopStopwatch();
        this.playSound();
        this.updateDisplay();
    }

    handleReset() {
        this.isRunning = false;
        this.time = 0;
        this.lapTimes = [];
        this.splitTimes = [];
        this.stopStopwatch();
        this.playSound();
        this.updateDisplay();
        this.updateLapDisplay();
        this.updateSplitDisplay();
    }

    handleLap() {
        if (this.isRunning && this.time > 0) {
            const previousLapTime = this.lapTimes.length > 0 ? this.lapTimes[0].totalMilliseconds : 0;
            const lapTime = this.time - previousLapTime;
            
            const lap = {
                id: this.lapTimes.length + 1,
                time: this.formatTime(lapTime),
                totalTime: this.formatTime(this.time),
                milliseconds: lapTime,
                totalMilliseconds: this.time,
                timestamp: new Date()
            };
            
            this.lapTimes.unshift(lap);
            this.playSound();
            this.updateDisplay();
            this.updateLapDisplay();
        }
    }

    handleSplit() {
        if (this.isRunning && this.time > 0) {
            const split = {
                id: this.splitTimes.length + 1,
                time: this.formatTime(this.time),
                totalTime: this.formatTime(this.time),
                milliseconds: this.time,
                totalMilliseconds: this.time,
                timestamp: new Date()
            };
            
            this.splitTimes.unshift(split);
            this.playSound();
            this.updateSplitDisplay();
        }
    }

    startStopwatch() {
        if (!this.startTime) {
            this.startTime = Date.now() - this.time;
        }
        
        this.startTick();
        
        this.intervalId = setInterval(() => {
            const now = Date.now();
            this.time = now - this.startTime;
            
            // Auto lap
            if (this.autoLap > 0 && this.time > 0 && this.time % (this.autoLap * 1000) < 20) {
                this.handleLap();
            }
            
            this.updateDisplay();
        }, 10);
    }

    stopStopwatch() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.stopTick();
        if (!this.isRunning) {
            this.startTime = null;
        }
    }

    updateStats() {
        if (this.lapTimes.length > 0) {
            this.statisticsPanel.classList.remove('hidden');
            
            this.totalLaps.textContent = this.lapTimes.length;
            
            const fastest = this.lapTimes.reduce((min, lap) => lap.milliseconds < min.milliseconds ? lap : min);
            const slowest = this.lapTimes.reduce((max, lap) => lap.milliseconds > max.milliseconds ? lap : max);
            const average = this.lapTimes.reduce((sum, lap) => sum + lap.milliseconds, 0) / this.lapTimes.length;
            
            this.fastestLap.textContent = fastest.time;
            this.slowestLap.textContent = slowest.time;
            this.averageLap.textContent = this.formatTime(Math.floor(average));
            this.totalTimeSpan.textContent = this.formatTime(this.time);
        } else {
            this.statisticsPanel.classList.add('hidden');
        }
    }

    updateLapDisplay() {
        if (this.lapTimes.length > 0) {
            this.lapTimesPanel.classList.remove('hidden');
            this.lapCount.textContent = this.lapTimes.length;
            
            const fastest = this.lapTimes.reduce((min, lap) => lap.milliseconds < min.milliseconds ? lap : min);
            const slowest = this.lapTimes.reduce((max, lap) => lap.milliseconds > max.milliseconds ? lap : max);
            
            this.lapTimesList.innerHTML = this.lapTimes.map((lap, index) => {
                let classes = 'time-item';
                let badges = '';
                
                if (lap.id === fastest.id) {
                    classes += ' best';
                    badges += '<span class="badge best">🏆</span>';
                }
                if (lap.id === slowest.id) {
                    classes += ' worst';
                }
                if (index === 0) {
                    classes += ' latest';
                    badges += '<span class="badge latest">LATEST</span>';
                }
                
                return `
                    <div class="${classes}">
                        <div class="time-info">
                            <span class="time-number">#${lap.id}</span>
                            ${badges}
                        </div>
                        <div class="time-details">
                            <div class="time-main">${lap.time}</div>
                            <div class="time-total">${lap.totalTime}</div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            this.lapTimesPanel.classList.add('hidden');
        }
    }

    updateSplitDisplay() {
        if (this.splitTimes.length > 0) {
            this.splitTimesPanel.classList.remove('hidden');
            this.splitCount.textContent = this.splitTimes.length;
            
            this.splitTimesList.innerHTML = this.splitTimes.map((split, index) => {
                let classes = 'time-item';
                let badges = '';
                
                if (index === 0) {
                    classes += ' latest';
                    badges += '<span class="badge latest">LATEST</span>';
                }
                
                return `
                    <div class="${classes}">
                        <div class="time-info">
                            <span class="time-number">S${split.id}</span>
                            ${badges}
                        </div>
                        <div class="time-details">
                            <div class="time-main">${split.time}</div>
                            <div class="time-total">${split.timestamp.toLocaleTimeString()}</div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            this.splitTimesPanel.classList.add('hidden');
        }
    }

    updateSessionsDisplay() {
        if (this.sessions.length > 0) {
            this.sessionsPanel.classList.remove('hidden');
            this.sessionCount.textContent = this.sessions.length;
            
            this.sessionsList.innerHTML = this.sessions.map(session => `
                <div class="time-item">
                    <div class="time-info">
                        <span class="time-number">${session.name}</span>
                    </div>
                    <div class="time-details">
                        <div class="time-main">${session.totalTime}</div>
                        <div class="time-total">${session.date}</div>
                    </div>
                    <button class="load-session-btn" data-id="${session.id}">Load</button>
                    <button class="delete-session-btn" data-id="${session.id}">❌</button>
                </div>
            `).join('');
            
            // Add event listeners to the new buttons
            document.querySelectorAll('.load-session-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.loadSession(e.target.dataset.id));
            });
            
            document.querySelectorAll('.delete-session-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.deleteSession(e.target.dataset.id));
            });
        } else {
            this.sessionsPanel.classList.add('hidden');
        }
    }

    loadSession(id) {
        const session = this.sessions.find(s => s.id === id);
        if (session) {
            this.handleReset();
            this.lapTimes = [...session.lapTimes];
            this.time = session.duration;
            this.updateDisplay();
            this.updateLapDisplay();
            this.showNotification(`Session "${session.name}" loaded`);
        }
    }

    deleteSession(id) {
        this.sessions = this.sessions.filter(s => s.id !== id);
        localStorage.setItem('stopwatch-sessions', JSON.stringify(this.sessions));
        this.updateSessionsDisplay();
        this.showNotification('Session deleted');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    saveSession() {
        if (this.lapTimes.length > 0) {
            const sessionName = this.sessionNameInput.value || `Session ${this.sessions.length + 1}`;
            const session = {
                id: Date.now().toString(),
                name: sessionName,
                date: new Date().toLocaleString(),
                totalTime: this.formatTime(this.time),
                lapTimes: [...this.lapTimes],
                duration: this.time
            };
            
            this.sessions.unshift(session);
            localStorage.setItem('stopwatch-sessions', JSON.stringify(this.sessions));
            this.sessionNameInput.value = '';
            this.updateSessionsDisplay();
            this.showNotification('Session saved successfully!');
        }
    }

    exportData(format) {
        if (this.lapTimes.length === 0) return;

        const data = this.lapTimes.map(lap => ({
            lap: lap.id,
            lapTime: lap.time,
            totalTime: lap.totalTime,
            timestamp: lap.timestamp.toISOString()
        }));

        let content, fileName, mimeType;

        if (format === 'csv') {
            const headers = 'Lap,Lap Time,Total Time,Timestamp\n';
            const rows = data.map(row => `${row.lap},${row.lapTime},${row.totalTime},${row.timestamp}`).join('\n');
            content = headers + rows;
            fileName = `stopwatch-data-${new Date().toISOString().split('T')[0]}.csv`;
            mimeType = 'text/csv';
        } else {
            content = JSON.stringify(data, null, 2);
            fileName = `stopwatch-data-${new Date().toISOString().split('T')[0]}.json`;
            mimeType = 'application/json';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }

    handleKeyPress(e) {
        // Don't trigger shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT') return;
        
        if (e.code === 'Space') {
            e.preventDefault();
            this.handleStartPause();
        } else if (e.code === 'KeyR' && e.ctrlKey) {
            e.preventDefault();
            this.handleReset();
        } else if (e.code === 'KeyL') {
            e.preventDefault();
            this.handleLap();
        } else if (e.code === 'KeyS') {
            e.preventDefault();
            this.handleSplit();
        }
    }
}

// Initialize the stopwatch when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Stopwatch();
});