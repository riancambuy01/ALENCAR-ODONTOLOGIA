const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "data", "agendamentos.db");
const db = new Database(dbPath);

try {
    db.pragma("foreign_keys = ON");

    const migration = db.transaction(() => {
        // 1. Criar a tabela de clínicas
        db.exec(`
            CREATE TABLE IF NOT EXISTS clinics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                slug TEXT NOT NULL UNIQUE,
                logo_url TEXT,
                primary_color TEXT DEFAULT '#0D4B70',
                secondary_color TEXT DEFAULT '#67C9ED',
                whatsapp TEXT,
                email TEXT,
                active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Verificar se a coluna clinic_id já existe
        const columns = db.prepare(`
            PRAGMA table_info(appointments)
        `).all();

        const hasClinicId = columns.some(
            column => column.name === "clinic_id"
        );

        // 3. Adicionar a coluna, caso ainda não exista
        if (!hasClinicId) {
            db.exec(`
                ALTER TABLE appointments
                ADD COLUMN clinic_id INTEGER
                REFERENCES clinics(id);
            `);
        }

        // 4. Cadastrar a primeira clínica
        db.prepare(`
            INSERT OR IGNORE INTO clinics (name, slug)
            VALUES (?, ?)
        `).run("Alencar Odontologia", "alencar-odontologia");

        const clinic = db.prepare(`
            SELECT id
            FROM clinics
            WHERE slug = ?
        `).get("alencar-odontologia");

        if (!clinic) {
            throw new Error("Não foi possível localizar a clínica Alencar.");
        }

        // 5. Vincular os agendamentos antigos à Alencar
        const result = db.prepare(`
            UPDATE appointments
            SET clinic_id = ?
            WHERE clinic_id IS NULL
        `).run(clinic.id);

        // 6. Criar índice para consultas por clínica
        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_appointments_clinic
            ON appointments (clinic_id, appointment_date, period);
        `);

        // 7. Impedir novos agendamentos sem clínica
        db.exec(`
            CREATE TRIGGER IF NOT EXISTS appointments_require_clinic_insert
            BEFORE INSERT ON appointments
            WHEN NEW.clinic_id IS NULL
            BEGIN
                SELECT RAISE(ABORT, 'clinic_id é obrigatório');
            END;
        `);

        db.exec(`
            CREATE TRIGGER IF NOT EXISTS appointments_require_clinic_update
            BEFORE UPDATE OF clinic_id ON appointments
            WHEN NEW.clinic_id IS NULL
            BEGIN
                SELECT RAISE(ABORT, 'clinic_id é obrigatório');
            END;
        `);

        return {
            clinicId: clinic.id,
            migratedAppointments: result.changes
        };
    });

    const result = migration();

    const total = db.prepare(`
        SELECT COUNT(*) AS total
        FROM appointments
    `).get();

    console.log("\n==================================");
    console.log("MIGRAÇÃO CONCLUÍDA");
    console.log("==================================");
    console.log("Clínica:", "Alencar Odontologia");
    console.log("ID da clínica:", result.clinicId);
    console.log("Agendamentos vinculados:", result.migratedAppointments);
    console.log("Total de agendamentos:", total.total);
    console.log("Banco preparado para múltiplas clínicas.");
    console.log("==================================\n");

} catch (error) {
    console.error("\nERRO NA MIGRAÇÃO:");
    console.error(error.message);
    process.exitCode = 1;

} finally {
    db.close();
}