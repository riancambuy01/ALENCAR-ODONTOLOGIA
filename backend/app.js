
const express = require("express");
const Database = require("better-sqlite3");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { promisify } = require("util");
require("dotenv").config();
const cors = require("cors");

const scrypt = promisify(crypto.scrypt);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const SESSION_DURATION = 8 * 60 * 60 * 1000;
const COOKIE_NAME = "alpha_admin_session";

console.log("Iniciando a API Alpha Odonto Digital...");

// BANCO DE DADOS
const dataDirectory = path.join(__dirname, "data");
fs.mkdirSync(dataDirectory, { recursive: true });

const db = new Database(
  path.join(dataDirectory, "agendamentos.db")
);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// VERIFICAR ESTRUTURA MULTICLÍNICA
const clinicColumn = db.prepare(`
  PRAGMA table_info(appointments)
`).all().some(column => column.name === "clinic_id");

if (!clinicColumn) {
  throw new Error("Banco não migrado para múltiplas clínicas.");
}

// CLÍNICA DO FORMULÁRIO PÚBLICO ATUAL
const clinic = db.prepare(`
  SELECT id, name, slug
  FROM clinics
  WHERE slug = ? AND active = 1
`).get("alencar-odontologia");

if (!clinic) {
  throw new Error("Clínica Alencar não encontrada ou inativa.");
}

console.log(`Clínica ativa: ${clinic.name} (ID ${clinic.id})`);

app.disable("x-powered-by");
app.use(helmet());

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    try {
      const url = new URL(origin);

      const isLocalhost =
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname);

      if (isLocalhost) {
        return callback(null, true);
      }
    } catch (error) {
      // Origem inválida
    }

    return callback(new Error("Origem não permitida pelo CORS."));
  },
  credentials: true
}));

app.use(express.json({ limit: "10kb" }));

// LIMITADORES
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message: "Muitas tentativas de login. Aguarde 15 minutos."
  }
});

const appointmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message: "Muitas solicitações. Aguarde alguns minutos."
  }
});

// FUNÇÕES AUXILIARES
function isText(value, maxLength) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength
  );
}

function localToday() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getCookie(req, name) {
  const header = req.headers.cookie;

  if (!header) return null;

  const cookies = header.split(";");

  for (const cookie of cookies) {
    const separator = cookie.indexOf("=");

    if (separator === -1) continue;

    const key = cookie.slice(0, separator).trim();
    const value = cookie.slice(separator + 1).trim();

    if (key === name) {
      try {
        return decodeURIComponent(value);
      } catch {
        return null;
      }
    }
  }

  return null;
}

function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === "production";

  const cookie = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${SESSION_DURATION / 1000}`,
    secure ? "Secure" : ""
  ].filter(Boolean).join("; ");

  res.setHeader("Set-Cookie", cookie);
}

function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === "production";

  const cookie = [
    `${COOKIE_NAME}=`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    "Max-Age=0",
    secure ? "Secure" : ""
  ].filter(Boolean).join("; ");

  res.setHeader("Set-Cookie", cookie);
}

async function verifyPassword(password, storedHash) {
  try {
    const parts = storedHash.split("$");

    if (parts.length !== 3 || parts[0] !== "scrypt") {
      return false;
    }

    const salt = parts[1];
    const originalHash = Buffer.from(parts[2], "hex");

    if (originalHash.length !== 64) return false;

    const calculatedHash = await scrypt(password, salt, 64);

    return crypto.timingSafeEqual(
      originalHash,
      calculatedHash
    );
  } catch {
    return false;
  }
}

// AUTENTICAÇÃO ADMINISTRATIVA
async function requireAdmin(req, res, next) {
  try {
    const token = getCookie(req, COOKIE_NAME);

    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
    if (req.accepts("html")) {
        return res.redirect("/admin/login.html");
    }

    return res.status(401).json({
        message: "Autenticação necessária."
    });
  }

    const tokenHash = hashToken(token);

    const session = db.prepare(`
      SELECT
        s.id AS session_id,
        u.id AS user_id,
        u.name,
        u.email,
        u.role,
        c.id AS clinic_id,
        c.name AS clinic_name,
        c.slug AS clinic_slug
      FROM admin_sessions s
      JOIN users u ON u.id = s.user_id
      JOIN clinics c ON c.id = u.clinic_id
      WHERE s.token_hash = ?
        AND s.expires_at > ?
        AND u.active = 1
        AND c.active = 1
    `).get(tokenHash, Date.now());

if (!session) {
    clearSessionCookie(res);

    if (req.accepts("html")) {
        return res.redirect("/admin/login.html");
    }

    return res.status(401).json({
        message: "Sua sessão expirou. Faça login novamente."
    });
}

    req.admin = {
      sessionId: session.session_id,
      userId: session.user_id,
      name: session.name,
      email: session.email,
      role: session.role,
      clinicId: session.clinic_id,
      clinicName: session.clinic_name,
      clinicSlug: session.clinic_slug
    };

    next();
  } catch (error) {
    console.error("Erro na autenticação:", error.message);

    return res.status(500).json({
      message: "Erro ao verificar autenticação."
    });
  }
}


/* =========================================
   ACESSO ÀS PÁGINAS ADMINISTRATIVAS
========================================= */

const adminDirectory = path.join(__dirname, "..", "admin");

// Login: acesso público
app.get("/admin/login.html", (req, res) => {
    res.sendFile(path.join(adminDirectory, "login.html"));
});

// Painel: somente usuários autenticados
app.get("/admin/painel.html", requireAdmin, (req, res) => {
    res.sendFile(path.join(adminDirectory, "painel.html"));
});

// Arquivos estáticos: CSS, JavaScript e imagens
app.use(
    "/admin",
    express.static(adminDirectory, {
        index: false
    })
);


// ROTA DE SAÚDE
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Alpha Odonto Digital",
    clinic: clinic.name
  });
});

// LOGIN ADMINISTRATIVO
app.post("/api/admin/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      email.length > 254 ||
      password.length < 1 ||
      password.length > 256
    ) {
      return res.status(400).json({
        message: "Informe e-mail e senha válidos."
      });
    }

    const user = db.prepare(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.password_hash,
        u.role,
        u.active,
        c.id AS clinic_id,
        c.name AS clinic_name,
        c.slug AS clinic_slug,
        c.active AS clinic_active
      FROM users u
      JOIN clinics c ON c.id = u.clinic_id
      WHERE u.email = ?
    `).get(email.trim());

    if (
      !user ||
      user.active !== 1 ||
      user.clinic_active !== 1
    ) {
      return res.status(401).json({
        message: "E-mail ou senha incorretos."
      });
    }
    const passwordIsValid = await verifyPassword(
      password,
      user.password_hash
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        message: "E-mail ou senha incorretos."
      });
    }

    // REMOVER SESSÕES EXPIRADAS
    db.prepare(`
      DELETE FROM admin_sessions
      WHERE expires_at <= ?
    `).run(Date.now());

    // GERAR TOKEN ALEATÓRIO
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = Date.now() + SESSION_DURATION;

    // ARMAZENAR SOMENTE O HASH DO TOKEN
    db.prepare(`
      INSERT INTO admin_sessions (
        user_id,
        token_hash,
        expires_at
      )
      VALUES (?, ?, ?)
    `).run(user.id, tokenHash, expiresAt);

    setSessionCookie(res, token);

    return res.json({
      success: true,
      message: "Login realizado com sucesso.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      clinic: {
        id: user.clinic_id,
        name: user.clinic_name,
        slug: user.clinic_slug
      }
    });

  } catch (error) {
    console.error("ERRO COMPLETO NO LOGIN:", error);

    return res.status(500).json({
        message: "Não foi possível realizar o login."
    });
}
});

// VERIFICAR USUÁRIO AUTENTICADO
app.get("/api/admin/me", requireAdmin, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      id: req.admin.userId,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role
    },
    clinic: {
      id: req.admin.clinicId,
      name: req.admin.clinicName,
      slug: req.admin.clinicSlug
    }
  });
});

// ENCERRAR SESSÃO
app.post("/api/admin/logout", (req, res) => {
  try {
    const token = getCookie(req, COOKIE_NAME);

    if (token && /^[a-f0-9]{64}$/i.test(token)) {
      db.prepare(`
        DELETE FROM admin_sessions
        WHERE token_hash = ?
      `).run(hashToken(token));
    }

    clearSessionCookie(res);

    return res.json({
      success: true,
      message: "Sessão encerrada."
    });

  } catch (error) {
    console.error("Erro no logout:", error.message);

    return res.status(500).json({
      message: "Não foi possível encerrar a sessão."
    });
  }
});

// ROTA DE TESTE PROTEGIDA
app.get("/api/admin/dashboard", requireAdmin, (req, res) => {
  const total = db.prepare(`
    SELECT COUNT(*) AS total
    FROM appointments
    WHERE clinic_id = ?
  `).get(req.admin.clinicId);

  const pending = db.prepare(`
    SELECT COUNT(*) AS total
    FROM appointments
    WHERE clinic_id = ?
      AND status = 'pendente'
  `).get(req.admin.clinicId);

  return res.json({
    clinic: req.admin.clinicName,
    appointments: {
      total: total.total,
      pending: pending.total
    }
  });
});


// LISTAR AGENDAMENTOS DA CLÍNICA
app.get("/api/admin/appointments", requireAdmin, (req, res) => {
  try {
    const appointments = db.prepare(`
      SELECT
        id,
        name,
        treatment,
        appointment_date,
        period,
        status
      FROM appointments
      WHERE clinic_id = ?
      ORDER BY
        appointment_date ASC,
        CASE period
          WHEN 'manha' THEN 1
          WHEN 'tarde' THEN 2
          WHEN 'noite' THEN 3
          ELSE 4
        END ASC,
        id DESC
    `).all(req.admin.clinicId);

    return res.json({
      success: true,
      total: appointments.length,
      appointments
    });

  } catch (error) {
    console.error("Erro ao listar agendamentos:", error);

    return res.status(500).json({
      message: "Não foi possível carregar os agendamentos."
    });
  }
});


 // ATUALIZAR STATUS DO AGENDAMENTO
app.patch("/api/admin/appointments/:id/status", requireAdmin, (req, res) => {
  try {
    const appointmentId = Number(req.params.id);
    const { status } = req.body || {};

    const allowedStatuses = [
      "pendente",
      "confirmado",
      "concluido",
      "cancelado"
    ];

    if (!Number.isSafeInteger(appointmentId) || appointmentId <= 0) {
      return res.status(400).json({
        message: "Identificador de agendamento inválido."
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Status informado inválido."
      });
    }

    const result = db.prepare(`
      UPDATE appointments
      SET status = ?
      WHERE id = ? AND clinic_id = ?
    `).run(status, appointmentId, req.admin.clinicId);

    if (result.changes === 0) {
      return res.status(404).json({
        message: "Agendamento não encontrado."
      });
    }

    return res.json({
      success: true,
      message: "Status atualizado com sucesso.",
      appointment: {
        id: appointmentId,
        status
      }
    });

  } catch (error) {
    console.error("Erro ao atualizar status:", error);

    return res.status(500).json({
      message: "Não foi possível atualizar o agendamento."
    });
  }
});


// INSERÇÃO DE AGENDAMENTO
const insertAppointment = db.prepare(`
  INSERT INTO appointments (
    clinic_id,
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
    @clinic_id,
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

app.post("/api/agendamento", appointmentLimiter, (req, res) => {
  try {
    const body = req.body;

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return res.status(400).json({
        message: "Envie os dados do agendamento em formato válido."
      });
    }

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const whatsapp = String(
      body.whatsappClean || body.whatsapp || ""
    ).replace(/\D/g, "");

    const email =
      typeof body.email === "string" ? body.email.trim() : "";

    const treatment =
      typeof body.treatment === "string"
        ? body.treatment.trim()
        : "";

    const date =
      typeof body.date === "string" ? body.date.trim() : "";

    const period =
      typeof body.period === "string"
        ? body.period.trim()
        : "";

    const message =
      typeof body.message === "string"
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

    if (
      email.length > 254 ||
      (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ) {
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
      clinic_id: clinic.id,
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
    console.error("Erro ao registrar agendamento:", error.message);

    return res.status(500).json({
      message: "Não foi possível registrar a solicitação agora."
    });
  }
});

// TRATAMENTO DE ERROS
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      message: "O formato dos dados enviados é inválido."
    });
  }

  if (res.headersSent) {
    return next(error);
  }

  if (error.message?.includes("CORS")) {
    return res.status(403).json({
      message: "Origem não autorizada."
    });
  }

  console.error("Erro na API:", error.message);

  return res.status(500).json({
    message: "Ocorreu um erro interno."
  });
});

// INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`API disponível em http://localhost:${PORT}`);
  console.log(`Saúde: http://localhost:${PORT}/api/health`);
  console.log(`Painel: http://localhost:${PORT}/admin/painel.html`);
});
