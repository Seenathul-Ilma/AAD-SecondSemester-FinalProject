/*
document.addEventListener("DOMContentLoaded", function () {
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach(link => {
        const dot = link.querySelector("i[data-lucide='dot']");
        const href = link.getAttribute("href");

        // Check if the link is active
        const isActive = href === currentPage || (href === "index.html" && currentPage === "");

        // Toggle classes and dot visibility
        if (isActive) {
            link.classList.add("active-link");
            if (dot) dot.classList.remove("hidden");
        } else {
            link.classList.remove("active-link");
            if (dot) dot.classList.add("hidden");
        }
    });

    // Re-render Lucide icons once
    lucide.createIcons();
});*/


document.addEventListener("DOMContentLoaded", function () {
    // Get the current page name from the URL
    const path = window.location.pathname;
    const page = path.split("/").pop().replace('.html', '');

    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach(link => {
        const dot = link.querySelector("i[data-lucide='dot']");
        const allDots = document.querySelectorAll("nav i[data-lucide='dot']");
        console.log("Total dots in nav:", allDots.length);

        const pageName = link.getAttribute("data-page");

        // Check if the link is active
        const isActive = pageName === page || (page === "" && pageName === "index");

        // Toggle classes and dot visibility
        if (isActive) {
            link.classList.add("active-link");
            if (dot) dot.classList.remove("hidden");
        } else {
            link.classList.remove("active-link");
            if (dot) dot.classList.add("hidden");
        }
    });

    // Re-render Lucide icons once
    lucide.createIcons();
});