(function () {
    let audioCtx = null;
    let isMuted = localStorage.getItem("rpg-audio-muted") !== "false"; // Default to muted (true) for recruiters

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
    }

    function playBeep(freq, duration, type = "square", endFreq = null) {
        if (isMuted) return;
        initAudio();
        if (!audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        if (endFreq) {
            osc.frequency.exponentialRampToValueAtTime(endFreq, audioCtx.currentTime + duration);
        }

        // Keep it very subtle (0.02 gain) so it doesn't startle recruiters
        gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }

    function playHover() {
        playBeep(750, 0.04, "square");
    }

    function playClick() {
        // Retro double beep (ascending select sound)
        playBeep(480, 0.05, "square");
        setTimeout(() => {
            playBeep(720, 0.07, "square");
        }, 50);
    }

    function playFilter() {
        // Quick pitch sweep
        playBeep(350, 0.12, "triangle", 700);
    }

    function toggleMute() {
        isMuted = !isMuted;
        localStorage.setItem("rpg-audio-muted", isMuted);
        updateToggleButtons();
        if (!isMuted) {
            initAudio();
            playClick();
        }
    }

    function updateToggleButtons() {
        const buttons = document.querySelectorAll(".sound-toggle-btn");
        buttons.forEach(btn => {
            if (isMuted) {
                btn.innerHTML = `<span class="sound-icon">🔇</span> Sound Off`;
                btn.classList.add("muted");
            } else {
                btn.innerHTML = `<span class="sound-icon">🔊</span> Sound On`;
                btn.classList.remove("muted");
            }
        });
    }

    function bindAudio() {
        // Select elements that should trigger hover sound
        const hoverElements = document.querySelectorAll(
            "a, button, .Projects-list, .filter-btn, .Experiences-listTitle, .Achievements-list, .li-img, .Play-game-button-list a"
        );
        hoverElements.forEach(el => {
            if (el.dataset.audioHoverBound) return;
            el.dataset.audioHoverBound = "true";

            el.addEventListener("mouseenter", () => {
                playHover();
            });
        });

        // Select elements that should trigger click sound
        const clickElements = document.querySelectorAll(
            "button, a, .filter-btn, .Play-game-button"
        );
        clickElements.forEach(el => {
            if (el.dataset.audioClickBound) return;
            el.dataset.audioClickBound = "true";

            el.addEventListener("click", (e) => {
                // If it is a link or normal button, play click sound
                if (el.classList.contains("sound-toggle-btn")) return;
                playClick();
            });
        });
    }

    // Set up everything on DOM content loaded
    document.addEventListener("DOMContentLoaded", () => {
        updateToggleButtons();

        // Listen for sound toggle clicks
        document.body.addEventListener("click", (e) => {
            const toggleBtn = e.target.closest(".sound-toggle-btn");
            if (toggleBtn) {
                toggleMute();
            }
        });

        // Init AudioContext on first user interaction
        const initOnInteraction = () => {
            initAudio();
            document.removeEventListener("mousedown", initOnInteraction);
            document.removeEventListener("keydown", initOnInteraction);
            document.removeEventListener("touchstart", initOnInteraction);
        };
        document.addEventListener("mousedown", initOnInteraction);
        document.addEventListener("keydown", initOnInteraction);
        document.addEventListener("touchstart", initOnInteraction);

        // Bind initial elements
        bindAudio();

        // Expose globally so other scripts can play sound or re-bind dynamically loaded nodes
        window.RpgAudio = {
            playHover,
            playClick,
            playFilter,
            bindAudio
        };
    });
})();
