(function () {
    document.addEventListener("DOMContentLoaded", () => {
        // ==========================================================================
        // 1. MOBILE MENU TOGGLE
        // ==========================================================================
        const mobileToggle = document.querySelector(".navbar-mobile-toggle");
        const navLinksContainer = document.querySelector(".navbar-links");

        if (mobileToggle && navLinksContainer) {
            mobileToggle.addEventListener("click", () => {
                const isExpanded = mobileToggle.getAttribute("aria-expanded") === "true";
                mobileToggle.setAttribute("aria-expanded", !isExpanded);
                
                // Toggle display of nav links
                if (navLinksContainer.style.display === "flex") {
                    navLinksContainer.style.display = "";
                } else {
                    navLinksContainer.style.display = "flex";
                    navLinksContainer.style.flexDirection = "column";
                    navLinksContainer.style.position = "absolute";
                    navLinksContainer.style.top = "100%";
                    navLinksContainer.style.left = "0";
                    navLinksContainer.style.width = "100%";
                    navLinksContainer.style.backgroundColor = "rgba(5, 5, 8, 0.95)";
                    navLinksContainer.style.padding = "20px";
                    navLinksContainer.style.borderBottom = "1px solid rgba(255, 255, 255, 0.05)";
                }
            });
        }

        // ==========================================================================
        // 2. SMOOTH ANCHOR SCROLLING
        // ==========================================================================
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach(anchor => {
            anchor.addEventListener("click", function (e) {
                const targetId = this.getAttribute("href");
                if (targetId === "#") return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    
                    // Close mobile menu if open
                    if (navLinksContainer && navLinksContainer.style.display === "flex") {
                        navLinksContainer.style.display = "";
                        mobileToggle.setAttribute("aria-expanded", "false");
                    }
                    
                    const navbarHeight = document.querySelector(".navbar").offsetHeight || 70;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: "smooth"
                    });
                }
            });
        });

        // ==========================================================================
        // 3. PROJECT FILTERING LOGIC
        // ==========================================================================
        const filterButtons = document.querySelectorAll(".filter-btn");
        const projectCards = document.querySelectorAll(".project-card");

        if (filterButtons.length > 0 && projectCards.length > 0) {
            filterButtons.forEach(button => {
                button.addEventListener("click", () => {
                    const filter = button.getAttribute("data-filter");

                    // Toggle active button class
                    filterButtons.forEach(btn => btn.classList.remove("active"));
                    button.classList.add("active");

                    projectCards.forEach(card => {
                        const tags = card.getAttribute("data-tags") || "";
                        const tagArray = tags.split(",").map(t => t.trim().toLowerCase());

                        if (filter === "all" || tagArray.includes(filter)) {
                            // First, make it display flex/block
                            card.style.display = "flex";
                            // Force reflow
                            card.offsetHeight;
                            // Animate in
                            card.style.transition = "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
                            card.style.opacity = "1";
                            card.style.transform = "scale(1)";
                        } else {
                            // Animate out
                            card.style.transition = "opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
                            card.style.opacity = "0";
                            card.style.transform = "scale(0.95)";
                            
                            // Set display to none after animation completes
                            setTimeout(() => {
                                if (card.style.opacity === "0") {
                                    card.style.display = "none";
                                }
                            }, 300);
                        }
                    });
                });
            });
        }

        // ==========================================================================
        // 4. ANIMATE SKILLS ON VIEWPORT ENTER (IntersectionObserver)
        // ==========================================================================
        const skillSection = document.querySelector("#about");
        const skillFills = document.querySelectorAll(".skill-fill");

        if (skillSection && skillFills.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        skillFills.forEach(fill => {
                            const level = fill.getAttribute("data-level");
                            fill.style.width = `${level}%`;
                        });
                        // Once loaded, stop observing
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });

            observer.observe(skillSection);
        } else {
            // Fallback: load immediately if observer not supported or about section missing
            skillFills.forEach(fill => {
                const level = fill.getAttribute("data-level");
                fill.style.width = `${level}%`;
            });
        }
    });
})();
