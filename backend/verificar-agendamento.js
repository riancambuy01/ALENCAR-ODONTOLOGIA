const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(
    path.join(__dirname, "data", "agendamentos.db"),
    { readonly: true }
);

try {
    const registros = db.prepare(`
        SELECT
            id,
            name,
            treatment,
            appointment_date,
            status,
            clinic_id,
            created_at
        FROM appointments
        ORDER BY id DESC
        LIMIT 5
    `).all();

    console.log("\n--- ÚLTIMOS AGENDAMENTOS ---");
    console.table(registros);

} catch (error) {
    console.error("Erro:", error.message);
} finally {
    db.close();
}