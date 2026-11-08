/* =========================================================
   ALENCAR ODONTOLOGIA
   FOOTER PREMIUM — JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       01. ANO AUTOMÁTICO
    ====================================================== */

    const footerYear = document.getElementById("footerYear");

    if (footerYear) {

        footerYear.textContent =
            new Date().getFullYear();

    }


    /* =====================================================
       02. REVEAL DO FOOTER
    ====================================================== */

    const footerElements =
        document.querySelectorAll(".footer-reveal");


    if ("IntersectionObserver" in window) {

        const footerObserver =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach(entry => {

                        if (entry.isIntersecting) {

                            entry.target.classList.add(
                                "footer-visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.12
                }
            );


        footerElements.forEach(
            (element, index) => {

                /*
                 * Pequeno atraso entre os elementos
                 * para criar efeito cascata.
                 */

                element.style.transitionDelay =
                    `${index * 90}ms`;

                footerObserver.observe(element);

            }
        );

    } else {

        footerElements.forEach(element => {

            element.classList.add(
                "footer-visible"
            );

        });

    }


    /* =====================================================
       03. VOLTAR AO TOPO
    ====================================================== */

    const backTop =
        document.querySelector(
            ".footer-back-top"
        );


    if (backTop) {

        backTop.addEventListener(
            "click",
            event => {

                event.preventDefault();

                window.scrollTo({

                    top: 0,

                    behavior: "smooth"

                });

            }
        );

    }


    /* =====================================================
       04. LINKS INTERNOS SUAVES
    ====================================================== */

    const internalLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    internalLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const targetId =
                    link.getAttribute("href");


                if (
                    !targetId ||
                    targetId === "#"
                ) {

                    return;

                }


                const target =
                    document.querySelector(
                        targetId
                    );


                if (!target) {

                    return;

                }


                event.preventDefault();


                target.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            }
        );

    });


    /* =====================================================
       05. EFEITO SUTIL NO LOGO
    ====================================================== */

    const footerLogo =
        document.querySelector(
            ".footer-logo"
        );


    if (footerLogo) {

        footerLogo.addEventListener(
            "mousemove",
            event => {

                const rect =
                    footerLogo.getBoundingClientRect();

                const x =
                    event.clientX - rect.left;

                const y =
                    event.clientY - rect.top;

                const rotateY =
                    ((x / rect.width) - .5) * 5;

                const rotateX =
                    ((y / rect.height) - .5) * -5;


                footerLogo.style.transform =
                    `perspective(500px)
                     rotateX(${rotateX}deg)
                     rotateY(${rotateY}deg)`;

            }
        );


        footerLogo.addEventListener(
            "mouseleave",
            () => {

                footerLogo.style.transform =
                    "";

            }
        );

    }


    /* =====================================================
       06. WHATSAPP — MICRO INTERAÇÃO
    ====================================================== */

    const whatsappButton =
        document.querySelector(
            ".floating-whatsapp"
        );


    if (whatsappButton) {

        whatsappButton.addEventListener(
            "mouseenter",
            () => {

                whatsappButton.classList.add(
                    "whatsapp-active"
                );

            }
        );


        whatsappButton.addEventListener(
            "mouseleave",
            () => {

                whatsappButton.classList.remove(
                    "whatsapp-active"
                );

            }
        );

    }


});