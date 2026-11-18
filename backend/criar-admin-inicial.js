
const Database = require("better-sqlite3");
const crypto = require("crypto");
const path = require("path");
const readline = require("readline");
const { promisify } = require("util");

const scrypt = promisify(crypto.scrypt);

const ADMIN = {
  name: "Rian Cambuy",
  email: "rianpereirapi09@gmail.com",
  clinicSlug: "alencar-odontologia"
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function perguntar(texto) {
  return new Promise((resolve) => {
    rl.question(texto, resolve);
  });
}

async function main() {
  const db = new Database(
    path.join(__dirname, "data", "agendamentos.db")
  );

  try {
    const clinic = db.prepare(`
      SELECT id, name
      FROM clinics
      WHERE slug = ? AND active = 1
    `).get(ADMIN.clinicSlug);

    if (!clinic) {
      throw new Error("Clínica não encontrada ou inativa.");
    }

    const existingUser = db.prepare(`
      SELECT id FROM users WHERE email = ?
    `).get(ADMIN.email);

    if (existingUser) {
      throw new Error("Este e-mail já está cadastrado.");
    }

    const password = await perguntar("Digite sua senha: ");

    if (password.length < 12) {
      throw new Error("A senha precisa ter pelo menos 12 caracteres.");
    }

    const confirmation = await perguntar("Confirme sua senha: ");

    if (password !== confirmation) {
      throw new Error("As senhas não coincidem.");
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const hash = await scrypt(password, salt, 64);

    const passwordHash =
      `scrypt$${salt}$${hash.toString("hex")}`;

    db.prepare(`
      INSERT INTO users (
        clinic_id,
        name,
        email,
        password_hash,
        role,
        active
      )
      VALUES (?, ?, ?, ?, 'admin', 1)
    `).run(
      clinic.id,
      ADMIN.name,
      ADMIN.email,
      passwordHash
    );

    console.log("\nADMINISTRADOR CRIADO COM SUCESSO!");
    console.log("Nome:", ADMIN.name);
    console.log("E-mail:", ADMIN.email);
    console.log("Clínica:", clinic.name);
    console.log("Perfil: Administrador");

  } finally {
    rl.close();
    db.close();
  }
}

main().catch((error) => {
  console.error("\nERRO:", error.message);
  process.exitCode = 1;
});
