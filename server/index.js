const fs = require("fs");
const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const dns = require("dns");
const admin = require("firebase-admin");
const crypto = require("crypto");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 3000;

// ======================================================
// HELPERS DE CRIPTOGRAFIA & SENHAS SEGURAS
// ======================================================
function hashPassword(senha, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(senha, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(senha, storedHash) {
  if (!storedHash) return false;
  if (!storedHash.includes(":")) {
    // Compatibilidade com senhas legadas em texto puro
    return senha === storedHash;
  }
  const [salt, originalHash] = storedHash.split(":");
  const hashToVerify = crypto.pbkdf2Sync(senha, salt, 10000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(originalHash, "hex"), Buffer.from(hashToVerify, "hex"));
}

// ======================================================
// BANCO DE DADOS SQLITE UNIFICADO
// ======================================================
const dbPath = path.join(__dirname, "presenx.db");
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

// Horários padrões dos turnos
const turnosPadrao = [
  // Matutino
  { turno: "matutino", chave: "1", inicio: "07:00", fim: "07:45", ordem: 1 },
  { turno: "matutino", chave: "2", inicio: "07:45", fim: "08:30", ordem: 2 },
  { turno: "matutino", chave: "3", inicio: "08:30", fim: "09:15", ordem: 3 },
  { turno: "matutino", chave: "4", inicio: "09:15", fim: "10:00", ordem: 4 },
  { turno: "matutino", chave: "intervalo", inicio: "10:00", fim: "10:20", ordem: 5 },
  { turno: "matutino", chave: "5", inicio: "10:20", fim: "11:05", ordem: 6 },
  { turno: "matutino", chave: "6", inicio: "11:05", fim: "11:50", ordem: 7 },
  // Vespertino
  { turno: "vespertino", chave: "1", inicio: "13:00", fim: "13:45", ordem: 1 },
  { turno: "vespertino", chave: "2", inicio: "13:45", fim: "14:30", ordem: 2 },
  { turno: "vespertino", chave: "3", inicio: "14:30", fim: "15:15", ordem: 3 },
  { turno: "vespertino", chave: "4", inicio: "15:15", fim: "16:00", ordem: 4 },
  { turno: "vespertino", chave: "intervalo", inicio: "16:00", fim: "16:20", ordem: 5 },
  { turno: "vespertino", chave: "5", inicio: "16:20", fim: "17:05", ordem: 6 },
  { turno: "vespertino", chave: "6", inicio: "17:05", fim: "17:50", ordem: 7 },
  // Noturno
  { turno: "noturno", chave: "1", inicio: "19:00", fim: "19:45", ordem: 1 },
  { turno: "noturno", chave: "2", inicio: "19:45", fim: "20:30", ordem: 2 },
  { turno: "noturno", chave: "3", inicio: "20:30", fim: "21:15", ordem: 3 },
  { turno: "noturno", chave: "4", inicio: "21:15", fim: "22:00", ordem: 4 },
  { turno: "noturno", chave: "intervalo", inicio: "22:00", fim: "22:20", ordem: 5 },
  { turno: "noturno", chave: "5", inicio: "22:20", fim: "23:05", ordem: 6 },
  { turno: "noturno", chave: "6", inicio: "23:05", fim: "23:50", ordem: 7 }
];

// ======================================================
// FIREBASE ADMIN (Persistência em Nuvem / Opcional)
// ======================================================
let firebaseDb = null;
const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");

let serviceAccountData = null;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccountData = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (e) {
    try {
      serviceAccountData = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString("utf-8"));
    } catch (e2) {
      console.warn("Aviso: falha ao interpretar FIREBASE_SERVICE_ACCOUNT da variável de ambiente.");
    }
  }
} else if (fs.existsSync(serviceAccountPath)) {
  try {
    serviceAccountData = require(serviceAccountPath);
  } catch (e) {
    console.warn("Aviso ao carregar serviceAccountKey.json:", e.message);
  }
}

if (serviceAccountData) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountData),
        databaseURL: process.env.FIREBASE_DATABASE_URL || "https://controledepresenca-99c9d-default-rtdb.firebaseio.com/"
      });
    }
    firebaseDb = admin.database();
    console.log(">> Firebase Realtime Database conectado com sucesso (persistência ativa).");
  } catch (err) {
    console.warn("Aviso: Firebase Admin não pôde ser iniciado:", err.message);
  }
}

// ======================================================
// HELPERS DE SINCRONIZAÇÃO EM NUVEM COM FIREBASE RTDB
// ======================================================
async function syncFirebaseSet(caminho, dados) {
  if (!firebaseDb) return;
  try {
    await firebaseDb.ref(caminho).set(dados);
  } catch (err) {
    console.warn(`[Firebase Sync] Aviso ao definir ${caminho}:`, err.message);
  }
}

async function syncFirebaseUpdate(caminho, dados) {
  if (!firebaseDb) return;
  try {
    await firebaseDb.ref(caminho).update(dados);
  } catch (err) {
    console.warn(`[Firebase Sync] Aviso ao atualizar ${caminho}:`, err.message);
  }
}

async function syncFirebaseRemove(caminho) {
  if (!firebaseDb) return;
  try {
    await firebaseDb.ref(caminho).remove();
  } catch (err) {
    console.warn(`[Firebase Sync] Aviso ao remover ${caminho}:`, err.message);
  }
}

async function sincronizarBancoComFirebase() {
  if (!firebaseDb) return;
  try {
    console.log(">> [Sincronização Nuvem] Verificando integridade com Firebase RTDB...");

    // 1. Pavilhões
    try {
      const snapPav = await firebaseDb.ref("pavilhoes").once("value");
      const fbPav = snapPav.val();
      if (!fbPav || Object.keys(fbPav).length === 0) {
        const pavs = await allAsync("SELECT * FROM pavilhoes");
        const fbPayload = {};
        pavs.forEach(p => { fbPayload[p.id] = p; });
        await firebaseDb.ref("pavilhoes").set(fbPayload);
      } else {
        for (const [id, p] of Object.entries(fbPav)) {
          if (p && p.id && p.nome) {
            await runAsync(
              "INSERT INTO pavilhoes (id, nome, ordem) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET nome = excluded.nome, ordem = excluded.ordem",
              [p.id, p.nome, Number(p.ordem) || 0]
            );
          }
        }
      }
    } catch (e) {
      console.warn("Aviso ao sincronizar pavilhões:", e.message);
    }

    // 2. Turnos Horários
    try {
      const snapTurnos = await firebaseDb.ref("turnos_horarios").once("value");
      const fbTurnos = snapTurnos.val();
      if (!fbTurnos || Object.keys(fbTurnos).length === 0) {
        const turnos = await allAsync("SELECT * FROM turnos_horarios");
        const fbPayload = {};
        turnos.forEach(t => {
          const key = `${t.turno}__${t.chave}`;
          fbPayload[key] = t;
        });
        await firebaseDb.ref("turnos_horarios").set(fbPayload);
      } else {
        for (const [k, t] of Object.entries(fbTurnos)) {
          if (t && t.turno && t.chave && t.inicio && t.fim) {
            await runAsync(
              `INSERT INTO turnos_horarios (turno, chave, inicio, fim, ordem) VALUES (?, ?, ?, ?, ?)
               ON CONFLICT(turno, chave) DO UPDATE SET inicio = excluded.inicio, fim = excluded.fim, ordem = excluded.ordem`,
              [t.turno, t.chave, t.inicio, t.fim, Number(t.ordem) || 0]
            );
          }
        }
      }
    } catch (e) {
      console.warn("Aviso ao sincronizar turnos:", e.message);
    }

    // 3. Disciplinas
    try {
      const snapDisc = await firebaseDb.ref("disciplinas").once("value");
      const fbDisc = snapDisc.val();
      if (!fbDisc || Object.keys(fbDisc).length === 0) {
        const discs = await allAsync("SELECT * FROM disciplinas");
        const fbPayload = {};
        discs.forEach(d => { fbPayload[String(d.id)] = d; });
        await firebaseDb.ref("disciplinas").set(fbPayload);
      } else {
        for (const [idStr, d] of Object.entries(fbDisc)) {
          if (d && d.nome) {
            const dId = Number(d.id || idStr);
            await runAsync(
              `INSERT INTO disciplinas (id, nome, codigo, cor_badge) VALUES (?, ?, ?, ?)
               ON CONFLICT(id) DO UPDATE SET nome = excluded.nome, codigo = excluded.codigo, cor_badge = excluded.cor_badge`,
              [dId, d.nome, d.codigo || "", d.cor_badge || "#2563eb"]
            );
          }
        }
      }
    } catch (e) {
      console.warn("Aviso ao sincronizar disciplinas:", e.message);
    }

    // 4. Turmas
    try {
      const snapTurmas = await firebaseDb.ref("turmas").once("value");
      const fbTurmas = snapTurmas.val();
      if (!fbTurmas || Object.keys(fbTurmas).length === 0) {
        const turmas = await allAsync("SELECT * FROM turmas");
        const fbPayload = {};
        turmas.forEach(t => { fbPayload[t.id] = t; });
        await firebaseDb.ref("turmas").set(fbPayload);
      } else {
        for (const [id, t] of Object.entries(fbTurmas)) {
          if (t && t.id && t.nome) {
            await runAsync(
              `INSERT INTO turmas (id, nome, turno, pavilhao_id, sala_nome, ordem) VALUES (?, ?, ?, ?, ?, ?)
               ON CONFLICT(id) DO UPDATE SET nome = excluded.nome, turno = excluded.turno, pavilhao_id = excluded.pavilhao_id, sala_nome = excluded.sala_nome, ordem = excluded.ordem`,
              [t.id, t.nome, t.turno || "matutino", t.pavilhao_id || "acm", t.sala_nome || t.nome, Number(t.ordem) || 0]
            );
          }
        }
      }
    } catch (e) {
      console.warn("Aviso ao sincronizar turmas:", e.message);
    }

    // 5. Professores Disciplinas (Vínculos)
    try {
      const snapPD = await firebaseDb.ref("professores_disciplinas").once("value");
      const fbPD = snapPD.val();
      if (!fbPD || Object.keys(fbPD).length === 0) {
        const pds = await allAsync("SELECT * FROM professores_disciplinas");
        const fbPayload = {};
        pds.forEach(pd => {
          const key = `${pd.professor_uid}__${pd.disciplina_id}`;
          fbPayload[key] = pd;
        });
        await firebaseDb.ref("professores_disciplinas").set(fbPayload);
      } else {
        for (const [k, pd] of Object.entries(fbPD)) {
          if (pd && pd.professor_uid && pd.disciplina_id) {
            await runAsync(
              "INSERT OR IGNORE INTO professores_disciplinas (professor_uid, disciplina_id) VALUES (?, ?)",
              [pd.professor_uid, Number(pd.disciplina_id)]
            );
          }
        }
      }
    } catch (e) {
      console.warn("Aviso ao sincronizar vínculos professores-disciplinas:", e.message);
    }

    // 6. Grade de Horários
    try {
      const snapGrade = await firebaseDb.ref("grade_horarios").once("value");
      const fbGrade = snapGrade.val();
      if (!fbGrade || Object.keys(fbGrade).length === 0) {
        const grades = await allAsync("SELECT * FROM grade_horarios");
        const fbPayload = {};
        grades.forEach(g => {
          const key = `${g.turma_id}__${g.dia}__${g.horario}`;
          fbPayload[key] = g;
        });
        await firebaseDb.ref("grade_horarios").set(fbPayload);
      } else {
        for (const [k, g] of Object.entries(fbGrade)) {
          if (g && g.turma_id && g.dia && g.horario && g.disciplina) {
            await runAsync(
              `INSERT OR REPLACE INTO grade_horarios (id, turma_id, dia, horario, disciplina, professor)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [g.id || null, g.turma_id, g.dia, Number(g.horario), g.disciplina, g.professor || ""]
            );
          }
        }
      }
    } catch (e) {
      console.warn("Aviso ao sincronizar grade horários:", e.message);
    }

    // 7. Usuários (Professores) - Merge bidirecional
    try {
      const snapUsers = await firebaseDb.ref("usuarios").once("value");
      const fbUsers = snapUsers.val() || {};
      for (const [uid, u] of Object.entries(fbUsers)) {
        if (u && u.nome) {
          const ativo = (u.ativo === false || u.ativo === 0) ? 0 : 1;
          await runAsync(
            `INSERT INTO usuarios (uid, nome, curso, ativo, sincronizado) VALUES (?, ?, ?, ?, 1)
             ON CONFLICT(uid) DO UPDATE SET nome = excluded.nome, curso = excluded.curso, ativo = excluded.ativo, sincronizado = 1`,
            [uid, u.nome, u.curso || "", ativo]
          );
        }
      }
      const localUsers = await allAsync("SELECT * FROM usuarios");
      for (const u of localUsers) {
        if (!fbUsers[u.uid]) {
          await firebaseDb.ref(`usuarios/${u.uid}`).set({
            nome: u.nome,
            curso: u.curso || "",
            ativo: u.ativo === 1
          });
        }
      }
    } catch (e) {
      console.warn("Aviso ao sincronizar usuários:", e.message);
    }

    // 8. Coordenadores (admin_usuarios) - Merge bidirecional
    try {
      const snapAdmins = await firebaseDb.ref("admin_usuarios").once("value");
      const fbAdmins = snapAdmins.val() || {};
      for (const [k, v] of Object.entries(fbAdmins)) {
        if (v && v.email && v.senha) {
          const em = String(v.email).trim().toLowerCase();
          const ex = await getAsync("SELECT id FROM admin_usuarios WHERE email = ?", [em]);
          if (!ex) {
            await runAsync("INSERT INTO admin_usuarios (email, senha) VALUES (?, ?)", [em, v.senha]);
            console.log(`>> Coordenador restaurado do Firebase: ${em}`);
          }
        }
      }
      const localAdmins = await allAsync("SELECT * FROM admin_usuarios");
      for (const a of localAdmins) {
        const safeKey = a.email.replace(/[.#$\[\]]/g, "_");
        if (!fbAdmins[safeKey]) {
          await firebaseDb.ref(`admin_usuarios/${safeKey}`).set({
            email: a.email,
            senha: a.senha,
            criado_em: Date.now()
          });
          console.log(`>> Coordenador local sincronizado para o Firebase: ${a.email}`);
        }
      }
    } catch (e) {
      console.warn("Aviso ao sincronizar coordenadores:", e.message);
    }

    // 9. Avisos
    try {
      const snapAvisos = await firebaseDb.ref("avisos").once("value");
      const fbAvisos = snapAvisos.val() || {};
      for (const [k, av] of Object.entries(fbAvisos)) {
        if (av && av.titulo && av.mensagem) {
          const ja = await getAsync("SELECT id FROM avisos WHERE titulo = ? AND mensagem = ?", [av.titulo, av.mensagem]);
          if (!ja) {
            await runAsync(
              `INSERT INTO avisos (titulo, mensagem, prioridade, expiracao, ativo, criado_em, sincronizado)
               VALUES (?, ?, ?, ?, ?, ?, 1)`,
              [av.titulo, av.mensagem, av.prioridade || "normal", av.expiracao || "", av.ativo !== false ? 1 : 0, av.criado_em || av.criadoEm || Date.now()]
            );
          }
        }
      }
      const localAvisos = await allAsync("SELECT * FROM avisos");
      for (const av of localAvisos) {
        if (!fbAvisos[String(av.id)]) {
          await firebaseDb.ref(`avisos/${av.id}`).set({
            id: av.id,
            titulo: av.titulo,
            mensagem: av.mensagem,
            prioridade: av.prioridade,
            expiracao: av.expiracao,
            ativo: av.ativo === 1,
            criado_em: av.criado_em
          });
        }
      }
    } catch (e) {
      console.warn("Aviso ao sincronizar avisos:", e.message);
    }

    // 10. Eventos
    try {
      const snapEv = await firebaseDb.ref("eventos").once("value");
      const fbEv = snapEv.val() || {};
      for (const [k, ev] of Object.entries(fbEv)) {
        if (ev && ev.titulo && ev.data) {
          const ja = await getAsync("SELECT id FROM eventos WHERE titulo = ? AND data = ?", [ev.titulo, ev.data]);
          if (!ja) {
            await runAsync(
              `INSERT INTO eventos (titulo, descricao, data, sincronizado)
               VALUES (?, ?, ?, 1)`,
              [ev.titulo, ev.descricao || "", ev.data]
            );
          }
        }
      }
      const localEv = await allAsync("SELECT * FROM eventos");
      for (const ev of localEv) {
        if (!fbEv[String(ev.id)]) {
          await firebaseDb.ref(`eventos/${ev.id}`).set({
            id: ev.id,
            titulo: ev.titulo,
            descricao: ev.descricao,
            data: ev.data
          });
        }
      }
    } catch (e) {
      console.warn("Aviso ao sincronizar eventos:", e.message);
    }

    // 11. Presenças
    try {
      const snapPres = await firebaseDb.ref("presencas").once("value");
      const fbPres = snapPres.val() || {};
      for (const [data, registros] of Object.entries(fbPres)) {
        if (registros && typeof registros === "object") {
          for (const [uid, p] of Object.entries(registros)) {
            if (p && uid) {
              const ja = await getAsync("SELECT id FROM presencas WHERE data = ? AND uid = ?", [data, uid]);
              if (!ja) {
                await runAsync(
                  `INSERT INTO presencas (data, uid, nome, curso, status, hora_entrada, hora_saida, sincronizado)
                   VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
                  [data, uid, p.nome || "", p.curso || "", p.status || "Presente", p.hora_entrada || null, p.hora_saida || null]
                );
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn("Aviso ao sincronizar presenças:", e.message);
    }

    console.log(">> [Sincronização Nuvem] Banco de dados totalmente sincronizado com Firebase Realtime Database!");
  } catch (err) {
    console.warn("Aviso na sincronização Firebase:", err.message);
  }
}

// ======================================================
// INICIALIZAÇÃO E SCHEMA DAS TABELAS (EM SEGUNDO PLANO)
// ======================================================
async function inicializarBancoESincronizacao() {
  try {
  db.run(`
    CREATE TABLE IF NOT EXISTS pavilhoes (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      ordem INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS turnos_horarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      turno TEXT NOT NULL,
      chave TEXT NOT NULL,
      inicio TEXT NOT NULL,
      fim TEXT NOT NULL,
      ordem INTEGER DEFAULT 0,
      UNIQUE(turno, chave)
    )
  `);

  db.run(`
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

  db.run(`
    CREATE TABLE IF NOT EXISTS disciplinas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT UNIQUE NOT NULL,
      codigo TEXT DEFAULT '',
      cor_badge TEXT DEFAULT '#2563eb'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      uid TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      curso TEXT DEFAULT '',
      ativo INTEGER NOT NULL DEFAULT 1,
      sincronizado INTEGER NOT NULL DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS professores_disciplinas (
      professor_uid TEXT NOT NULL,
      disciplina_id INTEGER NOT NULL,
      PRIMARY KEY (professor_uid, disciplina_id),
      FOREIGN KEY(professor_uid) REFERENCES usuarios(uid) ON DELETE CASCADE,
      FOREIGN KEY(disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE
    )
  `);

  db.run(`
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

  db.run(`
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

  db.run(`
    CREATE TABLE IF NOT EXISTS avisos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      mensagem TEXT NOT NULL,
      prioridade TEXT NOT NULL DEFAULT 'normal',
      expiracao TEXT NOT NULL DEFAULT '',
      ativo INTEGER NOT NULL DEFAULT 1,
      criado_em INTEGER DEFAULT 0,
      sincronizado INTEGER NOT NULL DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS eventos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      data TEXT NOT NULL,
      sincronizado INTEGER NOT NULL DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS admin_usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS admin_sessoes (
      token TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      expira_em INTEGER NOT NULL,
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
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

  db.run(`
    CREATE TABLE IF NOT EXISTS leitores_rfid (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      local TEXT DEFAULT '',
      ip TEXT DEFAULT '',
      ultimo_ping INTEGER DEFAULT 0,
      total_leituras_hoje INTEGER DEFAULT 0
    )
  `);

  db.run(`
    INSERT OR IGNORE INTO leitores_rfid (id, nome, local, ip, ultimo_ping, total_leituras_hoje)
    VALUES ('leitor_portaria', 'Leitor Portaria', 'Portaria Principal', '', 0, 0)
  `);

  db.run(`
    INSERT OR IGNORE INTO pavilhoes (id, nome, ordem) VALUES
    ('acm', 'Pavilhão ACM', 1),
    ('luis_viana', 'Pavilhão Luís Viana', 2)
  `);

  // Popula turnos padrões se vazios
  const totalTurnos = await getAsync("SELECT COUNT(*) as total FROM turnos_horarios");
  if (!totalTurnos || totalTurnos.total === 0) {
    for (const t of turnosPadrao) {
      await runAsync(
        "INSERT OR IGNORE INTO turnos_horarios (turno, chave, inicio, fim, ordem) VALUES (?, ?, ?, ?, ?)",
        [t.turno, t.chave, t.inicio, t.fim, t.ordem]
      );
    }
  }

  // Garante senha de admin com hash seguro (admin@presenx.com e fallback para qualquer e-mail admin)
  const senhaAdminInicial = process.env.ADMIN_INITIAL_PASSWORD || "admin123";
  const hashPadrao = hashPassword(senhaAdminInicial);

  const adminRow = await getAsync("SELECT * FROM admin_usuarios WHERE email = 'admin@presenx.com'");
  if (!adminRow) {
    await runAsync("INSERT INTO admin_usuarios (email, senha) VALUES ('admin@presenx.com', ?)", [hashPadrao]);
    console.log(">> Usuário inicial 'admin@presenx.com' configurado com sucesso.");
  } else if (!adminRow.senha.includes(":")) {
    // Migra senha antiga em texto puro para hash seguro
    const hash = hashPassword(adminRow.senha);
    await runAsync("UPDATE admin_usuarios SET senha = ? WHERE id = ?", [hash, adminRow.id]);
  }

  // 1. Suporte a lista fixa de coordenadores adicionais via variável de ambiente (garante permanência no Render)
  const envAdmins = process.env.ADMIN_COORDINATORS || process.env.ADMIN_EMAILS || "";
  if (envAdmins) {
    const lista = envAdmins.split(",").map(s => s.trim()).filter(Boolean);
    for (const item of lista) {
      let email = item;
      let senha = senhaAdminInicial;
      if (item.includes(":")) {
        const partes = item.split(":");
        email = partes[0].trim();
        senha = partes.slice(1).join(":").trim();
      }
      email = email.toLowerCase();
      if (email.includes("@")) {
        const jaExiste = await getAsync("SELECT id FROM admin_usuarios WHERE email = ?", [email]);
        if (!jaExiste) {
          const hash = hashPassword(senha);
          await runAsync("INSERT INTO admin_usuarios (email, senha) VALUES (?, ?)", [email, hash]);
          console.log(`>> Coordenador de ambiente inicializado: ${email}`);
        }
      }
    }
  }

  // 2. Executa sincronização completa bidirecional com Firebase Realtime Database
  if (firebaseDb) {
    await sincronizarBancoComFirebase();
  }
  } catch (err) {
    console.warn("Aviso na inicialização do banco:", err.message);
  }
}

// ======================================================
// MIDDLEWARES E CONFIGURAÇÕES
// ======================================================
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ======================================================
// CABEÇALHOS DE SEGURANÇA & PROTEÇÃO CONTRA VAZAMENTO
// ======================================================
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Bloqueio rigoroso contra vazamento de arquivos de banco, senhas, git ou código backend
  const p = req.path.toLowerCase();
  if (
    p.includes(".db") ||
    p.includes(".env") ||
    p.includes("serviceaccount") ||
    p.includes(".git") ||
    p.startsWith("/server") ||
    p.startsWith("/node_modules")
  ) {
    return res.status(403).json({ ok: false, erro: "Acesso proibido." });
  }
  next();
});

// Servir estritamente apenas a pasta 'web' estaticamente (NUNCA a raiz do projeto)
app.use(express.static(path.join(__dirname, "..", "web")));
app.use("/web", express.static(path.join(__dirname, "..", "web")));

app.get("/", (req, res) => {
  res.redirect("/web/login-gestao.html");
});


// ======================================================
// SEGURANÇA: RATE LIMITING & AUTENTICAÇÃO ADMINISTRATIVA
// ======================================================
const tentativasLoginPorIp = new Map();

function rateLimitLogin(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || "unknown";
  const agora = Date.now();
  const registro = tentativasLoginPorIp.get(ip);

  if (registro) {
    if (registro.bloqueadoAte && agora < registro.bloqueadoAte) {
      const restantesMin = Math.ceil((registro.bloqueadoAte - agora) / 60000);
      return res.status(429).json({
        ok: false,
        erro: `Muitas tentativas de login incorretas. Tente novamente em ${restantesMin} minuto(s).`
      });
    }
    if (agora - registro.primeiraTentativa > 15 * 60 * 1000) {
      tentativasLoginPorIp.delete(ip);
    }
  }
  next();
}

function registrarFalhaLogin(ip) {
  const agora = Date.now();
  const registro = tentativasLoginPorIp.get(ip) || { falhas: 0, primeiraTentativa: agora };
  registro.falhas++;
  if (registro.falhas >= 5) {
    registro.bloqueadoAte = agora + 15 * 60 * 1000; // 15 minutos de bloqueio
  }
  tentativasLoginPorIp.set(ip, registro);
}

function limparTentativasLogin(ip) {
  tentativasLoginPorIp.delete(ip);
}

async function authAdmin(req, res, next) {
  try {
    const authHeader = req.headers["authorization"] || "";
    let token = "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else if (req.headers["x-admin-token"]) {
      token = String(req.headers["x-admin-token"]).trim();
    } else if (req.query && req.query.token) {
      token = String(req.query.token).trim();
    }

    if (!token) {
      return fail(res, 401, "Acesso restrito. Faça login como coordenador.");
    }

    const agora = Date.now();
    const sessao = await getAsync(
      "SELECT * FROM admin_sessoes WHERE token = ? AND expira_em > ?",
      [token, agora]
    );

    if (!sessao) {
      return fail(res, 401, "Sessão inválida ou expirada. Faça login novamente.");
    }

    req.adminUser = { email: sessao.email };
    next();
  } catch (err) {
    fail(res, 500, "Erro ao validar credencial administrativa.");
  }
}

function ok(res, data = {}) {
  return res.json({ ok: true, ...data });
}

function fail(res, code, erro) {
  if (code >= 500) {
    console.error("ERRO INTERNO DO SERVIDOR:", erro);
    if (process.env.NODE_ENV === "production") {
      return res.status(code).json({ ok: false, erro: "Ocorreu um erro interno no servidor." });
    }
  }
  return res.status(code).json({ ok: false, erro });
}

function norm(s) {
  return (s || "").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// ======================================================
// ROTAS DE STATUS & PING
// ======================================================
app.get("/api/ping", (req, res) => {
  ok(res, { msg: "Servidor PresenX operando", timestamp: Date.now() });
});

app.get("/api/hora", (req, res) => {
  const agora = new Date();
  const y = agora.getFullYear();
  const m = String(agora.getMonth() + 1).padStart(2, "0");
  const d = String(agora.getDate()).padStart(2, "0");
  const hh = String(agora.getHours()).padStart(2, "0");
  const mm = String(agora.getMinutes()).padStart(2, "0");
  const ss = String(agora.getSeconds()).padStart(2, "0");

  res.json({
    ok: true,
    data: `${y}-${m}-${d}`,
    hora: `${hh}:${mm}:${ss}`,
    horaNum: Number(hh),
    minNum: Number(mm)
  });
});

// ======================================================
// ROTAS DE HORÁRIOS DE TURNOS (EDITÁVEIS)
// ======================================================
app.get("/api/turnos", async (req, res) => {
  try {
    const rows = await allAsync("SELECT * FROM turnos_horarios ORDER BY turno ASC, ordem ASC");

    // Monta objeto estruturado para o frontend: { matutino: { 1: { inicio, fim }, ... } }
    const mapaTurnos = { matutino: {}, vespertino: {}, noturno: {} };
    rows.forEach(r => {
      if (!mapaTurnos[r.turno]) mapaTurnos[r.turno] = {};
      mapaTurnos[r.turno][r.chave] = { inicio: r.inicio, fim: r.fim };
    });

    ok(res, { turnos: mapaTurnos, lista: rows });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.post("/api/turnos/salvar", authAdmin, async (req, res) => {
  try {
    const { faixas } = req.body;
    if (!Array.isArray(faixas) || faixas.length === 0) {
      return fail(res, 400, "Array de faixas de horários é obrigatório");
    }

    for (const f of faixas) {
      if (f.turno && f.chave && f.inicio && f.fim) {
        await runAsync(
          `INSERT INTO turnos_horarios (turno, chave, inicio, fim, ordem)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(turno, chave) DO UPDATE SET
             inicio = excluded.inicio,
             fim = excluded.fim,
             ordem = excluded.ordem`,
          [f.turno, f.chave, f.inicio, f.fim, Number(f.ordem) || 0]
        );
        syncFirebaseSet(`turnos_horarios/${f.turno}__${f.chave}`, {
          turno: f.turno,
          chave: f.chave,
          inicio: f.inicio,
          fim: f.fim,
          ordem: Number(f.ordem) || 0
        });
      }
    }

    ok(res, { salvos: faixas.length });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

// ======================================================
// ROTAS DE PAVILHÕES & SALAS
// ======================================================
app.get("/api/pavilhoes", async (req, res) => {
  try {
    const rows = await allAsync("SELECT * FROM pavilhoes ORDER BY ordem ASC, nome ASC");
    ok(res, { pavilhoes: rows });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.post("/api/pavilhoes", authAdmin, async (req, res) => {
  try {
    const id = String(req.body.id || "").trim().toLowerCase();
    const nome = String(req.body.nome || "").trim();
    const ordem = Number(req.body.ordem) || 0;

    if (!id || !nome) return fail(res, 400, "id e nome são obrigatórios");

    await runAsync(
      `INSERT INTO pavilhoes (id, nome, ordem) VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET nome = excluded.nome, ordem = excluded.ordem`,
      [id, nome, ordem]
    );

    syncFirebaseSet(`pavilhoes/${id}`, { id, nome, ordem });

    ok(res);
  } catch (err) {
    fail(res, 500, err.message);
  }
});

// ======================================================
// ROTAS DE DISCIPLINAS / MATÉRIAS
// ======================================================
app.get("/api/disciplinas", async (req, res) => {
  try {
    const disciplinas = await allAsync("SELECT * FROM disciplinas ORDER BY nome ASC");
    const vinculos = await allAsync(`
      SELECT pd.disciplina_id, u.uid, u.nome
      FROM professores_disciplinas pd
      JOIN usuarios u ON pd.professor_uid = u.uid
      ORDER BY u.nome ASC
    `);

    const mapaProfs = {};
    vinculos.forEach(v => {
      if (!mapaProfs[v.disciplina_id]) mapaProfs[v.disciplina_id] = [];
      mapaProfs[v.disciplina_id].push({ uid: v.uid, nome: v.nome });
    });

    const lista = disciplinas.map(d => ({
      ...d,
      professores: mapaProfs[d.id] || []
    }));

    ok(res, { disciplinas: lista });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.post("/api/disciplinas", authAdmin, async (req, res) => {
  try {
    const nome = String(req.body.nome || "").trim();
    const codigo = String(req.body.codigo || "").trim();
    const cor_badge = String(req.body.cor_badge || "#2563eb").trim();
    const professores_uids = Array.isArray(req.body.professores_uids) ? req.body.professores_uids : [];
    const id = req.body.id ? Number(req.body.id) : null;

    if (!nome) return fail(res, 400, "Nome da disciplina é obrigatório");

    let disciplinaId = id;
    if (id) {
      await runAsync(
        "UPDATE disciplinas SET nome = ?, codigo = ?, cor_badge = ? WHERE id = ?",
        [nome, codigo, cor_badge, id]
      );
    } else {
      const result = await runAsync(
        "INSERT INTO disciplinas (nome, codigo, cor_badge) VALUES (?, ?, ?)",
        [nome, codigo, cor_badge]
      );
      disciplinaId = result.lastID;
    }

    // Atualizar vínculos de professores
    await runAsync("DELETE FROM professores_disciplinas WHERE disciplina_id = ?", [disciplinaId]);
    for (const pUid of professores_uids) {
      if (pUid) {
        await runAsync(
          "INSERT OR IGNORE INTO professores_disciplinas (professor_uid, disciplina_id) VALUES (?, ?)",
          [pUid, disciplinaId]
        );
      }
    }

    // Sincroniza disciplina e vínculos no Firebase
    syncFirebaseSet(`disciplinas/${disciplinaId}`, {
      id: disciplinaId,
      nome,
      codigo,
      cor_badge
    });
    if (firebaseDb) {
      firebaseDb.ref("professores_disciplinas").once("value").then(snap => {
        const todosPD = snap.val() || {};
        for (const [k, v] of Object.entries(todosPD)) {
          if (v && Number(v.disciplina_id) === Number(disciplinaId)) {
            firebaseDb.ref(`professores_disciplinas/${k}`).remove().catch(() => {});
          }
        }
        for (const pUid of professores_uids) {
          if (pUid) {
            firebaseDb.ref(`professores_disciplinas/${pUid}__${disciplinaId}`).set({
              professor_uid: pUid,
              disciplina_id: Number(disciplinaId)
            }).catch(() => {});
          }
        }
      }).catch(e => console.warn("Aviso ao sincronizar vinculos disciplina:", e.message));
    }

    ok(res, { id: disciplinaId });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.delete("/api/disciplinas/:id", authAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    await runAsync("DELETE FROM professores_disciplinas WHERE disciplina_id = ?", [id]);
    const result = await runAsync("DELETE FROM disciplinas WHERE id = ?", [id]);

    syncFirebaseRemove(`disciplinas/${id}`);
    if (firebaseDb) {
      firebaseDb.ref("professores_disciplinas").once("value").then(snap => {
        const todosPD = snap.val() || {};
        for (const [k, v] of Object.entries(todosPD)) {
          if (v && Number(v.disciplina_id) === Number(id)) {
            firebaseDb.ref(`professores_disciplinas/${k}`).remove().catch(() => {});
          }
        }
      }).catch(e => console.warn("Aviso ao remover vinculos disciplina Firebase:", e.message));
    }

    ok(res, { removidos: result.changes });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

// ======================================================
// ROTAS DE TURMAS
// ======================================================
app.get("/api/turmas", async (req, res) => {
  try {
    const turno = req.query.turno ? String(req.query.turno).toLowerCase() : null;
    const pavilhao = req.query.pavilhao ? String(req.query.pavilhao).toLowerCase() : null;

    let sql = `
      SELECT t.*, p.nome AS pavilhao_nome
      FROM turmas t
      LEFT JOIN pavilhoes p ON t.pavilhao_id = p.id
    `;
    const params = [];
    const where = [];

    if (turno) {
      where.push("t.turno = ?");
      params.push(turno);
    }
    if (pavilhao) {
      where.push("t.pavilhao_id = ?");
      params.push(pavilhao);
    }

    if (where.length) sql += " WHERE " + where.join(" AND ");
    sql += " ORDER BY t.ordem ASC, t.nome ASC";

    const rows = await allAsync(sql, params);
    ok(res, { turmas: rows });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.post("/api/turmas", authAdmin, async (req, res) => {
  try {
    const id = String(req.body.id || "").trim().toUpperCase();
    const nome = String(req.body.nome || id).trim();
    const turno = String(req.body.turno || "matutino").trim().toLowerCase();
    const pavilhao_id = String(req.body.pavilhao_id || "acm").trim().toLowerCase();
    const sala_nome = String(req.body.sala_nome || nome).trim();

    if (!id || !nome || !turno) {
      return fail(res, 400, "id, nome e turno são obrigatórios");
    }

    await runAsync(
      `INSERT INTO turmas (id, nome, turno, pavilhao_id, sala_nome)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         nome = excluded.nome,
         turno = excluded.turno,
         pavilhao_id = excluded.pavilhao_id,
         sala_nome = excluded.sala_nome`,
      [id, nome, turno, pavilhao_id, sala_nome]
    );

    syncFirebaseSet(`turmas/${id}`, {
      id,
      nome,
      turno,
      pavilhao_id,
      sala_nome,
      ordem: Number(req.body.ordem) || 0
    });

    ok(res);
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.delete("/api/turmas/:id", authAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    await runAsync("DELETE FROM grade_horarios WHERE turma_id = ?", [id]);
    const result = await runAsync("DELETE FROM turmas WHERE id = ?", [id]);

    syncFirebaseRemove(`turmas/${id}`);
    if (firebaseDb) {
      firebaseDb.ref("grade_horarios").once("value").then(snap => {
        const todasGrades = snap.val() || {};
        for (const [k, v] of Object.entries(todasGrades)) {
          if (v && v.turma_id === id) {
            firebaseDb.ref(`grade_horarios/${k}`).remove().catch(() => {});
          }
        }
      }).catch(e => console.warn("Aviso ao remover grade da turma no Firebase:", e.message));
    }

    ok(res, { removidos: result.changes });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

// ======================================================
// ROTAS DE GRADE DE HORÁRIOS
// ======================================================
app.get("/api/grade/:turmaId", async (req, res) => {
  try {
    const turmaId = req.params.turmaId;
    const turma = await getAsync("SELECT * FROM turmas WHERE id = ?", [turmaId]);
    const grade = await allAsync(
      "SELECT * FROM grade_horarios WHERE turma_id = ? ORDER BY dia ASC, horario ASC",
      [turmaId]
    );

    const matriz = { seg: {}, ter: {}, qua: {}, qui: {}, sex: {} };
    grade.forEach(g => {
      if (matriz[g.dia]) {
        matriz[g.dia][g.horario] = {
          disciplina: g.disciplina,
          professor: g.professor
        };
      }
    });

    ok(res, { turma, grade, matriz });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.post("/api/grade/salvar-semanal", async (req, res) => {
  try {
    const { turma_id, grade } = req.body;
    if (!turma_id || !Array.isArray(grade)) {
      return fail(res, 400, "turma_id e grade (array) são obrigatórios");
    }

    await runAsync("BEGIN TRANSACTION");
    await runAsync("DELETE FROM grade_horarios WHERE turma_id = ?", [turma_id]);

    for (const item of grade) {
      if (item.dia && item.horario && item.disciplina) {
        await runAsync(
          `INSERT INTO grade_horarios (turma_id, dia, horario, disciplina, professor)
           VALUES (?, ?, ?, ?, ?)`,
          [turma_id, item.dia, Number(item.horario), String(item.disciplina).trim(), String(item.professor || "").trim()]
        );
      }
    }

    await runAsync("COMMIT");

    if (firebaseDb) {
      firebaseDb.ref("grade_horarios").once("value").then(snap => {
        const todasGrades = snap.val() || {};
        for (const [k, v] of Object.entries(todasGrades)) {
          if (v && v.turma_id === turma_id) {
            firebaseDb.ref(`grade_horarios/${k}`).remove().catch(() => {});
          }
        }
        for (const item of grade) {
          if (item.dia && item.horario && item.disciplina) {
            const key = `${turma_id}__${item.dia}__${item.horario}`;
            firebaseDb.ref(`grade_horarios/${key}`).set({
              turma_id,
              dia: item.dia,
              horario: Number(item.horario),
              disciplina: String(item.disciplina).trim(),
              professor: String(item.professor || "").trim()
            }).catch(() => {});
          }
        }
      }).catch(e => console.warn("Aviso ao sincronizar grade no Firebase:", e.message));
    }

    ok(res, { total_salvos: grade.length });
  } catch (err) {
    try { await runAsync("ROLLBACK"); } catch (_) {}
    fail(res, 500, err.message);
  }
});

app.post("/api/grade/copiar", authAdmin, async (req, res) => {
  try {
    const { turma_origem, turma_destino } = req.body;
    if (!turma_origem || !turma_destino) {
      return fail(res, 400, "turma_origem e turma_destino são obrigatórias");
    }

    const gradeOrigem = await allAsync("SELECT * FROM grade_horarios WHERE turma_id = ?", [turma_origem]);
    await runAsync("DELETE FROM grade_horarios WHERE turma_id = ?", [turma_destino]);

    for (const item of gradeOrigem) {
      await runAsync(
        `INSERT INTO grade_horarios (turma_id, dia, horario, disciplina, professor)
         VALUES (?, ?, ?, ?, ?)`,
        [turma_destino, item.dia, item.horario, item.disciplina, item.professor]
      );
    }

    if (firebaseDb) {
      firebaseDb.ref("grade_horarios").once("value").then(snap => {
        const todasGrades = snap.val() || {};
        for (const [k, v] of Object.entries(todasGrades)) {
          if (v && v.turma_id === turma_destino) {
            firebaseDb.ref(`grade_horarios/${k}`).remove().catch(() => {});
          }
        }
        for (const item of gradeOrigem) {
          const key = `${turma_destino}__${item.dia}__${item.horario}`;
          firebaseDb.ref(`grade_horarios/${key}`).set({
            turma_id: turma_destino,
            dia: item.dia,
            horario: item.horario,
            disciplina: item.disciplina,
            professor: item.professor
          }).catch(() => {});
        }
      }).catch(e => console.warn("Aviso ao copiar grade no Firebase:", e.message));
    }

    ok(res, { copiados: gradeOrigem.length });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

// ======================================================
// DADOS COMPLETOS PARA O PAINEL DE TV (COM VÍNCULO UID)
// ======================================================
app.get("/api/painel-dados", async (req, res) => {
  try {
    const pavilhoes = await allAsync("SELECT * FROM pavilhoes ORDER BY ordem ASC, nome ASC");
    const turmas = await allAsync("SELECT * FROM turmas ORDER BY ordem ASC, nome ASC");
    const grade = await allAsync("SELECT * FROM grade_horarios");
    const usuarios = await allAsync("SELECT uid, nome FROM usuarios WHERE ativo = 1");

    // Mapa de nome normalizado de professor -> UID
    const mapaProfUid = {};
    usuarios.forEach(u => {
      mapaProfUid[norm(u.nome)] = u.uid;
    });

    const mapaTurmas = {};
    turmas.forEach(t => {
      mapaTurmas[t.id] = {
        id: t.id,
        turma: t.nome,
        turno: t.turno,
        pavilhao: t.pavilhao_id,
        sala: t.sala_nome,
        dias: {}
      };
    });

    grade.forEach(g => {
      if (mapaTurmas[g.turma_id]) {
        if (!mapaTurmas[g.turma_id].dias[g.dia]) {
          mapaTurmas[g.turma_id].dias[g.dia] = {};
        }

        const profNomes = g.professor ? g.professor.split(",").map(s => s.trim()).filter(Boolean) : [];
        const professoresDetalhados = profNomes.map(nomeProf => ({
          nome: nomeProf,
          uid: mapaProfUid[norm(nomeProf)] || null
        }));

        mapaTurmas[g.turma_id].dias[g.dia][g.horario] = {
          disciplina: g.disciplina,
          professor: g.professor,
          professores: profNomes,
          professores_detalhes: professoresDetalhados
        };
      }
    });

    ok(res, { pavilhoes, turmas: mapaTurmas });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

// ======================================================
// ROTAS DE PROFESSORES / USUÁRIOS
// ======================================================
app.get("/api/usuarios", async (req, res) => {
  try {
    const usuarios = await allAsync("SELECT * FROM usuarios ORDER BY nome ASC");
    const vinculos = await allAsync(`
      SELECT pd.professor_uid, d.id AS disciplina_id, d.nome AS disciplina_nome
      FROM professores_disciplinas pd
      JOIN disciplinas d ON pd.disciplina_id = d.id
      ORDER BY d.nome ASC
    `);

    const mapaDiscs = {};
    vinculos.forEach(v => {
      if (!mapaDiscs[v.professor_uid]) mapaDiscs[v.professor_uid] = [];
      mapaDiscs[v.professor_uid].push({ id: v.disciplina_id, nome: v.disciplina_nome });
    });

    const lista = usuarios.map(u => ({
      ...u,
      disciplinas: mapaDiscs[u.uid] || []
    }));

    ok(res, { usuarios: lista });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.get("/api/professores", async (req, res) => {
  try {
    const rows = await allAsync("SELECT * FROM usuarios ORDER BY nome ASC");
    ok(res, { professores: rows });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.post("/api/usuarios", authAdmin, async (req, res) => {
  try {
    const uid = String(req.body.uid || "").trim().toUpperCase();
    const nome = String(req.body.nome || "").trim();
    const curso = String(req.body.curso || "").trim();
    const ativo = req.body.ativo !== false && req.body.ativo !== 0 ? 1 : 0;
    const disciplinas_ids = Array.isArray(req.body.disciplinas_ids) ? req.body.disciplinas_ids : [];

    if (!uid || !nome) {
      return fail(res, 400, "UID e Nome são obrigatórios");
    }

    await runAsync(
      `INSERT INTO usuarios (uid, nome, curso, ativo, sincronizado)
       VALUES (?, ?, ?, ?, 0)
       ON CONFLICT(uid) DO UPDATE SET
         nome = excluded.nome,
         curso = excluded.curso,
         ativo = excluded.ativo,
         sincronizado = 0`,
      [uid, nome, curso, ativo]
    );

    if (req.body.disciplinas_ids !== undefined) {
      await runAsync("DELETE FROM professores_disciplinas WHERE professor_uid = ?", [uid]);
      for (const dId of disciplinas_ids) {
        if (dId) {
          await runAsync(
            "INSERT OR IGNORE INTO professores_disciplinas (professor_uid, disciplina_id) VALUES (?, ?)",
            [uid, Number(dId)]
          );
        }
      }
    }

    // Sincroniza professor no Firebase
    syncFirebaseSet(`usuarios/${uid}`, {
      nome,
      curso,
      ativo: ativo === 1
    });

    if (firebaseDb && req.body.disciplinas_ids !== undefined) {
      firebaseDb.ref("professores_disciplinas").once("value").then(snap => {
        const todosPD = snap.val() || {};
        for (const [k, v] of Object.entries(todosPD)) {
          if (v && v.professor_uid === uid) {
            firebaseDb.ref(`professores_disciplinas/${k}`).remove().catch(() => {});
          }
        }
        for (const dId of disciplinas_ids) {
          if (dId) {
            firebaseDb.ref(`professores_disciplinas/${uid}__${dId}`).set({
              professor_uid: uid,
              disciplina_id: Number(dId)
            }).catch(() => {});
          }
        }
      }).catch(e => console.warn("Aviso ao sincronizar vinculos professor Firebase:", e.message));
    }

    ok(res);
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.delete("/api/usuarios/:uid", authAdmin, async (req, res) => {
  try {
    const uid = String(req.params.uid || "").trim().toUpperCase();
    await runAsync("DELETE FROM professores_disciplinas WHERE professor_uid = ?", [uid]);
    const result = await runAsync("DELETE FROM usuarios WHERE uid = ?", [uid]);

    syncFirebaseRemove(`usuarios/${uid}`);
    if (firebaseDb) {
      firebaseDb.ref("professores_disciplinas").once("value").then(snap => {
        const todosPD = snap.val() || {};
        for (const [k, v] of Object.entries(todosPD)) {
          if (v && v.professor_uid === uid) {
            firebaseDb.ref(`professores_disciplinas/${k}`).remove().catch(() => {});
          }
        }
      }).catch(e => console.warn("Aviso ao remover vinculos professor Firebase:", e.message));
    }

    ok(res, { removidos: result.changes });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

// ======================================================
// ROTAS DE PRESENÇAS & ÚLTIMO ACESSO
// ======================================================
async function salvarUltimoAcesso({ uid, nome, curso, hora, data, status }) {
  await runAsync(
    `INSERT INTO ultimo_acesso (chave, uid, nome, curso, hora, data, status, sincronizado)
     VALUES ('ultimo', ?, ?, ?, ?, ?, ?, 0)
     ON CONFLICT(chave) DO UPDATE SET
       uid = excluded.uid,
       nome = excluded.nome,
       curso = excluded.curso,
       hora = excluded.hora,
       data = excluded.data,
       status = excluded.status,
       sincronizado = 0`,
    [uid, nome, curso || "", hora, data, status]
  );

  if (firebaseDb) {
    firebaseDb.ref("ultimo_acesso").set({
      uid,
      nome,
      curso: curso || "",
      hora,
      data,
      status,
      timestamp: Date.now()
    }).catch(e => console.warn("Aviso ao sincronizar ultimo_acesso com Firebase:", e.message));
  }
}

app.get("/api/ultimo-acesso", async (req, res) => {
  try {
    const row = await getAsync("SELECT * FROM ultimo_acesso WHERE chave = 'ultimo'");
    ok(res, { ultimoAcesso: row || null });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.get("/api/presencas", async (req, res) => {
  try {
    const data = String(req.query.data || "").trim();
    if (!data) return fail(res, 400, "data é obrigatória");

    const rows = await allAsync(
      "SELECT * FROM presencas WHERE data = ? ORDER BY nome ASC",
      [data]
    );
    ok(res, { presencas: rows });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

// ======================================================
// ROTAS DE MONITORAMENTO DE LEITORES RFID (HEARTBEAT)
// ======================================================
app.post("/api/leitores/ping", async (req, res) => {
  try {
    const id = String(req.body.id || req.body.leitor_id || "leitor_portaria").trim().toLowerCase();
    const nome = String(req.body.nome || req.body.leitor_nome || "Leitor Portaria").trim();
    const local = String(req.body.local || "Portaria").trim();
    const ip = String(req.body.ip || req.ip || "").replace(/^.*:/, "").trim();

    await runAsync(
      `INSERT INTO leitores_rfid (id, nome, local, ip, ultimo_ping, total_leituras_hoje)
       VALUES (?, ?, ?, ?, ?, 0)
       ON CONFLICT(id) DO UPDATE SET
         nome = excluded.nome,
         local = excluded.local,
         ip = CASE WHEN excluded.ip != '' THEN excluded.ip ELSE leitores_rfid.ip END,
         ultimo_ping = excluded.ultimo_ping`,
      [id, nome, local, ip, Date.now()]
    );

    ok(res, { msg: "Ping do leitor registrado com sucesso" });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.get("/api/leitores", async (req, res) => {
  try {
    const rows = await allAsync("SELECT * FROM leitores_rfid ORDER BY nome ASC");
    const agora = Date.now();
    const LIMITE_OFFLINE_MS = 90 * 1000; // 90s sem ping = offline

    const leitores = rows.map(r => {
      const diffSeg = r.ultimo_ping ? Math.max(0, Math.floor((agora - r.ultimo_ping) / 1000)) : 999999;
      const online = diffSeg < 90 && r.ultimo_ping > 0;
      let tempoTexto = "nunca";
      if (r.ultimo_ping > 0) {
        if (diffSeg < 60) tempoTexto = `há ${diffSeg}s`;
        else if (diffSeg < 3600) tempoTexto = `há ${Math.floor(diffSeg / 60)}min`;
        else tempoTexto = `há ${Math.floor(diffSeg / 3600)}h`;
      }

      return {
        id: r.id,
        nome: r.nome,
        local: r.local,
        ip: r.ip,
        ultimo_ping: r.ultimo_ping,
        tempo_decorrido: tempoTexto,
        online,
        total_leituras_hoje: r.total_leituras_hoje || 0
      };
    });

    ok(res, { leitores });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

function obterIPLocal() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

app.get("/api/servidor/info", (req, res) => {
  const ip = obterIPLocal();
  ok(res, {
    ip,
    porta: PORT,
    hostname: os.hostname(),
    url_base: `http://${ip}:${PORT}`,
    url_presenca: `http://${ip}:${PORT}/api/presenca`,
    url_ping: `http://${ip}:${PORT}/api/leitores/ping`
  });
});

app.delete("/api/leitores/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await runAsync("DELETE FROM leitores_rfid WHERE id = ?", [id]);
    ok(res, { msg: "Leitor removido com sucesso" });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.post("/api/leitores/reset-status", async (req, res) => {
  try {
    await runAsync("UPDATE leitores_rfid SET ultimo_ping = 0, ip = ''");
    ok(res, { msg: "Status de conexão dos leitores resetado com sucesso" });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.post("/api/presenca", async (req, res) => {
  try {
    const agora = new Date();
    const y = agora.getFullYear();
    const m = String(agora.getMonth() + 1).padStart(2, "0");
    const d = String(agora.getDate()).padStart(2, "0");
    const hh = String(agora.getHours()).padStart(2, "0");
    const mm = String(agora.getMinutes()).padStart(2, "0");
    const ss = String(agora.getSeconds()).padStart(2, "0");

    const dataPadrao = `${y}-${m}-${d}`;
    const horaPadrao = `${hh}:${mm}:${ss}`;

    const data = String(req.body.data || dataPadrao).trim();
    const hora = String(req.body.hora || horaPadrao).trim();
    const uid = String(req.body.uid || req.body.identifier || "").trim().toUpperCase();
    const leitorId = String(req.body.leitor_id || req.body.leitor || "leitor_portaria").trim().toLowerCase();
    const leitorNome = String(req.body.leitor_nome || "Leitor Portaria").trim();
    const ipCliente = String(req.ip || "").replace(/^.*:/, "").trim();

    if (!uid) {
      return fail(res, 400, "uid é obrigatório");
    }

    // Registra/atualiza heartbeat do leitor que enviou o cartão
    await runAsync(
      `INSERT INTO leitores_rfid (id, nome, local, ip, ultimo_ping, total_leituras_hoje)
       VALUES (?, ?, 'Portaria', ?, ?, 1)
       ON CONFLICT(id) DO UPDATE SET
         ultimo_ping = excluded.ultimo_ping,
         ip = CASE WHEN excluded.ip != '' THEN excluded.ip ELSE leitores_rfid.ip END,
         total_leituras_hoje = total_leituras_hoje + 1`,
      [leitorId, leitorNome, ipCliente, Date.now()]
    );

    const usuario = await getAsync("SELECT * FROM usuarios WHERE uid = ?", [uid]);
    if (!usuario) {
      await salvarUltimoAcesso({
        uid,
        nome: "Cartão Não Cadastrado",
        curso: "",
        hora,
        data,
        status: "Desconhecido"
      });
      return res.status(200).json({
        ok: false,
        status: "fail",
        allowed: false,
        acao: "negado",
        action: "negado",
        nome: "Não cadastrado",
        name: "Não cadastrado",
        uid,
        mensagem: "Cartão não cadastrado",
        message: "Cartao nao cadastrado"
      });
    }

    if (usuario.ativo !== 1) {
      return res.status(200).json({
        ok: false,
        status: "fail",
        allowed: false,
        acao: "bloqueado",
        action: "bloqueado",
        nome: usuario.nome,
        name: usuario.nome,
        mensagem: "Usuário inativo",
        message: "Usuario inativo"
      });
    }

    const presenca = await getAsync(
      "SELECT * FROM presencas WHERE data = ? AND uid = ?",
      [data, uid]
    );

    if (!presenca) {
      await runAsync(
        `INSERT INTO presencas (data, uid, nome, curso, status, hora_entrada, hora_saida, sincronizado)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [data, uid, usuario.nome, usuario.curso || "", "Presente", hora, ""]
      );

      await salvarUltimoAcesso({
        uid,
        nome: usuario.nome,
        curso: usuario.curso,
        hora,
        data,
        status: "Presente"
      });

      if (firebaseDb) {
        const safeUid = uid.replace(/[.#$\[\]]/g, "_");
        firebaseDb.ref(`presencas/${data}/${safeUid}`).set({
          uid,
          nome: usuario.nome,
          curso: usuario.curso || "",
          status: "Presente",
          hora_entrada: hora,
          hora_saida: "",
          data,
          timestamp: Date.now()
        }).catch(e => console.warn("Aviso ao sincronizar presenca no Firebase:", e.message));
      }

      return ok(res, {
        ok: true,
        allowed: true,
        status: "success",
        acao: "entrada",
        action: "entrada",
        nome: usuario.nome,
        name: usuario.nome,
        curso: usuario.curso,
        hora,
        mensagem: "Entrada liberada",
        message: "Entrada liberada"
      });
    }

    const novoStatus = presenca.status === "Presente" ? "Ausente" : "Presente";
    const novaEntrada = novoStatus === "Presente" ? hora : presenca.hora_entrada;
    const novaSaida = novoStatus === "Ausente" ? hora : "";

    await runAsync(
      `UPDATE presencas
       SET status = ?, hora_entrada = ?, hora_saida = ?, nome = ?, curso = ?, sincronizado = 0
       WHERE data = ? AND uid = ?`,
      [novoStatus, novaEntrada, novaSaida, usuario.nome, usuario.curso || "", data, uid]
    );

    await salvarUltimoAcesso({
      uid,
      nome: usuario.nome,
      curso: usuario.curso,
      hora,
      data,
      status: novoStatus
    });

    if (firebaseDb) {
      const safeUid = uid.replace(/[.#$\[\]]/g, "_");
      firebaseDb.ref(`presencas/${data}/${safeUid}`).set({
        uid,
        nome: usuario.nome,
        curso: usuario.curso || "",
        status: novoStatus,
        hora_entrada: novaEntrada,
        hora_saida: novaSaida,
        data,
        timestamp: Date.now()
      }).catch(e => console.warn("Aviso ao sincronizar presenca no Firebase:", e.message));
    }

    ok(res, {
      ok: true,
      allowed: true,
      status: "success",
      acao: novoStatus === "Presente" ? "entrada" : "saida",
      action: novoStatus === "Presente" ? "entrada" : "saida",
      nome: usuario.nome,
      name: usuario.nome,
      curso: usuario.curso,
      hora,
      mensagem: novoStatus === "Presente" ? "Entrada liberada" : "Saída liberada",
      message: novoStatus === "Presente" ? "Entrada liberada" : "Saida liberada"
    });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.post("/api/reset-presencas", async (req, res) => {
  try {
    const data = String(req.body.data || "").trim();
    const hora = String(req.body.hora || "").trim();

    if (!data || !hora) return fail(res, 400, "data e hora são obrigatórias");

    const result = await runAsync(
      `UPDATE presencas
       SET status = 'Ausente',
           hora_saida = CASE
             WHEN hora_saida IS NULL OR hora_saida = '' THEN ?
             ELSE hora_saida
           END,
           sincronizado = 0
       WHERE data = ? AND status = 'Presente'`,
      [hora, data]
    );

    ok(res, { resetados: result.changes });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

// ======================================================
// ROTAS DE AVISOS & EVENTOS
// ======================================================
app.get("/api/avisos", async (req, res) => {
  try {
    const rows = await allAsync("SELECT * FROM avisos ORDER BY expiracao ASC, id DESC");
    ok(res, { avisos: rows });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.post("/api/avisos", authAdmin, async (req, res) => {
  try {
    const titulo = String(req.body.titulo || "").trim();
    const mensagem = String(req.body.mensagem || "").trim();
    const prioridade = String(req.body.prioridade || "normal").trim().toLowerCase();
    const expiracao = String(req.body.expiracao || "").trim();
    const ativo = req.body.ativo !== false ? 1 : 0;
    const criado_em = Date.now();

    if (!titulo || !mensagem || !expiracao) {
      return fail(res, 400, "Título, mensagem e data de expiração são obrigatórios");
    }

    const result = await runAsync(
      `INSERT INTO avisos (titulo, mensagem, prioridade, expiracao, ativo, criado_em, sincronizado)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [titulo, mensagem, prioridade, expiracao, ativo, criado_em]
    );

    syncFirebaseSet(`avisos/${result.lastID}`, {
      id: result.lastID,
      titulo,
      mensagem,
      prioridade,
      expiracao,
      ativo: ativo === 1,
      criado_em
    });

    ok(res, { id: result.lastID });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.put("/api/avisos/:id", authAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const titulo = String(req.body.titulo || "").trim();
    const mensagem = String(req.body.mensagem || "").trim();
    const prioridade = String(req.body.prioridade || "normal").trim().toLowerCase();
    const expiracao = String(req.body.expiracao || "").trim();
    const ativo = req.body.ativo !== false ? 1 : 0;

    if (!titulo || !mensagem || !expiracao) {
      return fail(res, 400, "Título, mensagem e data de expiração são obrigatórios");
    }

    const result = await runAsync(
      `UPDATE avisos 
       SET titulo = ?, mensagem = ?, prioridade = ?, expiracao = ?, ativo = ?, sincronizado = 0
       WHERE id = ?`,
      [titulo, mensagem, prioridade, expiracao, ativo, id]
    );

    syncFirebaseUpdate(`avisos/${id}`, {
      titulo,
      mensagem,
      prioridade,
      expiracao,
      ativo: ativo === 1
    });

    ok(res, { atualizados: result.changes });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.delete("/api/avisos/:id", authAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await runAsync("DELETE FROM avisos WHERE id = ?", [id]);
    syncFirebaseRemove(`avisos/${id}`);
    ok(res, { removidos: result.changes });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.get("/api/eventos", async (req, res) => {
  try {
    const rows = await allAsync("SELECT * FROM eventos ORDER BY data ASC, id ASC");
    ok(res, { eventos: rows });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.post("/api/eventos", authAdmin, async (req, res) => {
  try {
    const titulo = String(req.body.titulo || "").trim();
    const descricao = String(req.body.descricao || "").trim();
    const data = String(req.body.data || "").trim();

    if (!titulo || !data) {
      return fail(res, 400, "Título e data são obrigatórios");
    }

    const result = await runAsync(
      `INSERT INTO eventos (titulo, descricao, data, sincronizado)
       VALUES (?, ?, ?, 0)`,
      [titulo, descricao, data]
    );

    syncFirebaseSet(`eventos/${result.lastID}`, {
      id: result.lastID,
      titulo,
      descricao,
      data
    });

    ok(res, { id: result.lastID });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.put("/api/eventos/:id", authAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const titulo = String(req.body.titulo || "").trim();
    const descricao = String(req.body.descricao || "").trim();
    const data = String(req.body.data || "").trim();

    if (!titulo || !data) {
      return fail(res, 400, "Título e data são obrigatórios");
    }

    const result = await runAsync(
      `UPDATE eventos
       SET titulo = ?, descricao = ?, data = ?, sincronizado = 0
       WHERE id = ?`,
      [titulo, descricao, data, id]
    );

    syncFirebaseUpdate(`eventos/${id}`, {
      titulo,
      descricao,
      data
    });

    ok(res, { atualizados: result.changes });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.delete("/api/eventos/:id", authAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await runAsync("DELETE FROM eventos WHERE id = ?", [id]);
    syncFirebaseRemove(`eventos/${id}`);
    ok(res, { removidos: result.changes });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

// ======================================================
// LOGIN LOCAL COM HASH CRIPTOGRÁFICO SEGURO
// ======================================================
app.post("/api/login", rateLimitLogin, async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const senha = String(req.body.senha || "").trim();

    if (!email || !senha) return fail(res, 400, "Email e senha são obrigatórios");

    let row = await getAsync("SELECT * FROM admin_usuarios WHERE email = ?", [email]);
    
    // Auto-criação do admin caso o banco tenha sido iniciado sem registro
    if (!row && email === "admin@presenx.com") {
      const senhaPadrao = process.env.ADMIN_INITIAL_PASSWORD || "admin123";
      if (senha === senhaPadrao) {
        const hash = hashPassword(senhaPadrao);
        await runAsync("INSERT OR REPLACE INTO admin_usuarios (email, senha) VALUES ('admin@presenx.com', ?)", [hash]);
        row = { email: "admin@presenx.com", senha: hash };
      }
    }
    if (row && verifyPassword(senha, row.senha)) {
      limparTentativasLogin(req.ip || "unknown");

      const token = "px_" + crypto.randomBytes(32).toString("hex");
      const expira_em = Date.now() + 24 * 60 * 60 * 1000; // 24 horas

      await runAsync(
        "INSERT INTO admin_sessoes (token, email, expira_em) VALUES (?, ?, ?)",
        [token, row.email, expira_em]
      );

      return ok(res, { token, user: { email: row.email }, expira_em });
    }

    registrarFalhaLogin(req.ip || "unknown");
    fail(res, 401, "Email ou senha inválidos.");
  } catch (err) {
    fail(res, 500, "Erro ao processar login.");
  }
});

app.post("/api/logout", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"] || "";
    let token = "";
    if (authHeader.startsWith("Bearer ")) token = authHeader.substring(7).trim();
    else if (req.headers["x-admin-token"]) token = String(req.headers["x-admin-token"]).trim();

    if (token) {
      await runAsync("DELETE FROM admin_sessoes WHERE token = ?", [token]);
    }
    ok(res, { mensagem: "Logout realizado com sucesso" });
  } catch (err) {
    fail(res, 500, "Erro ao realizar logout.");
  }
});

// ======================================================
// VINCULAR CARTÃO RFID A PROFESSOR EXISTENTE
// ======================================================
app.post("/api/vincular-cartao", authAdmin, async (req, res) => {
  try {
    const uid_antigo = String(req.body.uid_antigo || "").trim().toUpperCase();
    const uid_novo = String(req.body.uid_novo || "").trim().toUpperCase();

    if (!uid_antigo || !uid_novo) {
      return fail(res, 400, "uid_antigo e uid_novo são obrigatórios");
    }

    const profAntigo = await getAsync("SELECT * FROM usuarios WHERE uid = ?", [uid_antigo]);
    if (!profAntigo) return fail(res, 404, "Professor não encontrado");

    const jaExiste = await getAsync("SELECT * FROM usuarios WHERE uid = ? AND uid != ?", [uid_novo, uid_antigo]);
    if (jaExiste) return fail(res, 400, `O cartão ${uid_novo} já está cadastrado para o professor ${jaExiste.nome}`);

    // Cria/atualiza o usuário com o novo UID
    await runAsync(
      `INSERT INTO usuarios (uid, nome, curso, ativo, sincronizado)
       VALUES (?, ?, ?, ?, 0)
       ON CONFLICT(uid) DO UPDATE SET nome = excluded.nome, curso = excluded.curso, ativo = excluded.ativo`,
      [uid_novo, profAntigo.nome, profAntigo.curso || "", profAntigo.ativo]
    );

    // Transfere vínculos de disciplinas
    await runAsync("UPDATE OR IGNORE professores_disciplinas SET professor_uid = ? WHERE professor_uid = ?", [uid_novo, uid_antigo]);
    await runAsync("UPDATE OR IGNORE presencas SET uid = ? WHERE uid = ?", [uid_novo, uid_antigo]);

    // Remove registro antigo se for diferente
    if (uid_novo !== uid_antigo) {
      await runAsync("DELETE FROM professores_disciplinas WHERE professor_uid = ?", [uid_antigo]);
      await runAsync("DELETE FROM usuarios WHERE uid = ?", [uid_antigo]);
    }

    ok(res, { msg: `Cartão ${uid_novo} vinculado com sucesso a ${profAntigo.nome}!` });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

// ======================================================
// ALTERAÇÃO DE SENHA DO ADMINISTRADOR
// ======================================================
app.post("/api/alterar-senha", async (req, res) => {
  try {
    const email = String(req.body.email || "admin@presenx.com").trim().toLowerCase();
    const senha_atual = String(req.body.senha_atual || "").trim();
    const nova_senha = String(req.body.nova_senha || "").trim();

    if (!senha_atual || !nova_senha) {
      return fail(res, 400, "Senha atual e nova senha são obrigatórias");
    }
    if (nova_senha.length < 6) {
      return fail(res, 400, "A nova senha deve ter pelo menos 6 caracteres");
    }

    const row = await getAsync("SELECT * FROM admin_usuarios WHERE email = ?", [email]);
    if (!row || !verifyPassword(senha_atual, row.senha)) {
      return fail(res, 401, "Senha atual incorreta");
    }

    const novoHash = hashPassword(nova_senha);
    await runAsync("UPDATE admin_usuarios SET senha = ? WHERE email = ?", [novoHash, email]);

    if (firebaseDb) {
      const safeKey = email.replace(/[.#$\[\]]/g, "_");
      firebaseDb.ref(`admin_usuarios/${safeKey}`).update({
        senha: novoHash,
        atualizado_em: Date.now()
      }).catch(e => console.warn("Aviso ao atualizar senha no Firebase:", e.message));
    }

    ok(res, { msg: "Senha alterada com sucesso!" });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

// ======================================================
// GESTÃO DE COORDENADORES / USUÁRIOS ADMINISTRATIVOS
// ======================================================
app.get("/api/admin-usuarios", authAdmin, async (req, res) => {
  try {
    const rows = await allAsync("SELECT id, email FROM admin_usuarios ORDER BY id ASC");
    ok(res, { usuarios: rows });
  } catch (err) {
    fail(res, 500, "Erro ao listar coordenadores.");
  }
});

app.post("/api/admin-usuarios", authAdmin, async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const senha = String(req.body.senha || "").trim();

    if (!email || !senha) {
      return fail(res, 400, "E-mail e senha são obrigatórios.");
    }
    if (senha.length < 6) {
      return fail(res, 400, "A senha deve ter pelo menos 6 caracteres.");
    }
    if (!email.includes("@")) {
      return fail(res, 400, "Informe um e-mail válido.");
    }

    const jaExiste = await getAsync("SELECT id FROM admin_usuarios WHERE email = ?", [email]);
    if (jaExiste) {
      return fail(res, 400, "Este e-mail já está cadastrado.");
    }

    const hash = hashPassword(senha);
    await runAsync("INSERT INTO admin_usuarios (email, senha) VALUES (?, ?)", [email, hash]);

    if (firebaseDb) {
      const safeKey = email.replace(/[.#$\[\]]/g, "_");
      firebaseDb.ref(`admin_usuarios/${safeKey}`).set({
        email,
        senha: hash,
        criado_em: Date.now()
      }).catch(e => console.warn("Aviso ao salvar admin no Firebase:", e.message));
    }

    ok(res, { mensagem: "Coordenador cadastrado com sucesso!" });
  } catch (err) {
    fail(res, 500, "Erro ao cadastrar coordenador.");
  }
});

app.delete("/api/admin-usuarios/:id", authAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return fail(res, 400, "ID inválido.");

    const row = await getAsync("SELECT email FROM admin_usuarios WHERE id = ?", [id]);
    if (!row) return fail(res, 404, "Usuário não encontrado.");

    if (row.email === "admin@presenx.com") {
      return fail(res, 400, "O usuário mestre admin@presenx.com não pode ser removido.");
    }

    if (req.adminUser && req.adminUser.email === row.email) {
      return fail(res, 400, "Você não pode excluir sua própria conta enquanto estiver logado.");
    }

    await runAsync("DELETE FROM admin_usuarios WHERE id = ?", [id]);
    await runAsync("DELETE FROM admin_sessoes WHERE email = ?", [row.email]);

    if (firebaseDb) {
      const safeKey = row.email.replace(/[.#$\[\]]/g, "_");
      firebaseDb.ref(`admin_usuarios/${safeKey}`).remove()
        .catch(e => console.warn("Aviso ao remover admin no Firebase:", e.message));
    }

    ok(res, { mensagem: "Coordenador removido com sucesso." });
  } catch (err) {
    fail(res, 500, "Erro ao remover coordenador.");
  }
});

// ======================================================
// ROTAS DE BACKUP & PERSISTÊNCIA COMPLETA (NUVEM + LOCAL)
// ======================================================
app.get("/api/backup/status", authAdmin, async (req, res) => {
  try {
    const tabelas = [
      'admin_usuarios', 'usuarios', 'disciplinas', 'turmas',
      'professores_disciplinas', 'grade_horarios', 'turnos_horarios',
      'avisos', 'eventos', 'presencas', 'pavilhoes'
    ];
    const totais = {};
    for (const t of tabelas) {
      const r = await getAsync(`SELECT COUNT(*) as c FROM ${t}`);
      totais[t] = r ? r.c : 0;
    }

    ok(res, {
      firebaseConectado: Boolean(firebaseDb),
      bancoNuvem: "Firebase Realtime Database",
      totais
    });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

app.get("/api/backup/export", authAdmin, async (req, res) => {
  try {
    const tabelas = {
      admin_usuarios: await allAsync("SELECT id, email, senha FROM admin_usuarios"),
      usuarios: await allAsync("SELECT uid, nome, curso, ativo FROM usuarios"),
      pavilhoes: await allAsync("SELECT * FROM pavilhoes"),
      turnos_horarios: await allAsync("SELECT * FROM turnos_horarios"),
      turmas: await allAsync("SELECT * FROM turmas"),
      disciplinas: await allAsync("SELECT * FROM disciplinas"),
      professores_disciplinas: await allAsync("SELECT * FROM professores_disciplinas"),
      grade_horarios: await allAsync("SELECT * FROM grade_horarios"),
      avisos: await allAsync("SELECT * FROM avisos"),
      eventos: await allAsync("SELECT * FROM eventos"),
      presencas: await allAsync("SELECT * FROM presencas")
    };

    const totais = {};
    for (const [k, arr] of Object.entries(tabelas)) {
      totais[k] = arr.length;
    }

    const backupData = {
      sistema: "PresenX",
      versao: "2.0",
      exportado_em: new Date().toISOString(),
      totais,
      tabelas
    };

    const dataHoje = new Date().toISOString().slice(0, 10);
    const nomeArquivo = `backup-presenx-${dataHoje}.json`;

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${nomeArquivo}"`);
    res.send(JSON.stringify(backupData, null, 2));
  } catch (err) {
    fail(res, 500, "Erro ao exportar backup: " + err.message);
  }
});

app.post("/api/backup/import", authAdmin, async (req, res) => {
  try {
    const { tabelas } = req.body;
    if (!tabelas || typeof tabelas !== "object") {
      return fail(res, 400, "Arquivo de backup inválido: bloco 'tabelas' ausente.");
    }

    await runAsync("BEGIN TRANSACTION");

    // 1. Pavilhões
    if (Array.isArray(tabelas.pavilhoes)) {
      for (const p of tabelas.pavilhoes) {
        if (p.id && p.nome) {
          await runAsync(
            "INSERT INTO pavilhoes (id, nome, ordem) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET nome = excluded.nome, ordem = excluded.ordem",
            [p.id, p.nome, Number(p.ordem) || 0]
          );
        }
      }
    }

    // 2. Turnos
    if (Array.isArray(tabelas.turnos_horarios)) {
      for (const t of tabelas.turnos_horarios) {
        if (t.turno && t.chave && t.inicio && t.fim) {
          await runAsync(
            `INSERT INTO turnos_horarios (turno, chave, inicio, fim, ordem) VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(turno, chave) DO UPDATE SET inicio = excluded.inicio, fim = excluded.fim, ordem = excluded.ordem`,
            [t.turno, t.chave, t.inicio, t.fim, Number(t.ordem) || 0]
          );
        }
      }
    }

    // 3. Disciplinas
    if (Array.isArray(tabelas.disciplinas)) {
      for (const d of tabelas.disciplinas) {
        if (d.nome) {
          await runAsync(
            `INSERT INTO disciplinas (id, nome, codigo, cor_badge) VALUES (?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET nome = excluded.nome, codigo = excluded.codigo, cor_badge = excluded.cor_badge`,
            [d.id || null, d.nome, d.codigo || "", d.cor_badge || "#2563eb"]
          );
        }
      }
    }

    // 4. Turmas
    if (Array.isArray(tabelas.turmas)) {
      for (const t of tabelas.turmas) {
        if (t.id && t.nome) {
          await runAsync(
            `INSERT INTO turmas (id, nome, turno, pavilhao_id, sala_nome, ordem) VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET nome = excluded.nome, turno = excluded.turno, pavilhao_id = excluded.pavilhao_id, sala_nome = excluded.sala_nome, ordem = excluded.ordem`,
            [t.id, t.nome, t.turno || "matutino", t.pavilhao_id || "acm", t.sala_nome || t.nome, Number(t.ordem) || 0]
          );
        }
      }
    }

    // 5. Usuários
    if (Array.isArray(tabelas.usuarios)) {
      for (const u of tabelas.usuarios) {
        if (u.uid && u.nome) {
          await runAsync(
            `INSERT INTO usuarios (uid, nome, curso, ativo, sincronizado) VALUES (?, ?, ?, ?, 1)
             ON CONFLICT(uid) DO UPDATE SET nome = excluded.nome, curso = excluded.curso, ativo = excluded.ativo, sincronizado = 1`,
            [u.uid, u.nome, u.curso || "", u.ativo !== 0 && u.ativo !== false ? 1 : 0]
          );
        }
      }
    }

    // 6. Vínculos professores_disciplinas
    if (Array.isArray(tabelas.professores_disciplinas)) {
      for (const pd of tabelas.professores_disciplinas) {
        if (pd.professor_uid && pd.disciplina_id) {
          await runAsync(
            "INSERT OR IGNORE INTO professores_disciplinas (professor_uid, disciplina_id) VALUES (?, ?)",
            [pd.professor_uid, Number(pd.disciplina_id)]
          );
        }
      }
    }

    // 7. Grade horários
    if (Array.isArray(tabelas.grade_horarios)) {
      for (const g of tabelas.grade_horarios) {
        if (g.turma_id && g.dia && g.horario && g.disciplina) {
          await runAsync(
            `INSERT OR REPLACE INTO grade_horarios (id, turma_id, dia, horario, disciplina, professor)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [g.id || null, g.turma_id, g.dia, Number(g.horario), g.disciplina, g.professor || ""]
          );
        }
      }
    }

    // 8. Avisos
    if (Array.isArray(tabelas.avisos)) {
      for (const av of tabelas.avisos) {
        if (av.titulo && av.mensagem) {
          await runAsync(
            `INSERT OR REPLACE INTO avisos (id, titulo, mensagem, prioridade, expiracao, ativo, criado_em, sincronizado)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
            [av.id || null, av.titulo, av.mensagem, av.prioridade || "normal", av.expiracao || "", av.ativo !== 0 ? 1 : 0, av.criado_em || Date.now()]
          );
        }
      }
    }

    // 9. Eventos
    if (Array.isArray(tabelas.eventos)) {
      for (const ev of tabelas.eventos) {
        if (ev.titulo && ev.data) {
          await runAsync(
            `INSERT OR REPLACE INTO eventos (id, titulo, descricao, data, sincronizado)
             VALUES (?, ?, ?, ?, 1)`,
            [ev.id || null, ev.titulo, ev.descricao || "", ev.data]
          );
        }
      }
    }

    // 10. Coordenadores
    if (Array.isArray(tabelas.admin_usuarios)) {
      for (const a of tabelas.admin_usuarios) {
        if (a.email && a.senha) {
          await runAsync(
            `INSERT INTO admin_usuarios (email, senha) VALUES (?, ?)
             ON CONFLICT(email) DO UPDATE SET senha = excluded.senha`,
            [a.email.toLowerCase(), a.senha]
          );
        }
      }
    }

    await runAsync("COMMIT");

    // Sincroniza imediatamente com Firebase
    sincronizarBancoComFirebase().catch(e => console.warn("Aviso pós importação:", e.message));

    ok(res, { mensagem: "Backup restaurado com sucesso no banco de dados e nuvem!" });
  } catch (err) {
    try { await runAsync("ROLLBACK"); } catch (_) {}
    fail(res, 500, "Erro ao restaurar backup: " + err.message);
  }
});

app.post("/api/backup/sincronizar-nuvem", authAdmin, async (req, res) => {
  try {
    if (!firebaseDb) {
      return fail(res, 400, "Firebase RTDB não está configurado neste ambiente.");
    }
    await sincronizarBancoComFirebase();
    ok(res, { mensagem: "Sincronização com a nuvem executada com sucesso!" });
  } catch (err) {
    fail(res, 500, err.message);
  }
});

// ======================================================
// INICIALIZAÇÃO DO SERVIDOR (PORT BINDING IMEDIATO)
// ======================================================
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`=========================================`);
  console.log(` PresenX Servidor Ativo: http://0.0.0.0:${PORT}`);
  console.log(` Banco de Dados SQLite Unificado Conectado`);
  console.log(` Criptografia de Senhas Segura Ativa`);
  console.log(`=========================================`);

  // Executa inicialização das tabelas e sincronização em segundo plano (sem travar a porta)
  inicializarBancoESincronizacao().catch(err => {
    console.warn("Aviso na inicialização do banco:", err.message);
  });
});

server.on("error", (err) => {
  console.error("Erro no servidor HTTP:", err.message);
});