(() => {
    const initMobileNavigation = () => {
        const toggle = document.querySelector('.mobile-menu');
        const navigation = document.querySelector('#site-navigation');

        if (!toggle || !navigation) return;

        const setOpen = (open) => {
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
            navigation.classList.toggle('is-open', open);
        };

        toggle.addEventListener('click', () => {
            setOpen(toggle.getAttribute('aria-expanded') !== 'true');
        });

        navigation.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => setOpen(false));
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
                setOpen(false);
                toggle.focus();
            }
        });
    };

    const initExperienceCarousel = () => {
        const carousel = document.querySelector('#hero-role-carousel');
        if (!carousel) return;

        const source = document.querySelector(carousel.dataset.source || '#experience-entries');
        const track = carousel.querySelector('#hero-role-slides');
        const indicators = carousel.querySelector('#hero-role-indicators');
        const counter = carousel.querySelector('#hero-role-count');
        const announcement = carousel.querySelector('#hero-role-announcement');
        const previous = carousel.querySelector('[data-carousel-action="previous"]');
        const next = carousel.querySelector('[data-carousel-action="next"]');
        const toggle = carousel.querySelector('[data-carousel-action="toggle"]');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const interval = Math.max(1000, Number(carousel.dataset.interval) || 7000);

        if (!source || !track || !indicators) return;

        let slides = [];
        let activeIndex = 0;
        let pausedByUser = reducedMotion.matches;
        let hovered = false;
        let focused = false;
        let inView = false;
        let timer = null;

        const stopTimer = () => {
            if (timer !== null) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        const canAutoplay = () => (
            !pausedByUser &&
            !reducedMotion.matches &&
            !hovered &&
            !focused &&
            inView &&
            slides.length > 1
        );

        const updatePlaybackControl = () => {
            if (!toggle) return;

            const isPaused = pausedByUser || reducedMotion.matches;
            toggle.textContent = isPaused ? 'Play' : 'Pause';
            toggle.setAttribute('aria-pressed', String(isPaused));
            toggle.setAttribute(
                'aria-label',
                reducedMotion.matches
                    ? 'Autoplay disabled by reduced motion; navigate experience highlights manually'
                    : `${isPaused ? 'Play' : 'Pause'} experience highlights`
            );
            toggle.title = reducedMotion.matches
                ? 'Autoplay is disabled by reduced motion; manual controls remain available'
                : `${isPaused ? 'Play' : 'Pause'} experience highlights`;
            toggle.disabled = slides.length < 2 || reducedMotion.matches;
        };

        const scheduleAutoplay = () => {
            stopTimer();
            if (canAutoplay()) {
                timer = window.setInterval(() => move(1, false), interval);
            }
            updatePlaybackControl();
        };

        const renderActiveSlide = (announceChange = false) => {
            slides.forEach((slide, index) => {
                slide.hidden = index !== activeIndex;
            });

            [...indicators.children].forEach((indicator, index) => {
                const isCurrent = index === activeIndex;
                indicator.setAttribute('aria-current', String(isCurrent));
                indicator.setAttribute(
                    'aria-label',
                    `Go to experience ${index + 1}: ${slides[index]?.dataset.slideTitle || ''}`
                );
            });

            if (counter) {
                counter.textContent = slides.length ? `${activeIndex + 1} / ${slides.length}` : '0 / 0';
            }

            if (announceChange && announcement && slides[activeIndex]) {
                announcement.textContent = `Experience ${activeIndex + 1} of ${slides.length}: ${slides[activeIndex].dataset.slideTitle}.`;
            }

            scheduleAutoplay();
        };

        const move = (offset, announceChange = true) => {
            if (slides.length < 2) return;
            activeIndex = (activeIndex + offset + slides.length) % slides.length;
            renderActiveSlide(announceChange);
        };

        const createSlide = (entry, index, total) => {
            const title = entry.querySelector('.role-title, h4')?.textContent.trim() || 'Experience';
            const organization = entry.querySelector('.role-organization')?.textContent.trim() || '';
            const date = entry.querySelector('.role-date')?.textContent.trim() || '';

            const slide = document.createElement('div');
            slide.className = 'role-slide';
            slide.id = `hero-role-slide-${index + 1}`;
            slide.setAttribute('role', 'group');
            slide.setAttribute('aria-roledescription', 'slide');
            slide.setAttribute('aria-label', `${index + 1} of ${total}`);
            slide.dataset.slideTitle = title;

            const heading = document.createElement('p');
            heading.className = 'role-slide-title';
            heading.textContent = title;

            const details = document.createElement('p');
            details.className = 'role-slide-meta';
            details.textContent = [organization, date].filter(Boolean).join(' · ');

            slide.append(heading, details);
            return slide;
        };

        const buildSlides = () => {
            const oldTitle = slides[activeIndex]?.dataset.slideTitle;
            const entries = [...source.querySelectorAll('.role-entry')];
            track.replaceChildren();
            indicators.replaceChildren();
            slides = entries.map((entry, index) => {
                const slide = createSlide(entry, index, entries.length);
                track.append(slide);

                const indicator = document.createElement('button');
                indicator.className = 'carousel-indicator';
                indicator.type = 'button';
                indicator.setAttribute('aria-controls', slide.id);
                indicator.setAttribute('aria-current', 'false');
                indicator.addEventListener('click', () => {
                    activeIndex = index;
                    renderActiveSlide(true);
                });
                indicators.append(indicator);
                return slide;
            });

            const preservedIndex = slides.findIndex((slide) => slide.dataset.slideTitle === oldTitle);
            activeIndex = preservedIndex >= 0 ? preservedIndex : 0;

            if (slides.length === 0) {
                const emptyState = document.createElement('p');
                emptyState.className = 'role-slide-meta';
                emptyState.textContent = 'Add a role to Professional Experience to show it here.';
                track.append(emptyState);
            }

            if (previous) previous.disabled = slides.length < 2;
            if (next) next.disabled = slides.length < 2;
            renderActiveSlide(false);
        };

        previous?.addEventListener('click', () => move(-1));
        next?.addEventListener('click', () => move(1));
        toggle?.addEventListener('click', () => {
            if (!reducedMotion.matches) {
                pausedByUser = !pausedByUser;
                scheduleAutoplay();
            }
        });

        carousel.addEventListener('mouseenter', () => {
            hovered = true;
            scheduleAutoplay();
        });
        carousel.addEventListener('mouseleave', () => {
            hovered = false;
            scheduleAutoplay();
        });
        carousel.addEventListener('focusin', () => {
            focused = true;
            scheduleAutoplay();
        });
        carousel.addEventListener('focusout', (event) => {
            if (!carousel.contains(event.relatedTarget)) {
                window.setTimeout(() => {
                    focused = carousel.contains(document.activeElement);
                    scheduleAutoplay();
                }, 0);
            }
        });
        carousel.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                move(1);
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                move(-1);
            }
        });

        const handleMotionPreference = (event) => {
            if (event.matches) pausedByUser = true;
            scheduleAutoplay();
        };
        if (typeof reducedMotion.addEventListener === 'function') {
            reducedMotion.addEventListener('change', handleMotionPreference);
        } else if (typeof reducedMotion.addListener === 'function') {
            reducedMotion.addListener(handleMotionPreference);
        }

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(([entry]) => {
                inView = Boolean(entry?.isIntersecting);
                scheduleAutoplay();
            }, { threshold: 0.2 });
            observer.observe(carousel);
        } else {
            inView = true;
        }

        buildSlides();

        if ('MutationObserver' in window) {
            const observer = new MutationObserver(buildSlides);
            observer.observe(source, { childList: true, subtree: true, characterData: true });
        }
    };

    const initProjectFilters = () => {
        const buttons = [...document.querySelectorAll('.filter-button[data-filter]')];
        const entries = [...document.querySelectorAll('.project-entry[data-tags]')];
        const count = document.querySelector('#project-count');
        const emptyState = document.querySelector('#filter-empty');

        if (!buttons.length || !entries.length) return;

        const applyFilter = (selectedFilter) => {
            let visibleCount = 0;

            buttons.forEach((button) => {
                button.setAttribute('aria-pressed', String(button.dataset.filter === selectedFilter));
            });

            entries.forEach((entry) => {
                const tags = (entry.dataset.tags || '')
                    .split(',')
                    .map((tag) => tag.trim().toLowerCase())
                    .filter(Boolean);
                const isVisible = selectedFilter === 'all' || tags.includes(selectedFilter);
                entry.hidden = !isVisible;
                if (isVisible) visibleCount += 1;
            });

            if (count) {
                count.textContent = `${visibleCount} ${visibleCount === 1 ? 'project' : 'projects'}`;
            }
            if (emptyState) emptyState.hidden = visibleCount !== 0;
        };

        buttons.forEach((button) => {
            button.addEventListener('click', () => applyFilter(button.dataset.filter || 'all'));
        });

        applyFilter(buttons.find((button) => button.getAttribute('aria-pressed') === 'true')?.dataset.filter || 'all');
    };

    const initHeroProjectSlideshow = () => {
        const carousel = document.querySelector('#hero-project-carousel');
        if (!carousel) return;

        const source = document.querySelector(carousel.dataset.source || '#project-index');
        const track = carousel.querySelector('#hero-project-slides');
        const indicators = carousel.querySelector('#hero-project-indicators');
        const counter = carousel.querySelector('#hero-project-count');
        const announcement = carousel.querySelector('#hero-project-announcement');
        const previous = carousel.querySelector('[data-carousel-action="previous"]');
        const next = carousel.querySelector('[data-carousel-action="next"]');
        const toggle = carousel.querySelector('[data-carousel-action="toggle"]');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const interval = Math.max(2000, Number(carousel.dataset.interval) || 6000);

        if (!source || !track || !indicators) return;

        let slides = [];
        let activeIndex = 0;
        let pausedByUser = reducedMotion.matches;
        let hovered = false;
        let focused = false;
        let inView = false;
        let timer = null;

        const stopTimer = () => {
            if (timer !== null) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        const canAutoplay = () => (
            !pausedByUser &&
            !reducedMotion.matches &&
            !hovered &&
            !focused &&
            inView &&
            slides.length > 1
        );

        const updatePlaybackControl = () => {
            if (!toggle) return;

            const isPaused = pausedByUser || reducedMotion.matches;
            toggle.textContent = isPaused ? 'Play' : 'Pause';
            toggle.setAttribute('aria-pressed', String(isPaused));
            toggle.setAttribute(
                'aria-label',
                reducedMotion.matches
                    ? 'Autoplay disabled by reduced motion; navigate projects manually'
                    : `${isPaused ? 'Play' : 'Pause'} projects slideshow`
            );
            toggle.title = reducedMotion.matches
                ? 'Autoplay is disabled by reduced motion; manual controls remain available'
                : `${isPaused ? 'Play' : 'Pause'} projects slideshow`;
            toggle.disabled = slides.length < 2 || reducedMotion.matches;
        };

        const scheduleAutoplay = () => {
            stopTimer();
            if (canAutoplay()) {
                timer = window.setInterval(() => move(1, false), interval);
            }
            updatePlaybackControl();
        };

        const renderActiveSlide = (announceChange = false) => {
            slides.forEach((slide, index) => {
                slide.hidden = index !== activeIndex;
            });

            [...indicators.children].forEach((indicator, index) => {
                const isCurrent = index === activeIndex;
                indicator.setAttribute('aria-current', String(isCurrent));
                indicator.setAttribute(
                    'aria-label',
                    `Go to project ${index + 1}: ${slides[index]?.dataset.slideTitle || ''}`
                );
            });

            if (counter) {
                counter.textContent = slides.length ? `${activeIndex + 1} / ${slides.length}` : '0 / 0';
            }

            if (announceChange && announcement && slides[activeIndex]) {
                announcement.textContent = `Project ${activeIndex + 1} of ${slides.length}: ${slides[activeIndex].dataset.slideTitle}.`;
            }

            scheduleAutoplay();
        };

        const move = (offset, announceChange = true) => {
            if (slides.length < 2) return;
            activeIndex = (activeIndex + offset + slides.length) % slides.length;
            renderActiveSlide(announceChange);
        };

        const createSlide = (entry, index, total) => {
            const img = entry.querySelector('img');
            const imgSrc = img?.getAttribute('src') || '';
            const imgAlt = img?.getAttribute('alt') || '';
            const metaRaw = entry.querySelector('.metadata')?.textContent.trim() || '';
            const title = entry.querySelector('.project-title')?.textContent.trim() || 'Project';
            const bodyCopy = entry.querySelector('.body-copy')?.textContent.trim() || '';
            const linkEl = entry.querySelector('a.text-link');
            const href = linkEl?.getAttribute('href') || '#';
            const linkText = linkEl?.innerHTML || 'View project <span aria-hidden="true">↗</span>';

            const metaParts = metaRaw.split('·').map(part => part.trim()).filter(Boolean);
            const engineBadge = metaParts[0] || 'Game Project';
            const eyebrowText = (metaParts.slice(1).join(' · ') || 'FEATURED PROJECT').toUpperCase();

            const slide = document.createElement('article');
            slide.className = 'hero-project-slide';
            slide.id = `hero-project-slide-${index + 1}`;
            slide.setAttribute('role', 'group');
            slide.setAttribute('aria-roledescription', 'slide');
            slide.setAttribute('aria-label', `${index + 1} of ${total}`);
            slide.dataset.slideTitle = title;

            slide.innerHTML = `
                <a class="feature-art-link" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="View ${title}">
                    <img class="feature-art" src="${imgSrc}" alt="${imgAlt}" fetchpriority="${index === 0 ? 'high' : 'auto'}" decoding="async">
                </a>
                <div class="feature-body">
                    <div class="meta-row">
                        <p class="eyebrow code-text">${eyebrowText}</p>
                        <span class="metadata">${engineBadge}</span>
                    </div>
                    <h2 class="display feature-title">${title}</h2>
                    <p class="body-copy">${bodyCopy}</p>
                    <a class="text-link" href="${href}" target="_blank" rel="noopener noreferrer">${linkText}</a>
                </div>
            `;

            return slide;
        };

        const buildSlides = () => {
            const oldTitle = slides[activeIndex]?.dataset.slideTitle;
            const entries = [...source.querySelectorAll('.project-entry')];
            track.replaceChildren();
            indicators.replaceChildren();

            slides = entries.map((entry, index) => {
                const slide = createSlide(entry, index, entries.length);
                track.append(slide);

                const indicator = document.createElement('button');
                indicator.className = 'carousel-indicator';
                indicator.type = 'button';
                indicator.setAttribute('aria-controls', slide.id);
                indicator.setAttribute('aria-current', 'false');
                indicator.addEventListener('click', () => {
                    activeIndex = index;
                    renderActiveSlide(true);
                });
                indicators.append(indicator);
                return slide;
            });

            const preservedIndex = slides.findIndex((slide) => slide.dataset.slideTitle === oldTitle);
            activeIndex = preservedIndex >= 0 ? preservedIndex : 0;

            if (slides.length === 0) {
                const emptyState = document.createElement('p');
                emptyState.className = 'body-copy';
                emptyState.textContent = 'No projects available.';
                track.append(emptyState);
            }

            if (previous) previous.disabled = slides.length < 2;
            if (next) next.disabled = slides.length < 2;
            renderActiveSlide(false);
        };

        previous?.addEventListener('click', () => move(-1));
        next?.addEventListener('click', () => move(1));
        toggle?.addEventListener('click', () => {
            if (!reducedMotion.matches) {
                pausedByUser = !pausedByUser;
                scheduleAutoplay();
            }
        });

        const hasHoverSupport = window.matchMedia('(hover: hover)');
        carousel.addEventListener('mouseenter', () => {
            if (hasHoverSupport.matches) {
                hovered = true;
                scheduleAutoplay();
            }
        });
        carousel.addEventListener('mouseleave', () => {
            if (hasHoverSupport.matches) {
                hovered = false;
                scheduleAutoplay();
            }
        });
        carousel.addEventListener('focusin', () => {
            focused = true;
            scheduleAutoplay();
        });
        carousel.addEventListener('focusout', (event) => {
            if (!carousel.contains(event.relatedTarget)) {
                window.setTimeout(() => {
                    focused = carousel.contains(document.activeElement);
                    scheduleAutoplay();
                }, 0);
            }
        });
        carousel.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                move(1);
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                move(-1);
            }
        });

        const handleMotionPreference = (event) => {
            if (event.matches) pausedByUser = true;
            scheduleAutoplay();
        };
        if (typeof reducedMotion.addEventListener === 'function') {
            reducedMotion.addEventListener('change', handleMotionPreference);
        } else if (typeof reducedMotion.addListener === 'function') {
            reducedMotion.addListener(handleMotionPreference);
        }

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(([entry]) => {
                inView = Boolean(entry?.isIntersecting);
                scheduleAutoplay();
            }, { threshold: 0.2 });
            observer.observe(carousel);
        } else {
            inView = true;
        }

        buildSlides();

        if ('MutationObserver' in window) {
            const observer = new MutationObserver(buildSlides);
            observer.observe(source, { childList: true, subtree: true });
        }
    };

    const initPortfolio = () => {
        initMobileNavigation();
        initExperienceCarousel();
        initHeroProjectSlideshow();
        initProjectFilters();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPortfolio, { once: true });
    } else {
        initPortfolio();
    }
})();
