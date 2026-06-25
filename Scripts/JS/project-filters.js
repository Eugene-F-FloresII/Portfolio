(function () {
    document.addEventListener("DOMContentLoaded", () => {
        const filterButtons = document.querySelectorAll(".filter-btn");
        const projectItems = document.querySelectorAll(".Projects-list");
        const container = document.querySelector(".Projects-border-list");

        if (filterButtons.length === 0 || projectItems.length === 0) return;

        // Custom function to trigger height recalculation in projects-scroll.js
        function triggerHeightRecalculate() {
            // Dispatch a window resize event to trigger height adjustments
            window.dispatchEvent(new Event("resize"));
        }

        filterButtons.forEach(button => {
            button.addEventListener("click", () => {
                const filter = button.getAttribute("data-filter");

                // Remove active class from all buttons and add to clicked
                filterButtons.forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");

                // Play filter audio sweep if available
                if (window.RpgAudio && typeof window.RpgAudio.playFilter === "function") {
                    window.RpgAudio.playFilter();
                }

                let visibleCount = 0;

                projectItems.forEach(item => {
                    const tags = item.getAttribute("data-tags") || "";
                    const tagArray = tags.split(",").map(t => t.trim().toLowerCase());

                    if (filter === "all" || tagArray.includes(filter)) {
                        // Show item
                        item.style.display = "flex";
                        // Micro-animation: fade in and scale up
                        item.style.opacity = "0";
                        item.style.transform = "scale(0.95)";
                        
                        // Force reflow
                        item.offsetHeight;
                        
                        item.style.transition = "opacity 0.3s ease, transform 0.3s ease, border-color 0.2s ease, background-color 0.2s ease";
                        item.style.opacity = "1";
                        item.style.transform = "scale(1)";
                        visibleCount++;
                    } else {
                        // Hide item
                        item.style.display = "none";
                        item.style.opacity = "0";
                    }
                });

                // Re-calculate the height container to fit the newly visible projects
                setTimeout(triggerHeightRecalculate, 150);
            });
        });
    });
})();
