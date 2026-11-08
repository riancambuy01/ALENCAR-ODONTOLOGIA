/* =========================================================
   ALENCAR ODONTOLOGIA
   WHATSAPP FLUTUANTE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const whatsappButton =
        document.getElementById("whatsappFloat");


    /* =====================================================
       VERIFICAÇÃO
    ===================================================== */

    if (!whatsappButton) {

        console.warn(
            "WhatsApp Float: botão não encontrado."
        );

        return;

    }


    /* =====================================================
       CLIQUE
    ===================================================== */

    whatsappButton.addEventListener("click", () => {

        whatsappButton.classList.add("is-clicked");


        setTimeout(() => {

            whatsappButton.classList.remove("is-clicked");

        }, 500);

    });


    /* =====================================================
       ACESSIBILIDADE
    ===================================================== */

    whatsappButton.addEventListener("keydown", (event) => {

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {

            event.preventDefault();

            whatsappButton.click();

        }

    });


    /* =====================================================
       PEQUENO EFEITO DE ATENÇÃO
    ===================================================== */

    let attentionTimer;


    function attentionEffect() {

        if (
            document.hidden ||
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {

            return;

        }


        whatsappButton.classList.add(
            "whatsapp-attention"
        );


        setTimeout(() => {

            whatsappButton.classList.remove(
                "whatsapp-attention"
            );

        }, 900);

    }


    /* =====================================================
       PRIMEIRO EFEITO
    ===================================================== */

    setTimeout(() => {

        attentionEffect();

    }, 5000);


    /* =====================================================
       REPETE PERIODICAMENTE
       SEM FICAR CHAMANDO ATENÇÃO DEMAIS
    ===================================================== */

    attentionTimer = setInterval(() => {

        attentionEffect();

    }, 18000);


    /* =====================================================
       LIMPEZA
    ===================================================== */

    window.addEventListener(
        "beforeunload",
        () => {

            clearInterval(attentionTimer);

        }
    );

});