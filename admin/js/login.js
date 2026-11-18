
"use strict";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginButton = document.getElementById("loginButton");
const buttonText = document.getElementById("buttonText");
const loginMessage = document.getElementById("loginMessage");

function showMessage(message, type = "error") {
    loginMessage.textContent = message;
    loginMessage.className = `login-message ${type}`;
}

function clearMessage() {
    loginMessage.textContent = "";
    loginMessage.className = "login-message";
}

function setLoading(isLoading) {
    loginButton.disabled = isLoading;
    buttonText.textContent = isLoading
        ? "Verificando acesso..."
        : "Entrar no painel";
}

async function checkExistingSession() {
    try {
        const response = await fetch("/api/admin/me", {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json"
            }
        });

        if (response.ok) {
            window.location.replace("/admin/painel.html");
        }
    } catch (error) {
        console.error("Não foi possível verificar a sessão:", error);
    }
}

togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.textContent = isPassword ? "Ocultar" : "Mostrar";
    togglePassword.setAttribute(
        "aria-label",
        isPassword ? "Ocultar senha" : "Mostrar senha"
    );
});

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showMessage("Preencha o e-mail e a senha para continuar.");
        return;
    }

    setLoading(true);

    try {
        const response = await fetch("/api/admin/login", {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("E-mail ou senha incorretos.");
            }

            if (response.status === 429) {
                throw new Error(
                    "Muitas tentativas de acesso. Aguarde alguns minutos e tente novamente."
                );
            }

            throw new Error(
                data.message || data.error || "Não foi possível realizar o login."
            );
        }

        showMessage("Acesso autorizado! Abrindo o painel...", "success");

        loginButton.disabled = true;
        buttonText.textContent = "Acesso autorizado";

        window.location.replace("/admin/painel.html");

    } catch (error) {
        console.error("Erro no login:", error);

        showMessage(
            error.message || "Erro de conexão. Verifique se o servidor está ativo."
        );

        setLoading(false);
    }
});

checkExistingSession();
