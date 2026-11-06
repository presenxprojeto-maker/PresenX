console.log("PAINEL JS - PRESENX CARREGADO");

const el = {
  txtDia: document.getElementById("txtDia"),
  txtHorario: document.getElementById("txtHorario"),
  txtTurno: document.getElementById("txtTurno"),
  txtPavilhaoAtual: document.getElementById("txtPavilhaoAtual"),
  painelData: document.getElementById("painelData"),
  painelHoraAtual: document.getElementById("painelHoraAtual"),
  painelGrade: document.getElementById("painelGrade"),
  painelVazio: document.getElementById("painelVazio"),
  painelPagina: document.getElementById("painelPagina"),
  painelAvisos: document.getElementById("painelAvisos"),
  painelEventos: document.getElementById("painelEventos"),
  pavilhaoBanner: document.getElementById("pavilhaoBanner"),
  tituloPavilhaoBanner: document.getElementById("tituloPavilhaoBanner"),
  subPavilhaoBanner: document.getElementById("subPavilhaoBanner"),
  iconePavilhaoBanner: document.getElementById("iconePavilhaoBanner"),
  carrosselProgressoBar: document.getElementById("carrosselProgressoBar"),
  carrosselProgressoWrap: document.getElementById("carrosselProgressoWrap"),
  salasPaginasDots: document.getElementById("salasPaginasDots"),
  pavilhaoTabs: document.querySelectorAll(".btn-pavilhao-tab")
};

// Estado global do painel
let presencas = {};
let avisos = [];
let eventos = [];
let mapaTurmas = {};
let horariosTurnosDinamicos = null;
let pavilhoesCadastrados = [
  { id: "acm", nome: "Pavilhão ACM" },
  { id: "luis_viana", nome: "Pavilhão Luís Viana" }
];

// Configurações do Carrossel e Pavilhões
let pavilhaoAtivo = "acm"; // 'acm', 'luis_viana' ou 'todos'
let modoFixado = false;    // Se o usuário clicou ou passou ?pavilhao=...
let paginaAtual = 0;
let ultimaChavePagina = "";
let ultimoHtmlGrade = null;
let ultimaChaveDots = null;
let ultimoTotalPaginasSalas = 1;
let timerPaginaSalas = null;
const TEMPO_CARROSSEL_PAVILHAO = 12000; // 12 segundos por pavilhão
const TEMPO_PAGINACAO_SALAS = 8000; // 8 segundos por página de salas
let timerCarrossel = null;
let inicioCicloCarrossel = Date.now();
let alturaCardEstimada = 122; // Altura calibrada dos cards para preenchimento imediato sem delay

// Lê parâmetro da URL se houver (ex: painel.html?pavilhao=acm)
const urlParams = new URLSearchParams(window.location.search);
const pavilhaoUrl = urlParams.get("pavilhao");
if (pavilhaoUrl) {
  pavilhaoAtivo = pavilhaoUrl.toLowerCase();
  modoFixado = true;
}

// ======================================================
// HELPERS
// ======================================================
function norm(s) {
  return (s || "").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function diaSemanaKey() {
  const dias = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
  return dias[new Date().getDay()];
}

function nomeDiaSemana(diaKey) {
  const mapa = {
    dom: "Domingo", seg: "Segunda-feira", ter: "Terça-feira",
    qua: "Quarta-feira", qui: "Quinta-feira", sex: "Sexta-feira", sab: "Sábado"
  };
  return mapa[diaKey] || diaKey;
}

function nomeTurno(turno) {
  const mapa = { matutino: "Matutino", vespertino: "Vespertino", noturno: "Noturno" };
  return mapa[turno] || turno;
}

function horaParaMinutos(hora) {
  if (!hora || typeof hora !== "string") return 0;
  const [h, m] = hora.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutosAgora() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function textoHorarioPainel(faixa) {
  if (!faixa) return "Fora do turno";
  if (faixa.horario === "intervalo") return "Intervalo";
  return `${faixa.horario}º horário`;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

// ======================================================
// API CALLS
// ======================================================
async function apiGet(url) {
  const resposta = await fetch(url);
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.erro || "Erro na API");
  return dados;
}

async function carregarTurnos() {
  try {
    const dados = await apiGet("/api/turnos");
    if (dados.turnos && Object.keys(dados.turnos).length > 0) {
      horariosTurnosDinamicos = dados.turnos;
    }
  } catch (e) {
    console.warn("Usando horários padrões de turnos:", e);
  }
}

async function carregarDadosPainel() {
  try {
    const dados = await apiGet("/api/painel-dados");
    if (dados.pavilhoes && dados.pavilhoes.length > 0) {
      pavilhoesCadastrados = dados.pavilhoes;
    }
    mapaTurmas = dados.turmas || {};
    atualizarContadoresSalasNaSelecao();
  } catch (e) {
    console.warn("Erro ao carregar dados de turmas da API:", e);
  }
}

async function carregarPresencas() {
  try {
    const dados = await apiGet(`/api/presencas?data=${encodeURIComponent(todayKey())}`);
    presencas = {};
    (dados.presencas || []).forEach(p => {
      presencas[p.uid] = p;
    });
  } catch (e) {
    console.warn("Erro ao carregar presenças:", e);
  }
}

async function carregarAvisos() {
  try {
    const dados = await apiGet("/api/avisos");
    avisos = (dados.avisos || []).filter(a => a.ativo && a.expiracao >= todayKey());
    renderAvisos();
    atualizarVisibilidadeLateral();
  } catch (e) {
    console.warn("Erro ao carregar avisos:", e);
  }
}

async function carregarEventos() {
  try {
    const dados = await apiGet("/api/eventos");
    eventos = (dados.eventos || []).filter(e => e.data >= todayKey());
    renderEventos();
    atualizarVisibilidadeLateral();
  } catch (e) {
    console.warn("Erro ao carregar eventos:", e);
  }
}

// ======================================================
// REGRAS DE NEGÓCIO DA GRADE
// ======================================================
function descobrirFaixaAtual() {
  const agora = minutosAgora();
  const fonteTurnos = horariosTurnosDinamicos || (typeof horariosTurnos !== "undefined" ? horariosTurnos : null);
  if (!fonteTurnos) return null;

  for (const [turno, faixas] of Object.entries(fonteTurnos)) {
    for (const [chave, faixa] of Object.entries(faixas)) {
      const ini = horaParaMinutos(faixa.inicio);
      const fim = horaParaMinutos(faixa.fim);
      if (agora >= ini && agora < fim) {
        return { turno, horario: chave === "intervalo" ? "intervalo" : Number(chave) };
      }
    }
  }
  return null;
}

// Verifica presença pelo UID (preferencial e preciso) ou pelo nome normalizado
function algumProfessorPresente(professoresDetalhes = [], professoresNomes = []) {
  // 1. Verifica por UID
  for (const p of professoresDetalhes) {
    if (p.uid && presencas[p.uid] && presencas[p.uid].status === "Presente") {
      return true;
    }
  }

  // 2. Fallback por nome
  const presencasValues = Object.values(presencas);
  return professoresNomes.some(nomeProfessor => {
    const nomeNorm = norm(nomeProfessor);
    return presencasValues.some(p =>
      p.status === "Presente" && norm(p.nome) === nomeNorm
    );
  });
}

function montarListaAtual() {
  const dia = diaSemanaKey();
  if (dia === "sab" || dia === "dom") return { faixa: null, lista: [] };

  const faixa = descobrirFaixaAtual();
  if (!faixa) return { faixa: null, lista: [] };

  let lista = Object.values(mapaTurmas).filter(t => t.turno === faixa.turno);

  // Filtragem por Pavilhão ativo (se não for 'todos')
  if (pavilhaoAtivo && pavilhaoAtivo !== "todos") {
    lista = lista.filter(t => (t.pavilhao || "acm").toLowerCase() === pavilhaoAtivo.toLowerCase());
  }

  const quadros = lista.map(turma => {
    let aula = null;
    if (typeof faixa.horario === "number") {
      aula = turma?.dias?.[dia]?.[faixa.horario] || null;
    }

    let classeCor = "cinza";
    let statusTexto = "SEM AULA";
    let statusTipo = "sem-aula";
    let disciplina = "Sem aula";

    if (faixa.horario === "intervalo") {
      disciplina = "Intervalo";
      statusTexto = "INTERVALO";
      statusTipo = "intervalo";
      classeCor = "cinza";
    } else if (aula) {
      disciplina = aula.disciplina || "-";
      const listaProfsDetalhes = Array.isArray(aula.professores_detalhes) ? aula.professores_detalhes : [];
      const listaProfessores = Array.isArray(aula.professores) ? aula.professores : (aula.professor ? [aula.professor] : []);
      
      const presente = algumProfessorPresente(listaProfsDetalhes, listaProfessores);
      classeCor = presente ? "verde" : "vermelho";
      statusTexto = presente ? "PRESENTE" : "AUSENTE";
      statusTipo = presente ? "presente" : "ausente";
    }

    return {
      turma: turma.turma || turma.id,
      sala: turma.sala || turma.turma,
      pavilhao: turma.pavilhao || "acm",
      classeCor,
      statusTexto,
      statusTipo,
      disciplina
    };
  });

  quadros.sort((a, b) => norm(a.sala).localeCompare(norm(b.sala)));
  return { faixa, lista: quadros };
}

// ======================================================
// RENDERIZAÇÃO PRINCIPAL DO PAINEL
// ======================================================
function obterNomePavilhao(pId) {
  if (pId === "acm") return "Pavilhão ACM";
  if (pId === "luis_viana") return "Pavilhão Luís Viana";
  if (pId === "todos") return "Todos os Pavilhões";
  const pav = pavilhoesCadastrados.find(p => p.id === pId);
  return pav ? pav.nome : "Pavilhão ACM";
}

function atualizarDotsPaginacaoSalas(totalPaginas, paginaExibida) {
  const wrap = el.salasPaginasDots;
  if (!wrap) return;

  if (totalPaginas <= 1) {
    if (wrap.style.display !== "none") wrap.style.display = "none";
    ultimaChaveDots = null;
    return;
  }

  wrap.style.display = "flex";

  const chave = `${totalPaginas}|${paginaExibida}`;
  if (chave === ultimaChaveDots) return;
  ultimaChaveDots = chave;

  wrap.innerHTML = Array.from({ length: totalPaginas }, (_, i) =>
    `<span class="salas-dot${i === paginaExibida ? " ativo" : ""}"></span>`
  ).join("");
}

function render() {
  const agora = new Date();
  const dia = diaSemanaKey();
  const { faixa, lista } = montarListaAtual();

  if (el.txtDia) el.txtDia.textContent = nomeDiaSemana(dia);
  if (el.txtHorario) el.txtHorario.textContent = textoHorarioPainel(faixa);
  if (el.txtTurno) el.txtTurno.textContent = faixa ? nomeTurno(faixa.turno) : "Fora do turno";
  if (el.txtPavilhaoAtual) el.txtPavilhaoAtual.textContent = obterNomePavilhao(pavilhaoAtivo);
  if (el.painelData) el.painelData.textContent = agora.toLocaleDateString("pt-BR");
  if (el.painelHoraAtual) el.painelHoraAtual.textContent = agora.toLocaleTimeString("pt-BR");

  if (el.tituloPavilhaoBanner) el.tituloPavilhaoBanner.textContent = obterNomePavilhao(pavilhaoAtivo);
  if (el.iconePavilhaoBanner) {
    if (pavilhaoAtivo === "todos") el.iconePavilhaoBanner.setAttribute("data-lucide", "layout-grid");
    else if (pavilhaoAtivo === "luis_viana") el.iconePavilhaoBanner.setAttribute("data-lucide", "building-2");
    else el.iconePavilhaoBanner.setAttribute("data-lucide", "building");
  }
  if (el.subPavilhaoBanner) {
    el.subPavilhaoBanner.textContent = faixa 
      ? `Aulas em andamento no turno ${nomeTurno(faixa.turno)} • ${lista.length} sala(s)`
      : "Nenhum turno em andamento no momento";
  }

  const txtChip = document.getElementById("txtPavilhaoSelecionado");
  const iconeChip = document.getElementById("iconePavilhaoSelecionado");
  if (txtChip) txtChip.textContent = obterNomePavilhao(pavilhaoAtivo);
  if (iconeChip) {
    let iconName = "building";
    if (pavilhaoAtivo === "todos") iconName = "layout-grid";
    else if (pavilhaoAtivo === "luis_viana") iconName = "building-2";
    iconeChip.setAttribute("data-lucide", iconName);
  }

  if (!faixa || lista.length === 0) {
    el.painelGrade.innerHTML = "";
    el.painelGrade.style.display = "none";
    el.painelVazio.style.display = "flex";
    el.painelPagina.textContent = "Página 1/1";
    renderIcons();
    return;
  }

  el.painelVazio.style.display = "none";
  el.painelGrade.style.display = "grid";

  const colTracks = getComputedStyle(el.painelGrade).gridTemplateColumns.split(" ").filter(Boolean);
  const cols = colTracks.length || 1;

  const chaveContexto = `${pavilhaoAtivo}|${faixa.turno}|${faixa.horario}`;
  const contextoMudou = chaveContexto !== ultimaChavePagina;

  // Mede cards reais existentes para manter altura precisa e calibrada
  const cardsExistentes = el.painelGrade.querySelectorAll(".painel-quadro");
  if (cardsExistentes.length) {
    const alturaMedida = Math.max(...Array.from(cardsExistentes, c => c.getBoundingClientRect().height));
    if (alturaMedida > 80 && alturaMedida < 250) {
      alturaCardEstimada = Math.round(alturaMedida);
    }
  }

  const isMobile = window.innerWidth <= 768;
  const GAP = 14;
  const gradeH = el.painelGrade.clientHeight || 400;
  const rows = Math.max(1, Math.floor((gradeH + GAP) / (alturaCardEstimada + GAP)));
  let capacidade = isMobile ? lista.length : (cols * rows);

  let totalPaginas = isMobile ? 1 : Math.max(1, Math.ceil(lista.length / capacidade));
  ultimoTotalPaginasSalas = totalPaginas;

  if (contextoMudou) {
    paginaAtual = 0;
    ultimaChavePagina = chaveContexto;
    if (!isMobile) agendarProximaPaginaSalas();
  }

  const cardHtml = item => {
    let iconeStatus = "clock";
    if (item.statusTipo === "presente") iconeStatus = "check-circle-2";
    else if (item.statusTipo === "ausente" || item.statusTipo === "aguardando") iconeStatus = "x-circle";
    else if (item.statusTipo === "intervalo") iconeStatus = "coffee";
    else if (item.statusTipo === "sem-aula") iconeStatus = "minus";

    const badgePavilhao = pavilhaoAtivo === "todos"
      ? `<span class="painel-badge-pavilhao ${item.pavilhao === 'luis_viana' ? 'luis-viana' : 'acm'}">${item.pavilhao === 'luis_viana' ? 'Luís Viana' : 'ACM'}</span>`
      : "";

    const nomePrincipalSala = item.sala && item.sala.trim() ? item.sala : item.turma;
    const nomeSecundarioTurma = (item.turma && item.sala && norm(item.turma) !== norm(item.sala)) ? item.turma : null;

    return `
      <article class="painel-quadro ${item.classeCor}">
        <div class="painel-quadro-topo">
          <div class="painel-status-badge ${item.statusTipo}">
            <i data-lucide="${iconeStatus}"></i>
            <span>${item.statusTexto}</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            ${badgePavilhao}
          </div>
        </div>

        <div class="painel-turma-container">
          <div class="painel-turma">${escapeHtml(nomePrincipalSala)}</div>
          ${nomeSecundarioTurma ? `<span class="painel-subturma-tag">${escapeHtml(nomeSecundarioTurma)}</span>` : ""}
        </div>

        <div class="painel-conteudo">
          <div class="painel-linha">
            <span class="painel-label-pequena">DISCIPLINA:</span>
            <span class="painel-valor">${escapeHtml(item.disciplina)}</span>
          </div>
        </div>
      </article>
    `;
  };

  function montarPagina() {
    const paginaExibida = paginaAtual % totalPaginas;
    const inicio = paginaExibida * capacidade;
    const listaPagina = lista.slice(inicio, inicio + capacidade);
    return { paginaExibida, html: listaPagina.map(cardHtml).join("") };
  }

  let { paginaExibida, html: htmlPagina } = montarPagina();

  if (htmlPagina !== ultimoHtmlGrade) {
    el.painelGrade.innerHTML = htmlPagina;
    ultimoHtmlGrade = htmlPagina;
  }

  // Autocorreção imediata se houver overflow (apenas modo TV/desktop)
  if (!isMobile && el.painelGrade.scrollHeight > el.painelGrade.clientHeight + 2 && capacidade > cols) {
    capacidade -= cols;
    totalPaginas = Math.max(1, Math.ceil(lista.length / capacidade));
    ({ paginaExibida, html: htmlPagina } = montarPagina());
    el.painelGrade.innerHTML = htmlPagina;
    ultimoHtmlGrade = htmlPagina;
  }

  el.painelPagina.textContent = totalPaginas > 1
    ? `Mostrando salas ${paginaExibida * capacidade + 1}–${Math.min((paginaExibida + 1) * capacidade, lista.length)} de ${lista.length}`
    : `${lista.length} sala(s) em aula`;

  atualizarDotsPaginacaoSalas(totalPaginas, paginaExibida);
  renderIcons();
}

// ======================================================
// VISIBILIDADE DINÂMICA DA LATERAL
// ======================================================
function atualizarVisibilidadeLateral() {
  const blocoAvisos = el.painelAvisos ? el.painelAvisos.closest(".painel-lateral-bloco") : null;
  const blocoEventos = el.painelEventos ? el.painelEventos.closest(".painel-lateral-bloco") : null;
  const aside = document.querySelector(".painel-lateral");

  if (blocoAvisos) blocoAvisos.style.display = avisos.length ? "" : "none";
  if (blocoEventos) blocoEventos.style.display = eventos.length ? "" : "none";
  if (aside) aside.style.display = (avisos.length === 0 && eventos.length === 0) ? "none" : "";
}

// ======================================================
// RENDERIZAÇÃO DE AVISOS E EVENTOS
// ======================================================
let ultimoHtmlAvisos = null;
let ultimoHtmlEventos = null;

function renderAvisos() {
  if (!el.painelAvisos) return;

  let html;
  if (avisos.length === 0) {
    html = `
      <div class="painel-lateral-vazio">
        <i data-lucide="bell-off" style="width:24px; height:24px; color:var(--muted); margin-bottom:6px;"></i>
        Nenhum aviso no momento
      </div>`;
  } else {
    html = avisos.map(aviso => {
      const prioridadeClass = ["urgente", "normal", "informativo"].includes(aviso.prioridade) ? aviso.prioridade : "normal";
      const dataFmt = aviso.expiracao ? aviso.expiracao.split("-").reverse().join("/") : "";
      return `
        <div class="painel-aviso-item ${prioridadeClass}">
          <div class="painel-aviso-item-topo">
            <span class="painel-aviso-badge ${prioridadeClass}">
              <i data-lucide="alert-circle" style="width:12px; height:12px;"></i>
              ${prioridadeClass.toUpperCase()}
            </span>
            <span class="painel-aviso-expira">até ${dataFmt}</span>
          </div>
          <div class="painel-aviso-item-titulo">${escapeHtml(aviso.titulo)}</div>
          <div class="painel-aviso-item-msg">${escapeHtml(aviso.mensagem)}</div>
        </div>
      `;
    }).join("");
  }

  if (html === ultimoHtmlAvisos) return;
  ultimoHtmlAvisos = html;

  el.painelAvisos.innerHTML = html;
  renderIcons();
}

function renderEventos() {
  if (!el.painelEventos) return;

  let html;
  if (eventos.length === 0) {
    html = `
      <div class="painel-lateral-vazio">
        <i data-lucide="calendar-x" style="width:24px; height:24px; color:var(--muted); margin-bottom:6px;"></i>
        Nenhum evento programado
      </div>`;
  } else {
    const mesesAbrev = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
    html = eventos.map(evento => {
      const [ano, mes, dia] = (evento.data || "").split("-").map(Number);
      const diaTxt = dia ? String(dia).padStart(2, "0") : "--";
      const mesTxt = mes ? mesesAbrev[mes - 1] : "";
      return `
        <div class="painel-evento-item">
          <div class="painel-evento-data-bloco">
            <span class="painel-evento-data">${diaTxt}</span>
            <span class="painel-evento-dias">${mesTxt}</span>
          </div>
          <div class="painel-evento-corpo">
            <div class="painel-evento-titulo">${escapeHtml(evento.titulo)}</div>
            ${evento.descricao ? `<div class="painel-evento-desc">${escapeHtml(evento.descricao)}</div>` : ""}
          </div>
        </div>
      `;
    }).join("");
  }

  if (html === ultimoHtmlEventos) return;
  ultimoHtmlEventos = html;

  el.painelEventos.innerHTML = html;
  renderIcons();
}

// ======================================================
// AUTO-SCROLL DAS LISTAS LATERAIS
// ======================================================
function iniciarAutoScrollLateral() {
  [el.painelAvisos, el.painelEventos].forEach(lista => {
    if (!lista) return;
    let direcao = 1;
    let pausaAte = 0;
    let pos = 0;

    setInterval(() => {
      const max = lista.scrollHeight - lista.clientHeight;
      if (max <= 4) { pos = 0; lista.scrollTop = 0; return; }

      if (Date.now() < pausaAte) return;

      pos += direcao * 0.6;

      if (pos >= max) {
        pos = max;
        direcao = -1;
        pausaAte = Date.now() + 3000;
      } else if (pos <= 0) {
        pos = 0;
        direcao = 1;
        pausaAte = Date.now() + 3000;
      }

      lista.scrollTop = pos;
    }, 30);
  });
}

// ======================================================
// CONTROLE DO CARROSSEL AUTOMÁTICO DE PAVILHÕES
// ======================================================
function reiniciarCicloCarrossel() {
  inicioCicloCarrossel = Date.now();
  if (el.carrosselProgressoBar) {
    el.carrosselProgressoBar.classList.remove("suave");
    el.carrosselProgressoBar.style.width = "0%";
    void el.carrosselProgressoBar.offsetWidth;
    el.carrosselProgressoBar.classList.add("suave");
  }
}

function alternarPavilhaoCarrossel() {
  if (modoFixado) return;

  const listaPavilhoes = ["acm", "luis_viana"];
  const indexAtual = listaPavilhoes.indexOf(pavilhaoAtivo);
  const proximoIndex = (indexAtual + 1) % listaPavilhoes.length;
  pavilhaoAtivo = listaPavilhoes[proximoIndex];

  reiniciarCicloCarrossel();
  render();
}

function agendarProximaPaginaSalas() {
  if (timerPaginaSalas) clearTimeout(timerPaginaSalas);
  if (window.innerWidth <= 768) return; // No auto-scroll de páginas no mobile
  timerPaginaSalas = setTimeout(() => {
    if (ultimoTotalPaginasSalas > 1) {
      paginaAtual++;
      avancarPaginaSalasComFade();
    }
    agendarProximaPaginaSalas();
  }, TEMPO_PAGINACAO_SALAS);
}

function avancarPaginaSalasComFade() {
  if (!el.painelGrade) { render(); return; }
  el.painelGrade.classList.add("fade-transicao");
  setTimeout(() => {
    render();
    requestAnimationFrame(() => {
      el.painelGrade.classList.remove("fade-transicao");
    });
  }, 200);
}

function atualizarBarraProgresso() {
  if (modoFixado || !el.carrosselProgressoBar) {
    if (el.carrosselProgressoWrap) el.carrosselProgressoWrap.style.display = "none";
    return;
  }
  if (el.carrosselProgressoWrap) el.carrosselProgressoWrap.style.display = "block";
  const decorrido = Date.now() - inicioCicloCarrossel;
  const pct = Math.min(100, (decorrido / TEMPO_CARROSSEL_PAVILHAO) * 100);
  el.carrosselProgressoBar.style.width = `${pct}%`;
}

function setupNavegacaoPavilhoes() {
  if (el.pavilhaoTabs && el.pavilhaoTabs.length) {
    el.pavilhaoTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const p = tab.dataset.pavilhao;
        pavilhaoAtivo = p;
        modoFixado = true;
        reiniciarCicloCarrossel();
        render();
      });
    });
  }
}

function setupModoKioskETelaCheia() {
  const btnFullscreen = document.getElementById("btnFullscreen");
  if (btnFullscreen) {
    btnFullscreen.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    document.addEventListener("fullscreenchange", () => {
      const icone = btnFullscreen.querySelector("i");
      if (icone) {
        icone.setAttribute("data-lucide", document.fullscreenElement ? "minimize-2" : "maximize-2");
        renderIcons();
      }
    });
  }

  // Oculta cursor do mouse após 3s sem movimento
  let mouseTimer = null;
  window.addEventListener("mousemove", () => {
    document.body.classList.remove("hide-cursor");
    clearTimeout(mouseTimer);
    mouseTimer = setTimeout(() => {
      document.body.classList.add("hide-cursor");
    }, 3000);
  });
}

// ======================================================
// MONITORAMENTO DO LEITOR RFID NO PAINEL
// ======================================================
async function carregarStatusLeitor() {
  try {
    const res = await apiGet("/api/leitores");
    const leitores = res?.leitores || [];
    const tag = document.getElementById("painelLeitorStatus");
    const txt = document.getElementById("painelLeitorNome");
    if (!tag || !txt) return;

    if (leitores.length === 0) {
      tag.className = "painel-leitor-tag offline";
      txt.textContent = "Nenhum leitor registrado";
      return;
    }

    const offlineCount = leitores.filter(l => !l.online).length;
    const leitorPrincipal = leitores[0];

    if (leitores.length === 1) {
      if (leitorPrincipal.online) {
        tag.className = "painel-leitor-tag online";
        txt.textContent = `${leitorPrincipal.nome}: Conectado`;
      } else {
        tag.className = "painel-leitor-tag offline";
        txt.textContent = `${leitorPrincipal.nome}: Desconectado`;
      }
    } else {
      if (offlineCount === 0) {
        tag.className = "painel-leitor-tag online";
        txt.textContent = `${leitores.length} Leitores Conectados`;
      } else {
        tag.className = "painel-leitor-tag offline";
        txt.textContent = `${offlineCount} de ${leitores.length} Leitores Offline`;
      }
    }
  } catch (err) {
    const tag = document.getElementById("painelLeitorStatus");
    const txt = document.getElementById("painelLeitorNome");
    if (tag && txt) {
      tag.className = "painel-leitor-tag offline";
      txt.textContent = "Leitor: Desconectado";
    }
  }
}

// ======================================================
// MODAL DE SELEÇÃO DE PAVILHÃO
// ======================================================
function atualizarContadoresSalasNaSelecao() {
  const dia = diaSemanaKey();
  const faixa = descobrirFaixaAtual();

  const elLuis = document.getElementById("qtdSalasLuisViana");
  const elAcm = document.getElementById("qtdSalasAcm");
  const elTodos = document.getElementById("qtdSalasTodos");

  if (!elLuis && !elAcm && !elTodos) return;

  if (!faixa || dia === "sab" || dia === "dom") {
    const texto = "0 salas em aula agora";
    if (elLuis) elLuis.textContent = texto;
    if (elAcm) elAcm.textContent = texto;
    if (elTodos) elTodos.textContent = texto;
    return;
  }

  const turmasTurno = Object.values(mapaTurmas).filter(t => t.turno === faixa.turno);

  let countAcm = 0;
  let countLuis = 0;

  turmasTurno.forEach(t => {
    const p = (t.pavilhao || "acm").toLowerCase();
    let emAula = false;
    if (faixa.horario === "intervalo") {
      emAula = true;
    } else if (typeof faixa.horario === "number") {
      const aula = t?.dias?.[dia]?.[faixa.horario];
      if (aula && (aula.disciplina || aula.professor)) emAula = true;
    }
    if (emAula) {
      if (p === "luis_viana") countLuis++;
      else countAcm++;
    }
  });

  const total = countAcm + countLuis;

  if (elLuis) elLuis.textContent = `${countLuis} ${countLuis === 1 ? "sala" : "salas"} em aula agora`;
  if (elAcm) elAcm.textContent = `${countAcm} ${countAcm === 1 ? "sala" : "salas"} em aula agora`;
  if (elTodos) elTodos.textContent = `${total} ${total === 1 ? "sala" : "salas"} em aula agora`;
}

function setupModalPavilhao() {
  const overlay = document.getElementById("modalSelecaoPavilhao");
  if (!overlay) return;

  function abrirModal() {
    overlay.classList.add("visivel");
    overlay.classList.add("ativo");
    atualizarContadoresSalasNaSelecao();
    renderIcons();
  }

  function fecharModal(escolha) {
    overlay.classList.remove("visivel");
    overlay.classList.remove("ativo");
    if (escolha) {
      pavilhaoAtivo = escolha;
      modoFixado = true;
      reiniciarCicloCarrossel();
      render();
    }
  }

  // Cards de escolha
  overlay.querySelectorAll(".card-opcao-pavilhao").forEach(card => {
    card.addEventListener("click", () => {
      fecharModal(card.dataset.pavilhaoEscolha || "acm");
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fecharModal(card.dataset.pavilhaoEscolha || "acm");
      }
    });
  });

  // Botão "Trocar" reabre o modal
  const btnTrocar = document.getElementById("btnAbrirModalPavilhao");
  if (btnTrocar) btnTrocar.addEventListener("click", abrirModal);

  // Se veio com ?pavilhao= na URL, aplica e fecha; se NÃO veio, garante que o modal permaneça aberto
  if (pavilhaoUrl) {
    fecharModal(pavilhaoUrl.toLowerCase());
  } else {
    abrirModal();
  }
}

// ======================================================
// INICIALIZAÇÃO
// ======================================================
async function init() {
  setupNavegacaoPavilhoes();
  setupModoKioskETelaCheia();

  // Carrega dados iniciais
  await carregarTurnos();
  await carregarDadosPainel();
  await carregarPresencas();
  await carregarStatusLeitor();

  render();

  // Loop de 1s para relógio e grade
  setInterval(() => {
    render();
  }, 1000);

  // Barra de progresso fluida
  setInterval(() => {
    atualizarBarraProgresso();
  }, 100);

  // Troca de pavilhão no carrossel
  setInterval(() => {
    alternarPavilhaoCarrossel();
  }, TEMPO_CARROSSEL_PAVILHAO);

  // Paginação automática de salas
  agendarProximaPaginaSalas();

  // Polling de dados a cada 4s
  setInterval(async () => {
    await carregarPresencas();
    await carregarStatusLeitor();
  }, 4000);

  // Reage instantaneamente ao F11 ou redimensionamento de tela
  window.addEventListener("resize", () => {
    render();
  });
}

init();

// Modal de seleção de pavilhão — executado imediatamente, sem esperar dados da API
setupModalPavilhao();