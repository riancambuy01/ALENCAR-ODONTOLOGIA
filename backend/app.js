
const express = require("express");
const Database = require("better-sqlite3");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const cors = require("cors");

const app = express();
console.log("Iniciando a API de Agendamentos...");
const PORT = Number(process.env.PORT) || 3000;

// Banco de dados persistente.
const dataDirectory = path.join(__dirname, "data");
fs.mkdirSync(dataDirectory, { recursive: true });

const db = new Database(path.join(dataDirectory, "agendamentos.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        whatsapp TEXT NOT NULL,
        email TEXT,
        treatment TEXT NOT NULL,
        appointment_date TEXT NOT NULL,
        period TEXT NOT NULL,
        message TEXT,
        contact_consent INTEGER NOT NULL,
        marketing_consent INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pendente',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
`);

app.disable("x-powered-by");
app.use(helmet());
// Desenvolvimento local: permitir o Live Server.
app.use(cors({
    origin: (origin, callback) => {
        // Permite ferramentas locais sem origem, como alguns testes.
        if (!origin) return callback(null, true);

        try {
            const url = new URL(origin);
            const isLocalhost =
                url.protocol === "http:" &&
                ["localhost", "127.0.0.1"].includes(url.hostname);

            if (isLocalhost) {
                return callback(null, true);
            }
        } catch (_) {
            // Origem inválida.
        }

        return callback(new Error("Origem não permitida pelo CORS."));
    }
}));
app.use(express.json({ limit: "10kb" }));

// Limite básico de solicitações por IP.
app.use(
    "/api/",
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 20,
        standardHeaders: "draft-7",
        legacyHeaders: false,
        message: {
            message: "Muitas tentativas. Aguarde alguns minutos e tente novamente."
        }
    })
);

function isText(value, maxLength) {
    return typeof value === "string" &&
        value.trim().length > 0 &&
        value.trim().length <= maxLength;
}

function localToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Rota de saúde: não revela informações pessoais.
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        service: "Alencar Odontologia - API de Agendamentos"
    });
});

const insertAppointment = db.prepare(`
    INSERT INTO appointments (
        name,
        whatsapp,
        email,
        treatment,
        appointment_date,
        period,
        message,
        contact_consent,
        marketing_consent
    )
    VALUES (
        @name,
        @whatsapp,
        @email,
        @treatment,
        @appointment_date,
        @period,
        @message,
        @contact_consent,
        @marketing_consent
    )
`);

app.post("/api/agendamento", (req, res) => {
    try {
        const body = req.body;

        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return res.status(400).json({
                message: "Envie os dados do agendamento em formato válido."
            });
        }

        const name = typeof body.name === "string"
            ? body.name.trim()
            : "";

        const whatsapp = String(
            body.whatsappClean || body.whatsapp || ""
        ).replace(/\D/g, "");

        const email = typeof body.email === "string"
            ? body.email.trim()
            : "";

        const treatment = typeof body.treatment === "string"
            ? body.treatment.trim()
            : "";

        const date = typeof body.date === "string"
            ? body.date.trim()
            : "";

        const period = typeof body.period === "string"
            ? body.period.trim()
            : "";

        const message = typeof body.message === "string"
            ? body.message.trim()
            : "";

        if (!isText(name, 120) || name.length < 3) {
            return res.status(400).json({
                message: "Informe um nome válido."
            });
        }

        if (!/^\d{10,11}$/.test(whatsapp)) {
            return res.status(400).json({
                message: "Informe um WhatsApp brasileiro válido com DDD."
            });
        }

        if (email.length > 254 ||
            (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
            return res.status(400).json({
                message: "Informe um e-mail válido ou deixe o campo vazio."
            });
        }

        if (!isText(treatment, 120)) {
            return res.status(400).json({
                message: "Selecione o tratamento desejado."
            });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                message: "Selecione uma data válida."
            });
        }

        const parsedDate = new Date(`${date}T00:00:00Z`);

        if (
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !== date
        ) {
            return res.status(400).json({
                message: "A data informada não é válida."
            });
        }

        if (date < localToday()) {
            return res.status(400).json({
                message: "A data deve ser hoje ou uma data futura."
            });
        }

        if (!isText(period, 50)) {
            return res.status(400).json({
                message: "Selecione o período desejado."
            });
        }

        if (message.length > 500) {
            return res.status(400).json({
                message: "A mensagem deve ter no máximo 500 caracteres."
            });
        }

        if (body.contactConsent !== true) {
            return res.status(400).json({
                message: "É necessário autorizar o contato para enviar a solicitação."
            });
        }

        const result = insertAppointment.run({
            name,
            whatsapp,
            email: email || null,
            treatment,
            appointment_date: date,
            period,
            message,
            contact_consent: 1,
            marketing_consent: body.marketingConsent === true ? 1 : 0
        });

        return res.status(201).json({
            success: true,
            message: "Solicitação registrada com sucesso.",
            appointment: {
                id: result.lastInsertRowid,
                status: "pendente"
            }
        });
    } catch (error) {
        console.error("Erro interno ao registrar solicitação.");

        return res.status(500).json({
            message: "Não foi possível registrar a solicitação agora. Tente novamente."
        });
    }
});

// JSON inválido ou corpo de requisição malformado.
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && "body" in error) {
        return res.status(400).json({
            message: "O formato dos dados enviados é inválido."
        });
    }

    return res.status(500).json({
        message: "Ocorreu um erro interno."
    });
});

app.listen(PORT, () => {
    console.log(`API disponível em http://localhost:${PORT}`);
    console.log(`Teste de saúde: http://localhost:${PORT}/api/health`);
});