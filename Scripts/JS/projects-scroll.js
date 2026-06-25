(function () {
    const MAX_VISIBLE_PROJECTS = 5;
    const container = document.querySelector(".Projects-border-list");

    if (!container) {
        return;
    }

    function getElementOuterHeight(element) {
        const styles = window.getComputedStyle(element);
        const marginTop = Number.parseFloat(styles.marginTop) || 0;
        const marginBottom = Number.parseFloat(styles.marginBottom) || 0;
        return element.getBoundingClientRect().height + marginTop + marginBottom;
    }

    function applyProjectListHeight() {
        const projects = Array.from(container.querySelectorAll(".Projects-list")).filter(el => {
            return window.getComputedStyle(el).display !== "none";
        });

        if (projects.length === 0) {
            container.style.maxHeight = "";
            return;
        }

        const visibleCount = Math.min(MAX_VISIBLE_PROJECTS, projects.length);
        let visibleHeight = 0;

        for (let index = 0; index < visibleCount; index += 1) {
            visibleHeight += getElementOuterHeight(projects[index]);
        }

        container.style.maxHeight = `${Math.ceil(visibleHeight)}px`;
    }

    let resizeFrameId = 0;

    function scheduleHeightRecalculation() {
        if (resizeFrameId) {
            window.cancelAnimationFrame(resizeFrameId);
        }

        resizeFrameId = window.requestAnimationFrame(() => {
            applyProjectListHeight();
        });
    }

    applyProjectListHeight();

    document.addEventListener("DOMContentLoaded", applyProjectListHeight);
    window.addEventListener("load", applyProjectListHeight);
    window.addEventListener("resize", scheduleHeightRecalculation);
})();
