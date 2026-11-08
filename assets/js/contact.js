/* =========================================================
   ALENCAR ODONTOLOGIA
   SISTEMA DE CONTATO / AGENDAMENTO PREMIUM
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIGURAÇÕES
       ===================================================== */

    const CONFIG = {

        // Endpoint que receberá os dados do formulário.
        // Quando criarmos o backend, alteraremos somente aqui.
        API_URL: "/api/agendamento",

        // Quantidade máxima de caracteres da mensagem
        MAX_MESSAGE_LENGTH: 500,

        // Animações
        ANIMATION_DURATION: 400

    };


    /* =====================================================
       ELEMENTOS DO FORMULÁRIO
       ===================================================== */

    const form = document.getElementById("appointmentForm");

    if (!form) {
        console.warn("Formulário #appointmentForm não encontrado.");
        return;
    }

    const nameInput = document.getElementById("patientName");
    const whatsappInput = document.getElementById("patientWhatsapp");
    const emailInput = document.getElementById("patientEmail");
    const treatmentInput = document.getElementById("treatment");
    const dateInput = document.getElementById("appointmentDate");
    const periodInput = document.getElementById("appointmentPeriod");
    const messageInput = document.getElementById("patientMessage");

    const contactConsent = document.getElementById("contactConsent");
    const marketingConsent = document.getElementById("marketingConsent");

    const submitButton = document.getElementById("appointmentSubmit");
    const submitText = submitButton?.querySelector(".submit-text");
    const submitArrow = submitButton?.querySelector(".submit-arrow");

    const messageCounter = document.getElementById("messageCounter");

    const successMessage = document.getElementById("formSuccess");
    const errorMessage = document.getElementById("formError");

    const steps = document.querySelectorAll(".form-step");
    const stepLines = document.querySelectorAll(".step-line");


    /* =====================================================
       ESTADO DO FORMULÁRIO
       ===================================================== */

    let isSubmitting = false;


    /* =====================================================
       DATA MÍNIMA
       Impede seleção de datas anteriores a hoje
       ===================================================== */

    function setMinimumDate() {

        if (!dateInput) return;

        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        const todayFormatted = `${year}-${month}-${day}`;

        dateInput.min = todayFormatted;
    }

    setMinimumDate();


    /* =====================================================
       MÁSCARA WHATSAPP
       ===================================================== */

    function formatWhatsapp(value) {

        let numbers = value.replace(/\D/g, "");

        // Limita ao máximo de 11 números
        numbers = numbers.substring(0, 11);

        if (numbers.length <= 2) {
            return numbers.length
                ? `(${numbers}`
                : "";
        }

        if (numbers.length <= 7) {
            return `(${numbers.substring(0, 2)}) ${numbers.substring(2)}`;
        }

        return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`;
    }


    if (whatsappInput) {

        whatsappInput.addEventListener("input", (event) => {

            event.target.value = formatWhatsapp(event.target.value);

            clearFieldError(whatsappInput);

            updateFormProgress();
        });

    }


    /* =====================================================
       CONTADOR DA MENSAGEM
       ===================================================== */

    function updateMessageCounter() {

        if (!messageInput || !messageCounter) return;

        const length = messageInput.value.length;

        messageCounter.textContent =
            `${length}/${CONFIG.MAX_MESSAGE_LENGTH}`;

        if (length >= CONFIG.MAX_MESSAGE_LENGTH * 0.9) {
            messageCounter.classList.add("warning");
        } else {
            messageCounter.classList.remove("warning");
        }
    }


    if (messageInput) {

        messageInput.addEventListener("input", () => {

            updateMessageCounter();

            clearFieldError(messageInput);

            updateFormProgress();
        });

    }

    updateMessageCounter();


    /* =====================================================
       ANIMAÇÃO DOS CAMPOS
       ===================================================== */

    const fields = form.querySelectorAll(
        "input:not([type='checkbox']), select, textarea"
    );


    fields.forEach(field => {

        field.addEventListener("focus", () => {

            const wrapper =
                field.closest(".input-wrapper, .textarea-wrapper");

            if (wrapper) {
                wrapper.classList.add("is-focused");
            }

            const formField = field.closest(".form-field");

            if (formField) {
                formField.classList.add("field-active");
            }

        });


        field.addEventListener("blur", () => {

            const wrapper =
                field.closest(".input-wrapper, .textarea-wrapper");

            if (wrapper) {
                wrapper.classList.remove("is-focused");
            }

            const formField = field.closest(".form-field");

            if (formField) {
                formField.classList.remove("field-active");
            }

        });


        field.addEventListener("input", () => {
            clearFieldError(field);
        });


        field.addEventListener("change", () => {
            clearFieldError(field);
        });

    });


    /* =====================================================
       ERRO VISUAL
       ===================================================== */

    function showFieldError(field, message = "") {

        if (!field) return;

        const formField = field.closest(".form-field");

        if (!formField) return;

        formField.classList.add("field-error");

        field.setAttribute("aria-invalid", "true");

        let errorElement =
            formField.querySelector(".field-error-message");

        if (!errorElement) {

            errorElement = document.createElement("span");

            errorElement.className =
                "field-error-message";

            formField.appendChild(errorElement);
        }

        errorElement.textContent = message;
    }


    /* =====================================================
       REMOVER ERRO
       ===================================================== */

    function clearFieldError(field) {

        if (!field) return;

        const formField = field.closest(".form-field");

        if (!formField) return;

        formField.classList.remove("field-error");

        field.removeAttribute("aria-invalid");

        const errorElement =
            formField.querySelector(".field-error-message");

        if (errorElement) {
            errorElement.remove();
        }
    }


    /* =====================================================
       MENSAGENS GERAIS
       ===================================================== */

    function clearMessages() {

        if (successMessage) {
            successMessage.classList.remove("show");
        }

        if (errorMessage) {
            errorMessage.classList.remove("show");
            errorMessage.textContent = "";
        }
    }


    function showSuccess(message) {

        if (!successMessage) return;

        successMessage.innerHTML = `
            <span class="success-icon">✓</span>
            <span>${message}</span>
        `;

        successMessage.classList.add("show");

        setTimeout(() => {

            successMessage.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }, 100);
    }


    function showError(message) {

        if (!errorMessage) return;

        errorMessage.innerHTML = `
            <span class="error-icon">!</span>
            <span>${message}</span>
        `;

        errorMessage.classList.add("show");

        setTimeout(() => {

            errorMessage.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }, 100);
    }


    /* =====================================================
       VALIDAÇÃO DO NOME
       ===================================================== */

    function validateName() {

        const value = nameInput.value.trim();

        if (!value) {

            showFieldError(
                nameInput,
                "Informe seu nome completo."
            );

            return false;
        }


        if (value.length < 3) {

            showFieldError(
                nameInput,
                "Digite um nome válido."
            );

            return false;
        }

        return true;
    }


    /* =====================================================
       VALIDAÇÃO WHATSAPP
       ===================================================== */

    function validateWhatsapp() {

        const value =
            whatsappInput.value.replace(/\D/g, "");

        if (!value) {

            showFieldError(
                whatsappInput,
                "Informe seu WhatsApp."
            );

            return false;
        }


        if (value.length !== 10 && value.length !== 11) {

            showFieldError(
                whatsappInput,
                "Digite um WhatsApp válido."
            );

            return false;
        }

        return true;
    }


    /* =====================================================
       VALIDAÇÃO EMAIL
       ===================================================== */

    function validateEmail() {

        const value =
            emailInput.value.trim();

        // E-mail é opcional
        if (!value) {
            return true;
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(value)) {

            showFieldError(
                emailInput,
                "Digite um e-mail válido."
            );

            return false;
        }

        return true;
    }


    /* =====================================================
       VALIDAÇÃO PROCEDIMENTO
       ===================================================== */

    function validateTreatment() {

        if (!treatmentInput.value) {

            showFieldError(
                treatmentInput,
                "Selecione como podemos ajudar."
            );

            return false;
        }

        return true;
    }


    /* =====================================================
       VALIDAÇÃO DATA
       ===================================================== */

    function validateDate() {

        if (!dateInput.value) {

            showFieldError(
                dateInput,
                "Escolha uma data."
            );

            return false;
        }

        const selectedDate =
            new Date(dateInput.value + "T00:00:00");

        const today = new Date();

        today.setHours(0, 0, 0, 0);


        if (selectedDate < today) {

            showFieldError(
                dateInput,
                "Escolha uma data a partir de hoje."
            );

            return false;
        }

        return true;
    }


    /* =====================================================
       VALIDAÇÃO PERÍODO
       ===================================================== */

    function validatePeriod() {

        if (!periodInput.value) {

            showFieldError(
                periodInput,
                "Escolha o melhor período."
            );

            return false;
        }

        return true;
    }


    /* =====================================================
       VALIDAÇÃO CONSENTIMENTO
       ===================================================== */

    function validateConsent() {

        if (!contactConsent.checked) {

            contactConsent
                .closest(".consent-card")
                ?.classList.add("consent-error");

            return false;
        }

        contactConsent
            .closest(".consent-card")
            ?.classList.remove("consent-error");

        return true;
    }


    if (contactConsent) {

        contactConsent.addEventListener("change", () => {

            if (contactConsent.checked) {

                contactConsent
                    .closest(".consent-card")
                    ?.classList.remove("consent-error");

            }

        });

    }


    /* =====================================================
       VALIDAÇÃO COMPLETA
       ===================================================== */

    function validateForm() {

        clearMessages();

        const validations = [

            validateName(),

            validateWhatsapp(),

            validateEmail(),

            validateTreatment(),

            validateDate(),

            validatePeriod(),

            validateConsent()

        ];


        const isValid =
            validations.every(Boolean);


        if (!isValid) {

            const firstError =
                form.querySelector(
                    ".field-error input, " +
                    ".field-error select, " +
                    ".field-error textarea"
                );

            if (firstError) {

                setTimeout(() => {

                    firstError.focus();

                    firstError.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                }, 100);

            }

            return false;
        }


        return true;
    }


    /* =====================================================
       PROGRESSO / ETAPAS
       ===================================================== */

    function updateFormProgress() {

        if (!steps.length) return;

        const fieldsToCheck = [

            nameInput,
            whatsappInput,
            emailInput,
            treatmentInput,
            dateInput,
            periodInput,
            messageInput

        ];


        const filledFields =
            fieldsToCheck.filter(field => {

                if (!field) return false;

                return field.value.trim() !== "";

            }).length;


        const percentage =
            filledFields / fieldsToCheck.length;


        let activeStep = 1;


        if (percentage >= 0.66) {

            activeStep = 3;

        } else if (percentage >= 0.33) {

            activeStep = 2;

        }


        steps.forEach((step, index) => {

            const stepNumber = index + 1;

            step.classList.toggle(
                "active",
                stepNumber <= activeStep
            );

            step.classList.toggle(
                "completed",
                stepNumber < activeStep
            );

        });


        stepLines.forEach((line, index) => {

            line.classList.toggle(
                "active",
                index < activeStep - 1
            );

        });

    }


    fields.forEach(field => {

        field.addEventListener(
            "input",
            updateFormProgress
        );

        field.addEventListener(
            "change",
            updateFormProgress
        );

    });


    updateFormProgress();


    /* =====================================================
       BOTÃO - ESTADO NORMAL
       ===================================================== */

    function resetSubmitButton() {

        if (!submitButton) return;

        submitButton.disabled = false;

        submitButton.classList.remove("is-loading");

        if (submitText) {

            submitText.textContent =
                "Solicitar minha avaliação";

        }

        if (submitArrow) {

            submitArrow.textContent = "→";

        }

    }


    /* =====================================================
       BOTÃO - ESTADO ENVIANDO
       ===================================================== */

    function setSubmittingState() {

        if (!submitButton) return;

        submitButton.disabled = true;

        submitButton.classList.add("is-loading");

        if (submitText) {

            submitText.textContent =
                "Enviando solicitação...";

        }

        if (submitArrow) {

            submitArrow.innerHTML =
                `<span class="submit-spinner"></span>`;

        }

    }


    /* =====================================================
       COLETAR DADOS
       ===================================================== */

    function collectFormData() {

        return {

            name:
                nameInput.value.trim(),

            whatsapp:
                whatsappInput.value.trim(),

            whatsappClean:
                whatsappInput.value
                    .replace(/\D/g, ""),

            email:
                emailInput.value.trim(),

            treatment:
                treatmentInput.value,

            treatmentLabel:
                treatmentInput.options[
                    treatmentInput.selectedIndex
                ]?.text || "",

            date:
                dateInput.value,

            period:
                periodInput.value,

            periodLabel:
                periodInput.options[
                    periodInput.selectedIndex
                ]?.text || "",

            message:
                messageInput.value.trim(),

            contactConsent:
                contactConsent.checked,

            marketingConsent:
                marketingConsent.checked,

            submittedAt:
                new Date().toISOString(),

            source:
                window.location.href,

            page:
                document.title

        };

    }


    /* =====================================================
       ENVIO PARA BACKEND
       ===================================================== */

    async function sendToBackend(data) {

       const response = await fetch(
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
        ? "http://localhost:3000/api/agendamento"
        : "/api/agendamento",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(data)
    }
);

let result = null;

try {
    result = await response.json();
} catch (error) {
    result = null;
}

if (!response.ok) {
    throw new Error(
        result?.message || "Não foi possível enviar sua solicitação."
    );
}

return result;
    }

    /* =====================================================
       SUBMIT PRINCIPAL
       ===================================================== */

    form.addEventListener("submit", async (event) => {

        event.preventDefault();


        // Impede duplo clique
        if (isSubmitting) {
            return;
        }


        if (!validateForm()) {

            return;
        }


        isSubmitting = true;

        clearMessages();

        setSubmittingState();


        const data =
            collectFormData();


        try {

            /*
             * Envia para o backend.
             */
            const result =
                await sendToBackend(data);


            console.log(
                "Solicitação enviada:",
                result
            );


            /* =============================================
               SUCESSO
               ============================================= */

            showSuccess(
                "Solicitação enviada com sucesso! " +
                "Nossa equipe entrará em contato em breve."
            );


            /*
             * Reseta o formulário.
             */
            form.reset();


            updateMessageCounter();

            updateFormProgress();


            /*
             * Mantém a data mínima depois do reset.
             */
            setMinimumDate();


        } catch (error) {

            console.error(
                "Erro ao enviar formulário:",
                error
            );


            /* =============================================
               ERRO
               ============================================= */

            showError(
                error.message ||
                "Não conseguimos enviar sua solicitação. " +
                "Verifique sua conexão e tente novamente."
            );


        } finally {

            isSubmitting = false;

            resetSubmitButton();

        }

    });


    /* =====================================================
       ACESSIBILIDADE
       ===================================================== */

    if (nameInput) {
        nameInput.setAttribute(
            "aria-required",
            "true"
        );
    }

    if (whatsappInput) {
        whatsappInput.setAttribute(
            "aria-required",
            "true"
        );
    }

    if (treatmentInput) {
        treatmentInput.setAttribute(
            "aria-required",
            "true"
        );
    }

    if (dateInput) {
        dateInput.setAttribute(
            "aria-required",
            "true"
        );
    }

    if (periodInput) {
        periodInput.setAttribute(
            "aria-required",
            "true"
        );
    }


    /* =====================================================
       ANIMAÇÃO DE ENTRADA
       ===================================================== */

    const formFields =
        document.querySelectorAll(
            ".appointment-form .form-field, " +
            ".appointment-form .consent-card, " +
            ".appointment-form .form-footer"
        );


    formFields.forEach((element, index) => {

        element.style.setProperty(
            "--animation-delay",
            `${index * 60}ms`
        );

        element.classList.add(
            "form-element-ready"
        );

    });


    /* =====================================================
       LOG
       ===================================================== */

    console.log(
        "✓ Sistema de formulário Alencar Odontologia carregado."
    );

});