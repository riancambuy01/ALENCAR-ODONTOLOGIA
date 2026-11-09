const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(
    path.join(__dirname, "data", "agendamentos.db"),
    { readonly: true }
);

try {
    const clinics = db.prepare(`
        SELECT id, name, slug, active
        FROM clinics
    `).all();

    const appointments = db.prepare(`
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN clinic_id IS NOT NULL THEN 1 ELSE 0 END) AS vinculados,
            SUM(CASE WHEN clinic_id IS NULL THEN 1 ELSE 0 END) AS sem_clinica
        FROM appointments
    `).get();

    console.log("\n--- CLÍNICAS CADASTRADAS ---");
    console.table(clinics);

    console.log("\n--- AGENDAMENTOS ---");
    console.table([appointments]);

} catch (error) {
    console.error("Erro na verificação:", error.message);
    process.exitCode = 1;
} finally {
    db.close();
}
