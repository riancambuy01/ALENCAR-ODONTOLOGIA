/* =========================================================
   ALENCAR ODONTOLOGIA
   HEADER JS
   NAVIGATION + MOBILE MENU + SMOOTH SCROLL
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";


    /* =====================================================
       ELEMENTOS
       ===================================================== */

    const header =
        document.getElementById("header");

    const headerMenu =
        document.getElementById("headerMenu");

    const headerOverlay =
        document.getElementById("headerOverlay");

    const mobileMenu =
        document.getElementById("mobileMenu");

    const mobileMenuClose =
        document.getElementById("mobileMenuClose");


    const desktopLinks =
        document.querySelectorAll(
            ".header-link"
        );

    const mobileLinks =
        document.querySelectorAll(
            ".mobile-link"
        );

    const scrollButtons =
        document.querySelectorAll(
            "[data-scroll-to]"
        );


    /* =====================================================
       VERIFICAÇÃO
       ===================================================== */

    if (!header) return;


    /* =====================================================
       HEADER SCROLL
       ===================================================== */

    const updateHeader = () => {

        if (window.scrollY > 25) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    };


    updateHeader();

    window.addEventListener(
        "scroll",
        updateHeader,
        { passive: true }
    );


    /* =====================================================
       SCROLL SUAVE
       ===================================================== */

    const scrollToSection = (targetId) => {

        const target =
            document.getElementById(targetId);

        if (!target) {

            console.warn(
                `Seção #${targetId} não encontrada.`
            );

            return;

        }


        const headerHeight =
            header.offsetHeight;


        const extraSpace = 20;


        const targetPosition =
            target.getBoundingClientRect().top +
            window.scrollY -
            headerHeight -
            extraSpace;


        window.scrollTo({

            top: Math.max(
                0,
                targetPosition
            ),

            behavior: "smooth"

        });

    };


    /* =====================================================
       LINKS DESKTOP
       ===================================================== */

    desktopLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const href =
                    link.getAttribute("href");


                if (
                    !href ||
                    !href.startsWith("#") ||
                    href === "#"
                ) {

                    return;

                }


                const targetId =
                    href.substring(1);


                const target =
                    document.getElementById(targetId);


                if (!target) {

                    return;

                }


                event.preventDefault();

                scrollToSection(targetId);

                setActiveLink(targetId);

            }
        );

    });


    /* =====================================================
       LINKS MOBILE
       ===================================================== */

    mobileLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const href =
                    link.getAttribute("href");


                if (
                    !href ||
                    !href.startsWith("#")
                ) {

                    return;

                }


                const targetId =
                    href.substring(1);


                const target =
                    document.getElementById(targetId);


                if (!target) {

                    return;

                }


                event.preventDefault();


                setActiveLink(targetId);


                closeMobileMenu();


                /*
                 * Pequeno atraso para a animação
                 * do menu terminar antes da rolagem.
                 */

                setTimeout(() => {

                    scrollToSection(targetId);

                }, 120);

            }
        );

    });


    /* =====================================================
       BOTÕES DE AGENDAMENTO
       ===================================================== */

    scrollButtons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                const targetId =
                    button.dataset.scrollTo;


                if (!targetId) {

                    return;

                }


                const target =
                    document.getElementById(targetId);


                if (!target) {

                    console.warn(
                        `O botão tenta acessar #${targetId}, mas essa seção não existe.`
                    );

                    return;

                }


                event.preventDefault();


                closeMobileMenu();


                setTimeout(() => {

                    scrollToSection(targetId);

                    setActiveLink(targetId);

                }, 80);

            }
        );

    });


    /* =====================================================
       MENU MOBILE — ABRIR
       ===================================================== */

    const openMobileMenu = () => {

        if (!mobileMenu || !headerMenu) {

            return;

        }


        header.classList.add(
            "menu-open"
        );


        document.body.classList.add(
            "header-lock"
        );


        headerMenu.setAttribute(
            "aria-expanded",
            "true"
        );


        headerMenu.setAttribute(
            "aria-label",
            "Fechar menu"
        );


        mobileMenu.setAttribute(
            "aria-hidden",
            "false"
        );

    };


    /* =====================================================
       MENU MOBILE — FECHAR
       ===================================================== */

    const closeMobileMenu = () => {

        if (!mobileMenu || !headerMenu) {

            return;

        }


        header.classList.remove(
            "menu-open"
        );


        document.body.classList.remove(
            "header-lock"
        );


        headerMenu.setAttribute(
            "aria-expanded",
            "false"
        );


        headerMenu.setAttribute(
            "aria-label",
            "Abrir menu"
        );


        mobileMenu.setAttribute(
            "aria-hidden",
            "true"
        );

    };


    /* =====================================================
       TOGGLE
       ===================================================== */

    if (headerMenu) {

        headerMenu.addEventListener(
            "click",
            () => {

                const isOpen =
                    header.classList.contains(
                        "menu-open"
                    );


                if (isOpen) {

                    closeMobileMenu();

                } else {

                    openMobileMenu();

                }

            }
        );

    }


    /* =====================================================
       BOTÃO FECHAR
       ===================================================== */

    if (mobileMenuClose) {

        mobileMenuClose.addEventListener(
            "click",
            closeMobileMenu
        );

    }


    /* =====================================================
       OVERLAY
       ===================================================== */

    if (headerOverlay) {

        headerOverlay.addEventListener(
            "click",
            closeMobileMenu
        );

    }


    /* =====================================================
       ESC
       ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                header.classList.contains(
                    "menu-open"
                )
            ) {

                closeMobileMenu();

            }

        }
    );


    /* =====================================================
       ACTIVE LINK
       ===================================================== */

    const setActiveLink = (targetId) => {

        desktopLinks.forEach(link => {

            const href =
                link.getAttribute("href");


            link.classList.toggle(
                "active",
                href === `#${targetId}`
            );

        });


        mobileLinks.forEach(link => {

            const href =
                link.getAttribute("href");


            link.classList.toggle(
                "active",
                href === `#${targetId}`
            );

        });

    };


    /* =====================================================
       DETECTAR SEÇÃO ATUAL
       ===================================================== */

    const sections = [
        ...document.querySelectorAll(
            "section[id]"
        )
    ];


    if (
        sections.length &&
        "IntersectionObserver" in window
    ) {

        const observer =
            new IntersectionObserver(
                entries => {

                    const visible =
                        entries
                            .filter(
                                entry =>
                                    entry.isIntersecting
                            )
                            .sort(
                                (a, b) =>
                                    b.intersectionRatio -
                                    a.intersectionRatio
                            );


                    if (!visible.length) {

                        return;

                    }


                    const currentId =
                        visible[0]
                            .target
                            .id;


                    setActiveLink(
                        currentId
                    );

                },
                {
                    root: null,

                    rootMargin:
                        "-35% 0px -55% 0px",

                    threshold: [
                        0,
                        .2,
                        .5,
                        .8
                    ]

                }
            );


        sections.forEach(section => {

            observer.observe(section);

        });

    }


    /* =====================================================
       REDIMENSIONAMENTO
       ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 820 &&
                header.classList.contains(
                    "menu-open"
                )
            ) {

                closeMobileMenu();

            }

        }
    );


    /* =====================================================
       HASH INICIAL
       ===================================================== */

    const initialHash =
        window.location.hash;


    if (initialHash) {

        const targetId =
            initialHash.substring(1);


        const target =
            document.getElementById(targetId);


        if (target) {

            setTimeout(() => {

                scrollToSection(
                    targetId
                );

            }, 100);

        }

    }


});