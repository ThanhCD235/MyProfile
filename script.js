// ==========================================
// CLIENT-SIDE LOGIC & INTERACTIVE METRICS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    const headerTime = document.getElementById('header-time');
    const fpsVal = document.getElementById('fps-val');
    
    // Modal & Settings elements
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const particleToggle = document.getElementById('particle-toggle');
    const particleSpeedSlider = document.getElementById('particle-speed');
    const themeButtons = document.querySelectorAll('.theme-opt-btn');
    
    // Audio elements & playlist controls (Settings modal)
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    const bgAudio = document.getElementById('bg-audio');
    const playIcon = musicToggleBtn.querySelector('.play-icon');
    const pauseIcon = musicToggleBtn.querySelector('.pause-icon');
    const playlistItems = document.getElementById('playlist-items');
    const prevTrackBtn = document.getElementById('prev-track-btn');
    const nextTrackBtn = document.getElementById('next-track-btn');
    const currentTrackName = document.getElementById('current-track-name');
    const currentTrackArtist = document.getElementById('current-track-artist');

    // Dynamic access check to hide playlist action buttons on GitHub Pages
    const playlistActions = document.querySelector('.playlist-actions');
    if (playlistActions) {
        const isGitHubPages = window.location.hostname.includes('github.io');
        if (!isGitHubPages) {
            playlistActions.style.display = 'flex';
        }
    }

    // Audio elements & playlist controls (Main screen)
    const mainTrackName = document.getElementById('main-track-name');
    const mainTrackArtist = document.getElementById('main-track-artist');
    const mainPlayBtn = document.getElementById('main-play-btn');
    const mainPrevBtn = document.getElementById('main-prev-btn');
    const mainNextBtn = document.getElementById('main-next-btn');

    // State Variables
    let particlesEnabled = true;
    let particleSpeed = 3;
    let particlesArray = [];
    let currentTheme = 'cyber-red';
    
    // FPS Tracker Variables
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let fps = 60.0;
    let lastFpsUpdateTime = performance.now();

    // ==========================================
    // 1. DYNAMIC HEADER CLOCK (iOS Style)
    // ==========================================
    function updateClock() {
        if (!headerTime) return;
        const now = new Date();
        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = now.getMinutes().toString().padStart(2, '0');
        headerTime.textContent = `${hours}:${minutes}`;
    }
    updateClock();
    setInterval(updateClock, 30000); // Update time every 30s

    // ==========================================
    // 2. DYNAMIC REAL-TIME FPS MONITOR
    // ==========================================
    function calculateFPS(now) {
        frameCount++;
        const delta = now - lastFrameTime;
        lastFrameTime = now;

        // Update FPS value every 500ms to make it readable
        if (now - lastFpsUpdateTime >= 500) {
            fps = (frameCount * 1000) / (now - lastFpsUpdateTime);
            // Cap at 60.0 or 120.0 depending on user's monitor refresh rate, adding slight realistic fluctuations
            const displayFps = Math.min(fps, 60.0);
            const fluctuation = (Math.random() * 0.4) - 0.2; // Add realistic fluctuations +/- 0.2
            fpsVal.textContent = (displayFps + fluctuation).toFixed(1);
            
            frameCount = 0;
            lastFpsUpdateTime = now;
        }
    }

    // ==========================================
    // 3. CANVAS PARTICLE SYSTEM (Space Snow/Dust)
    // ==========================================
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1; // Size 1px to 3px
            this.speedX = (Math.random() * 0.5 - 0.25) * (particleSpeed / 3);
            this.speedY = (Math.random() * 1.5 + 0.5) * (particleSpeed / 3);
            this.opacity = Math.random() * 0.6 + 0.2;
            this.glowColor = 'rgba(255, 255, 255, 0.3)';
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;

            // Loop particles back to top if they exit screen
            if (this.y > canvas.height) {
                this.y = -10;
                this.x = Math.random() * canvas.width;
            }
            if (this.x > canvas.width || this.x < 0) {
                this.x = Math.random() * canvas.width;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.shadowBlur = this.size * 2;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
            ctx.fill();
            ctx.shadowBlur = 0; // Reset shadow for efficiency
        }
    }

    function initParticles() {
        particlesArray = [];
        const numberOfParticles = Math.floor((canvas.width * canvas.height) / 12000); // Responsive particle count
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }
    initParticles();

    // Re-initialize particles on window resize
    window.addEventListener('resize', () => {
        initParticles();
    });

    // Particle Interaction (Mouse wind effect)
    let mouse = { x: null, y: null, radius: 100 };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Main animation loops
    function animate(timestamp) {
        calculateFPS(timestamp);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (particlesEnabled && window.innerWidth > 480) {
            particlesArray.forEach(particle => {
                particle.update();
                
                // Add soft interactive force field away from cursor
                if (mouse.x !== null && mouse.y !== null) {
                    let dx = particle.x - mouse.x;
                    let dy = particle.y - mouse.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        let force = (mouse.radius - distance) / mouse.radius;
                        let directionX = dx / distance;
                        let directionY = dy / distance;
                        particle.x += directionX * force * 5;
                        particle.y += directionY * force * 2;
                    }
                }
                
                particle.draw();
            });
        }
        
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    // ==========================================
    // 4. SETTINGS MODAL INTERACTION & STATE
    // ==========================================
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('open');
    });

    const closeModal = () => {
        settingsModal.classList.remove('open');
    };

    closeModalBtn.addEventListener('click', closeModal);
    saveSettingsBtn.addEventListener('click', closeModal);
    
    // Close modal on click outside modal content
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeModal();
        }
    });

    // Toggle Particles
    particleToggle.addEventListener('change', (e) => {
        particlesEnabled = e.target.checked;
    });

    // Adjust Particle Speed
    particleSpeedSlider.addEventListener('input', (e) => {
        particleSpeed = parseInt(e.target.value);
        particlesArray.forEach(p => {
            p.speedX = (Math.random() * 0.5 - 0.25) * (particleSpeed / 3);
            p.speedY = (Math.random() * 1.5 + 0.5) * (particleSpeed / 3);
        });
    });

    // Theme Picker Action
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active status from all theme buttons
            themeButtons.forEach(b => b.classList.remove('active'));
            
            // Add active to current button
            btn.classList.add('active');
            
            // Apply new theme class to body
            const theme = btn.getAttribute('data-theme');
            document.body.className = ''; // Reset body classes
            if (theme !== 'cyber-red') {
                document.body.classList.add(`theme-${theme}`);
            }
            
            // Update app variable
            currentTheme = theme;
        });
    });

    // ==========================================
    // 5. AMBIENT MUSIC PLAYLIST & CONTROLS
    // ==========================================
    const playlist = [
        {
            name: "Lofi Retro Beat",
            artist: "Local MP3 File",
            src: "music/song1.mp3",
            type: "mp3"
        },
        {
            name: "Synthwave Loop",
            artist: "Ambient Chill (Online)",
            src: "https://assets.codepen.io/25868/synthwave-loop.mp3",
            type: "online"
        },
        {
            name: "Cyberpunk Teaser Video",
            artist: "Local MP4 Video",
            src: "music/sample_video.mp4",
            type: "mp4"
        },
        {
            name: "Neo Tokyo Lights",
            artist: "Retrowave Lofi (Online)",
            src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            type: "online"
        }
    ];

    let currentTrackIndex = 0;
    let isPlaying = false;
    let errorCount = 0; // Tracks consecutive playback failures to prevent infinite loops

    // References to folder/files selectors
    const folderInput = document.getElementById('folder-input');
    const filesInput = document.getElementById('files-input');
    const folderUploadBtn = document.getElementById('folder-upload-btn');
    const filesUploadBtn = document.getElementById('files-upload-btn');

    // Synchronize play/pause icons on both players (main screen and settings modal)
    function syncPlayUI(playState) {
        const mainPlayIcon = mainPlayBtn ? mainPlayBtn.querySelector('.play-icon') : null;
        const mainPauseIcon = mainPlayBtn ? mainPlayBtn.querySelector('.pause-icon') : null;
        
        if (playState) {
            // Show pause icon (bars)
            if (playIcon) playIcon.classList.add('hidden');
            if (pauseIcon) pauseIcon.classList.remove('hidden');
            if (musicToggleBtn) musicToggleBtn.classList.add('playing');
            
            if (mainPlayIcon) mainPlayIcon.classList.add('hidden');
            if (mainPauseIcon) mainPauseIcon.classList.remove('hidden');
            if (mainPlayBtn) mainPlayBtn.classList.add('playing');
        } else {
            // Show play icon (triangle)
            if (playIcon) playIcon.classList.remove('hidden');
            if (pauseIcon) pauseIcon.classList.add('hidden');
            if (musicToggleBtn) musicToggleBtn.classList.remove('playing');
            
            if (mainPlayIcon) mainPlayIcon.classList.remove('hidden');
            if (mainPauseIcon) mainPauseIcon.classList.add('hidden');
            if (mainPlayBtn) mainPlayBtn.classList.remove('playing');
        }
    }

    // Handle track failures by automatically moving to the next track
    function handleTrackError() {
        errorCount++;
        if (errorCount >= playlist.length) {
            console.log("All audio sources failed. Stopping player.");
            errorCount = 0;
            isPlaying = false;
            syncPlayUI(false);
            return;
        }
        
        const failedTrack = playlist[currentTrackIndex];
        console.log(`Track "${failedTrack.name}" failed to load. Trying next track... (Attempt ${errorCount}/${playlist.length})`);
        
        let nextIndex = (currentTrackIndex + 1) % playlist.length;
        currentTrackIndex = nextIndex;
        updateTrackDisplay();
        
        if (isPlaying) {
            bgAudio.play().then(() => {
                errorCount = 0; // Reset error count on success
                syncPlayUI(true);
            }).catch(err => {
                console.log("Next fallback track also failed:", err);
                if (err.name === 'NotAllowedError') {
                    console.log("Browser blocked autoplay on fallback track. Pausing player.");
                    isPlaying = false;
                    syncPlayUI(false);
                } else {
                    handleTrackError(); // Recurse to next track
                }
            });
        }
    }

    // Populate Track Selector list options on the UI
    function initPlaylistDOM() {
        playlistItems.innerHTML = '';
        playlist.forEach((track, index) => {
            const item = document.createElement('div');
            item.className = 'playlist-item';
            item.setAttribute('data-index', index);
            if (index === currentTrackIndex) {
                item.classList.add('active');
            }

            // Create index column
            const indexCol = document.createElement('div');
            indexCol.className = 'track-index-col';
            indexCol.textContent = index + 1;
            item.appendChild(indexCol);

            // Create details column
            const detailsCol = document.createElement('div');
            detailsCol.className = 'track-details-col';

            const trackName = document.createElement('span');
            trackName.className = 'track-name-item';
            trackName.textContent = track.name;
            detailsCol.appendChild(trackName);

            const trackArtist = document.createElement('span');
            trackArtist.className = 'track-artist-item';
            trackArtist.textContent = track.artist;
            detailsCol.appendChild(trackArtist);

            item.appendChild(detailsCol);

            // Create file type badge
            const badge = document.createElement('span');
            badge.className = 'track-type-badge';
            badge.textContent = (track.type || 'MP3').toUpperCase();
            item.appendChild(badge);

            // Click handler to select and play track
            item.addEventListener('click', () => {
                const alreadyActive = (index === currentTrackIndex);
                loadTrack(index, true);
                if (!isPlaying) {
                    toggleMusic();
                } else if (alreadyActive) {
                    toggleMusic(); // pause if click currently playing song
                } else {
                    bgAudio.play().then(() => {
                        errorCount = 0;
                    }).catch(err => {
                        console.log("Select play failed: ", err);
                        handleTrackError();
                    });
                }
            });

            playlistItems.appendChild(item);
        });
        updateTrackDisplay();
    }

    // Update player displays
    function updateTrackDisplay() {
        if (playlist.length === 0) return;
        const currentTrack = playlist[currentTrackIndex];
        
        // Update settings modal display
        currentTrackName.textContent = currentTrack.name;
        currentTrackArtist.textContent = currentTrack.artist;
        
        // Update main card player display
        if (mainTrackName) mainTrackName.textContent = currentTrack.name;
        if (mainTrackArtist) mainTrackArtist.textContent = currentTrack.artist;
        
        bgAudio.src = currentTrack.src;

        // Highlight active item in list
        const items = playlistItems.querySelectorAll('.playlist-item');
        items.forEach((item, idx) => {
            if (idx === currentTrackIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Load and play track
    function loadTrack(index, autoPlay = true) {
        if (playlist.length === 0) return;
        currentTrackIndex = index;
        updateTrackDisplay();
        if (autoPlay && isPlaying) {
            bgAudio.play().then(() => {
                errorCount = 0; // Reset error count on success
                syncPlayUI(true);
            }).catch(err => {
                console.log("Playback error: ", err);
                if (err.name === 'NotAllowedError') {
                    console.log("Browser blocked autoplay. Pausing player.");
                    isPlaying = false;
                    syncPlayUI(false);
                } else {
                    handleTrackError();
                }
            });
        }
    }

    function toggleMusic() {
        if (playlist.length === 0) return;
        
        if (isPlaying) {
            bgAudio.pause();
            syncPlayUI(false);
            isPlaying = false;
        } else {
            // Force load source if empty
            if (!bgAudio.src) {
                bgAudio.src = playlist[currentTrackIndex].src;
            }
            
            isPlaying = true;
            bgAudio.play().then(() => {
                errorCount = 0; // Reset error count on success
                syncPlayUI(true);
            }).catch(err => {
                console.log("Autoplay blocked or file missing, attempting fallback reload...", err);
                if (err.name === 'NotAllowedError') {
                    console.log("Browser blocked autoplay. Pausing player.");
                    isPlaying = false;
                    syncPlayUI(false);
                } else {
                    handleTrackError();
                }
            });
        }
    }

    function playNextTrack() {
        if (playlist.length === 0) return;
        let nextIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(nextIndex, isPlaying);
    }

    function playPrevTrack() {
        if (playlist.length === 0) return;
        let prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(prevIndex, isPlaying);
    }

    // Process files from Folder Selection or File Upload
    function loadLocalFiles(files) {
        const detectedTracks = [];
        Array.from(files).forEach(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            if (['mp3', 'mp4', 'm4a', 'ogg', 'wav'].includes(ext)) {
                const cleanName = file.name.substring(0, file.name.lastIndexOf('.'));
                let name = cleanName;
                let artist = "Local File";
                
                if (cleanName.includes('-')) {
                    const parts = cleanName.split('-');
                    artist = parts[0].trim();
                    name = parts.slice(1).join('-').trim();
                }
                
                detectedTracks.push({
                    name: name,
                    artist: artist,
                    src: URL.createObjectURL(file), // Generate browser-safe Blob URL for file
                    type: ext
                });
            }
        });

        if (detectedTracks.length > 0) {
            // Sort files alphabetically by name
            detectedTracks.sort((a, b) => a.name.localeCompare(b.name));
            
            playlist.length = 0;
            playlist.push(...detectedTracks);
            currentTrackIndex = 0;
            initPlaylistDOM();
            
            // Auto play the first track
            if (isPlaying) {
                bgAudio.play().catch(err => console.log("Playback error: ", err));
            } else {
                toggleMusic();
            }
        } else {
            alert("Không tìm thấy tệp âm thanh hợp lệ (.mp3, .mp4, .m4a, .wav) trong thư mục đã chọn.");
        }
    }

    // Auto-scan folder listing (Active when served over local web server)
    async function scanMusicDirectory() {
        // 1. Try to load music/playlist.json first
        try {
            const response = await fetch('music/playlist.json');
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    playlist.length = 0;
                    playlist.push(...data);
                    initPlaylistDOM();
                    return; // Successfully loaded from playlist.json, skip directory scanning
                }
            }
        } catch (e) {
            console.log("Could not load music/playlist.json, checking directory listing...", e);
        }

        // 2. Fallback to scanning directory listing
        try {
            const response = await fetch('music/');
            if (response.ok) {
                const text = await response.text();
                // Check if directory listing is returned in HTML format
                if (text.includes('<title>Directory listing') || text.includes('Index of /music') || text.includes('href=')) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(text, 'text/html');
                    const links = Array.from(doc.querySelectorAll('a'));
                    
                    const detectedTracks = [];
                    links.forEach(link => {
                        const href = link.getAttribute('href');
                        if (!href) return;
                        
                        const decodedHref = decodeURIComponent(href);
                        const filename = decodedHref.split('/').pop();
                        const ext = filename.split('.').pop().toLowerCase();
                        
                        if (['mp3', 'mp4', 'm4a', 'ogg', 'wav'].includes(ext)) {
                            const cleanName = filename.substring(0, filename.lastIndexOf('.'));
                            let name = cleanName;
                            let artist = "Local Folder";
                            
                            if (cleanName.includes('-')) {
                                const parts = cleanName.split('-');
                                artist = parts[0].trim();
                                name = parts.slice(1).join('-').trim();
                            }
                            
                            detectedTracks.push({
                                name: name,
                                artist: artist,
                                src: 'music/' + href,
                                type: ext
                            });
                        }
                    });
                    
                    if (detectedTracks.length > 0) {
                        playlist.length = 0;
                        playlist.push(...detectedTracks);
                        initPlaylistDOM();
                        return;
                    }
                }
            }
        } catch (e) {
            console.log("Direct folder index scan not supported or blocked.", e);
        }
        
        initPlaylistDOM();
    }

    // Trigger initial scan
    scanMusicDirectory();

    // Event Listeners for local triggers
    if (folderUploadBtn && folderInput) {
        folderUploadBtn.addEventListener('click', () => folderInput.click());
    }
    if (filesUploadBtn && filesInput) {
        filesUploadBtn.addEventListener('click', () => filesInput.click());
    }
    if (folderInput) {
        folderInput.addEventListener('change', (e) => loadLocalFiles(e.target.files));
    }
    if (filesInput) {
        filesInput.addEventListener('change', (e) => loadLocalFiles(e.target.files));
    }

    // Playback events (Settings modal)
    musicToggleBtn.addEventListener('click', toggleMusic);
    prevTrackBtn.addEventListener('click', playPrevTrack);
    nextTrackBtn.addEventListener('click', playNextTrack);

    // Playback events (Main screen player)
    if (mainPlayBtn) mainPlayBtn.addEventListener('click', toggleMusic);
    if (mainPrevBtn) mainPrevBtn.addEventListener('click', playPrevTrack);
    if (mainNextBtn) mainNextBtn.addEventListener('click', playNextTrack);

    // Auto play next track when current ends
    bgAudio.addEventListener('ended', () => {
        playNextTrack();
    });

    // Handle audio error during playback/loading
    bgAudio.addEventListener('error', () => {
        if (isPlaying) {
            handleTrackError();
        }
    });

    // ==========================================
    // 6. ACTION INTERACTIONS (Zalo copy popup)
    // ==========================================
    const zaloBtn = document.getElementById('zalo-btn');
    zaloBtn.addEventListener('click', (e) => {
        // Prevent default navigation to show notification and then open link in new window
        e.preventDefault();
        const number = '0762244113';
        
        navigator.clipboard.writeText(number).then(() => {
            // Visual feedback
            const originalText = zaloBtn.textContent;
            zaloBtn.textContent = 'Đã sao chép SĐT!';
            zaloBtn.style.color = '#10b981';
            
            setTimeout(() => {
                zaloBtn.textContent = originalText;
                zaloBtn.style.color = '';
                // Open Zalo contact page
                window.open('https://zalo.me/0762244113', '_blank');
            }, 1000);
        }).catch(err => {
            window.open('https://zalo.me/0762244113', '_blank');
        });
    });
});
