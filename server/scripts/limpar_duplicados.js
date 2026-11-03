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

function norm(s) {
  return (s || "").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

// Mapa de padronização de disciplinas duplicadas/similares
const mapaPadronizacaoDisciplinas = {
  "algoritmos e ling de pro": "ALGORITMOS E LINGUAGEM DE PROGRAMAÇÃO",
  "algoritmos e ling program": "ALGORITMOS E LINGUAGEM DE PROGRAMAÇÃO",
  "anatomia e f nutricao": "ANATOMIA E FISIOLOGIA DA NUTRIÇÃO",
  "anatomia e fisi em nutri": "ANATOMIA E FISIOLOGIA DA NUTRIÇÃO",
  "aspectos imp ambientais": "ASPECTOS E IMPACTOS AMBIENTAIS",
  "aspectos impactos ambientais": "ASPECTOS E IMPACTOS AMBIENTAIS",
  "bioquimica": "BIOQUÍMICA",
  "bioquimica basica": "BIOQUÍMICA",
  "bioquimica alimentos": "BIOQUÍMICA DOS ALIMENTOS",
  "bioquimica de alimentos": "BIOQUÍMICA DOS ALIMENTOS",
  "bioquimica dos alimentos": "BIOQUÍMICA DOS ALIMENTOS",
  "biosseguranca": "BIOSSEGURANÇA",
  "biosseguranca em saude": "BIOSSEGURANÇA",
  "coleta amos inter exam": "COLETA E AMOSTRAS",
  "coleta amos inter exam": "COLETA E AMOSTRAS",
  "des tec e arquitetonico": "DESENHO TÉCNICO E ARQUITETÔNICO",
  "destec e arquitetonico": "DESENHO TÉCNICO E ARQUITETÔNICO",
  "desenho tecnico": "DESENHO TÉCNICO",
  "desig interf exper usu": "DESIGN DE INTERFACE E EXPERIÊNCIA DO USUÁRIO",
  "dietoterapia": "DIETOTERAPIA",
  "diototerapia": "DIETOTERAPIA",
  "educ digital e midiatica": "EDUCAÇÃO DIGITAL E MIDIÁTICA",
  "estacao aprofund saberes": "ESTAÇÃO DE APROFUNDAMENTO DOS SABERES",
  "estacao dos saberes": "ESTAÇÃO DE APROFUNDAMENTO DOS SABERES",
  "estac aprof saberes": "ESTAÇÃO DE APROFUNDAMENTO DOS SABERES",
  "est dos solos e fundacoes": "ESTUDO DOS SOLOS E FUNDAÇÕES",
  "estud dos solos e fund": "ESTUDO DOS SOLOS E FUNDAÇÕES",
  "estab de estruturas": "ESTABILIDADE E ESTRUTURAS",
  "estabilidade e estruturas": "ESTABILIDADE E ESTRUTURAS",
  "filosofia": "FILOSOFIA",
  "filososfia": "FILOSOFIA",
  "fisilogia da nutricao": "FISIOLOGIA DA NUTRIÇÃO",
  "fisiologia da nutricao": "FISIOLOGIA DA NUTRIÇÃO",
  "fund de administracao": "FUNDAMENTOS DA ADMINISTRAÇÃO",
  "fund de administacao": "FUNDAMENTOS DA ADMINISTRAÇÃO",
  "fundamentos da administracao": "FUNDAMENTOS DA ADMINISTRAÇÃO",
  "fund arq computadores": "FUNDAMENTOS E ARQUITETURA DE COMPUTADORES",
  "fund e arq de computadore": "FUNDAMENTOS E ARQUITETURA DE COMPUTADORES",
  "fund arquit computadores": "FUNDAMENTOS E ARQUITETURA DE COMPUTADORES",
  "fund e gest labotorial": "FUNDAMENTOS E GESTÃO LABORATORIAL",
  "fund e gest laboratorial": "FUNDAMENTOS E GESTÃO LABORATORIAL",
  "fundam de laborat clinico": "FUNDAMENTOS DE LABORATÓRIO CLÍNICO",
  "geotecnologia": "GEOTECNOLOGIA E SUSTENTABILIDADE",
  "geotecnologia e sustentab": "GEOTECNOLOGIA E SUSTENTABILIDADE",
  "gestao e impac socioambie": "GESTÃO E IMPACTOS SOCIOAMBIENTAIS",
  "gestao de residuos": "GESTÃO DE RESÍDUOS",
  "gestao da qualidade": "GESTÃO DA QUALIDADE",
  "hist ba e hist e cult ind": "HISTÓRIA DA BAHIA E CULTURA INDÍGENA E AFRO",
  "hist ba hist cult ind afr": "HISTÓRIA DA BAHIA E CULTURA INDÍGENA E AFRO",
  "historia": "HISTÓRIA",
  "historia da bahia": "HISTÓRIA DA BAHIA",
  "iniciacao cientifica": "INICIAÇÃO CIENTÍFICA",
  "iniciacao ao trab cient": "INICIAÇÃO AO TRABALHO CIENTÍFICO",
  "ins manut computadores": "INSTALAÇÃO E MANUTENÇÃO DE COMPUTADORES",
  "inst manu computadores": "INSTALAÇÃO E MANUTENÇÃO DE COMPUTADORES",
  "inst manut computadores": "INSTALAÇÃO E MANUTENÇÃO DE COMPUTADORES",
  "introd e tec const": "INTRODUÇÃO E TÉCNICAS CONSTRUTIVAS",
  "introd e tec construtiv": "INTRODUÇÃO E TÉCNICAS CONSTRUTIVAS",
  "legisl e normas de segura": "LEGISLAÇÃO E NORMAS DE SEGURANÇA",
  "legisl e normas de seguranca": "LEGISLAÇÃO E NORMAS DE SEGURANÇA",
  "legislacao norma seguranc": "LEGISLAÇÃO E NORMAS DE SEGURANÇA",
  "legislacao norma seguranca": "LEGISLAÇÃO E NORMAS DE SEGURANÇA",
  "ling de programacao": "LINGUAGEM DE PROGRAMAÇÃO",
  "lingua portuguesa": "LÍNGUA PORTUGUESA",
  "lingua": "LÍNGUA PORTUGUESA",
  "materiais de construcao": "MATERIAIS DE CONSTRUÇÃO",
  "materiais de construcoes": "MATERIAIS DE CONSTRUÇÃO",
  "metodologia trab cientif": "METODOLOGIA DO TRABALHO CIENTÍFICO",
  "metodologoiatrab cientif": "METODOLOGIA DO TRABALHO CIENTÍFICO",
  "metodologoiatrab cientif": "METODOLOGIA DO TRABALHO CIENTÍFICO",
  "metodos tec administrativo": "MÉTODOS E TÉCNICAS ADMINISTRATIVAS",
  "metodos tec prep alimenta": "MÉTODOS E TÉCNICAS DE PREPARO DE ALIMENTOS",
  "microb e paras em nutri": "MICROBIOLOGIA E PARASITOLOGIA",
  "microbiologia parasitolog": "MICROBIOLOGIA E PARASITOLOGIA",
  "microbiologia amb saud pub": "MICROBIOLOGIA AMBIENTAL E SAÚDE PÚBLICA",
  "proj de tec soci emp soci": "PROJETO DE TECNOLOGIAS SOCIAIS",
  "proj tecno sociais": "PROJETO DE TECNOLOGIAS SOCIAIS",
  "projeto de tec sociais": "PROJETO DE TECNOLOGIAS SOCIAIS",
  "proj tec soci emp soc eco": "PROJETO DE EMPREENDEDORISMO SOCIAL",
  "proj emp social eco solid": "PROJETO DE EMPREENDEDORISMO SOCIAL",
  "proj de emp social e econ": "PROJETO DE EMPREENDEDORISMO SOCIAL",
  "processo saude doenca": "PROCESSO DE SAÚDE E DOENÇA",
  "processo de saude doenca": "PROCESSO DE SAÚDE E DOENÇA",
  "saude pubica integrada": "SAÚDE PÚBLICA INTEGRADA",
  "saude publica integrada": "SAÚDE PÚBLICA INTEGRADA",
  "sust e anal de imp amb": "SUSTENTABILIDADE E ANÁLISE DE IMPACTOS AMBIENTAIS",
  "sustent anal imp ambienta": "SUSTENTABILIDADE E ANÁLISE DE IMPACTOS AMBIENTAIS",
  "tecnologia alimentos": "TECNOLOGIA DOS ALIMENTOS",
  "tecnologia dos alimentos": "TECNOLOGIA DOS ALIMENTOS",
  "urinalise": "URINÁLISE E FLUIDOS CORPORAIS",
  "uranalise e fluidos corp": "URINÁLISE E FLUIDOS CORPORAIS",
  "etica profisional": "ÉTICA PROFISSIONAL",
  "etica profissional": "ÉTICA PROFISSIONAL"
};

// Correções de Professores
const correcoesProfessores = {
  "AISLNA": "AISLAN",
  "JOSÉ RAUNEI": "JOSUÉ RAUNEI",
  "JOSUÉ": "JOSUÉ RAUNEI"
};

async function consolidar() {
  console.log("Iniciando limpeza e consolidação de disciplinas e professores...");

  // 1. Atualizar e corrigir nomes de professores na tabela usuarios
  for (const [de, para] of Object.entries(correcoesProfessores)) {
    const profDe = await allAsync("SELECT * FROM usuarios WHERE nome = ?", [de]);
    const profPara = await allAsync("SELECT * FROM usuarios WHERE nome = ?", [para]);

    if (profDe.length && profPara.length) {
      const uidDe = profDe[0].uid;
      const uidPara = profPara[0].uid;
      // Transfere vínculos de disciplinas
      await runAsync("UPDATE OR IGNORE professores_disciplinas SET professor_uid = ? WHERE professor_uid = ?", [uidPara, uidDe]);
      await runAsync("DELETE FROM professores_disciplinas WHERE professor_uid = ?", [uidDe]);
      await runAsync("DELETE FROM usuarios WHERE uid = ?", [uidDe]);
      console.log(`Fundido professor [${de}] -> [${para}]`);
    } else if (profDe.length) {
      await runAsync("UPDATE usuarios SET nome = ? WHERE nome = ?", [para, de]);
      console.log(`Corrigido nome do professor [${de}] -> [${para}]`);
    }
  }

  // Remove "professores" que na verdade eram nomes de matérias digitadas no campo errado no passado
  await runAsync("DELETE FROM usuarios WHERE nome = 'BIOQUIMICA BASICA' OR nome = 'Dev.Teste'");

  // 2. Padronizar disciplinas
  const todasDisciplinas = await allAsync("SELECT * FROM disciplinas");

  for (const disc of todasDisciplinas) {
    const chave = norm(disc.nome);
    const nomePadrao = mapaPadronizacaoDisciplinas[chave];

    if (nomePadrao && nomePadrao !== disc.nome) {
      // Verifica se já existe uma disciplina com esse nome padrão
      const existente = await allAsync("SELECT * FROM disciplinas WHERE nome = ?", [nomePadrao]);
      if (existente.length && existente[0].id !== disc.id) {
        const idPrincipal = existente[0].id;
        const idAntigo = disc.id;

        // Migra vínculos de professores
        await runAsync("UPDATE OR IGNORE professores_disciplinas SET disciplina_id = ? WHERE disciplina_id = ?", [idPrincipal, idAntigo]);
        await runAsync("DELETE FROM professores_disciplinas WHERE disciplina_id = ?", [idAntigo]);

        // Atualiza a grade_horarios para o nome padronizado
        await runAsync("UPDATE grade_horarios SET disciplina = ? WHERE disciplina = ?", [nomePadrao, disc.nome]);

        // Deleta a disciplina duplicada antiga
        await runAsync("DELETE FROM disciplinas WHERE id = ?", [idAntigo]);
        console.log(`Disciplina consolidada: [${disc.nome}] -> [${nomePadrao}]`);
      } else {
        await runAsync("UPDATE disciplinas SET nome = ? WHERE id = ?", [nomePadrao, disc.id]);
        await runAsync("UPDATE grade_horarios SET disciplina = ? WHERE disciplina = ?", [nomePadrao, disc.nome]);
        console.log(`Disciplina renomeada para padrão: [${disc.nome}] -> [${nomePadrao}]`);
      }
    }
  }

  // Garante que a grade_horarios use os nomes consolidados
  for (const [chave, nomePadrao] of Object.entries(mapaPadronizacaoDisciplinas)) {
    const disciplinasGrade = await allAsync("SELECT DISTINCT disciplina FROM grade_horarios");
    for (const d of disciplinasGrade) {
      if (norm(d.disciplina) === chave) {
        await runAsync("UPDATE grade_horarios SET disciplina = ? WHERE disciplina = ?", [nomePadrao, d.disciplina]);
      }
    }
  }

  const totalDisc = await allAsync("SELECT COUNT(*) as total FROM disciplinas");
  const totalProf = await allAsync("SELECT COUNT(*) as total FROM usuarios");
  const totalVinc = await allAsync("SELECT COUNT(*) as total FROM professores_disciplinas");

  console.log("=========================================");
  console.log("Consolidação Concluída com Sucesso!");
  console.log(`- Total de Disciplinas Únicas: ${totalDisc[0].total}`);
  console.log(`- Total de Professores Únicos: ${totalProf[0].total}`);
  console.log(`- Total de Vínculos Matéria/Professor: ${totalVinc[0].total}`);
  console.log("=========================================");

  db.close();
}

consolidar().catch(err => {
  console.error("Erro na consolidação:", err);
  process.exit(1);
});
