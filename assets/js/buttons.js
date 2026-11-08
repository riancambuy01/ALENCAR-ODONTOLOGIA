/* =========================================================
   ALENCAR ODONTOLOGIA
   BUTTONS INTERACTIONS
   PREMIUM BUTTON JS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       01. SELEÇÃO DOS BOTÕES
    ===================================================== */

    const buttons = document.querySelectorAll(
        ".btn-primary, " +
        ".btn-header, " +
        ".reviews-cta-button, " +
        ".btn-secondary, " +
        ".image-overlay a"
    );


    /* =====================================================
       02. VERIFICAÇÃO
    ===================================================== */

    if (!buttons.length) {

        console.warn(
            "Alencar Odontologia: nenhum botão interativo encontrado."
        );

        return;

    }


    /* =====================================================
       03. PREPARAR BOTÕES
    ===================================================== */

    buttons.forEach((button) => {

        /*
         * Marca o botão para evitar inicialização duplicada.
         */

        if (button.dataset.buttonReady === "true") {
            return;
        }

        button.dataset.buttonReady = "true";


        /*
         * Permite que o botão receba o efeito ripple.
         */

        button.classList.add("premium-button");


        /* =================================================
           04. EFEITO DE CLIQUE
        ================================================= */

        button.addEventListener("click", (event) => {

            /*
             * Não interfere em links externos ou navegação.
             * Apenas cria a animação visual.
             */

            createRipple(button, event);

        });


        /* =================================================
           05. ACESSIBILIDADE
        ================================================= */

        button.addEventListener("keydown", (event) => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                button.classList.add("button-key-active");

            }

        });


        button.addEventListener("keyup", (event) => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                button.classList.remove("button-key-active");

            }

        });

    });


    /* =====================================================
       06. RIPPLE
    ===================================================== */

    function createRipple(button, event) {

        /*
         * Respeita a configuração de redução de movimento.
         */

        if (
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {

            return;

        }


        /*
         * Descobre a posição do clique.
         */

        const rect = button.getBoundingClientRect();


        let x;
        let y;


        /*
         * Clique de mouse.
         */

        if (
            typeof event.clientX === "number" &&
            typeof event.clientY === "number"
        ) {

            x = event.clientX - rect.left;
            y = event.clientY - rect.top;

        }

        /*
         * Caso seja acionamento por teclado,
         * coloca o ripple no centro.
         */

        else {

            x = rect.width / 2;
            y = rect.height / 2;

        }


        /* =================================================
           07. CRIAR ELEMENTO
        ================================================= */

        const ripple = document.createElement("span");

        ripple.className = "button-ripple";


        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;


        /*
         * Define o tamanho necessário para cobrir
         * todo o botão.
         */

        const diameter =
            Math.max(
                rect.width,
                rect.height
            ) * 2.2;


        ripple.style.width =
            `${diameter}px`;

        ripple.style.height =
            `${diameter}px`;


        /* =================================================
           08. INSERIR
        ================================================= */

        button.appendChild(ripple);


        /* =================================================
           09. REMOVER
        ================================================= */

        ripple.addEventListener(
            "animationend",
            () => {

                ripple.remove();

            },
            {
                once: true
            }
        );

    }


    /* =====================================================
       10. HOVER INTELIGENTE
    ===================================================== */

    const canHover = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    );


    if (canHover.matches) {

        buttons.forEach((button) => {

            button.addEventListener(
                "mouseenter",
                () => {

                    button.classList.add(
                        "button-hover"
                    );

                }
            );


            button.addEventListener(
                "mouseleave",
                () => {

                    button.classList.remove(
                        "button-hover"
                    );

                }
            );

        });

    }


    /* =====================================================
       11. MOBILE TOUCH
    ===================================================== */

    buttons.forEach((button) => {

        button.addEventListener(
            "touchstart",
            () => {

                button.classList.add(
                    "button-touch"
                );

            },
            {
                passive: true
            }
        );


        button.addEventListener(
            "touchend",
            () => {

                setTimeout(() => {

                    button.classList.remove(
                        "button-touch"
                    );

                }, 180);

            },
            {
                passive: true
            }
        );


        button.addEventListener(
            "touchcancel",
            () => {

                button.classList.remove(
                    "button-touch"
                );

            },
            {
                passive: true
            }
        );

    });


    /* =====================================================
       12. RESIZE
    ===================================================== */

    let resizeTimer;


    window.addEventListener(
        "resize",
        () => {

            clearTimeout(resizeTimer);


            resizeTimer = setTimeout(() => {

                /*
                 * Remove estados que eventualmente
                 * tenham ficado presos durante resize.
                 */

                buttons.forEach((button) => {

                    button.classList.remove(
                        "button-hover",
                        "button-touch",
                        "button-key-active"
                    );

                });

            }, 180);

        },
        {
            passive: true
        }
    );


    /* =====================================================
       13. LOG
    ===================================================== */

    console.log(
        `Alencar Odontologia: ${buttons.length} botões premium inicializados.`
    );

});