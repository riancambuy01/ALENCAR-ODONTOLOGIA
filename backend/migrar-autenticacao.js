
const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "data", "agendamentos.db");
const db = new Database(dbPath);

try {
    db.pragma("foreign_keys = ON");

    const migration = db.transaction(() => {
        // Usuários administrativos vinculados às clínicas
        db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                clinic_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                email TEXT NOT NULL COLLATE NOCASE UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'admin'
                    CHECK (role IN ('admin', 'manager')),
                active INTEGER NOT NULL DEFAULT 1
                    CHECK (active IN (0, 1)),
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (clinic_id)
                    REFERENCES clinics(id)
                    ON DELETE RESTRICT
            );
        `);

        // Sessões administrativas
        db.exec(`
            CREATE TABLE IF NOT EXISTS admin_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token_hash TEXT NOT NULL UNIQUE,
                expires_at INTEGER NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            );
        `);

        // Índices para consultas e autenticação
        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_users_clinic
            ON users (clinic_id, active);
        `);

        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_admin_sessions_user
            ON admin_sessions (user_id, expires_at);
        `);

        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_admin_sessions_expiration
            ON admin_sessions (expires_at);
        `);
    });

    migration();

    console.log("\n==================================");
    console.log("MIGRAÇÃO DE AUTENTICAÇÃO CONCLUÍDA");
    console.log("==================================");

    const tables = db.prepare(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name IN ('users', 'admin_sessions')
        ORDER BY name
    `).all();

    console.log("Tabelas criadas:");
    console.table(tables);

    console.log("Agendamentos preservados:",
        db.prepare("SELECT COUNT(*) AS total FROM appointments").get().total
    );

    console.log("Clínicas preservadas:",
        db.prepare("SELECT COUNT(*) AS total FROM clinics").get().total
    );

    console.log("==================================\n");

} catch (error) {
    console.error("ERRO NA MIGRAÇÃO:", error.message);
    process.exitCode = 1;

} finally {
    db.close();
}
