/* =========================================================
   ALENCAR ODONTOLOGIA
   AVALIAÇÕES PREMIUM
   JAVASCRIPT — PATIENT STORIES
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       01. CONFIGURAÇÃO
    ===================================================== */

    const testimonials = [

        {
            name: "Maria Oliveira",

            treatment: "Implante Dentário",

            text: "Depois do implante dentário voltei a sorrir com confiança. Toda equipe foi extremamente atenciosa desde a primeira consulta.",

            date: "Abril 2026",

            location: "Salvador · BA",

            image: "assets/images/testimonials/Paciente01.png",

            alt: "Maria Oliveira após tratamento odontológico"

        },

        {
            name: "Carlos Henrique",

            treatment: "Clareamento Dental",

            text: "O resultado ficou muito natural. Eu queria melhorar meu sorriso sem perder minha aparência e foi exatamente o que aconteceu.",

            date: "Maio 2026",

            location: "Salvador · BA",

            image: "assets/images/testimonials/Paciente02.png",

            alt: "Carlos Henrique após clareamento dental"

        },

        {
            name: "Fernanda Lima",

            treatment: "Lentes de Porcelana",

            text: "Sempre tive receio de fazer um procedimento estético, mas o cuidado da equipe me deixou muito segura. O resultado superou minhas expectativas.",

            date: "Maio 2026",

            location: "Salvador · BA",

            image: "assets/images/testimonials/Paciente03.png",

            alt: "Fernanda Lima após tratamento odontológico"

        },

        {
            name: "Ricardo Almeida",

            treatment: "Reabilitação Oral",

            text: "Fui muito bem recebido desde a primeira consulta. O tratamento foi explicado com clareza e o resultado trouxe de volta minha confiança para sorrir.",

            date: "Junho 2026",

            location: "Salvador · BA",

            image: "assets/images/testimonials/Paciente04.png",

            alt: "Ricardo Almeida após reabilitação oral"

        },

        {
            name: "Juliana Martins",

            treatment: "Clareamento Dental",

            text: "Toda a experiência foi muito melhor do que eu imaginava. A equipe foi cuidadosa, atenciosa e o resultado ficou extremamente natural.",

            date: "Junho 2026",

            location: "Salvador · BA",

            image: "assets/images/testimonials/Paciente05.png",

            alt: "Juliana Martins após tratamento odontológico"

        }

    ];


    /* =====================================================
       02. ELEMENTOS DO HTML
    ===================================================== */

    const mainImage =
        document.getElementById("mainPatientImage");

    const imageTreatment =
        document.getElementById("imageTreatment");

    const testimonialStars =
        document.getElementById("testimonialStars");

    const testimonialText =
        document.getElementById("testimonialText");

    const testimonialName =
        document.getElementById("testimonialName");

    const testimonialTreatment =
        document.getElementById("testimonialTreatment");

    const testimonialDate =
        document.getElementById("testimonialDate");

    const testimonialLocation =
        document.getElementById("testimonialLocation");

    const testimonialCurrent =
        document.getElementById("testimonialCurrent");

    const testimonialProgress =
        document.getElementById("testimonialProgress");

    const mobileCurrentNumber =
        document.getElementById("mobileCurrentNumber");

    const mobileProgress =
        document.getElementById("mobileProgress");

    const testimonialShowcase =
        document.getElementById("testimonialShowcase");

    const storyImage =
        document.querySelector(".story-image");

    const storyContent =
        document.querySelector(".story-content");

    const thumbnails =
        document.querySelectorAll(".testimonial-thumb");

    const prevButton =
        document.getElementById("testimonialPrev");

    const nextButton =
        document.getElementById("testimonialNext");

    const navPrevButton =
        document.getElementById("testimonialNavPrev");

    const navNextButton =
        document.getElementById("testimonialNavNext");


    /* =====================================================
       03. VERIFICAÇÃO
    ===================================================== */

    if (
        !mainImage ||
        !testimonialShowcase ||
        !testimonialText ||
        !testimonialName
    ) {

        console.warn(
            "Alencar Odontologia: elementos das avaliações não encontrados."
        );

        return;

    }


    /* =====================================================
       04. ESTADO
    ===================================================== */

    let currentIndex = 0;

    let autoplayTimer = null;

    let resumeTimer = null;

    let isChanging = false;

    let touchStartX = 0;

    let touchEndX = 0;


    /* =====================================================
       05. CONFIGURAÇÕES DO CARROSSEL
    ===================================================== */

    const AUTOPLAY_TIME = 7500;

    const RESUME_TIME = 10000;

    const TRANSITION_TIME = 450;


    /* =====================================================
       06. PRÉ-CARREGAR TODAS AS IMAGENS
       
       IMPORTANTE:
       Isso evita a imagem aparecer e desaparecer durante
       a troca do depoimento.
    ===================================================== */

    const preloadedImages = [];

    testimonials.forEach((testimonial) => {

        const image = new Image();

        image.src = testimonial.image;

        preloadedImages.push(image);

    });


    /* =====================================================
       07. FORMATAR NÚMERO
       
       1  -> 01
       2  -> 02
       10 -> 10
    ===================================================== */

    function formatNumber(number) {

        return String(number).padStart(2, "0");

    }


    /* =====================================================
       08. ATUALIZAR ESTRELAS
    ===================================================== */

    function updateStars() {

        if (!testimonialStars) return;

        testimonialStars.innerHTML = `
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
        `;

    }


    /* =====================================================
       09. ATUALIZAR THUMBNAILS
    ===================================================== */

    function updateThumbnails() {

        thumbnails.forEach((thumbnail, index) => {

            const isActive =
                index === currentIndex;

            thumbnail.classList.toggle(
                "active",
                isActive
            );

            thumbnail.setAttribute(
                "aria-selected",
                isActive ? "true" : "false"
            );

        });

    }


    /* =====================================================
       10. ATUALIZAR PROGRESSO
    ===================================================== */

    function updateProgress() {

        const current =
            currentIndex + 1;

        const total =
            testimonials.length;

        const percentage =
            (current / total) * 100;

        if (testimonialProgress) {

            testimonialProgress.style.width =
                `${percentage}%`;

        }

        if (mobileProgress) {

            mobileProgress.style.width =
                `${percentage}%`;

        }

        if (testimonialCurrent) {

            testimonialCurrent.textContent =
                formatNumber(current);

        }

        if (mobileCurrentNumber) {

            mobileCurrentNumber.textContent =
                formatNumber(current);

        }

    }


    /* =====================================================
       11. ATUALIZAR CONTEÚDO
    ===================================================== */

    function updateTextContent(testimonial) {

        testimonialText.textContent =
            `“${testimonial.text}”`;

        testimonialName.textContent =
            testimonial.name;

        testimonialTreatment.textContent =
            testimonial.treatment;

        testimonialDate.textContent =
            testimonial.date;

        testimonialLocation.textContent =
            testimonial.location;

        imageTreatment.textContent =
            testimonial.treatment;

        mainImage.alt =
            testimonial.alt;

    }


    /* =====================================================
       12. ATUALIZAR IMAGEM
       
       A imagem é carregada primeiro.
       Só depois substituímos a imagem atual.
       
       Isso é importante para evitar:
       
       imagem → branco → imagem
       
       ===================================================== */

    function changeImage(testimonial) {

        return new Promise((resolve) => {

            const newImage = new Image();

            newImage.onload = () => {

                mainImage.src =
                    testimonial.image;

                mainImage.alt =
                    testimonial.alt;

                resolve();

            };

            newImage.onerror = () => {

                console.warn(
                    "Não foi possível carregar:",
                    testimonial.image
                );

                resolve();

            };

            newImage.src =
                testimonial.image;

        });

    }


    /* =====================================================
       13. ANIMAÇÃO DE SAÍDA
    ===================================================== */

    function startExitAnimation() {

        if (storyImage) {

            storyImage.classList.add(
                "is-changing"
            );

        }

        if (storyContent) {

            storyContent.classList.add(
                "is-changing"
            );

        }

    }


    /* =====================================================
       14. ANIMAÇÃO DE ENTRADA
    ===================================================== */

    function finishEnterAnimation() {

        setTimeout(() => {

            if (storyImage) {

                storyImage.classList.remove(
                    "is-changing"
                );

            }

            if (storyContent) {

                storyContent.classList.remove(
                    "is-changing"
                );

            }

        }, 50);

    }


    /* =====================================================
       15. TROCAR DE DEPOIMENTO
    ===================================================== */

    async function showTestimonial(
        index,
        direction = "next"
    ) {

        if (isChanging) return;

        isChanging = true;

        /* -----------------------------------------------
           GARANTE ÍNDICE VÁLIDO
        ------------------------------------------------ */

        if (index < 0) {

            index =
                testimonials.length - 1;

        }

        if (index >= testimonials.length) {

            index = 0;

        }

        const testimonial =
            testimonials[index];


        /* -----------------------------------------------
           ANIMAÇÃO
        ------------------------------------------------ */

        startExitAnimation();


        /* -----------------------------------------------
           ESPERA A SAÍDA VISUAL
        ------------------------------------------------ */

        await new Promise(resolve => {

            setTimeout(
                resolve,
                TRANSITION_TIME
            );

        });


        /* -----------------------------------------------
           CARREGA A IMAGEM ANTES DE EXIBIR
        ------------------------------------------------ */

        await changeImage(testimonial);


        /* -----------------------------------------------
           ATUALIZA TEXTO
        ------------------------------------------------ */

        updateTextContent(
            testimonial
        );


        /* -----------------------------------------------
           ATUALIZA ESTRELAS
        ------------------------------------------------ */

        updateStars();


        /* -----------------------------------------------
           ATUALIZA ESTADO
        ------------------------------------------------ */

        currentIndex =
            index;


        /* -----------------------------------------------
           ATUALIZA THUMBNAILS
        ------------------------------------------------ */

        updateThumbnails();


        /* -----------------------------------------------
           ATUALIZA PROGRESSO
        ------------------------------------------------ */

        updateProgress();


        /* -----------------------------------------------
           FINALIZA ANIMAÇÃO
        ------------------------------------------------ */

        finishEnterAnimation();


        /* -----------------------------------------------
           LIBERA NOVA TROCA
        ------------------------------------------------ */

        setTimeout(() => {

            isChanging = false;

        }, 100);


        /* -----------------------------------------------
           CENTRALIZA THUMB ATIVA
        ------------------------------------------------ */

        scrollActiveThumbnail();


        /* -----------------------------------------------
           REINICIA AUTOPLAY
        ------------------------------------------------ */

        restartAutoplay();

    }


    /* =====================================================
       16. PRÓXIMO
    ===================================================== */

    function nextTestimonial() {

        const nextIndex =
            currentIndex + 1;

        showTestimonial(
            nextIndex,
            "next"
        );

    }


    /* =====================================================
       17. ANTERIOR
    ===================================================== */

    function previousTestimonial() {

        const previousIndex =
            currentIndex - 1;

        showTestimonial(
            previousIndex,
            "previous"
        );

    }


    /* =====================================================
       18. CLIQUE NAS THUMBNAILS
    ===================================================== */

    thumbnails.forEach((thumbnail) => {

        thumbnail.addEventListener(
            "click",
            () => {

                const index =
                    Number(
                        thumbnail.dataset.index
                    );

                if (
                    Number.isNaN(index) ||
                    index === currentIndex
                ) {

                    restartAutoplay();

                    return;

                }

                showTestimonial(
                    index,
                    index > currentIndex
                        ? "next"
                        : "previous"
                );

            }
        );

    });


    /* =====================================================
       19. SETA PRINCIPAL ESQUERDA
    ===================================================== */

    if (prevButton) {

        prevButton.addEventListener(
            "click",
            () => {

                previousTestimonial();

            }
        );

    }


    /* =====================================================
       20. SETA PRINCIPAL DIREITA
    ===================================================== */

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => {

                nextTestimonial();

            }
        );

    }


    /* =====================================================
       21. SETA DE NAVEGAÇÃO ESQUERDA
    ===================================================== */

    if (navPrevButton) {

        navPrevButton.addEventListener(
            "click",
            () => {

                previousTestimonial();

            }
        );

    }


    /* =====================================================
       22. SETA DE NAVEGAÇÃO DIREITA
    ===================================================== */

    if (navNextButton) {

        navNextButton.addEventListener(
            "click",
            () => {

                nextTestimonial();

            }
        );

    }


    /* =====================================================
       23. AUTOPLAY
    ===================================================== */

    function startAutoplay() {

        clearTimeout(
            autoplayTimer
        );

        autoplayTimer =
            setTimeout(() => {

                nextTestimonial();

            }, AUTOPLAY_TIME);

    }


    /* =====================================================
       24. PARAR AUTOPLAY
    ===================================================== */

    function stopAutoplay() {

        clearTimeout(
            autoplayTimer
        );

    }


    /* =====================================================
       25. REINICIAR AUTOPLAY
    ===================================================== */

    function restartAutoplay() {

        stopAutoplay();

        clearTimeout(
            resumeTimer
        );

        resumeTimer =
            setTimeout(() => {

                startAutoplay();

            }, RESUME_TIME);

    }


    /* =====================================================
       26. PAUSAR QUANDO O MOUSE ESTÁ SOBRE O CARD
    ===================================================== */

    if (testimonialShowcase) {

        testimonialShowcase.addEventListener(
            "mouseenter",
            () => {

                stopAutoplay();

            }
        );

        testimonialShowcase.addEventListener(
            "mouseleave",
            () => {

                startAutoplay();

            }
        );

    }


    /* =====================================================
       27. PAUSAR SOBRE AS THUMBNAILS
    ===================================================== */

    const thumbnailsContainer =
        document.getElementById(
            "testimonialThumbnails"
        );

    if (thumbnailsContainer) {

        thumbnailsContainer.addEventListener(
            "mouseenter",
            () => {

                stopAutoplay();

            }
        );

        thumbnailsContainer.addEventListener(
            "mouseleave",
            () => {

                startAutoplay();

            }
        );

    }


    /* =====================================================
       28. TECLADO
       
       ← anterior
       → próximo
    ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "ArrowLeft") {

                previousTestimonial();

            }

            if (event.key === "ArrowRight") {

                nextTestimonial();

            }

        }
    );


    /* =====================================================
       29. SWIPE MOBILE
    ===================================================== */

    if (testimonialShowcase) {

        testimonialShowcase.addEventListener(
            "touchstart",
            (event) => {

                touchStartX =
                    event.changedTouches[0].screenX;

            },
            {
                passive: true
            }
        );


        testimonialShowcase.addEventListener(
            "touchend",
            (event) => {

                touchEndX =
                    event.changedTouches[0].screenX;

                handleSwipe();

            },
            {
                passive: true
            }
        );

    }


    /* =====================================================
       30. DETECTAR SWIPE
    ===================================================== */

    function handleSwipe() {

        const difference =
            touchStartX -
            touchEndX;


        /* Movimento muito pequeno */

        if (
            Math.abs(difference) < 50
        ) {

            return;

        }


        /* Arrastou para esquerda */

        if (difference > 0) {

            nextTestimonial();

        }


        /* Arrastou para direita */

        else {

            previousTestimonial();

        }

    }


    /* =====================================================
       31. CENTRALIZAR THUMB ATIVA
    ===================================================== */

    function scrollActiveThumbnail() {

        const activeThumbnail =
            document.querySelector(
                ".testimonial-thumb.active"
            );

        if (
            !activeThumbnail ||
            !thumbnailsContainer
        ) {

            return;

        }


        /* No mobile */

        if (
            window.innerWidth < 1050
        ) {

            activeThumbnail.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center"
            });

        }

    }


    /* =====================================================
       32. PAUSA QUANDO A ABA NÃO ESTÁ VISÍVEL
    ===================================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.hidden
            ) {

                stopAutoplay();

            } else {

                startAutoplay();

            }

        }
    );


    /* =====================================================
       33. REDUÇÃO DE MOVIMENTO
    ===================================================== */

    const prefersReducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );


    if (
        prefersReducedMotion.matches
    ) {

        stopAutoplay();

    }


    /* =====================================================
       34. INICIALIZAÇÃO
    ===================================================== */

    function initializeTestimonials() {

        const firstTestimonial =
            testimonials[0];


        /* Imagem */

        mainImage.src =
            firstTestimonial.image;

        mainImage.alt =
            firstTestimonial.alt;


        /* Texto */

        updateTextContent(
            firstTestimonial
        );


        /* Estrelas */

        updateStars();


        /* Thumbnails */

        updateThumbnails();


        /* Progresso */

        updateProgress();


        /* Autoplay */

        if (
            !prefersReducedMotion.matches
        ) {

            startAutoplay();

        }

    }


    /* =====================================================
       35. INICIAR
    ===================================================== */

    initializeTestimonials();


    /* =====================================================
       36. LOG DE DESENVOLVIMENTO
       
       Pode apagar depois.
    ===================================================== */

    console.log(
        "✓ Alencar Odontologia — Avaliações Premium carregadas."
    );

});