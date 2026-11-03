const path = require("path");
const fs = require("fs");
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

async function inicializarTabelas() {
  console.log("Criando tabelas no banco de dados SQLite unificado...");

  await runAsync(`
    CREATE TABLE IF NOT EXISTS pavilhoes (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      ordem INTEGER DEFAULT 0
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS salas (
      id TEXT PRIMARY KEY,
      pavilhao_id TEXT NOT NULL,
      nome TEXT NOT NULL,
      FOREIGN KEY(pavilhao_id) REFERENCES pavilhoes(id)
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS turmas (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      turno TEXT NOT NULL,
      pavilhao_id TEXT NOT NULL DEFAULT 'acm',
      sala_nome TEXT NOT NULL DEFAULT '',
      ordem INTEGER DEFAULT 0,
      FOREIGN KEY(pavilhao_id) REFERENCES pavilhoes(id)
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS grade_horarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      turma_id TEXT NOT NULL,
      dia TEXT NOT NULL,
      horario INTEGER NOT NULL,
      disciplina TEXT NOT NULL,
      professor TEXT NOT NULL,
      FOREIGN KEY(turma_id) REFERENCES turmas(id)
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS usuarios (
      uid TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      curso TEXT DEFAULT '',
      ativo INTEGER NOT NULL DEFAULT 1,
      sincronizado INTEGER NOT NULL DEFAULT 0
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS presencas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      uid TEXT NOT NULL,
      nome TEXT NOT NULL,
      curso TEXT DEFAULT '',
      status TEXT NOT NULL,
      hora_entrada TEXT,
      hora_saida TEXT,
      sincronizado INTEGER NOT NULL DEFAULT 0
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS avisos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      mensagem TEXT NOT NULL,
      prioridade TEXT NOT NULL DEFAULT 'normal',
      expiracao TEXT NOT NULL,
      ativo INTEGER NOT NULL DEFAULT 1,
      criado_em INTEGER,
      sincronizado INTEGER NOT NULL DEFAULT 0
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS eventos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      data TEXT NOT NULL,
      sincronizado INTEGER NOT NULL DEFAULT 0
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS admin_usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS ultimo_acesso (
      chave TEXT PRIMARY KEY,
      uid TEXT,
      nome TEXT,
      curso TEXT,
      hora TEXT,
      data TEXT,
      status TEXT,
      sincronizado INTEGER NOT NULL DEFAULT 0
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS config (
      chave TEXT PRIMARY KEY,
      valor TEXT
    )
  `);

  // Pavilhões padrão
  await runAsync(`
    INSERT OR IGNORE INTO pavilhoes (id, nome, ordem) VALUES
    ('acm', 'Pavilhão ACM', 1),
    ('luis_viana', 'Pavilhão Luís Viana', 2)
  `);

  // Admin padrão
  await runAsync(`
    INSERT OR IGNORE INTO admin_usuarios (email, senha)
    VALUES ('admin@presenx.com', 'admin123')
  `);
}

function carregarArquivoJS(caminhoRelativo, variavelNome) {
  const caminhoAbsoluto = path.join(__dirname, "..", "..", caminhoRelativo);
  if (!fs.existsSync(caminhoAbsoluto)) {
    console.warn(`Arquivo não encontrado: ${caminhoAbsoluto}`);
    return {};
  }
  const conteudo = fs.readFileSync(caminhoAbsoluto, "utf8");
  const sandbox = {};
  const fn = new Function("sandbox", `${conteudo}; sandbox.${variavelNome} = typeof ${variavelNome} !== 'undefined' ? ${variavelNome} : {};`);
  fn(sandbox);
  return sandbox[variavelNome] || {};
}

async function migrarDados() {
  await inicializarTabelas();

  console.log("Lendo dados legados...");
  const matutino = carregarArquivoJS("web/data/turmas_matutino.js", "turmasMatutino");
  const vespertino = carregarArquivoJS("web/data/turmas_vespertino.js", "turmasVespertino");
  const noturno = carregarArquivoJS("web/data/turmas_noturno.js", "turmasNoturno");

  const todasTurmas = { ...matutino, ...vespertino, ...noturno };
  const totalTurmas = Object.keys(todasTurmas).length;
  console.log(`Total de turmas encontradas: ${totalTurmas}`);

  // Limpar grade e turmas anteriores para reimportação limpa
  await runAsync("DELETE FROM grade_horarios");
  await runAsync("DELETE FROM turmas");

  let contTurmas = 0;
  let contHorarios = 0;

  for (const [turmaKey, turmaObj] of Object.entries(todasTurmas)) {
    const nomeTurma = turmaObj.turma || turmaKey;
    const turno = turmaObj.turno || "matutino";
    const salaNome = turmaObj.sala || nomeTurma;

    // Regra inteligente de pavilhão inicial:
    // Turmas com "LV" ou "VIANA" -> 'luis_viana'; demais -> 'acm'
    let pavilhaoId = "acm";
    if (nomeTurma.toUpperCase().includes("LV") || nomeTurma.toUpperCase().includes("VIANA") || (turmaObj.pavilhao && turmaObj.pavilhao.toUpperCase().includes("VIANA"))) {
      pavilhaoId = "luis_viana";
    }

    await runAsync(
      `INSERT INTO turmas (id, nome, turno, pavilhao_id, sala_nome, ordem)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         nome = excluded.nome,
         turno = excluded.turno,
         pavilhao_id = excluded.pavilhao_id,
         sala_nome = excluded.sala_nome`,
      [turmaKey, nomeTurma, turno, pavilhaoId, salaNome, contTurmas]
    );
    contTurmas++;

    if (turmaObj.dias) {
      for (const [dia, horarios] of Object.entries(turmaObj.dias)) {
        for (const [horarioStr, aula] of Object.entries(horarios)) {
          const horarioNum = parseInt(horarioStr, 10);
          if (isNaN(horarioNum)) continue;

          const disciplina = aula.disciplina || "Sem aula";
          let profStr = "";
          if (Array.isArray(aula.professores)) {
            profStr = aula.professores.join(", ");
          } else if (Array.isArray(aula.professor)) {
            profStr = aula.professor.join(", ");
          } else if (aula.professor) {
            profStr = String(aula.professor);
          }

          await runAsync(
            `INSERT INTO grade_horarios (turma_id, dia, horario, disciplina, professor)
             VALUES (?, ?, ?, ?, ?)`,
            [turmaKey, dia, horarioNum, disciplina, profStr]
          );
          contHorarios++;
        }
      }
    }
  }

  console.log(`Migração concluída com sucesso!`);
  console.log(`- ${contTurmas} turmas cadastradas`);
  console.log(`- ${contHorarios} horários de aula cadastrados`);
  
  db.close();
}

migrarDados().catch(err => {
  console.error("Erro na migração:", err);
  process.exit(1);
});
