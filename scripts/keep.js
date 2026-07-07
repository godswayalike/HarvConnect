document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menuToggle");
    const mobileMenu = document.getElementById("mobileMenu");
    const navLinks = Array.from(document.querySelectorAll('.desktop-nav a'));
    const sections = ['problem', 'how-it-works', 'roles'];

    const setActiveNavLink = () => {
        const scrollPosition = window.scrollY + 120;

        let activeSection = '';
        sections.forEach((sectionId) => {
            const section = document.getElementById(sectionId);
            if (section && scrollPosition >= section.offsetTop) {
                activeSection = sectionId;
            }
        });

        navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            const isActive = href === `#${activeSection}`;
            link.classList.toggle('active', isActive);
        });
    };

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

    setActiveNavLink();
    window.addEventListener('scroll', setActiveNavLink, { passive: true });
});