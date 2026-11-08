const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("active");

            observer.unobserve(entry.target);

        }

    });

}, {
    threshold: 0.2
});

document.querySelectorAll(
    ".reveal-left, .reveal-right, .reveal-up"
).forEach(el => observer.observe(el));

/* =========================================================
   ALENCAR ODONTOLOGIA
   SISTEMA DE ANIMAÇÕES
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";


    /* =====================================================
       CONFIGURAÇÕES
       ===================================================== */

    const revealElements = document.querySelectorAll(
        ".reveal, .reveal-left, .reveal-right, .reveal-scale"
    );


    /* =====================================================
       INTERSECTION OBSERVER
       ===================================================== */

    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -60px 0px"
    };


    const revealObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("active");

                observer.unobserve(entry.target);

            });

        },
        observerOptions
    );


    revealElements.forEach(element => {
        revealObserver.observe(element);
    });


    /* =====================================================
       ANIMAÇÃO EM CASCATA
       ===================================================== */

    const staggerGroups = document.querySelectorAll(
        ".stagger-group"
    );


    const staggerObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) {
                    return;
                }

                const items = entry.target.querySelectorAll(
                    ".stagger-item"
                );

                items.forEach(item => {
                    item.classList.add("active");
                });

                observer.unobserve(entry.target);

            });

        },
        {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        }
    );


    staggerGroups.forEach(group => {
        staggerObserver.observe(group);
    });


    /* =====================================================
       SMOOTH SCROLL
       ===================================================== */

    const anchors = document.querySelectorAll(
        'a[href^="#"]'
    );


    anchors.forEach(anchor => {

        anchor.addEventListener("click", event => {

            const targetId =
                anchor.getAttribute("href");

            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }

            const target =
                document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });


    /* =====================================================
       EFEITO DE PROFUNDIDADE DO HERO
       ===================================================== */

    const hero = document.querySelector(".hero");
    const heroImage = document.querySelector(".hero-image");


    if (hero && heroImage) {

        hero.addEventListener("mousemove", event => {

            if (window.innerWidth < 900) {
                return;
            }

            const rect =
                hero.getBoundingClientRect();

            const x =
                event.clientX - rect.left;

            const y =
                event.clientY - rect.top;

            const centerX =
                rect.width / 2;

            const centerY =
                rect.height / 2;

            const rotateY =
                ((x - centerX) / centerX) * 2;

            const rotateX =
                ((centerY - y) / centerY) * 2;


            heroImage.style.transform = `
                perspective(1200px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale(1.01)
            `;

        });


        hero.addEventListener("mouseleave", () => {

            heroImage.style.transform = `
                perspective(1200px)
                rotateX(0deg)
                rotateY(0deg)
                scale(1)
            `;

        });

    }


    /* =====================================================
       PARALLAX LEVE DO BACKGROUND
       ===================================================== */

    const heroBackground =
        document.querySelector(".hero-background");


    if (hero && heroBackground) {

        hero.addEventListener("mousemove", event => {

            if (window.innerWidth < 900) {
                return;
            }

            const rect =
                hero.getBoundingClientRect();

            const x =
                (event.clientX - rect.left) /
                rect.width;

            const y =
                (event.clientY - rect.top) /
                rect.height;

            const moveX =
                (x - 0.5) * 30;

            const moveY =
                (y - 0.5) * 30;


            heroBackground.style.transform = `
                translate(${moveX}px, ${moveY}px)
                scale(1.05)
            `;

        });

    }


    /* =====================================================
       DETECÇÃO DE SCROLL
       ===================================================== */

    const header =
        document.querySelector("header");


    if (header) {

        const updateHeader = () => {

            if (window.scrollY > 30) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }

        };


        window.addEventListener(
            "scroll",
            updateHeader,
            {
                passive: true
            }
        );


        updateHeader();

    }


    /* =====================================================
       LOG
       ===================================================== */

    console.log(
        "Alencar Odontologia — Sistema de animações carregado."
    );

});