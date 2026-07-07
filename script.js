document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menuToggle");
    const mobileMenu = document.getElementById("mobileMenu");

    if (menuToggle && mobileMenu) {
        const setMenuState = (isOpen) => {
            mobileMenu.style.display = isOpen ? "flex" : "none";
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.innerHTML = isOpen ? '<i class="ph ph-x"></i>' : '<i class="ph ph-list"></i>';
        };

        menuToggle.addEventListener("click", () => {
            const isMenuOpen = menuToggle.getAttribute("aria-expanded") === "true";
            setMenuState(!isMenuOpen);
        });

        const mobileLinks = document.querySelectorAll(".mobile-link");
        mobileLinks.forEach(link => {
            link.addEventListener("click", () => {
                setMenuState(false);
            });
        });
    }
});