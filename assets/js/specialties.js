/* =========================================================
   ALENCAR ODONTOLOGIA
   ESPECIALIDADES — MOTION SYSTEM 2.0
   ========================================================= */

(() => {

    'use strict';

    const initSpecialties = () => {

        const section = document.querySelector('#especialidades');

        if (!section) {
            console.warn(
                '[Alencar] Seção #especialidades não encontrada.'
            );
            return;
        }


        /* -------------------------------------------------
           CONFIRMA QUE O JS ESTÁ FUNCIONANDO
        ------------------------------------------------- */

        console.log(
            '%c[Alencar] specialties.js carregado com sucesso.',
            'font-weight:700;'
        );


        /* -------------------------------------------------
           ATIVA O SISTEMA CSS
        ------------------------------------------------- */

        section.classList.add('js-ready');


        /* -------------------------------------------------
           ELEMENTOS QUE DEVEM APARECER
        ------------------------------------------------- */

        const elements = section.querySelectorAll(
            '.specialties-reveal, .specialty-reveal'
        );


        if (!elements.length) {

            console.warn(
                '[Alencar] Nenhum elemento de animação encontrado.'
            );

            return;
        }


        /* -------------------------------------------------
           REDUCED MOTION
        ------------------------------------------------- */

        const reduceMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        );


        if (reduceMotion.matches) {

            section.classList.add('motion-reduced');

            elements.forEach(element => {
                element.classList.add('is-visible');
            });

            return;
        }


        /* -------------------------------------------------
           INTERSECTION OBSERVER
        ------------------------------------------------- */

        if (!('IntersectionObserver' in window)) {

            elements.forEach(element => {
                element.classList.add('is-visible');
            });

            return;
        }


        const observer = new IntersectionObserver(

            (entries, observerInstance) => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    const element = entry.target;


                    /* Pequeno atraso natural */

                    requestAnimationFrame(() => {

                        element.classList.add(
                            'is-visible'
                        );

                    });


                    /* Não precisamos observar novamente */

                    observerInstance.unobserve(element);

                });

            },

            {
                threshold: 0.12,

                rootMargin:
                    '0px 0px -8% 0px'
            }

        );


        /* -------------------------------------------------
           OBSERVA TODOS OS ELEMENTOS
        ------------------------------------------------- */

        elements.forEach(element => {

            observer.observe(element);

        });


        /* -------------------------------------------------
           HOVER / FOCUS
        ------------------------------------------------- */

        const cards = section.querySelectorAll(
            '.specialty-card'
        );


        cards.forEach(card => {

            card.addEventListener(
                'mouseenter',
                () => {

                    card.classList.add(
                        'is-focused'
                    );

                }
            );


            card.addEventListener(
                'mouseleave',
                () => {

                    card.classList.remove(
                        'is-focused'
                    );

                }
            );


            card.addEventListener(
                'focusin',
                () => {

                    card.classList.add(
                        'is-focused'
                    );

                }
            );


            card.addEventListener(
                'focusout',
                () => {

                    card.classList.remove(
                        'is-focused'
                    );

                }
            );

        });


        /* -------------------------------------------------
           LIMPEZA DE REDUCED MOTION EM TEMPO REAL
        ------------------------------------------------- */

        if (typeof reduceMotion.addEventListener === 'function') {

            reduceMotion.addEventListener(
                'change',
                event => {

                    if (event.matches) {

                        section.classList.add(
                            'motion-reduced'
                        );

                        elements.forEach(element => {

                            element.classList.add(
                                'is-visible'
                            );

                        });

                    }

                }
            );

        }

    };


    /* -----------------------------------------------------
       EXECUTA CORRETAMENTE:
       - se script estiver no HEAD
       - se estiver no final do BODY
       - se estiver com defer
    ----------------------------------------------------- */

    if (document.readyState === 'loading') {

        document.addEventListener(
            'DOMContentLoaded',
            initSpecialties,
            { once: true }
        );

    } else {

        initSpecialties();

    }

})();