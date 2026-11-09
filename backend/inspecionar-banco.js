const Database = require("better-sqlite3");

const db = new Database("./data/agendamentos.db", {
    readonly: true
});

console.log("\n===== TABELAS EXISTENTES =====");

const tabelas = db.prepare(`
    SELECT name, sql
    FROM sqlite_master
    WHERE type = 'table'
`).all();

console.log(tabelas);

console.log("\n===== COLUNAS DE APPOINTMENTS =====");

const colunas = db.prepare(`
    PRAGMA table_info(appointments)
`).all();

console.log(colunas);

db.close();

console.log("\nInspeção concluída!");