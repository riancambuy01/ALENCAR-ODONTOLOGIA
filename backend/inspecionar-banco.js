
const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "data", "agendamentos.db");

const db = new Database(dbPath, {
    readonly: true,
    fileMustExist: true
});

try {
    console.log("\n===== TABELAS, ÍNDICES E TRIGGERS =====");

    const objetos = db.prepare(`
        SELECT type, name, tbl_name, sql
        FROM sqlite_master
        WHERE type IN ('table', 'index', 'trigger')
        ORDER BY type, name
    `).all();

    console.log(objetos);

    console.log("\n===== COLUNAS DE APPOINTMENTS =====");

    console.log(
        db.prepare("PRAGMA table_info(appointments)").all()
    );

    console.log("\n===== CHAVES ESTRANGEIRAS =====");

    console.log(
        db.prepare("PRAGMA foreign_key_list(appointments)").all()
    );

    console.log("\n===== ÍNDICES DE APPOINTMENTS =====");

    console.log(
        db.prepare("PRAGMA index_list(appointments)").all()
    );

    console.log("\n===== TOTAL DE AGENDAMENTOS =====");

    console.log(
        db.prepare("SELECT COUNT(*) AS total FROM appointments").get()
    );

    console.log("\n===== COLUNAS DE CLINICS =====");

    console.log(
        db.prepare("PRAGMA table_info(clinics)").all()
    );

    console.log("\n===== INSPEÇÃO CONCLUÍDA =====");

} catch (error) {
    console.error("Erro durante a inspeção:", error.message);


console.log("\n===== CLÍNICAS CADASTRADAS =====");

const clinics = db.prepare(`
    SELECT id, name, slug, active
    FROM clinics
`).all();

console.log(clinics);

console.log("\n===== AGENDAMENTOS E SUAS CLÍNICAS =====");

const appointments = db.prepare(`
    SELECT
        id,
        name,
        appointment_date,
        period,
        status,
        clinic_id
    FROM appointments
    ORDER BY id
`).all();

console.log(appointments);

console.log("\n===== VERIFICAÇÃO DE INTEGRIDADE =====");

const integrity = db.pragma("foreign_key_check");

console.log(integrity);


} finally {
    
console.log("\n===== CLÍNICAS CADASTRADAS =====");

console.log(db.prepare(`
    SELECT id, name, slug, active
    FROM clinics
`).all());

console.log("\n===== AGENDAMENTOS E CLÍNICAS =====");

console.log(db.prepare(`
    SELECT
        id,
        name,
        appointment_date,
        period,
        status,
        clinic_id
    FROM appointments
    ORDER BY id
`).all());

console.log("\n===== REGISTROS SEM CLÍNICA =====");

console.log(db.prepare(`
    SELECT COUNT(*) AS total
    FROM appointments
    WHERE clinic_id IS NULL
`).get());

console.log("\n===== INTEGRIDADE REFERENCIAL =====");

console.log(db.pragma("foreign_key_check"));

    db.close();
}
