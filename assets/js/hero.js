/* =========================================================
   ALENCAR ODONTOLOGIA
   HERO — ANIMAÇÃO DE ENTRADA
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const hero = document.querySelector(".hero");

    if (!hero) return;

    const elements = hero.querySelectorAll(".hero-reveal");

    /* =========================================
       ACESSIBILIDADE
       ========================================= */

    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

    if (reducedMotion) {

        elements.forEach(element => {

            element.style.opacity = "1";
            element.style.transform = "none";

        });

        return;
    }


    /* =========================================
       GARANTE ESTADO INICIAL
       ========================================= */

    elements.forEach(element => {

        element.style.animationPlayState = "paused";

    });


    /* =========================================
       OBSERVER
       ========================================= */

    const observer = new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) return;

                elements.forEach(element => {

                    element.style.animationPlayState = "running";

                });

                observer.unobserve(hero);

            });

        },

        {
            threshold: 0.15
        }

    );


    observer.observe(hero);

});