const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "..", "presenx.db");
const db = new sqlite3.Database(dbPath);

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function norm(s) {
  return (s || "").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function normalizar() {
  console.log("Iniciando normalização com schema atualizado...");

  // 1. Recriar tabela usuarios sem restrições de curso
  await runAsync(`
    CREATE TABLE IF NOT EXISTS usuarios_v2 (
      uid TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      curso TEXT DEFAULT '',
      ativo INTEGER NOT NULL DEFAULT 1,
      sincronizado INTEGER NOT NULL DEFAULT 0
    )
  `);

  await runAsync(`
    INSERT OR IGNORE INTO usuarios_v2 (uid, nome, curso, ativo, sincronizado)
    SELECT uid, nome, COALESCE(curso, ''), ativo, sincronizado FROM usuarios
  `);

  await runAsync(`DROP TABLE IF EXISTS usuarios`);
  await runAsync(`ALTER TABLE usuarios_v2 RENAME TO usuarios`);

  // 2. Criar tabelas disciplinas e professores_disciplinas
  await runAsync(`
    CREATE TABLE IF NOT EXISTS disciplinas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT UNIQUE NOT NULL,
      codigo TEXT DEFAULT '',
      cor_badge TEXT DEFAULT '#2563eb'
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS professores_disciplinas (
      professor_uid TEXT NOT NULL,
      disciplina_id INTEGER NOT NULL,
      PRIMARY KEY (professor_uid, disciplina_id),
      FOREIGN KEY(professor_uid) REFERENCES usuarios(uid) ON DELETE CASCADE,
      FOREIGN KEY(disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE
    )
  `);

  // 3. Buscar todas as disciplinas e professores da grade_horarios
  const linhasGrade = await allAsync("SELECT DISTINCT disciplina, professor FROM grade_horarios WHERE disciplina IS NOT NULL AND disciplina != '' AND disciplina != 'Sem aula'");
  console.log(`Pares disciplina/professor encontrados na grade: ${linhasGrade.length}`);

  const usuariosExistentes = await allAsync("SELECT * FROM usuarios");
  const mapaProfessoresPorNome = {};
  usuariosExistentes.forEach(u => {
    mapaProfessoresPorNome[norm(u.nome)] = u;
  });

  let profContador = 1;
  const mapaDisciplinas = {};

  for (const item of linhasGrade) {
    const nomeDisciplina = item.disciplina.trim();
    const profStr = item.professor ? item.professor.trim() : "";

    // Inserir disciplina se não existir
    if (!mapaDisciplinas[norm(nomeDisciplina)]) {
      await runAsync(
        "INSERT OR IGNORE INTO disciplinas (nome) VALUES (?)",
        [nomeDisciplina]
      );
      const rowDisc = await getAsync("SELECT id, nome FROM disciplinas WHERE nome = ?", [nomeDisciplina]);
      if (rowDisc) {
        mapaDisciplinas[norm(nomeDisciplina)] = rowDisc.id;
      }
    }

    const disciplinaId = mapaDisciplinas[norm(nomeDisciplina)];

    if (profStr && profStr !== "A definir" && profStr !== "-") {
      const nomesProfs = profStr.split(",").map(p => p.trim()).filter(Boolean);

      for (const nomeProf of nomesProfs) {
        let profExistente = mapaProfessoresPorNome[norm(nomeProf)];

        if (!profExistente) {
          const uidGerado = "PROF_" + String(profContador).padStart(3, "0");
          profContador++;

          await runAsync(
            "INSERT OR IGNORE INTO usuarios (uid, nome, curso, ativo, sincronizado) VALUES (?, ?, '', 1, 0)",
            [uidGerado, nomeProf]
          );

          profExistente = { uid: uidGerado, nome: nomeProf, ativo: 1 };
          mapaProfessoresPorNome[norm(nomeProf)] = profExistente;
        }

        if (disciplinaId && profExistente.uid) {
          await runAsync(
            "INSERT OR IGNORE INTO professores_disciplinas (professor_uid, disciplina_id) VALUES (?, ?)",
            [profExistente.uid, disciplinaId]
          );
        }
      }
    }
  }

  const totalDisciplinas = await getAsync("SELECT COUNT(*) AS total FROM disciplinas");
  const totalProfessores = await getAsync("SELECT COUNT(*) AS total FROM usuarios");
  const totalVinculos = await getAsync("SELECT COUNT(*) AS total FROM professores_disciplinas");

  console.log("=========================================");
  console.log("Normalização Concluída com Sucesso!");
  console.log(`- Total de Disciplinas Cadastradas: ${totalDisciplinas.total}`);
  console.log(`- Total de Professores Cadastrados: ${totalProfessores.total}`);
  console.log(`- Total de Vínculos Matéria/Professor: ${totalVinculos.total}`);
  console.log("=========================================");

  db.close();
}

normalizar().catch(err => {
  console.error("Erro na normalização:", err);
  process.exit(1);
});
