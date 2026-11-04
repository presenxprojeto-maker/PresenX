// Verificação estrita de autenticação administrativa
(function verificarAutenticacao() {
  const token = localStorage.getItem("px_admin_token");
  if (!token) {
    window.location.replace("./login-gestao.html");
  }
})();

console.log("GESTAO ADMIN JS - PRESENX MODERNO CARREGADO");

const el = {
  // Status
  dot: document.getElementById("dot-status"),
  status: document.getElementById("text-status"),
  dotBottom: document.getElementById("dot-status-bottom"),
  statusBottom: document.getElementById("text-status-bottom"),
  lastUpdate: document.getElementById("lastUpdate"),

  // Dashboard
  kpiCadastrados: document.getElementById("kpiCadastrados"),
  kpiPresentes: document.getElementById("kpiPresentes"),
  kpiAusentes: document.getElementById("kpiAusentes"),
  kpiSemRegistro: document.getElementById("kpiSemRegistro"),
  ultimosRegistros: document.getElementById("ultimosRegistros"),
  listaAusentes: document.getElementById("listaAusentes"),

  // Professores
  cadUid: document.getElementById("cadUid"),
  cadNome: document.getElementById("cadNome"),
  cadAtivo: document.getElementById("cadAtivo"),
  profDisciplinasCheckboxes: document.getElementById("profDisciplinasCheckboxes"),
  btnSalvarProfessor: document.getElementById("btnSalvarProfessor"),
  msgProfessor: document.getElementById("msgProfessor"),
  editBanner: document.getElementById("editBanner"),
  editBannerNome: document.getElementById("editBannerNome"),
  btnCancelarEdicao: document.getElementById("btnCancelarEdicao"),
  searchInput: document.getElementById("searchInput"),
  tbodyProfessores: document.getElementById("tbodyProfessores"),
  professoresEmpty: document.getElementById("professoresEmpty"),
  msgLista: document.getElementById("msgLista"),

  // Disciplinas
  discNomeInput: document.getElementById("discNomeInput"),
  discCodigoInput: document.getElementById("discCodigoInput"),
  discProfessoresCheckboxes: document.getElementById("discProfessoresCheckboxes"),
  btnSalvarDisciplina: document.getElementById("btnSalvarDisciplina"),
  btnCancelarEdicaoDisciplina: document.getElementById("btnCancelarEdicaoDisciplina"),
  msgDisciplina: document.getElementById("msgDisciplina"),
  searchDisciplinaInput: document.getElementById("searchDisciplinaInput"),
  tbodyDisciplinas: document.getElementById("tbodyDisciplinas"),
  disciplinasEmpty: document.getElementById("disciplinasEmpty"),

  // Turmas & Pavilhões
  turmaIdInput: document.getElementById("turmaIdInput"),
  turmaNomeInput: document.getElementById("turmaNomeInput"),
  turmaPavilhaoInput: document.getElementById("turmaPavilhaoInput"),
  turmaSalaInput: document.getElementById("turmaSalaInput"),
  turmaTurnoInput: document.getElementById("turmaTurnoInput"),
  btnSalvarTurma: document.getElementById("btnSalvarTurma"),
  btnCancelarEdicaoTurma: document.getElementById("btnCancelarEdicaoTurma"),
  msgTurma: document.getElementById("msgTurma"),
  searchTurmaInput: document.getElementById("searchTurmaInput"),
  filtroTurmaPavilhao: document.getElementById("filtroTurmaPavilhao"),
  filtroTurmaTurno: document.getElementById("filtroTurmaTurno"),
  tbodyTurmas: document.getElementById("tbodyTurmas"),
  turmasEmpty: document.getElementById("turmasEmpty"),
  totalCadastradosTurmas: document.getElementById("totalCadastradosTurmas"),

  // Grade Horária Semanal
  gradeSeletorTurma: document.getElementById("gradeSeletorTurma"),
  tbodyGradeSemanal: document.getElementById("tbodyGradeSemanal"),
  btnSalvarGradeHeader: document.getElementById("btnSalvarGradeHeader"),
  btnCopiarGradeModal: document.getElementById("btnCopiarGradeModal"),
  msgGrade: document.getElementById("msgGrade"),

  // Turnos & Horários
  btnSalvarTurnosHeader: document.getElementById("btnSalvarTurnosHeader"),
  msgTurnos: document.getElementById("msgTurnos"),

  // Relatórios
  filtroData: document.getElementById("filtroData"),
  filtroProfessor: document.getElementById("filtroProfessor"),
  btnGerarRelatorio: document.getElementById("btnGerarRelatorio"),
  btnExport: document.getElementById("btnExport"),
  btnImprimirFrequencia: document.getElementById("btnImprimirFrequencia"),
  areaImpressao: document.getElementById("areaImpressao"),
  tbody: document.getElementById("tbody"),
  empty: document.getElementById("empty"),
  paginacaoInfo: document.getElementById("paginacaoInfo"),
  btnPaginaAnterior: document.getElementById("btnPaginaAnterior"),
  btnPaginaProxima: document.getElementById("btnPaginaProxima"),

  // Avisos
  avisoTitulo: document.getElementById("avisoTitulo"),
  avisoMensagem: document.getElementById("avisoMensagem"),
  avisoPrioridade: document.getElementById("avisoPrioridade"),
  avisoExpiracao: document.getElementById("avisoExpiracao"),
  btnSalvarAviso: document.getElementById("btnSalvarAviso"),
  btnCancelarEdicaoAviso: document.getElementById("btnCancelarEdicaoAviso"),
  formAvisoTitulo: document.getElementById("formAvisoTitulo"),
  avisoIdEditando: document.getElementById("avisoIdEditando"),
  searchAvisoInput: document.getElementById("searchAvisoInput"),
  totalAvisosCounter: document.getElementById("totalAvisosCounter"),
  msgAviso: document.getElementById("msgAviso"),
  tbodyAvisos: document.getElementById("tbodyAvisos"),
  avisosEmpty: document.getElementById("avisosEmpty"),
  msgListaAvisos: document.getElementById("msgListaAvisos"),
  kpiTotalAvisos: document.getElementById("kpiTotalAvisos"),
  kpiAvisosAtivos: document.getElementById("kpiAvisosAtivos"),
  kpiAvisosExpirados: document.getElementById("kpiAvisosExpirados"),

  // Eventos
  eventoTitulo: document.getElementById("eventoTitulo"),
  eventoCategoria: document.getElementById("eventoCategoria"),
  eventoDescricao: document.getElementById("eventoDescricao"),
  eventoData: document.getElementById("eventoData"),
  btnSalvarEvento: document.getElementById("btnSalvarEvento"),
  btnCancelarEdicaoEvento: document.getElementById("btnCancelarEdicaoEvento"),
  formEventoTitulo: document.getElementById("formEventoTitulo"),
  eventoIdEditando: document.getElementById("eventoIdEditando"),
  searchEventoInput: document.getElementById("searchEventoInput"),
  totalEventosCounter: document.getElementById("totalEventosCounter"),
  msgEvento: document.getElementById("msgEvento"),
  tbodyEventos: document.getElementById("tbodyEventos"),
  eventosEmpty: document.getElementById("eventosEmpty"),
  msgListaEventos: document.getElementById("msgListaEventos"),
  kpiTotalEventos: document.getElementById("kpiTotalEventos"),
  kpiEventosProximos: document.getElementById("kpiEventosProximos"),
  kpiEventosEncerrados: document.getElementById("kpiEventosEncerrados"),

  // Assistente RFID
  rfidBanner: document.getElementById("rfidBanner"),
  rfidBannerUid: document.getElementById("rfidBannerUid"),
  btnRfidPreencher: document.getElementById("btnRfidPreencher"),
  btnRfidVincular: document.getElementById("btnRfidVincular"),
  btnRfidFechar: document.getElementById("btnRfidFechar"),

  // Modal de Confirmação Geral
  confirmModal: document.getElementById("confirmModal"),
  confirmTitle: document.getElementById("confirmTitle"),
  confirmMessage: document.getElementById("confirmMessage"),
  confirmCancel: document.getElementById("confirmCancel"),
  confirmOk: document.getElementById("confirmOk"),

  // Modal Vincular Cartão RFID
  modalVincularCartao: document.getElementById("modalVincularCartao"),
  modalVincularUid: document.getElementById("modalVincularUid"),
  selectVincularProfessor: document.getElementById("selectVincularProfessor"),
  msgModalVincular: document.getElementById("msgModalVincular"),
  btnModalVincularCancelar: document.getElementById("btnModalVincularCancelar"),
  btnModalVincularConfirmar: document.getElementById("btnModalVincularConfirmar"),

  // Monitoramento do Leitor RFID (ESP32)
  alertaLeitorOffline: document.getElementById("alertaLeitorOffline"),
  alertaLeitorTexto: document.getElementById("alertaLeitorTexto"),
  leitorNomeDash: document.getElementById("leitorNomeDash"),
  leitorBadgeDash: document.getElementById("leitorBadgeDash"),
  leitorIpDash: document.getElementById("leitorIpDash"),
  leitorTempoDash: document.getElementById("leitorTempoDash"),
  dotLeitorSidebar: document.getElementById("dot-leitor-sidebar"),
  textLeitorSidebar: document.getElementById("text-leitor-sidebar"),
  dotLeitorHeader: document.getElementById("dot-leitor-header"),
  textLeitorHeader: document.getElementById("text-leitor-header"),
  tbodyAusentesAgora: document.getElementById("tbodyAusentesAgora"),

  // Navegação
  navBtns: document.querySelectorAll(".nav-btn"),
  pageSections: document.querySelectorAll(".page-section"),
  pageTitle: document.getElementById("pageTitle"),
  pageSubtitle: document.getElementById("pageSubtitle")
};

const subtitles = {
  dashboard: "Monitoramento em tempo real do sistema",
  professores: "Gerenciamento dos professores cadastrados",
  disciplinas: "Catálogo de matérias e vínculos docentes",
  turmas: "Gerenciamento de turmas, salas e pavilhões",
  grade: "Editor visual e inteligente da grade horária semanal",
  turnos: "As alterações valem na hora no painel público.",
  relatorios: "Exportação e relatórios do sistema",
  avisos: "Publicação de avisos para o painel",
  eventos: "Agenda de eventos institucionais"
};

// Estado da Aplicação
let usuarios = {};
let disciplinasLista = [];
let turmasLista = [];
let presencas = {};
let avisos = [];
let eventos = [];
let dataSelecionada = todayKey();
let painelDadosTurmas = null;
let turnosDinamicos = null;

let rfidDesconhecidoDetectado = null;
let rfidUltimoDescartado = null;

let modoEdicaoUid = null;
let modoEdicaoDiscId = null;
let professorFiltro = "";
let paginaRelatorio = 0;
const ITENS_POR_PAGINA_RELATORIO = 10;

// Mapa de Disciplina -> Professores padrão para auto-preenchimento
let mapaProfessoresPorDisciplina = {};

// ======================================================
// HELPERS
// ======================================================
function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function nowBRTime() {
  return new Date().toLocaleTimeString("pt-BR");
}

function norm(s) {
  return (s || "").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getStatusClass(status) {
  const s = (status || "").toLowerCase().trim();
  if (s === "presente") return "presente";
  if (s === "ausente") return "ausente";
  if (s === "sem aula") return "sem-aula";
  return "sem-registro";
}

function renderIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ======================================================
// SISTEMA DE FEEDBACK DINÂMICO & TOAST NOTIFICATIONS
// ======================================================
const toast = {
  container: null,
  init() {
    this.container = document.getElementById("toastContainer");
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "toastContainer";
      this.container.className = "presenx-toast-container";
      this.container.setAttribute("aria-live", "polite");
      document.body.appendChild(this.container);
    }
  },
  show({ tipo = "info", titulo = "", mensagem = "", duracao = 3800 }) {
    this.init();

    const toastEl = document.createElement("div");
    toastEl.className = `presenx-toast ${tipo}`;

    const iconMap = {
      success: `<i data-lucide="check-circle-2"></i>`,
      error: `<i data-lucide="alert-circle"></i>`,
      warning: `<i data-lucide="alert-triangle"></i>`,
      info: `<i data-lucide="info"></i>`
    };

    const iconHtml = iconMap[tipo] || iconMap.info;

    toastEl.innerHTML = `
      <div class="presenx-toast-icon">${iconHtml}</div>
      <div class="presenx-toast-content">
        ${titulo ? `<div class="presenx-toast-title">${escapeHtml(titulo)}</div>` : ""}
        <div class="presenx-toast-message">${escapeHtml(mensagem)}</div>
      </div>
      <button type="button" class="presenx-toast-close" title="Fechar">&times;</button>
      <div class="presenx-toast-progress" style="animation-duration: ${duracao}ms;"></div>
    `;

    this.container.appendChild(toastEl);
    renderIcons();

    let dismissTimer = setTimeout(() => dismiss(), duracao);

    function dismiss() {
      clearTimeout(dismissTimer);
      toastEl.classList.add("hiding");
      setTimeout(() => {
        if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
      }, 240);
    }

    toastEl.querySelector(".presenx-toast-close").addEventListener("click", (e) => {
      e.stopPropagation();
      dismiss();
    });

    toastEl.addEventListener("click", dismiss);

    toastEl.addEventListener("mouseenter", () => {
      clearTimeout(dismissTimer);
      const prog = toastEl.querySelector(".presenx-toast-progress");
      if (prog) prog.style.animationPlayState = "paused";
    });

    toastEl.addEventListener("mouseleave", () => {
      const prog = toastEl.querySelector(".presenx-toast-progress");
      if (prog) prog.style.animationPlayState = "running";
      dismissTimer = setTimeout(() => dismiss(), 1500);
    });

    return toastEl;
  },
  success(mensagem, titulo = "Sucesso") {
    return this.show({ tipo: "success", titulo, mensagem });
  },
  error(mensagem, titulo = "Atenção") {
    return this.show({ tipo: "error", titulo, mensagem });
  },
  warning(mensagem, titulo = "Alerta") {
    return this.show({ tipo: "warning", titulo, mensagem });
  },
  info(mensagem, titulo = "Informação") {
    return this.show({ tipo: "info", titulo, mensagem });
  }
};

async function executarComLoading(botao, fn) {
  if (!botao) return await fn();
  const textoOriginal = botao.innerHTML;
  botao.disabled = true;
  botao.classList.add("btn-is-loading");
  try {
    return await fn();
  } finally {
    botao.disabled = false;
    botao.classList.remove("btn-is-loading");
    botao.innerHTML = textoOriginal;
    renderIcons();
  }
}

// ======================================================
// MODAL DE CONFIRMAÇÃO
// ======================================================
function confirmarAcao({
  titulo = "Confirmar ação",
  mensagem = "Tem certeza que deseja continuar?",
  textoConfirmar = "Confirmar",
  tipo = "danger"
} = {}) {
  return new Promise((resolve) => {
    if (!el.confirmModal) {
      resolve(window.confirm(mensagem));
      return;
    }

    el.confirmTitle.textContent = titulo;
    el.confirmMessage.textContent = mensagem;
    el.confirmOk.textContent = textoConfirmar;
    el.confirmOk.className = tipo === "danger" ? "btn-danger" : "btn-secondary";

    el.confirmModal.classList.remove("hidden");
    requestAnimationFrame(() => el.confirmModal.classList.add("active"));
    renderIcons();

    function fechar(resultado) {
      el.confirmModal.classList.remove("active");
      setTimeout(() => el.confirmModal.classList.add("hidden"), 200);

      el.confirmOk.removeEventListener("click", onConfirmar);
      el.confirmCancel.removeEventListener("click", onCancelar);
      el.confirmModal.removeEventListener("click", onOverlay);
      resolve(resultado);
    }

    function onConfirmar() { fechar(true); }
    function onCancelar() { fechar(false); }
    function onOverlay(event) {
      if (event.target === el.confirmModal) fechar(false);
    }

    el.confirmOk.addEventListener("click", onConfirmar);
    el.confirmCancel.addEventListener("click", onCancelar);
    el.confirmModal.addEventListener("click", onOverlay);
  });
}

// ======================================================
// API REST LOCAL
// ======================================================
async function apiGet(url) {
  const token = localStorage.getItem("px_admin_token");
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const sep = url.includes("?") ? "&" : "?";
  const resposta = await fetch(`${url}${sep}_t=${Date.now()}`, { headers, cache: "no-store" });
  if (resposta.status === 401) {
    localStorage.removeItem("px_admin_token");
    window.location.replace("./login-gestao.html?expirado=1");
    throw new Error("Sessão expirada. Faça login novamente.");
  }
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.erro || "Erro na API");
  return dados;
}

async function apiSend(url, method, body) {
  const token = localStorage.getItem("px_admin_token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const resposta = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(body)
  });
  if (resposta.status === 401) {
    localStorage.removeItem("px_admin_token");
    window.location.replace("./login-gestao.html?expirado=1");
    throw new Error("Sessão expirada. Faça login novamente.");
  }
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.erro || "Erro na API");
  return dados;
}

function formatarDataHoje() {
  const d = new Date();
  const dias = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const diaSemana = dias[d.getDay()];
  const diaMes = d.getDate();
  const mes = meses[d.getMonth()];
  return `${diaSemana}, ${diaMes} de ${mes}`;
}

function atualizarSubtituloHoje() {
  const secaoAtiva = document.querySelector(".page-section.active");
  if (!secaoAtiva || secaoAtiva.id === "dashboardSection") {
    if (el.pageTitle) el.pageTitle.textContent = "Hoje";
    if (el.pageSubtitle) {
      el.pageSubtitle.textContent = `${formatarDataHoje()} • atualizado às ${nowBRTime()}`;
    }
  }
}

function setConnOk() {
  if (el.dot) el.dot.className = "telemetry-dot online";
  if (el.status) el.status.textContent = "API local: online";
  const dotSb = document.getElementById("dot-status-sidebar");
  const txtSb = document.getElementById("text-status-sidebar");
  if (dotSb) dotSb.className = "telemetry-dot online";
  if (txtSb) txtSb.textContent = "API local: online";
  if (el.dotBottom) el.dotBottom.className = "dot presente";
  if (el.statusBottom) el.statusBottom.textContent = "Conectado";
}

function setConnBad() {
  if (el.dot) el.dot.className = "telemetry-dot offline";
  if (el.status) el.status.textContent = "API local: offline";
  const dotSb = document.getElementById("dot-status-sidebar");
  const txtSb = document.getElementById("text-status-sidebar");
  if (dotSb) dotSb.className = "telemetry-dot offline";
  if (txtSb) txtSb.textContent = "API local: offline";
  if (el.dotBottom) el.dotBottom.className = "dot ausente";
  if (el.statusBottom) el.statusBottom.textContent = "Offline";
}

// ======================================================
// NAVEGAÇÃO ENTRE ABAS
// ======================================================
function aplicarNavegacao(secaoAlvo) {
  fecharMenuMobile();

  el.navBtns.forEach(b => {
    if (b.dataset.section === secaoAlvo) b.classList.add("active");
    else b.classList.remove("active");
  });

  el.pageSections.forEach(sec => sec.classList.remove("active"));
  const sectionElement = document.getElementById(`${secaoAlvo}Section`);
  if (sectionElement) sectionElement.classList.add("active");

  const btnNovoProf = document.getElementById("btnNovoProfessor");
  const btnNovaDisc = document.getElementById("btnNovaDisciplina");
  const btnNovaTurma = document.getElementById("btnNovaTurma");
  const btnSalvarGrade = document.getElementById("btnSalvarGradeHeader");
  const btnSalvarTurnos = document.getElementById("btnSalvarTurnosHeader");
  const btnNovoAviso = document.getElementById("btnNovoAvisoHeader");
  const btnNovoEvento = document.getElementById("btnNovoEventoHeader");
  const telemetryHeader = document.getElementById("headerTelemetry");
  const sidebarTelemetry = document.getElementById("sidebarTelemetry");
  const pageSubtitle = document.getElementById("pageSubtitle");

  if (secaoAlvo === "dashboard") {
    if (el.pageTitle) el.pageTitle.textContent = "Hoje";
    if (telemetryHeader) telemetryHeader.classList.remove("hidden");
    if (sidebarTelemetry) sidebarTelemetry.classList.add("hidden");
    if (btnNovoProf) btnNovoProf.classList.add("hidden");
    if (btnNovaDisc) btnNovaDisc.classList.add("hidden");
    if (btnNovaTurma) btnNovaTurma.classList.add("hidden");
    if (btnSalvarGrade) btnSalvarGrade.classList.add("hidden");
    if (btnSalvarTurnos) btnSalvarTurnos.classList.add("hidden");
    if (btnNovoAviso) btnNovoAviso.classList.add("hidden");
    if (btnNovoEvento) btnNovoEvento.classList.add("hidden");
    if (pageSubtitle) pageSubtitle.classList.remove("hidden");
    atualizarSubtituloHoje();
  } else if (secaoAlvo === "professores") {
    if (el.pageTitle) el.pageTitle.textContent = "Professores";
    if (telemetryHeader) telemetryHeader.classList.add("hidden");
    if (sidebarTelemetry) sidebarTelemetry.classList.remove("hidden");
    if (btnNovoProf) btnNovoProf.classList.remove("hidden");
    if (btnNovaDisc) btnNovaDisc.classList.add("hidden");
    if (btnNovaTurma) btnNovaTurma.classList.add("hidden");
    if (btnSalvarGrade) btnSalvarGrade.classList.add("hidden");
    if (btnSalvarTurnos) btnSalvarTurnos.classList.add("hidden");
    if (btnNovoAviso) btnNovoAviso.classList.add("hidden");
    if (btnNovoEvento) btnNovoEvento.classList.add("hidden");
    if (pageSubtitle) pageSubtitle.classList.add("hidden");
  } else if (secaoAlvo === "disciplinas") {
    if (el.pageTitle) el.pageTitle.textContent = "Disciplinas";
    if (telemetryHeader) telemetryHeader.classList.add("hidden");
    if (sidebarTelemetry) sidebarTelemetry.classList.remove("hidden");
    if (btnNovoProf) btnNovoProf.classList.add("hidden");
    if (btnNovaDisc) btnNovaDisc.classList.remove("hidden");
    if (btnNovaTurma) btnNovaTurma.classList.add("hidden");
    if (btnSalvarGrade) btnSalvarGrade.classList.add("hidden");
    if (btnSalvarTurnos) btnSalvarTurnos.classList.add("hidden");
    if (btnNovoAviso) btnNovoAviso.classList.add("hidden");
    if (btnNovoEvento) btnNovoEvento.classList.add("hidden");
    if (pageSubtitle) pageSubtitle.classList.add("hidden");
  } else if (secaoAlvo === "turmas") {
    if (el.pageTitle) el.pageTitle.textContent = "Turmas e pavilhões";
    if (telemetryHeader) telemetryHeader.classList.add("hidden");
    if (sidebarTelemetry) sidebarTelemetry.classList.remove("hidden");
    if (btnNovoProf) btnNovoProf.classList.add("hidden");
    if (btnNovaDisc) btnNovaDisc.classList.add("hidden");
    if (btnNovaTurma) btnNovaTurma.classList.remove("hidden");
    if (btnSalvarGrade) btnSalvarGrade.classList.add("hidden");
    if (btnSalvarTurnos) btnSalvarTurnos.classList.add("hidden");
    if (btnNovoAviso) btnNovoAviso.classList.add("hidden");
    if (btnNovoEvento) btnNovoEvento.classList.add("hidden");
    if (pageSubtitle) pageSubtitle.classList.add("hidden");
  } else if (secaoAlvo === "grade") {
    if (el.pageTitle) el.pageTitle.textContent = "Grade horária";
    if (telemetryHeader) telemetryHeader.classList.add("hidden");
    if (sidebarTelemetry) sidebarTelemetry.classList.remove("hidden");
    if (btnNovoProf) btnNovoProf.classList.add("hidden");
    if (btnNovaDisc) btnNovaDisc.classList.add("hidden");
    if (btnNovaTurma) btnNovaTurma.classList.add("hidden");
    if (btnSalvarGrade) btnSalvarGrade.classList.remove("hidden");
    if (btnSalvarTurnos) btnSalvarTurnos.classList.add("hidden");
    if (btnNovoAviso) btnNovoAviso.classList.add("hidden");
    if (btnNovoEvento) btnNovoEvento.classList.add("hidden");
    if (pageSubtitle) pageSubtitle.classList.add("hidden");
  } else if (secaoAlvo === "turnos") {
    if (el.pageTitle) el.pageTitle.textContent = "Turnos e horários";
    if (telemetryHeader) telemetryHeader.classList.add("hidden");
    if (sidebarTelemetry) sidebarTelemetry.classList.remove("hidden");
    if (btnNovoProf) btnNovoProf.classList.add("hidden");
    if (btnNovaDisc) btnNovaDisc.classList.add("hidden");
    if (btnNovaTurma) btnNovaTurma.classList.add("hidden");
    if (btnSalvarGrade) btnSalvarGrade.classList.add("hidden");
    if (btnSalvarTurnos) btnSalvarTurnos.classList.remove("hidden");
    if (btnNovoAviso) btnNovoAviso.classList.add("hidden");
    if (btnNovoEvento) btnNovoEvento.classList.add("hidden");
    if (pageSubtitle) {
      pageSubtitle.textContent = "As alterações valem na hora no painel público.";
      pageSubtitle.classList.remove("hidden");
    }
  } else if (secaoAlvo === "relatorios") {
    if (el.pageTitle) el.pageTitle.textContent = "Relatórios";
    if (telemetryHeader) telemetryHeader.classList.add("hidden");
    if (sidebarTelemetry) sidebarTelemetry.classList.remove("hidden");
    if (btnNovoProf) btnNovoProf.classList.add("hidden");
    if (btnNovaDisc) btnNovaDisc.classList.add("hidden");
    if (btnNovaTurma) btnNovaTurma.classList.add("hidden");
    if (btnSalvarGrade) btnSalvarGrade.classList.add("hidden");
    if (btnSalvarTurnos) btnSalvarTurnos.classList.add("hidden");
    if (btnNovoAviso) btnNovoAviso.classList.add("hidden");
    if (btnNovoEvento) btnNovoEvento.classList.add("hidden");
    if (pageSubtitle) pageSubtitle.classList.add("hidden");
    popularFiltroProfessor();
    buildTabela();
  } else if (secaoAlvo === "avisos") {
    if (el.pageTitle) el.pageTitle.textContent = "Avisos";
    if (telemetryHeader) telemetryHeader.classList.add("hidden");
    if (sidebarTelemetry) sidebarTelemetry.classList.remove("hidden");
    if (btnNovoProf) btnNovoProf.classList.add("hidden");
    if (btnNovaDisc) btnNovaDisc.classList.add("hidden");
    if (btnNovaTurma) btnNovaTurma.classList.add("hidden");
    if (btnSalvarGrade) btnSalvarGrade.classList.add("hidden");
    if (btnSalvarTurnos) btnSalvarTurnos.classList.add("hidden");
    if (btnNovoAviso) btnNovoAviso.classList.remove("hidden");
    if (btnNovoEvento) btnNovoEvento.classList.add("hidden");
    if (pageSubtitle) pageSubtitle.classList.add("hidden");
    renderListaAvisos();
  } else if (secaoAlvo === "eventos") {
    if (el.pageTitle) el.pageTitle.textContent = "Eventos";
    if (telemetryHeader) telemetryHeader.classList.add("hidden");
    if (sidebarTelemetry) sidebarTelemetry.classList.remove("hidden");
    if (btnNovoProf) btnNovoProf.classList.add("hidden");
    if (btnNovaDisc) btnNovaDisc.classList.add("hidden");
    if (btnNovaTurma) btnNovaTurma.classList.add("hidden");
    if (btnSalvarGrade) btnSalvarGrade.classList.add("hidden");
    if (btnSalvarTurnos) btnSalvarTurnos.classList.add("hidden");
    if (btnNovoAviso) btnNovoAviso.classList.add("hidden");
    if (btnNovoEvento) btnNovoEvento.classList.remove("hidden");
    if (pageSubtitle) pageSubtitle.classList.add("hidden");
    renderListaEventos();
  } else if (secaoAlvo === "usuarios") {
    if (el.pageTitle) el.pageTitle.textContent = "Coordenadores";
    if (telemetryHeader) telemetryHeader.classList.add("hidden");
    if (sidebarTelemetry) sidebarTelemetry.classList.remove("hidden");
    if (btnNovoProf) btnNovoProf.classList.add("hidden");
    if (btnNovaDisc) btnNovaDisc.classList.add("hidden");
    if (btnNovaTurma) btnNovaTurma.classList.add("hidden");
    if (btnSalvarGrade) btnSalvarGrade.classList.add("hidden");
    if (btnSalvarTurnos) btnSalvarTurnos.classList.add("hidden");
    if (btnNovoAviso) btnNovoAviso.classList.add("hidden");
    if (btnNovoEvento) btnNovoEvento.classList.add("hidden");
    if (pageSubtitle) pageSubtitle.classList.add("hidden");
    carregarCoordenadores();
  } else if (secaoAlvo === "backup") {
    if (el.pageTitle) el.pageTitle.textContent = "Backup & Nuvem";
    if (telemetryHeader) telemetryHeader.classList.add("hidden");
    if (sidebarTelemetry) sidebarTelemetry.classList.remove("hidden");
    if (btnNovoProf) btnNovoProf.classList.add("hidden");
    if (btnNovaDisc) btnNovaDisc.classList.add("hidden");
    if (btnNovaTurma) btnNovaTurma.classList.add("hidden");
    if (btnSalvarGrade) btnSalvarGrade.classList.add("hidden");
    if (btnSalvarTurnos) btnSalvarTurnos.classList.add("hidden");
    if (btnNovoAviso) btnNovoAviso.classList.add("hidden");
    if (btnNovoEvento) btnNovoEvento.classList.add("hidden");
    if (pageSubtitle) pageSubtitle.classList.add("hidden");
    carregarStatusBackup();
  } else {
    if (telemetryHeader) telemetryHeader.classList.add("hidden");
    if (sidebarTelemetry) sidebarTelemetry.classList.remove("hidden");
    if (btnNovoProf) btnNovoProf.classList.add("hidden");
    if (btnNovaDisc) btnNovaDisc.classList.add("hidden");
    if (btnNovaTurma) btnNovaTurma.classList.add("hidden");
    if (btnSalvarGrade) btnSalvarGrade.classList.add("hidden");
    if (btnSalvarTurnos) btnSalvarTurnos.classList.add("hidden");
    if (btnNovoAviso) btnNovoAviso.classList.add("hidden");
    if (btnNovoEvento) btnNovoEvento.classList.add("hidden");
    if (pageSubtitle) pageSubtitle.classList.remove("hidden");
    if (el.pageTitle) {
      const activeBtn = document.querySelector(`.nav-btn[data-section="${secaoAlvo}"] span`);
      el.pageTitle.textContent = activeBtn ? activeBtn.textContent : secaoAlvo;
    }
    if (el.pageSubtitle) {
      el.pageSubtitle.textContent = subtitles[secaoAlvo] || "";
    }
  }

  if (secaoAlvo === "grade" && el.gradeSeletorTurma && el.gradeSeletorTurma.value) {
    carregarGradeDaTurma(el.gradeSeletorTurma.value);
  }

  renderIcons();

  // Suporte global à tecla ESC para fechar modais ou limpar busca
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // 0. Menu drawer mobile
      if (document.body.classList.contains("mobile-drawer-open")) {
        fecharMenuMobile();
        return;
      }
      // 1. Modal de confirmação
      if (el.confirmModal && el.confirmModal.classList.contains("active")) {
        if (el.confirmCancel) el.confirmCancel.click();
        return;
      }
      // 2. Modal do slot da grade
      const slotModal = document.getElementById("slotModal");
      if (slotModal && !slotModal.classList.contains("hidden")) {
        fecharModalSlot();
        return;
      }
      // 3. Modal copiar grade
      const modalCopiar = document.getElementById("modalCopiarGrade");
      if (modalCopiar && !modalCopiar.classList.contains("hidden")) {
        fecharModalCopiarGrade();
        return;
      }
      // 4. Modal vincular cartão RFID
      const modalVincular = document.getElementById("modalVincularCartao");
      if (modalVincular && !modalVincular.classList.contains("hidden")) {
        fecharModalVincularCartao();
        return;
      }
      // 5. Input de busca focado
      const activeInput = document.activeElement;
      if (activeInput && (activeInput.id.startsWith("search") || activeInput.id === "searchInput")) {
        if (activeInput.value) {
          activeInput.value = "";
          activeInput.dispatchEvent(new Event("input"));
        }
        activeInput.blur();
      }
    }
  });

}

// ======================================================
// CONTROLE DO MENU DRAWER MOBILE
// ======================================================
function abrirMenuMobile() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("sidebarOverlayMobile");
  if (sidebar) sidebar.classList.add("open-mobile");
  if (overlay) overlay.classList.add("active");
  document.body.classList.add("mobile-drawer-open");
}

function fecharMenuMobile() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("sidebarOverlayMobile");
  if (sidebar) sidebar.classList.remove("open-mobile");
  if (overlay) overlay.classList.remove("active");
  document.body.classList.remove("mobile-drawer-open");
}

function initMenuMobile() {
  const btnOpen = document.getElementById("btnOpenMobileMenu");
  const btnClose = document.getElementById("btnCloseSidebarMobile");
  const overlay = document.getElementById("sidebarOverlayMobile");

  if (btnOpen) {
    btnOpen.addEventListener("click", abrirMenuMobile);
  }
  if (btnClose) {
    btnClose.addEventListener("click", fecharMenuMobile);
  }
  if (overlay) {
    overlay.addEventListener("click", fecharMenuMobile);
  }

  // Permite fechar com gesto de deslizar para a esquerda
  let touchStartX = 0;
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    sidebar.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    sidebar.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      if (touchStartX - touchEndX > 50) {
        fecharMenuMobile();
      }
    }, { passive: true });
  }
}

function initNavegacao() {
  initMenuMobile();

  el.navBtns.forEach(botao => {
    botao.addEventListener("click", () => {
      aplicarNavegacao(botao.dataset.section);
    });
  });

  // Aplica imediatamente a aba inicial ("dashboard" / Hoje)
  aplicarNavegacao("dashboard");
}

// ======================================================
// ASSISTENTE DE VINCULAÇÃO RÁPIDA RFID
// ======================================================
async function verificarCartaoDesconhecido() {
  try {
    const res = await apiGet("/api/ultimo-acesso");
    const ult = res?.ultimoAcesso;
    if (ult && ult.status === "Desconhecido" && ult.uid) {
      const uid = ult.uid.trim().toUpperCase();
      // Verifica se o UID já foi cadastrado em algum professor ativo
      const jaCadastrado = Object.keys(usuarios).some(u => u.toUpperCase() === uid);
      if (!jaCadastrado) {
        if (rfidUltimoDescartado !== uid) {
          rfidDesconhecidoDetectado = uid;
          if (el.rfidBanner && el.rfidBannerUid) {
            el.rfidBannerUid.textContent = uid;
            el.rfidBanner.classList.remove("hidden");
            renderIcons();
          }
        }
      } else {
        // Se já está cadastrado, esconde o banner
        fecharBannerRfid();
      }
    }
  } catch (err) {
    // Silencioso para não poluir console durante polling
  }
}

function fecharBannerRfid() {
  if (rfidDesconhecidoDetectado) {
    rfidUltimoDescartado = rfidDesconhecidoDetectado;
  }
  if (el.rfidBanner) el.rfidBanner.classList.add("hidden");
}

function preencherUidDesconhecido() {
  if (!rfidDesconhecidoDetectado) return;
  // Muda para a seção de professores
  const btnProf = document.querySelector(`.nav-btn[data-section="professores"]`);
  if (btnProf) btnProf.click();

  if (el.uidInput) {
    el.uidInput.value = rfidDesconhecidoDetectado;
    el.uidInput.classList.remove("input-error");
  }
  if (el.nomeInput) {
    el.nomeInput.focus();
  }
  if (el.msgProfessor) {
    el.msgProfessor.style.color = "var(--primary)";
    el.msgProfessor.textContent = `Cartão ${rfidDesconhecidoDetectado} preenchido! Digite o nome do professor e salve.`;
  }
}

function abrirModalVincularCartao() {
  if (!rfidDesconhecidoDetectado) return;
  if (!el.modalVincularCartao) return;

  if (el.modalVincularUid) el.modalVincularUid.textContent = rfidDesconhecidoDetectado;
  if (el.msgModalVincular) el.msgModalVincular.textContent = "";

  if (el.selectVincularProfessor) {
    const listaProfs = Object.entries(usuarios)
      .filter(([_, u]) => u.ativo)
      .sort((a, b) => norm(a[1].nome).localeCompare(norm(b[1].nome)));

    el.selectVincularProfessor.innerHTML = `<option value="">Selecione o professor...</option>` +
      listaProfs.map(([uid, u]) => `<option value="${uid}">${escapeHtml(u.nome)} (Atual: ${uid})</option>`).join("");
  }

  el.modalVincularCartao.classList.remove("hidden");
  el.modalVincularCartao.classList.add("active");
  renderIcons();
}

function fecharModalVincularCartao() {
  if (el.modalVincularCartao) {
    el.modalVincularCartao.classList.remove("active");
    el.modalVincularCartao.classList.add("hidden");
  }
}

async function confirmarVinculoCartao() {
  if (!rfidDesconhecidoDetectado) return;
  const uidAntigo = el.selectVincularProfessor?.value;
  if (!uidAntigo) {
    if (el.msgModalVincular) {
      el.msgModalVincular.style.color = "var(--danger)";
      el.msgModalVincular.textContent = "Por favor, selecione um professor da lista.";
    }
    return;
  }

  try {
    if (el.btnModalVincularConfirmar) el.btnModalVincularConfirmar.disabled = true;
    const resp = await apiPost("/api/vincular-cartao", {
      uid_antigo: uidAntigo,
      uid_novo: rfidDesconhecidoDetectado
    });

    fecharModalVincularCartao();
    fecharBannerRfid();
    await carregarUsuariosLocais();
    await carregarPresencasPorData();

    if (el.msgProfessor) {
      el.msgProfessor.style.color = "var(--success)";
      el.msgProfessor.textContent = resp.msg || "Cartão vinculado com sucesso!";
      setTimeout(() => { if (el.msgProfessor) el.msgProfessor.textContent = ""; }, 5000);
    }
  } catch (err) {
    if (el.msgModalVincular) {
      el.msgModalVincular.style.color = "var(--danger)";
      el.msgModalVincular.textContent = "Erro ao vincular: " + err.message;
    }
  } finally {
    if (el.btnModalVincularConfirmar) el.btnModalVincularConfirmar.disabled = false;
  }
}

// ======================================================
// MONITORAMENTO DE LEITORES RFID (ESP32)
// ======================================================
async function carregarMonitoramentoLeitores() {
  try {
    const res = await apiGet("/api/leitores");
    const leitores = res?.leitores || [];

    if (leitores.length === 0) {
      if (el.dotLeitorSidebar) el.dotLeitorSidebar.className = "telemetry-dot offline";
      if (el.textLeitorSidebar) el.textLeitorSidebar.textContent = "Leitor: sem sinal";
      if (el.dotLeitorHeader) el.dotLeitorHeader.className = "telemetry-dot offline";
      if (el.textLeitorHeader) el.textLeitorHeader.textContent = "Leitor Portaria: sem sinal";
      if (el.alertaLeitorOffline) el.alertaLeitorOffline.classList.remove("hidden");
      if (el.alertaLeitorTexto) el.alertaLeitorTexto.textContent = "Nenhum leitor RFID foi conectado ainda.";
      return;
    }

    const offlineLeitores = leitores.filter(l => !l.online);
    const leitorPrincipal = leitores[0];

    // Atualiza telemetry no cabeçalho (Mockup)
    if (el.dotLeitorHeader && el.textLeitorHeader) {
      if (offlineLeitores.length === 0) {
        el.dotLeitorHeader.className = "telemetry-dot online";
        el.textLeitorHeader.textContent = "Leitor Portaria: online";
      } else {
        el.dotLeitorHeader.className = "telemetry-dot offline";
        const off = offlineLeitores[0];
        const tempo = off?.tempo_decorrido || "offline";
        el.textLeitorHeader.textContent = tempo !== "offline" && tempo !== "nunca" && tempo !== "desconectado"
          ? `Leitor Portaria: sem sinal (${tempo})`
          : "Leitor Portaria: sem sinal";
      }
    }

    // Atualiza status na barra lateral
    if (el.dotLeitorSidebar && el.textLeitorSidebar) {
      if (offlineLeitores.length === 0) {
        el.dotLeitorSidebar.className = "telemetry-dot online";
        el.textLeitorSidebar.textContent = "Leitor: online";
      } else {
        el.dotLeitorSidebar.className = "telemetry-dot offline";
        const off = offlineLeitores[0];
        const tempo = off?.tempo_decorrido || "offline";
        el.textLeitorSidebar.textContent = tempo !== "offline" && tempo !== "nunca" && tempo !== "desconectado"
          ? `Leitor: sem sinal (${tempo})`
          : "Leitor: sem sinal";
      }
    }

    // Atualiza Card de Monitoramento no Dashboard
    if (el.leitorNomeDash) el.leitorNomeDash.textContent = leitorPrincipal.nome;
    if (el.leitorIpDash) el.leitorIpDash.textContent = leitorPrincipal.ip ? `IP: ${leitorPrincipal.ip}` : "IP: Local";
    if (el.leitorTempoDash) {
      if (leitorPrincipal.online) {
        el.leitorTempoDash.textContent = `Sinal: ativo (${leitorPrincipal.tempo_decorrido})`;
      } else {
        el.leitorTempoDash.textContent = (leitorPrincipal.tempo_decorrido && leitorPrincipal.tempo_decorrido !== "nunca" && leitorPrincipal.tempo_decorrido !== "desconectado")
          ? `Sem sinal (${leitorPrincipal.tempo_decorrido})`
          : "Sem sinal";
      }
    }
    if (el.leitorBadgeDash) {
      if (leitorPrincipal.online) {
        el.leitorBadgeDash.className = "status-badge ativo";
        el.leitorBadgeDash.textContent = "Online";
      } else {
        el.leitorBadgeDash.className = "status-badge inativo";
        el.leitorBadgeDash.textContent = "Offline";
      }
    }

    // Alerta no topo do Dashboard se algum leitor estiver offline
    if (el.alertaLeitorOffline && el.alertaLeitorTexto) {
      if (offlineLeitores.length > 0) {
        const nomes = offlineLeitores.map(l => `"${l.nome}"`).join(", ");
        el.alertaLeitorTexto.textContent = `O leitor ${nomes} não envia sinal há mais de 2 minutos. Verifique a fonte de alimentação ou a conexão Wi-Fi da escola.`;
        el.alertaLeitorOffline.classList.remove("hidden");
        renderIcons();
      } else {
        el.alertaLeitorOffline.classList.add("hidden");
      }
    }
  } catch (err) {
    if (el.dotLeitorSidebar) el.dotLeitorSidebar.className = "telemetry-dot offline";
    if (el.textLeitorSidebar) el.textLeitorSidebar.textContent = "Leitor: sem sinal";
    if (el.dotLeitorHeader) el.dotLeitorHeader.className = "telemetry-dot offline";
    if (el.textLeitorHeader) el.textLeitorHeader.textContent = "Leitor Portaria: sem sinal";
  }
}

// ======================================================
// 1. PROFESSORES (CRUD)
// ======================================================
async function carregarUsuariosLocais() {
  try {
    const dados = await apiGet("/api/usuarios");
    usuarios = {};
    (dados.usuarios || []).forEach(usuario => {
      usuarios[usuario.uid] = {
        uid: usuario.uid,
        nome: usuario.nome,
        curso: usuario.curso || "",
        ativo: usuario.ativo === 1 || usuario.ativo === true,
        disciplinas: usuario.disciplinas || []
      };
    });
    atualizarDashboard();
    renderCheckboxesDisciplinasNoProfessor();
    renderCheckboxesProfessoresNaDisciplina();
    setConnOk();
  } catch (error) {
    console.warn("API de usuários inacessível:", error);
    setConnBad();
  }
}

function renderListaProfessores() {
  if (!el.tbodyProfessores) return;

  const termo = norm(el.searchInput ? el.searchInput.value : "");

  const totalProfs = Object.keys(usuarios).length;
  const elCounter = document.getElementById("totalCadastradosProfessores");
  if (elCounter) {
    elCounter.textContent = `${totalProfs} cadastrados`;
  }

  const lista = Object.entries(usuarios)
    .filter(([uid, u]) => {
      if (!termo) return true;
      return norm(u.nome).includes(termo) || norm(uid).includes(termo);
    })
    .sort((a, b) => norm(a[1].nome).localeCompare(norm(b[1].nome)));

  if (lista.length === 0) {
    el.tbodyProfessores.innerHTML = "";
    if (el.professoresEmpty) el.professoresEmpty.classList.remove("hidden");
    return;
  }

  if (el.professoresEmpty) el.professoresEmpty.classList.add("hidden");

  el.tbodyProfessores.innerHTML = lista.map(([uid, u]) => {
    const discsTexto = (u.disciplinas && u.disciplinas.length > 0)
      ? u.disciplinas.map(d => escapeHtml(d.nome)).join(", ")
      : `<span style="color:#94a3b8; font-size:13px;">—</span>`;

    return `
      <tr>
        <td><strong>${escapeHtml(u.nome)}</strong></td>
        <td><span class="mono">${escapeHtml(uid)}</span></td>
        <td style="max-width:280px;"><span class="prof-disciplinas-text">${discsTexto}</span></td>
        <td><span class="status-pill ${u.ativo ? "ativo" : "inativo"}">${u.ativo ? "Ativo" : "Inativo"}</span></td>
        <td class="col-acoes-prof">
          <button type="button" class="btn-action-edit" data-action="editar" data-uid="${escapeHtml(uid)}">Editar</button>
          <button type="button" class="btn-action-delete" data-action="excluir" data-uid="${escapeHtml(uid)}">Excluir</button>
        </td>
      </tr>
    `;
  }).join("");
}

function renderCheckboxesDisciplinasNoProfessor(selectedIds = []) {
  if (!el.profDisciplinasCheckboxes) return;
  if (disciplinasLista.length === 0) {
    el.profDisciplinasCheckboxes.innerHTML = `<span style="color:var(--muted); font-size:13px; padding:6px;">Cadastre disciplinas primeiro.</span>`;
    atualizarTextoDropdownDisciplinas();
    return;
  }

  el.profDisciplinasCheckboxes.innerHTML = disciplinasLista.map(d => {
    const checked = selectedIds.includes(d.id) ? "checked" : "";
    return `
      <label class="checkbox-tag">
        <input type="checkbox" name="prof_disc" value="${d.id}" ${checked} />
        <span>${escapeHtml(d.nome)}</span>
      </label>
    `;
  }).join("");

  el.profDisciplinasCheckboxes.querySelectorAll("input[type='checkbox']").forEach(input => {
    input.addEventListener("change", atualizarTextoDropdownDisciplinas);
  });

  atualizarTextoDropdownDisciplinas();
}

function atualizarTextoDropdownDisciplinas() {
  const cbs = document.querySelectorAll("input[name='prof_disc']:checked");
  const txt = document.getElementById("txtDropdownDisciplinas");
  if (!txt) return;
  if (cbs.length === 0) {
    txt.textContent = "Selecionar disciplinas";
  } else if (cbs.length === 1) {
    const label = cbs[0].closest("label");
    txt.textContent = label ? label.textContent.trim() : "1 selecionada";
  } else if (cbs.length <= 2) {
    const nomes = Array.from(cbs).map(cb => {
      const l = cb.closest("label");
      return l ? l.textContent.trim() : "";
    }).filter(Boolean);
    txt.textContent = nomes.join(", ");
  } else {
    txt.textContent = `${cbs.length} disciplinas selecionadas`;
  }
}

async function salvarProfessor() {
  const emEdicao = !!modoEdicaoUid;
  const uid = modoEdicaoUid || (el.cadUid.value || "").trim().toUpperCase();
  const nome = (el.cadNome.value || "").trim();
  const ativo = !!el.cadAtivo.checked;

  const checkboxes = document.querySelectorAll("input[name='prof_disc']:checked");
  const disciplinas_ids = Array.from(checkboxes).map(cb => Number(cb.value));

  el.msgProfessor.textContent = "";

  if (!uid || !nome) {
    el.msgProfessor.style.color = "var(--danger)";
    el.msgProfessor.textContent = "Preencha UID e Nome do professor.";
    return;
  }

  await executarComLoading(el.btnSalvarProfessor, async () => {
    try {
      await apiSend("/api/usuarios", "POST", { uid, nome, ativo, disciplinas_ids });
      cancelarEdicaoProfessor();
      el.msgProfessor.style.color = "var(--success)";
      el.msgProfessor.textContent = emEdicao ? "Professor atualizado com sucesso!" : "Professor cadastrado com sucesso!";
      toast.success(emEdicao ? "Professor atualizado com sucesso!" : "Professor cadastrado com sucesso!");
      await carregarUsuariosLocais();
      await carregarDisciplinas();
      setTimeout(() => { if (el.msgProfessor) el.msgProfessor.textContent = ""; }, 4000);
    } catch (error) {
      el.msgProfessor.style.color = "var(--danger)";
      el.msgProfessor.textContent = "Erro ao salvar professor: " + error.message;
      toast.error("Erro ao salvar professor: " + error.message);
    }
  });
}

function iniciarEdicaoProfessor(uid) {
  const usuario = usuarios[uid];
  if (!usuario) return;

  modoEdicaoUid = uid;
  el.cadUid.value = uid;
  el.cadNome.value = usuario.nome;
  el.cadAtivo.checked = !!usuario.ativo;
  el.cadUid.disabled = true;

  const discsIds = (usuario.disciplinas || []).map(d => d.id);
  renderCheckboxesDisciplinasNoProfessor(discsIds);

  const formTitulo = document.getElementById("formProfessorTitulo");
  if (formTitulo) formTitulo.textContent = "Editar professor";

  if (el.btnSalvarProfessor) el.btnSalvarProfessor.textContent = "Salvar";
  if (el.msgProfessor) el.msgProfessor.textContent = "";
  el.cadNome.focus();
}

function cancelarEdicaoProfessor() {
  modoEdicaoUid = null;
  el.cadUid.value = "";
  el.cadNome.value = "";
  el.cadAtivo.checked = true;
  el.cadUid.disabled = false;
  renderCheckboxesDisciplinasNoProfessor([]);

  const formTitulo = document.getElementById("formProfessorTitulo");
  if (formTitulo) formTitulo.textContent = "Cadastrar professor";

  if (el.btnSalvarProfessor) el.btnSalvarProfessor.textContent = "Salvar";
  if (el.msgProfessor) el.msgProfessor.textContent = "";
  renderListaProfessores();
}

async function alternarAtivoProfessor(uid) {
  const usuario = usuarios[uid];
  if (!usuario) return;
  try {
    await apiSend("/api/usuarios", "POST", { uid, nome: usuario.nome, ativo: !usuario.ativo });
    await carregarUsuariosLocais();
  } catch (error) {
    toast.error("Erro ao alterar status: " + error.message);
  }
}

async function excluirProfessor(uid, nome) {
  const ok = await confirmarAcao({
    titulo: "Excluir professor",
    mensagem: `Tem certeza que deseja excluir "${nome}"? Essa ação não pode ser desfeita.`,
    textoConfirmar: "Excluir",
    tipo: "danger"
  });
  if (!ok) return;

  try {
    await apiSend(`/api/usuarios/${uid}`, "DELETE", {});
    if (modoEdicaoUid === uid) cancelarEdicaoProfessor();
    await carregarUsuariosLocais();
    await carregarDisciplinas();
  } catch (error) {
    toast.error("Erro ao excluir professor: " + error.message);
  }
}

// ======================================================
// 2. DISCIPLINAS (CRUD & VÍNCULOS)
// ======================================================
async function carregarDisciplinas() {
  try {
    const dados = await apiGet("/api/disciplinas");
    disciplinasLista = dados.disciplinas || [];

    // Monta mapa de Professores por disciplina para auto-preenchimento
    mapaProfessoresPorDisciplina = {};
    disciplinasLista.forEach(d => {
      mapaProfessoresPorDisciplina[d.nome] = d.professores ? d.professores.map(p => p.nome).join(", ") : "";
    });

    renderListaDisciplinas();
    renderCheckboxesDisciplinasNoProfessor();
    renderCheckboxesProfessoresNaDisciplina();
  } catch (error) {
    console.warn("Erro ao carregar disciplinas:", error);
  }
}

function renderCheckboxesProfessoresNaDisciplina(selectedUids = null) {
  if (!el.discProfessoresCheckboxes) return;
  const profs = Object.values(usuarios).sort((a, b) => norm(a.nome).localeCompare(norm(b.nome)));

  if (profs.length === 0) {
    el.discProfessoresCheckboxes.innerHTML = `<span style="color:var(--muted); font-size:13px; padding:6px;">Cadastre professores primeiro.</span>`;
    atualizarTextoDropdownProfessores();
    return;
  }

  let uids = selectedUids;
  if (uids === null) {
    if (modoEdicaoDiscId) {
      const discAtual = disciplinasLista.find(d => Number(d.id) === Number(modoEdicaoDiscId));
      uids = discAtual && discAtual.professores ? discAtual.professores.map(p => p.uid) : [];
    } else {
      uids = [];
    }
  }

  el.discProfessoresCheckboxes.innerHTML = profs.map(p => {
    const checked = uids.includes(p.uid) ? "checked" : "";
    return `
      <label class="checkbox-tag">
        <input type="checkbox" name="disc_prof" value="${escapeHtml(p.uid)}" ${checked} />
        <span>${escapeHtml(p.nome)}</span>
      </label>
    `;
  }).join("");

  el.discProfessoresCheckboxes.querySelectorAll("input[type='checkbox']").forEach(input => {
    input.addEventListener("change", atualizarTextoDropdownProfessores);
  });

  atualizarTextoDropdownProfessores();
}

function atualizarTextoDropdownProfessores() {
  const cbs = document.querySelectorAll("input[name='disc_prof']:checked");
  const txt = document.getElementById("txtDropdownProfessores");
  if (!txt) return;
  if (cbs.length === 0) {
    txt.textContent = "Selecionar professores";
  } else if (cbs.length === 1) {
    const label = cbs[0].closest("label");
    txt.textContent = label ? label.textContent.trim() : "1 selecionado";
  } else if (cbs.length <= 2) {
    const nomes = Array.from(cbs).map(cb => {
      const l = cb.closest("label");
      return l ? l.textContent.trim() : "";
    }).filter(Boolean);
    txt.textContent = nomes.join(", ");
  } else {
    txt.textContent = `${cbs.length} professores selecionados`;
  }
}

function renderListaDisciplinas() {
  if (!el.tbodyDisciplinas) return;

  const termo = norm(el.searchDisciplinaInput ? el.searchDisciplinaInput.value : "");

  const elCounter = document.getElementById("totalCadastradosDisciplinas");
  if (elCounter) {
    elCounter.textContent = `${disciplinasLista.length} cadastrados`;
  }

  const lista = disciplinasLista.filter(d => {
    if (!termo) return true;
    return norm(d.nome).includes(termo) || norm(d.codigo).includes(termo);
  });

  if (lista.length === 0) {
    el.tbodyDisciplinas.innerHTML = "";
    if (el.disciplinasEmpty) el.disciplinasEmpty.classList.remove("hidden");
    return;
  }

  if (el.disciplinasEmpty) el.disciplinasEmpty.classList.add("hidden");

  el.tbodyDisciplinas.innerHTML = lista.map(d => {
    const profsTexto = (d.professores && d.professores.length > 0)
      ? d.professores.map(p => escapeHtml(p.nome)).join(", ")
      : `<span style="color:#94a3b8; font-size:13px;">—</span>`;

    return `
      <tr>
        <td><strong>${escapeHtml(d.codigo || "—")}</strong></td>
        <td>${escapeHtml(d.nome)}</td>
        <td style="max-width:320px;"><span class="prof-disciplinas-text">${profsTexto}</span></td>
        <td class="col-acoes-prof">
          <button type="button" class="btn-action-edit" data-action="editar" data-id="${d.id}">Editar</button>
          <button type="button" class="btn-action-delete" data-action="excluir" data-id="${d.id}">Excluir</button>
        </td>
      </tr>
    `;
  }).join("");
}

async function salvarDisciplina() {
  const emEdicao = !!modoEdicaoDiscId;
  const nome = (el.discNomeInput ? el.discNomeInput.value : "").trim();
  const codigo = (el.discCodigoInput ? el.discCodigoInput.value : "").trim();

  const checkboxes = document.querySelectorAll("input[name='disc_prof']:checked");
  const professores_uids = Array.from(checkboxes).map(cb => cb.value);

  if (el.msgDisciplina) el.msgDisciplina.textContent = "";

  if (!nome) {
    if (el.msgDisciplina) {
      el.msgDisciplina.style.color = "var(--danger)";
      el.msgDisciplina.textContent = "Preencha o nome da disciplina.";
    }
    return;
  }

  const payload = { nome, codigo, professores_uids };
  if (modoEdicaoDiscId) {
    payload.id = modoEdicaoDiscId;
  }

  await executarComLoading(el.btnSalvarDisciplina, async () => {
    try {
      await apiSend("/api/disciplinas", "POST", payload);
      cancelarEdicaoDisciplina();
      if (el.msgDisciplina) {
        el.msgDisciplina.style.color = "var(--success)";
        el.msgDisciplina.textContent = emEdicao ? "Disciplina atualizada com sucesso!" : "Disciplina salva com sucesso!";
      }
      toast.success(emEdicao ? "Disciplina atualizada com sucesso!" : "Disciplina cadastrada com sucesso!");
      await carregarDisciplinas();
      await carregarUsuariosLocais();
      setTimeout(() => { if (el.msgDisciplina) el.msgDisciplina.textContent = ""; }, 4000);
    } catch (e) {
      if (el.msgDisciplina) {
        el.msgDisciplina.style.color = "var(--danger)";
        el.msgDisciplina.textContent = "Erro ao salvar disciplina: " + e.message;
      }
      toast.error("Erro ao salvar disciplina: " + e.message);
    }
  });
}

function iniciarEdicaoDisciplina(id) {
  const disc = disciplinasLista.find(d => Number(d.id) === Number(id));
  if (!disc) return;

  modoEdicaoDiscId = Number(disc.id);
  if (el.discNomeInput) el.discNomeInput.value = disc.nome || "";
  if (el.discCodigoInput) el.discCodigoInput.value = disc.codigo || "";

  const profsUids = (disc.professores || []).map(p => p.uid);
  renderCheckboxesProfessoresNaDisciplina(profsUids);

  const formTitulo = document.getElementById("formDisciplinaTitulo");
  if (formTitulo) formTitulo.textContent = "Editar disciplina";

  if (el.btnSalvarDisciplina) el.btnSalvarDisciplina.textContent = "Salvar";
  if (el.msgDisciplina) el.msgDisciplina.textContent = "";
  if (el.discNomeInput) el.discNomeInput.focus();
}

function cancelarEdicaoDisciplina() {
  modoEdicaoDiscId = null;
  if (el.discNomeInput) el.discNomeInput.value = "";
  if (el.discCodigoInput) el.discCodigoInput.value = "";
  renderCheckboxesProfessoresNaDisciplina([]);

  const formTitulo = document.getElementById("formDisciplinaTitulo");
  if (formTitulo) formTitulo.textContent = "Nova disciplina";

  if (el.btnSalvarDisciplina) el.btnSalvarDisciplina.textContent = "Salvar";
  if (el.msgDisciplina) el.msgDisciplina.textContent = "";
  renderListaDisciplinas();
}

async function excluirDisciplina(id) {
  const disc = disciplinasLista.find(d => Number(d.id) === Number(id));
  const nome = disc ? disc.nome : "esta disciplina";

  const ok = await confirmarAcao({
    titulo: "Excluir disciplina",
    mensagem: `Tem certeza que deseja excluir "${nome}"? Essa ação não pode ser desfeita.`,
    textoConfirmar: "Excluir",
    tipo: "danger"
  });
  if (!ok) return;

  try {
    await apiSend(`/api/disciplinas/${id}`, "DELETE", {});
    if (modoEdicaoDiscId === Number(id)) cancelarEdicaoDisciplina();
    await carregarDisciplinas();
    await carregarUsuariosLocais();
  } catch (e) {
    toast.error("Erro ao excluir disciplina: " + e.message);
  }
}

// ======================================================
// 3. TURMAS & PAVILHÕES (CRUD)
// ======================================================
async function carregarTurmas() {
  try {
    const dados = await apiGet("/api/turmas");
    turmasLista = dados.turmas || [];
    renderListaTurmas();
    popularSeletorTurmasNaGrade();
  } catch (error) {
    console.warn("Erro ao carregar turmas:", error);
  }
}

function renderListaTurmas() {
  if (!el.tbodyTurmas) return;

  const termo = norm(el.searchTurmaInput ? el.searchTurmaInput.value : "");
  const pFiltro = (el.filtroTurmaPavilhao ? el.filtroTurmaPavilhao.value : "").toLowerCase();
  const tFiltro = (el.filtroTurmaTurno ? el.filtroTurmaTurno.value : "").toLowerCase();

  const lista = turmasLista.filter(t => {
    if (pFiltro && (t.pavilhao_id || "").toLowerCase() !== pFiltro) return false;
    if (tFiltro && (t.turno || "").toLowerCase() !== tFiltro) return false;
    if (termo) {
      const match = norm(t.id).includes(termo) || norm(t.nome).includes(termo) || norm(t.sala_nome).includes(termo);
      if (!match) return false;
    }
    return true;
  });

  const elCounter = document.getElementById("totalCadastradosTurmas");
  if (elCounter) {
    elCounter.textContent = `${lista.length} turmas`;
  }

  const elEmpty = document.getElementById("turmasEmpty");

  if (lista.length === 0) {
    el.tbodyTurmas.innerHTML = "";
    if (elEmpty) elEmpty.classList.remove("hidden");
    return;
  }

  if (elEmpty) elEmpty.classList.add("hidden");

  el.tbodyTurmas.innerHTML = lista.map(t => {
    const nomePav = t.pavilhao_id === "luis_viana" ? "Pavilhão Luís Viana" : "Pavilhão ACM";
    const turnoCap = t.turno ? t.turno.charAt(0).toUpperCase() + t.turno.slice(1).toLowerCase() : "";

    return `
      <tr>
        <td><strong>${escapeHtml(t.id)}</strong></td>
        <td>${escapeHtml(t.nome)}</td>
        <td>${escapeHtml(nomePav)}</td>
        <td>${escapeHtml(t.sala_nome || "—")}</td>
        <td>${escapeHtml(turnoCap)}</td>
        <td class="col-acoes-prof">
          <button type="button" class="btn-action-edit" data-action="editar" data-id="${escapeHtml(t.id)}">Editar</button>
          <button type="button" class="btn-action-delete" data-action="excluir" data-id="${escapeHtml(t.id)}">Excluir</button>
        </td>
      </tr>
    `;
  }).join("");
}

// Estado de edição de turma
let modoEdicaoTurmaId = null;

function iniciarEdicaoTurma(turmaId) {
  const turma = turmasLista.find(t => t.id === turmaId);
  if (!turma) return;

  modoEdicaoTurmaId = turmaId;

  if (el.turmaIdInput) {
    el.turmaIdInput.value = turma.id;
    el.turmaIdInput.disabled = true;
  }
  if (el.turmaNomeInput) el.turmaNomeInput.value = turma.nome || "";
  if (el.turmaPavilhaoInput) el.turmaPavilhaoInput.value = turma.pavilhao_id || "acm";
  if (el.turmaSalaInput) el.turmaSalaInput.value = turma.sala_nome || "";
  if (el.turmaTurnoInput) el.turmaTurnoInput.value = turma.turno || "matutino";

  const formTitulo = document.getElementById("formTurmaTitulo");
  if (formTitulo) formTitulo.textContent = "Editar turma";

  if (el.btnSalvarTurma) el.btnSalvarTurma.textContent = "Salvar";
  if (el.msgTurma) el.msgTurma.textContent = "";

  if (el.turmaNomeInput) el.turmaNomeInput.focus();
}

function cancelarEdicaoTurma() {
  modoEdicaoTurmaId = null;
  if (el.turmaIdInput) {
    el.turmaIdInput.value = "";
    el.turmaIdInput.disabled = false;
  }
  if (el.turmaNomeInput) el.turmaNomeInput.value = "";
  if (el.turmaPavilhaoInput) el.turmaPavilhaoInput.value = "acm";
  if (el.turmaSalaInput) el.turmaSalaInput.value = "";
  if (el.turmaTurnoInput) el.turmaTurnoInput.value = "matutino";

  const formTitulo = document.getElementById("formTurmaTitulo");
  if (formTitulo) formTitulo.textContent = "Nova turma";

  if (el.btnSalvarTurma) el.btnSalvarTurma.textContent = "Salvar";
  if (el.msgTurma) el.msgTurma.textContent = "";
  renderListaTurmas();
}

async function salvarTurma() {
  const emEdicao = !!modoEdicaoTurmaId;
  const id = modoEdicaoTurmaId || (el.turmaIdInput?.value || "").trim().toUpperCase();
  const nome = (el.turmaNomeInput?.value || id).trim();
  const pavilhao_id = el.turmaPavilhaoInput?.value || "acm";
  const sala_nome = (el.turmaSalaInput?.value || nome).trim();
  const turno = el.turmaTurnoInput?.value || "matutino";

  if (el.msgTurma) el.msgTurma.textContent = "";

  if (!id || !nome) {
    if (el.msgTurma) {
      el.msgTurma.style.color = "var(--danger)";
      el.msgTurma.textContent = "Preencha o identificador e nome da turma.";
    }
    return;
  }

  await executarComLoading(el.btnSalvarTurma, async () => {
    try {
      await apiSend("/api/turmas", "POST", { id, nome, pavilhao_id, sala_nome, turno });
      cancelarEdicaoTurma();
      if (el.msgTurma) {
        el.msgTurma.style.color = "var(--success)";
        el.msgTurma.textContent = emEdicao ? "Turma atualizada com sucesso!" : "Turma salva com sucesso!";
      }
      toast.success(emEdicao ? "Turma atualizada com sucesso!" : "Turma cadastrada com sucesso!");
      await carregarTurmas();
      setTimeout(() => { if (el.msgTurma) el.msgTurma.textContent = ""; }, 4000);
    } catch (e) {
      if (el.msgTurma) {
        el.msgTurma.style.color = "var(--danger)";
        el.msgTurma.textContent = "Erro ao salvar turma: " + e.message;
      }
      toast.error("Erro ao salvar turma: " + e.message);
    }
  });
}

async function excluirTurma(id) {
  const ok = await confirmarAcao({
    titulo: "Excluir turma",
    mensagem: `Tem certeza que deseja excluir a turma ${id}? Todos os horários associados serão removidos.`,
    textoConfirmar: "Excluir",
    tipo: "danger"
  });
  if (!ok) return;

  try {
    await apiSend(`/api/turmas/${encodeURIComponent(id)}`, "DELETE", {});
    if (modoEdicaoTurmaId === id) cancelarEdicaoTurma();
    await carregarTurmas();
  } catch (e) {
    toast.error("Erro ao excluir turma: " + e.message);
  }
}

// ======================================================
// 4. GRADE HORÁRIA SEMANAL INTERATIVA & AUTO-PREENCHIMENTO
// ======================================================
let gradeMatrizAtual = {};
let slotEditando = null;

const DIAS_GRADE = ["seg", "ter", "qua", "qui", "sex"];
const DIAS_GRADE_NOMES = {
  seg: "Segunda-feira",
  ter: "Terça-feira",
  qua: "Quarta-feira",
  qui: "Quinta-feira",
  sex: "Sexta-feira"
};

function popularSeletorTurmasNaGrade() {
  if (!el.gradeSeletorTurma) return;
  const valorAtual = el.gradeSeletorTurma.value;

  el.gradeSeletorTurma.innerHTML = turmasLista.map(t => {
    const nomePav = t.pavilhao_id === "luis_viana" ? "Pavilhão Luís Viana" : "Pavilhão ACM";
    return `<option value="${t.id}">${t.id} - ${escapeHtml(t.nome)} (${nomePav})` + `</option>`;
  }).join("");

  if (valorAtual && turmasLista.some(t => t.id === valorAtual)) {
    el.gradeSeletorTurma.value = valorAtual;
  } else if (turmasLista.length > 0) {
    el.gradeSeletorTurma.value = turmasLista[0].id;
    carregarGradeDaTurma(turmasLista[0].id);
  }
}

async function carregarGradeDaTurma(turmaId) {
  if (!turmaId || !el.tbodyGradeSemanal) return;

  try {
    const dados = await apiGet(`/api/grade/${encodeURIComponent(turmaId)}`);
    gradeMatrizAtual = dados.matriz || {};
    renderQuadroGradeSemanal();
  } catch (e) {
    console.warn("Erro ao carregar grade:", e);
  }
}

function obterHorarioTextoDaTurma(horario) {
  const turmaId = el.gradeSeletorTurma ? el.gradeSeletorTurma.value : "";
  const turma = turmasLista.find(t => t.id === turmaId);
  const turno = (turma && turma.turno) ? turma.turno.toLowerCase() : "matutino";

  const faixa = turnosListaConfig.find(tc => tc.turno === turno && String(tc.chave) === String(horario));
  if (faixa && faixa.inicio) {
    return faixa.fim ? `${faixa.inicio} - ${faixa.fim}` : faixa.inicio;
  }
  return `${horario}º Horário`;
}

function renderQuadroGradeSemanal() {
  if (!el.tbodyGradeSemanal) return;

  let html = "";

  for (let horario = 1; horario <= 6; horario++) {
    const horaTexto = obterHorarioTextoDaTurma(horario);

    html += `<tr>`;
    html += `<td class="col-grade-horario-cell">${escapeHtml(horaTexto)}</td>`;

    for (const dia of DIAS_GRADE) {
      const aula = gradeMatrizAtual[dia]?.[horario];
      const temAula = aula && aula.disciplina && aula.disciplina.trim() && aula.disciplina !== "Sem aula";

      if (temAula) {
        html += `
          <td class="grade-cell-slot" data-dia="${dia}" data-horario="${horario}">
            <div class="cell-grade-slot">
              <span class="slot-disc-title">${escapeHtml(aula.disciplina)}</span>
              <span class="slot-prof-subtitle">${escapeHtml(aula.professor || "Sem professor")}</span>
            </div>
          </td>
        `;
      } else {
        html += `
          <td class="grade-cell-slot" data-dia="${dia}" data-horario="${horario}">
            <div class="cell-grade-slot">
              <span class="slot-btn-add">+ Adicionar</span>
            </div>
          </td>
        `;
      }
    }

    html += `</tr>`;
  }

  el.tbodyGradeSemanal.innerHTML = html;
}

function abrirModalSlot(dia, horario) {
  slotEditando = { dia, horario };
  const modal = document.getElementById("modalEditarSlotGrade");
  const subtitulo = document.getElementById("modalSlotSubtitulo");
  const selDisc = document.getElementById("selectSlotDisciplina");
  const selProf = document.getElementById("selectSlotProfessor");
  const btnRemover = document.getElementById("btnSlotRemover");

  if (!modal || !selDisc || !selProf) return;

  const horaTexto = obterHorarioTextoDaTurma(horario);
  const diaNome = DIAS_GRADE_NOMES[dia] || dia;
  if (subtitulo) {
    subtitulo.textContent = `${diaNome} • ${horario}º Horário (${horaTexto})`;
  }

  selDisc.innerHTML = `<option value="">Selecione a disciplina...</option>` +
    disciplinasLista.map(d => `<option value="${escapeHtml(d.nome)}">${escapeHtml(d.nome)}</option>`).join("");

  const profs = Object.values(usuarios).sort((a, b) => norm(a.nome).localeCompare(norm(b.nome)));
  selProf.innerHTML = `<option value="">Selecione o professor...</option>` +
    profs.map(p => `<option value="${escapeHtml(p.nome)}">${escapeHtml(p.nome)}</option>`).join("");

  const aula = gradeMatrizAtual[dia]?.[horario];
  if (aula && aula.disciplina && aula.disciplina !== "Sem aula") {
    if (aula.disciplina && !disciplinasLista.some(d => d.nome === aula.disciplina)) {
      selDisc.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(aula.disciplina)}">${escapeHtml(aula.disciplina)}</option>`);
    }
    selDisc.value = aula.disciplina;

    if (aula.professor && !profs.some(p => p.nome === aula.professor)) {
      selProf.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(aula.professor)}">${escapeHtml(aula.professor)}</option>`);
    }
    selProf.value = aula.professor || "";

    if (btnRemover) btnRemover.classList.remove("hidden");
  } else {
    selDisc.value = "";
    selProf.value = "";
    if (btnRemover) btnRemover.classList.add("hidden");
  }

  modal.classList.remove("hidden");
  modal.classList.add("active");
  renderIcons();
}

function fecharModalSlot() {
  slotEditando = null;
  const modal = document.getElementById("modalEditarSlotGrade");
  if (modal) {
    modal.classList.remove("active");
    modal.classList.add("hidden");
  }
}

async function salvarSlotEditado() {
  if (!slotEditando) return;
  const { dia, horario } = slotEditando;
  const selDisc = document.getElementById("selectSlotDisciplina");
  const selProf = document.getElementById("selectSlotProfessor");

  const disciplina = selDisc ? selDisc.value.trim() : "";
  const professor = selProf ? selProf.value.trim() : "";

  if (!gradeMatrizAtual[dia]) gradeMatrizAtual[dia] = {};

  if (disciplina) {
    gradeMatrizAtual[dia][horario] = { disciplina, professor };
  } else {
    delete gradeMatrizAtual[dia][horario];
  }

  fecharModalSlot();
  renderQuadroGradeSemanal();

  // Salva no banco de dados automaticamente!
  await salvarGradeSemanalCompleta();
}

async function removerSlotEditado() {
  if (!slotEditando) return;
  const { dia, horario } = slotEditando;
  if (gradeMatrizAtual[dia]) {
    delete gradeMatrizAtual[dia][horario];
  }
  fecharModalSlot();
  renderQuadroGradeSemanal();

  // Salva no banco de dados automaticamente!
  await salvarGradeSemanalCompleta();
}

async function salvarGradeSemanalCompleta() {
  const turmaId = el.gradeSeletorTurma ? el.gradeSeletorTurma.value : "";
  if (!turmaId) return;

  const grade = [];

  for (let horario = 1; horario <= 6; horario++) {
    for (const dia of DIAS_GRADE) {
      const aula = gradeMatrizAtual[dia]?.[horario];
      if (aula && aula.disciplina && aula.disciplina.trim() && aula.disciplina !== "Sem aula") {
        grade.push({
          dia,
          horario,
          disciplina: aula.disciplina.trim(),
          professor: (aula.professor || "").trim()
        });
      }
    }
  }

  if (el.msgGrade) el.msgGrade.textContent = "";

  try {
    await apiSend("/api/grade/salvar-semanal", "POST", { turma_id: turmaId, grade });
    if (el.msgGrade) {
      el.msgGrade.style.color = "var(--success)";
      el.msgGrade.textContent = `Grade da turma ${turmaId} salva com sucesso (${grade.length} horários cadastrados)!`;
      setTimeout(() => { if (el.msgGrade) el.msgGrade.textContent = ""; }, 4000);
    }
    toast.success(`Grade da turma ${turmaId} salva com sucesso (${grade.length} horários)!`);
  } catch (e) {
    if (el.msgGrade) {
      el.msgGrade.style.color = "var(--danger)";
      el.msgGrade.textContent = "Erro ao salvar grade: " + e.message;
    }
    toast.error("Erro ao salvar grade: " + e.message);
  }
}

function abrirModalCopiarGrade() {
  const turmaOrigem = el.gradeSeletorTurma ? el.gradeSeletorTurma.value : "";
  if (!turmaOrigem) return;

  const modal = document.getElementById("modalCopiarGrade");
  const subtitulo = document.getElementById("modalCopiarSubtitulo");
  const selDestino = document.getElementById("selectTurmaDestinoGrade");
  if (!modal || !selDestino) return;

  if (subtitulo) {
    subtitulo.textContent = `Replicar grade da turma "${turmaOrigem}" para outra turma:`;
  }

  const outrasTurmas = turmasLista.filter(t => t.id !== turmaOrigem);
  if (outrasTurmas.length === 0) {
    toast.warning("Não há outras turmas cadastradas para copiar.");
    return;
  }

  selDestino.innerHTML = `<option value="">Selecione a turma de destino...</option>` +
    outrasTurmas.map(t => `<option value="${t.id}">${t.id} - ${escapeHtml(t.nome)}` + `</option>`).join("");

  modal.classList.remove("hidden");
  modal.classList.add("active");
  renderIcons();
}

function fecharModalCopiarGrade() {
  const modal = document.getElementById("modalCopiarGrade");
  if (modal) {
    modal.classList.remove("active");
    modal.classList.add("hidden");
  }
}

async function confirmarCopiarGrade() {
  const turmaOrigem = el.gradeSeletorTurma ? el.gradeSeletorTurma.value : "";
  const selDestino = document.getElementById("selectTurmaDestinoGrade");
  const turmaDestino = selDestino ? selDestino.value : "";

  if (!turmaOrigem || !turmaDestino) {
    toast.warning("Selecione a turma de destino.");
    return;
  }

  try {
    const res = await apiSend("/api/grade/copiar", "POST", {
      turma_origem: turmaOrigem,
      turma_destino: turmaDestino
    });
    fecharModalCopiarGrade();
    toast.success(`Grade copiada com sucesso para ${turmaDestino} (${res.copiados || 0} horários replicados)!`);
    await carregarTurmas();
  } catch (e) {
    toast.error("Erro ao copiar grade: " + e.message);
  }
}

// ======================================================
// 4.1 CONFIGURAÇÃO DE HORÁRIOS DOS TURNOS
// ======================================================
let turnosListaConfig = [];

function horaParaMinutos(hhmm) {
  if (!hhmm || typeof hhmm !== "string") return 0;
  const parts = hhmm.trim().split(":");
  if (parts.length < 2) return 0;
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

function minutosParaHora(mins) {
  mins = Math.round(mins);
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function calcularFaixasDoTurno(turno, inicioAulas, fimAulas, inicioIntervalo, fimIntervalo) {
  const minIni = horaParaMinutos(inicioAulas);
  const minFim = horaParaMinutos(fimAulas);
  const minIniInt = horaParaMinutos(inicioIntervalo);
  const minFimInt = horaParaMinutos(fimIntervalo);

  if (minFim <= minIni) {
    throw new Error(`No turno ${turno}, o fim das aulas deve ser após o início.`);
  }
  if (minIniInt <= minIni || minIniInt >= minFim) {
    throw new Error(`No turno ${turno}, o início do intervalo deve estar entre o início e o fim das aulas.`);
  }
  if (minFimInt <= minIniInt || minFimInt >= minFim) {
    throw new Error(`No turno ${turno}, o fim do intervalo deve ser posterior ao início do intervalo.`);
  }

  const faixas = [];

  // 4 aulas antes do intervalo (ordem 1, 2, 3, 4)
  const totalPre = minIniInt - minIni;
  let cursor = minIni;
  for (let i = 0; i < 4; i++) {
    const proximo = (i === 3) ? minIniInt : Math.round(minIni + ((i + 1) * totalPre) / 4);
    faixas.push({
      turno,
      chave: String(i + 1),
      inicio: minutosParaHora(cursor),
      fim: minutosParaHora(proximo),
      ordem: i + 1
    });
    cursor = proximo;
  }

  // Intervalo (ordem 5)
  faixas.push({
    turno,
    chave: "intervalo",
    inicio: minutosParaHora(minIniInt),
    fim: minutosParaHora(minFimInt),
    ordem: 5
  });

  // 2 aulas depois do intervalo (ordem 6, 7 com chaves "5" e "6")
  const totalPost = minFim - minFimInt;
  cursor = minFimInt;
  for (let j = 0; j < 2; j++) {
    const proximo = (j === 1) ? minFim : Math.round(minFimInt + ((j + 1) * totalPost) / 2);
    faixas.push({
      turno,
      chave: String(5 + j),
      inicio: minutosParaHora(cursor),
      fim: minutosParaHora(proximo),
      ordem: 6 + j
    });
    cursor = proximo;
  }

  return faixas;
}

async function carregarConfigTurnos() {
  try {
    const dados = await apiGet("/api/turnos");
    turnosListaConfig = dados.lista || [];
    if (dados.turnos) {
      turnosDinamicos = dados.turnos;
    }
    popularFormularioTurnos();
    renderAusentesAgora();
  } catch (e) {
    console.warn("Erro ao carregar horários dos turnos:", e);
  }
}

function popularFormularioTurnos() {
  const turnos = [
    { turno: "matutino", p: "mat", defIni: "07:00", defFim: "11:50", defIniInt: "10:00", defFimInt: "10:20" },
    { turno: "vespertino", p: "vesp", defIni: "13:00", defFim: "17:50", defIniInt: "16:00", defFimInt: "16:20" },
    { turno: "noturno", p: "not", defIni: "19:00", defFim: "23:50", defIniInt: "22:00", defFimInt: "22:20" }
  ];

  turnos.forEach(t => {
    const faixas = turnosListaConfig.filter(f => f.turno === t.turno);
    let inicioAulas = t.defIni;
    let fimAulas = t.defFim;
    let inicioIntervalo = t.defIniInt;
    let fimIntervalo = t.defFimInt;

    if (faixas.length > 0) {
      const f1 = faixas.find(f => f.chave === "1");
      const f6 = faixas.find(f => f.chave === "6");
      const fInt = faixas.find(f => f.chave === "intervalo");

      if (f1 && f1.inicio) inicioAulas = f1.inicio;
      if (f6 && f6.fim) fimAulas = f6.fim;
      if (fInt) {
        if (fInt.inicio) inicioIntervalo = fInt.inicio;
        if (fInt.fim) fimIntervalo = fInt.fim;
      }
    }

    const elIni = document.getElementById(`${t.p}_inicio_aulas`);
    const elFim = document.getElementById(`${t.p}_fim_aulas`);
    const elIniInt = document.getElementById(`${t.p}_inicio_intervalo`);
    const elFimInt = document.getElementById(`${t.p}_fim_intervalo`);

    if (elIni) elIni.value = inicioAulas;
    if (elFim) elFim.value = fimAulas;
    if (elIniInt) elIniInt.value = inicioIntervalo;
    if (elFimInt) elFimInt.value = fimIntervalo;
  });
}

function aplicarMascaraHora(input) {
  if (!input) return;
  input.addEventListener("input", () => {
    let v = input.value.replace(/\D/g, "");
    if (v.length > 4) v = v.slice(0, 4);
    if (v.length >= 3) {
      input.value = v.slice(0, 2) + ":" + v.slice(2);
    } else {
      input.value = v;
    }
  });

  input.addEventListener("blur", () => {
    let v = input.value.trim();
    if (!v) return;
    if (v.length === 5 && v.includes(":")) {
      const [hStr, mStr] = v.split(":");
      let h = parseInt(hStr, 10) || 0;
      let m = parseInt(mStr, 10) || 0;
      if (h > 23) h = 23;
      if (m > 59) m = 59;
      input.value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
  });
}

async function salvarConfigTurnos() {
  const turnos = [
    { turno: "matutino", nome: "Matutino", p: "mat" },
    { turno: "vespertino", nome: "Vespertino", p: "vesp" },
    { turno: "noturno", nome: "Noturno", p: "not" }
  ];

  const todasFaixas = [];
  const msgBox = document.getElementById("msgTurnos");
  if (msgBox) {
    msgBox.textContent = "";
    msgBox.className = "msg-box";
  }

  const btnSalvar = document.getElementById("btnSalvarTurnosHeader");

  try {
    for (const t of turnos) {
      const elIni = document.getElementById(`${t.p}_inicio_aulas`);
      const elFim = document.getElementById(`${t.p}_fim_aulas`);
      const elIniInt = document.getElementById(`${t.p}_inicio_intervalo`);
      const elFimInt = document.getElementById(`${t.p}_fim_intervalo`);

      const ini = elIni ? elIni.value.trim() : "";
      const fim = elFim ? elFim.value.trim() : "";
      const iniInt = elIniInt ? elIniInt.value.trim() : "";
      const fimInt = elFimInt ? elFimInt.value.trim() : "";

      if (!ini || !fim || !iniInt || !fimInt) {
        throw new Error(`Preencha todos os campos do turno ${t.nome}.`);
      }

      const horaRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
      if (!horaRegex.test(ini) || !horaRegex.test(fim) || !horaRegex.test(iniInt) || !horaRegex.test(fimInt)) {
        throw new Error(`Formato de hora inválido no turno ${t.nome}. Use o formato [hh:mm].`);
      }

      const faixasTurno = calcularFaixasDoTurno(t.turno, ini, fim, iniInt, fimInt);
      todasFaixas.push(...faixasTurno);
    }

    if (btnSalvar) {
      btnSalvar.disabled = true;
      btnSalvar.textContent = "Salvando...";
    }

    await apiSend("/api/turnos/salvar", "POST", { faixas: todasFaixas });

    if (msgBox) {
      msgBox.className = "msg-box msg-success";
      msgBox.textContent = "Horários dos turnos atualizados com sucesso! As alterações já estão valendo no painel público.";
    }

    await carregarConfigTurnos();

    setTimeout(() => {
      if (msgBox) msgBox.textContent = "";
    }, 5000);
  } catch (err) {
    if (msgBox) {
      msgBox.className = "msg-box msg-danger";
      msgBox.textContent = err.message || "Erro ao salvar horários dos turnos.";
    }
  } finally {
    if (btnSalvar) {
      btnSalvar.disabled = false;
      btnSalvar.textContent = "Salvar horários";
    }
  }
}

// ======================================================
// 5. RELATÓRIOS
// ======================================================
async function carregarPresencasPorData() {
  try {
    const dados = await apiGet(`/api/presencas?data=${encodeURIComponent(dataSelecionada)}`);
    presencas = {};
    (dados.presencas || []).forEach(p => {
      presencas[p.uid] = {
        status: p.status,
        hora_entrada: p.hora_entrada,
        hora_saida: p.hora_saida,
        nome: p.nome
      };
    });
    atualizarDashboard();
    buildTabela();
  } catch (error) {
    console.warn("API de presenças inacessível:", error);
    setConnBad();
  }
}

function formatarKpiNum(n) {
  const num = Number(n) || 0;
  return String(num).padStart(2, "0");
}

function horaParaMinutos(h) {
  if (!h) return 0;
  const [hh, mm] = h.split(":").map(Number);
  return hh * 60 + mm;
}

function minutosAgora() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function diaSemanaKey() {
  const d = new Date();
  const dias = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
  return dias[d.getDay()];
}

function descobrirFaixaAtual() {
  const agora = minutosAgora();
  if (!turnosDinamicos) return null;
  for (const [turno, faixas] of Object.entries(turnosDinamicos)) {
    for (const [chave, faixa] of Object.entries(faixas)) {
      const ini = horaParaMinutos(faixa.inicio);
      const fim = horaParaMinutos(faixa.fim);
      if (agora >= ini && agora < fim) {
        return {
          turno,
          horario: chave === "intervalo" ? "intervalo" : Number(chave),
          inicio: faixa.inicio,
          fim: faixa.fim
        };
      }
    }
  }
  return null;
}

async function carregarPainelDadosGrade() {
  try {
    const res = await apiGet("/api/painel-dados");
    if (res && res.turmas) {
      painelDadosTurmas = res.turmas;
      renderAusentesAgora();
      renderUltimosRegistros();
    }
  } catch (err) {
    console.warn("Aviso ao carregar dados do painel:", err);
  }
}

function obterSalaDoProfessorHoje(nomeProf, uidProf) {
  if (!painelDadosTurmas) return "";
  const dia = diaSemanaKey();
  const nomeNorm = norm(nomeProf);
  for (const t of Object.values(painelDadosTurmas)) {
    const aulasDia = t.dias?.[dia] || {};
    for (const aula of Object.values(aulasDia)) {
      if (!aula) continue;
      const temProf = (aula.professores_detalhes && aula.professores_detalhes.some(p => p.uid === uidProf || norm(p.nome) === nomeNorm)) ||
                      (aula.professor && norm(aula.professor).includes(nomeNorm));
      if (temProf) {
        return t.sala || t.turma || "";
      }
    }
  }
  return "";
}

function atualizarDashboard() {
  const ativos = Object.entries(usuarios).filter(([_, u]) => u.ativo);
  const cadastrados = ativos.length;
  const presentes = ativos.filter(([uid]) => presencas[uid]?.status === "Presente").length;
  const ausentes = ativos.filter(([uid]) => presencas[uid]?.status === "Ausente").length;
  const semRegistro = ativos.filter(([uid]) => !presencas[uid]).length;

  if (el.kpiCadastrados) el.kpiCadastrados.textContent = formatarKpiNum(cadastrados);
  if (el.kpiPresentes) el.kpiPresentes.textContent = formatarKpiNum(presentes);
  if (el.kpiAusentes) el.kpiAusentes.textContent = formatarKpiNum(ausentes);
  if (el.kpiSemRegistro) el.kpiSemRegistro.textContent = formatarKpiNum(semRegistro);

  renderUltimosRegistros();
  renderAusentesAgora();
  renderListaProfessores();
  popularFiltroProfessor();
}

function renderUltimosRegistros() {
  if (!el.ultimosRegistros) return;
  const lista = Object.entries(presencas)
    .map(([uid, p]) => ({ uid, ...p }))
    .sort((a, b) => norm(b.hora_entrada || "").localeCompare(norm(a.hora_entrada || "")))
    .slice(0, 6);

  if (lista.length === 0) {
    el.ultimosRegistros.innerHTML = `
      <div class="dash-empty-registros">
        Nenhum registro de presença hoje
      </div>`;
    return;
  }

  el.ultimosRegistros.innerHTML = lista.map(item => {
    const salaInfo = obterSalaDoProfessorHoje(item.nome, item.uid);
    const localTexto = salaInfo ? `Sala ${salaInfo.replace(/^sala\s*/i, "")}` : "Portaria";
    const hora = item.hora_entrada ? item.hora_entrada.slice(0, 5) : "--:--";

    return `
      <div class="ultimo-registro-row">
        <div class="reg-title">
          <span class="reg-time">${escapeHtml(hora)}</span>
          <span class="reg-prof">${escapeHtml(item.nome || "Professor")}</span>
          <span class="reg-action">registrou presença</span>
        </div>
        <div class="reg-sub">
          <span>Leitor Portaria</span>
          <span class="reg-sep">•</span>
          <span>${escapeHtml(localTexto)}</span>
        </div>
      </div>
    `;
  }).join("");
}

function renderAusentesAgora() {
  const tbody = el.tbodyAusentesAgora || document.getElementById("tbodyAusentesAgora");
  if (!tbody) return;

  const dia = diaSemanaKey();
  const faixa = descobrirFaixaAtual();

  if (dia === "dom" || dia === "sab" || !faixa) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="dash-empty-cell">
          Fora do horário letivo • Nenhum professor com aula agora
        </td>
      </tr>
    `;
    return;
  }

  if (faixa.horario === "intervalo") {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="dash-empty-cell">
          Intervalo em andamento • Próxima aula às ${faixa.fim}
        </td>
      </tr>
    `;
    return;
  }

  if (!painelDadosTurmas) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="dash-empty-cell">
          Carregando grade horária...
        </td>
      </tr>
    `;
    return;
  }

  const turmasNoTurno = Object.values(painelDadosTurmas).filter(t => t.turno === faixa.turno);
  const ausentesNaFaixa = [];

  turmasNoTurno.forEach(t => {
    const aula = t.dias?.[dia]?.[faixa.horario];
    if (!aula || (!aula.disciplina && !aula.professor)) return;

    const profs = aula.professores_detalhes && aula.professores_detalhes.length > 0
      ? aula.professores_detalhes
      : (aula.professor ? aula.professor.split(",").map(p => ({ nome: p.trim(), uid: null })) : []);

    profs.forEach(p => {
      let estaPresente = false;
      if (p.uid && presencas[p.uid]?.status === "Presente") {
        estaPresente = true;
      } else {
        const normProf = norm(p.nome);
        const matchUid = Object.keys(usuarios).find(u => norm(usuarios[u].nome) === normProf);
        if (matchUid && presencas[matchUid]?.status === "Presente") {
          estaPresente = true;
        }
      }

      if (!estaPresente) {
        const salaStr = t.sala ? `Sala ${t.sala.replace(/^sala\s*/i, "")}` : (t.turma || "Sala --");
        ausentesNaFaixa.push({
          nome: p.nome,
          disciplina: aula.disciplina || "Sem disciplina",
          sala: salaStr,
          inicio: faixa.inicio
        });
      }
    });
  });

  if (ausentesNaFaixa.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="dash-empty-cell success-state">
          Todos os professores com aula neste horário registraram presença.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = ausentesNaFaixa.map(item => `
    <tr>
      <td>${escapeHtml(item.nome)}</td>
      <td>${escapeHtml(item.disciplina)}</td>
      <td>${escapeHtml(item.sala)}</td>
      <td class="mono-cell">${escapeHtml(item.inicio)}</td>
    </tr>
  `).join("");
}

function renderAusentes() {
  renderAusentesAgora();
}

function popularFiltroProfessor() {
  if (!el.filtroProfessor) return;
  const valorAtual = el.filtroProfessor.value;
  const ativos = Object.entries(usuarios)
    .filter(([_, u]) => u.ativo)
    .sort((a, b) => norm(a[1].nome).localeCompare(norm(b[1].nome)));

  el.filtroProfessor.innerHTML = `<option value="">Todos os professores</option>` +
    ativos.map(([uid, u]) => `<option value="${uid}">${escapeHtml(u.nome)}</option>`).join("");

  if (valorAtual) el.filtroProfessor.value = valorAtual;
}

function diaSemanaKeyDaData(dataStr) {
  if (!dataStr) return diaSemanaKey();
  const [ano, mes, dia] = dataStr.split("-").map(Number);
  const d = new Date(ano, mes - 1, dia);
  const dias = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
  return dias[d.getDay()];
}

function professorTemAulaNaData(nomeProf, uidProf, dataStr) {
  if (!painelDadosTurmas) return false;
  const dia = diaSemanaKeyDaData(dataStr);
  const nomeNorm = norm(nomeProf);
  for (const t of Object.values(painelDadosTurmas)) {
    const aulasDia = t.dias?.[dia] || {};
    for (const aula of Object.values(aulasDia)) {
      if (!aula) continue;
      const temProf = (aula.professores_detalhes && aula.professores_detalhes.some(p => p.uid === uidProf || norm(p.nome) === nomeNorm)) ||
                      (aula.professor && norm(aula.professor).includes(nomeNorm));
      if (temProf) return true;
    }
  }
  return false;
}

function obterListaRelatorio() {
  let lista = Object.entries(usuarios)
    .filter(([_, u]) => u.ativo)
    .map(([uid, u]) => {
      const p = presencas[uid] || null;
      let status = "Sem aula";
      if (p && p.status) {
        status = p.status;
      } else {
        const temAula = professorTemAulaNaData(u.nome, uid, dataSelecionada);
        status = temAula ? "Ausente" : "Sem aula";
      }
      return {
        nome: u.nome,
        uid,
        status,
        entrada: p?.hora_entrada || "—",
        saida: p?.hora_saida || "—"
      };
    });

  if (professorFiltro) {
    lista = lista.filter(item => item.uid === professorFiltro);
  }

  lista.sort((a, b) => norm(a.nome).localeCompare(norm(b.nome)));
  return lista;
}

function buildTabela() {
  if (!el.tbody) return;
  const lista = obterListaRelatorio();
  const totalPaginas = Math.max(1, Math.ceil(lista.length / ITENS_POR_PAGINA_RELATORIO));
  paginaRelatorio = Math.min(Math.max(paginaRelatorio, 0), totalPaginas - 1);

  const inicio = paginaRelatorio * ITENS_POR_PAGINA_RELATORIO;
  const pagina = lista.slice(inicio, inicio + ITENS_POR_PAGINA_RELATORIO);

  el.tbody.innerHTML = pagina.map(item => `
    <tr>
      <td><strong>${escapeHtml(item.nome)}</strong></td>
      <td><span class="status-pill ${getStatusClass(item.status)}">${escapeHtml(item.status)}</span></td>
      <td class="mono">${escapeHtml(item.entrada)}</td>
      <td class="mono">${escapeHtml(item.saida)}</td>
      <td class="mono">${escapeHtml(item.uid)}</td>
    </tr>
  `).join("");

  if (el.empty) el.empty.classList.toggle("hidden", lista.length !== 0);
  if (el.paginacaoInfo) {
    el.paginacaoInfo.textContent = lista.length === 0
      ? "Página 1 de 1"
      : `Página ${paginaRelatorio + 1} de ${totalPaginas}`;
  }
  if (el.btnPaginaAnterior) el.btnPaginaAnterior.disabled = paginaRelatorio === 0;
  if (el.btnPaginaProxima) el.btnPaginaProxima.disabled = paginaRelatorio >= totalPaginas - 1;
}

function exportCSV() {
  const rows = [["Data", "Professor", "Status", "Entrada", "Saida", "UID"]];
  obterListaRelatorio().forEach(item => {
    rows.push([dataSelecionada, item.nome, item.status, item.entrada, item.saida, item.uid]);
  });
  const csv = rows.map(r => r.map(v => `"${v}"`).join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `presenx_relatorio_${dataSelecionada}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function imprimirFolhaFrequencia() {
  const lista = obterListaRelatorio();
  const dataFormatada = dataSelecionada ? dataSelecionada.split("-").reverse().join("/") : new Date().toLocaleDateString("pt-BR");

  const totalCadastrados = Object.values(usuarios).filter(u => u.ativo).length;
  const totalPresentes = lista.filter(i => i.status === "Presente").length;
  const totalAusentes = lista.filter(i => i.status === "Ausente").length;
  const totalSemRegistro = lista.filter(i => i.status === "Sem registro").length;

  const linhas = lista.map((item, idx) => {
    const profObj = usuarios[item.uid] || {};

    // Deduplica disciplinas vinculadas ao professor
    let discStr = "Geral";
    if (profObj.disciplinas && profObj.disciplinas.length > 0) {
      const unicas = [...new Set(profObj.disciplinas.map(d => (d.nome || "").trim()).filter(Boolean))];
      if (unicas.length <= 3) {
        discStr = unicas.join(", ");
      } else {
        discStr = unicas.slice(0, 3).join(", ") + ` (+${unicas.length - 3})`;
      }
    } else if (profObj.curso) {
      discStr = profObj.curso;
    }

    return `
      <tr>
        <td style="text-align:center; width:26px; font-weight:700;">${idx + 1}</td>
        <td style="width:160px; font-weight:700;">${escapeHtml(item.nome)}</td>
        <td style="color:#1e293b;">${escapeHtml(discStr)}</td>
        <td style="text-align:center; width:75px; font-weight:700;">${item.status}</td>
        <td style="text-align:center; width:55px; font-family:monospace;">${item.entrada !== "-" ? item.entrada : "—"}</td>
        <td style="text-align:center; width:55px; font-family:monospace;">${item.saida !== "-" ? item.saida : "—"}</td>
        <td style="width:130px; border-bottom:1px solid #64748b;"></td>
      </tr>
    `;
  }).join("");

  const html = `
    <div class="print-header">
      <h1>CETEP — CENTRO TERRITORIAL DE EDUCAÇÃO PROFISSIONAL</h1>
      <h2>RELATÓRIO OFICIAL DE FREQUÊNCIA DOCENTE</h2>
      <p>Sistema PresenX • Registro Automático por Identificação RFID / Biometria</p>
    </div>

    <div class="print-titulo-folha">
      Folha Diária de Presença — Data de Referência: ${dataFormatada}
    </div>

    <div class="print-info-data">
      <strong>Total de Docentes:</strong> ${totalCadastrados} &nbsp;|&nbsp;
      <strong>Presentes:</strong> ${totalPresentes} &nbsp;|&nbsp;
      <strong>Ausentes:</strong> ${totalAusentes} &nbsp;|&nbsp;
      <strong>Sem Registro:</strong> ${totalSemRegistro} &nbsp;|&nbsp;
      <strong>Emitido em:</strong> ${new Date().toLocaleString("pt-BR")}
    </div>

    <table>
      <thead>
        <tr>
          <th style="text-align:center; width:26px;">#</th>
          <th style="width:160px;">Docente</th>
          <th>Disciplina(s) / Matéria</th>
          <th style="text-align:center; width:75px;">Situação</th>
          <th style="text-align:center; width:55px;">Entrada</th>
          <th style="text-align:center; width:55px;">Saída</th>
          <th style="text-align:center; width:130px;">Assinatura / Visto</th>
        </tr>
      </thead>
      <tbody>
        ${linhas || '<tr><td colspan="7" style="text-align:center; padding:16px;">Nenhum registro encontrado para esta data.</td></tr>'}
      </tbody>
    </table>

    <div class="print-footer">
      <div class="print-assinatura">
        Coordenação Pedagógica
        <span>CETEP — Assinatura e Carimbo</span>
      </div>
      <div class="print-assinatura">
        Direção Geral
        <span>CETEP — Assinatura e Carimbo</span>
      </div>
    </div>
  `;

  if (!el.areaImpressao) {
    let div = document.getElementById("areaImpressao");
    if (!div) {
      div = document.createElement("div");
      div.id = "areaImpressao";
      div.className = "print-area print-only";
      document.body.appendChild(div);
    }
    el.areaImpressao = div;
  }

  el.areaImpressao.innerHTML = html;
  window.print();
}

// ======================================================
// 6. AVISOS & EVENTOS
// ======================================================
async function carregarAvisos() {
  try {
    const dados = await apiGet("/api/avisos");
    avisos = dados.avisos || [];
    renderListaAvisos();
    atualizarKpisAvisos();
  } catch (e) {
    console.warn("Erro ao carregar avisos:", e);
  }
}

function atualizarKpisAvisos() {
  const hoje = todayKey();
  const ativos = avisos.filter(a => a.expiracao >= hoje);
  const expirados = avisos.filter(a => a.expiracao < hoje);

  if (el.kpiTotalAvisos) el.kpiTotalAvisos.textContent = avisos.length;
  if (el.kpiAvisosAtivos) el.kpiAvisosAtivos.textContent = ativos.length;
  if (el.kpiAvisosExpirados) el.kpiAvisosExpirados.textContent = expirados.length;
  if (el.totalAvisosCounter) {
    el.totalAvisosCounter.textContent = `${ativos.length} ativos • ${expirados.length} expirados`;
  }
}

function renderListaAvisos() {
  if (!el.tbodyAvisos) return;

  const termo = norm(el.searchAvisoInput ? el.searchAvisoInput.value : "");
  const hoje = todayKey();

  const totalAtivos = avisos.filter(a => a.expiracao >= hoje).length;
  const totalExpirados = avisos.filter(a => a.expiracao < hoje).length;

  if (el.totalAvisosCounter) {
    el.totalAvisosCounter.textContent = `${totalAtivos} ativos • ${totalExpirados} expirados`;
  }

  const listaFiltrada = avisos.filter(a => {
    if (!termo) return true;
    return norm(a.titulo).includes(termo) || norm(a.mensagem).includes(termo);
  });

  if (listaFiltrada.length === 0) {
    el.tbodyAvisos.innerHTML = "";
    if (el.avisosEmpty) el.avisosEmpty.classList.remove("hidden");
    return;
  }
  if (el.avisosEmpty) el.avisosEmpty.classList.add("hidden");

  el.tbodyAvisos.innerHTML = listaFiltrada.map(a => {
    const ativo = a.expiracao >= hoje;
    let dataFmt = "";
    if (a.expiracao) {
      const parts = a.expiracao.split("-");
      if (parts.length === 3) {
        dataFmt = `${parts[2]}/${parts[1]}`;
      }
    }

    const prioNorm = norm(a.prioridade || "normal");
    const isAlta = prioNorm === "alta" || prioNorm === "urgente";
    const prioHtml = isAlta
      ? `<span class="prioridade-pill alta">${prioNorm === "urgente" ? "Urgente" : "Alta"}</span>`
      : `<span style="color:#101a4a; font-weight:500;">${prioNorm === "informativo" ? "Informativo" : "Normal"}</span>`;

    const statusHtml = ativo
      ? `<span class="status-pill ativo">Ativo</span>`
      : `<span class="status-pill inativo">Expirado</span>`;

    return `
      <tr>
        <td><strong>${escapeHtml(a.titulo)}</strong></td>
        <td>${prioHtml}</td>
        <td class="mono">${dataFmt}</td>
        <td>${statusHtml}</td>
        <td class="col-acoes-prof">
          <button type="button" class="btn-action-edit" data-action="editar-aviso" data-id="${a.id}">Editar</button>
          <button type="button" class="btn-action-delete" data-action="excluir-aviso" data-id="${a.id}">Excluir</button>
        </td>
      </tr>
    `;
  }).join("");

  renderIcons();
}

function iniciarEdicaoAviso(id) {
  const aviso = avisos.find(a => String(a.id) === String(id));
  if (!aviso) return;

  if (el.avisoIdEditando) el.avisoIdEditando.value = aviso.id;
  if (el.avisoTitulo) el.avisoTitulo.value = aviso.titulo || "";
  if (el.avisoMensagem) el.avisoMensagem.value = aviso.mensagem || "";
  if (el.avisoPrioridade) el.avisoPrioridade.value = (aviso.prioridade || "normal").toLowerCase();
  if (el.avisoExpiracao) el.avisoExpiracao.value = aviso.expiracao || "";

  if (el.formAvisoTitulo) el.formAvisoTitulo.textContent = "Editar aviso";
  if (el.btnSalvarAviso) el.btnSalvarAviso.textContent = "Salvar alterações";
  if (el.msgAviso) el.msgAviso.textContent = "";

  if (el.avisoTitulo) el.avisoTitulo.focus();
}

function cancelarEdicaoAviso() {
  if (el.avisoIdEditando) el.avisoIdEditando.value = "";
  if (el.avisoTitulo) el.avisoTitulo.value = "";
  if (el.avisoMensagem) el.avisoMensagem.value = "";
  if (el.avisoPrioridade) el.avisoPrioridade.value = "normal";
  if (el.avisoExpiracao) el.avisoExpiracao.value = "";

  if (el.formAvisoTitulo) el.formAvisoTitulo.textContent = "Novo aviso";
  if (el.btnSalvarAviso) el.btnSalvarAviso.textContent = "Publicar aviso";
  if (el.msgAviso) el.msgAviso.textContent = "";
}

async function salvarAviso() {
  const idEditando = el.avisoIdEditando ? el.avisoIdEditando.value.trim() : "";
  const titulo = (el.avisoTitulo ? el.avisoTitulo.value : "").trim();
  const mensagem = (el.avisoMensagem ? el.avisoMensagem.value : "").trim();
  const prioridade = el.avisoPrioridade ? el.avisoPrioridade.value : "normal";
  const expiracao = el.avisoExpiracao ? el.avisoExpiracao.value : "";

  if (!titulo || !mensagem || !expiracao) {
    if (el.msgAviso) {
      el.msgAviso.className = "msg-box msg-danger";
      el.msgAviso.textContent = "Preencha título, mensagem e data de expiração.";
    }
    return;
  }

  await executarComLoading(el.btnSalvarAviso, async () => {
    try {
      if (idEditando) {
        await apiSend(`/api/avisos/${idEditando}`, "PUT", { titulo, mensagem, prioridade, expiracao });
      } else {
        await apiSend("/api/avisos", "POST", { titulo, mensagem, prioridade, expiracao });
      }

      cancelarEdicaoAviso();
      if (el.msgAviso) {
        el.msgAviso.className = "msg-box msg-success";
        el.msgAviso.textContent = idEditando ? "Aviso atualizado com sucesso!" : "Aviso publicado com sucesso!";
      }
      toast.success(idEditando ? "Aviso atualizado com sucesso!" : "Aviso publicado com sucesso!");
      await carregarAvisos();
      setTimeout(() => { if (el.msgAviso) el.msgAviso.textContent = ""; }, 4000);
    } catch (e) {
      if (el.msgAviso) {
        el.msgAviso.className = "msg-box msg-danger";
        el.msgAviso.textContent = "Erro ao salvar aviso: " + e.message;
      }
      toast.error("Erro ao salvar aviso: " + e.message);
    }
  });
}

async function excluirAviso(id) {
  const aviso = avisos.find(a => String(a.id) === String(id));
  const titulo = aviso ? aviso.titulo : "este aviso";

  const ok = await confirmarAcao({
    titulo: "Excluir aviso",
    mensagem: `Tem certeza que deseja excluir o aviso "${titulo}"?`,
    textoConfirmar: "Excluir",
    tipo: "danger"
  });
  if (!ok) return;

  try {
    await apiSend(`/api/avisos/${id}`, "DELETE", {});
    if (el.avisoIdEditando && el.avisoIdEditando.value === String(id)) {
      cancelarEdicaoAviso();
    }
    toast.success("Aviso excluído com sucesso!");
    await carregarAvisos();
  } catch (e) {
    toast.error("Erro ao excluir aviso: " + e.message);
  }
}

async function carregarEventos() {
  try {
    const dados = await apiGet("/api/eventos");
    eventos = dados.eventos || [];
    renderListaEventos();
    atualizarKpisEventos();
  } catch (e) {
    console.warn("Erro ao carregar eventos:", e);
  }
}

function atualizarKpisEventos() {
  const hoje = todayKey();
  const proximos = eventos.filter(e => (e.data || "") >= hoje);
  const encerrados = eventos.filter(e => (e.data || "") < hoje);

  if (el.totalEventosCounter) {
    el.totalEventosCounter.textContent = `${proximos.length} próximos • ${encerrados.length} encerrados`;
  }
  if (el.kpiTotalEventos) el.kpiTotalEventos.textContent = eventos.length;
  if (el.kpiEventosProximos) el.kpiEventosProximos.textContent = proximos.length;
  if (el.kpiEventosEncerrados) el.kpiEventosEncerrados.textContent = encerrados.length;
}

function renderListaEventos() {
  if (!el.tbodyEventos) return;
  const termo = (el.searchEventoInput ? el.searchEventoInput.value : "").trim().toLowerCase();
  const hoje = todayKey();

  const filtrados = eventos.filter(e => {
    if (!termo) return true;
    const t = (e.titulo || "").toLowerCase();
    const d = (e.descricao || "").toLowerCase();
    return t.includes(termo) || d.includes(termo);
  });

  if (filtrados.length === 0) {
    el.tbodyEventos.innerHTML = "";
    if (el.eventosEmpty) el.eventosEmpty.classList.remove("hidden");
    return;
  }
  if (el.eventosEmpty) el.eventosEmpty.classList.add("hidden");

  // Ordenar: próximos primeiro, por data crescente
  filtrados.sort((a, b) => (a.data || "").localeCompare(b.data || ""));

  el.tbodyEventos.innerHTML = filtrados.map(e => {
    const proximo = (e.data || "") >= hoje;
    let dataFmt = "";
    if (e.data) {
      const parts = e.data.split("-");
      if (parts.length === 3) {
        dataFmt = `${parts[2]}/${parts[1]}`;
      } else {
        dataFmt = e.data;
      }
    }
    const statusHtml = proximo
      ? '<span class="status-pill ativo">Próximo</span>'
      : '<span class="status-pill inativo">Encerrado</span>';

    const catMap = {
      avaliacao: { rotulo: "Avaliação", cor: "pill-ausente" },
      feriado: { rotulo: "Feriado", cor: "pill-presente" },
      sabado: { rotulo: "Sábado Letivo", cor: "pill-sem-aula" },
      academico: { rotulo: "Acadêmico", cor: "pill-sem-aula" },
      evento: { rotulo: "Evento", cor: "status-pill" }
    };
    const catInfo = catMap[e.categoria] || catMap.evento;

    return `
      <tr>
        <td><strong>${escapeHtml(e.titulo)}</strong></td>
        <td><span class="status-pill ${catInfo.cor}">${catInfo.rotulo}</span></td>
        <td class="mono">${dataFmt}</td>
        <td>${statusHtml}</td>
        <td class="col-acoes-prof">
          <button type="button" class="btn-action-edit" data-action="editar-evento" data-id="${e.id}">Editar</button>
          <button type="button" class="btn-action-delete" data-action="excluir-evento" data-id="${e.id}">Excluir</button>
        </td>
      </tr>
    `;
  }).join("");

  renderIcons();
}

function iniciarEdicaoEvento(id) {
  const evento = eventos.find(e => String(e.id) === String(id));
  if (!evento) return;

  if (el.eventoIdEditando) el.eventoIdEditando.value = evento.id;
  if (el.eventoTitulo) el.eventoTitulo.value = evento.titulo || "";
  if (el.eventoDescricao) el.eventoDescricao.value = evento.descricao || "";
  if (el.eventoCategoria) el.eventoCategoria.value = evento.categoria || "evento";
  if (el.eventoData) el.eventoData.value = evento.data || "";

  if (el.formEventoTitulo) el.formEventoTitulo.textContent = "Editar evento";
  if (el.btnSalvarEvento) el.btnSalvarEvento.textContent = "Salvar alterações";
  if (el.msgEvento) el.msgEvento.textContent = "";

  if (el.eventoTitulo) el.eventoTitulo.focus();
}

function cancelarEdicaoEvento() {
  if (el.eventoIdEditando) el.eventoIdEditando.value = "";
  if (el.eventoTitulo) el.eventoTitulo.value = "";
  if (el.eventoDescricao) el.eventoDescricao.value = "";
  if (el.eventoCategoria) el.eventoCategoria.value = "evento";
  if (el.eventoData) el.eventoData.value = "";

  if (el.formEventoTitulo) el.formEventoTitulo.textContent = "Novo evento";
  if (el.btnSalvarEvento) el.btnSalvarEvento.textContent = "Salvar";
  if (el.msgEvento) el.msgEvento.textContent = "";
}

async function salvarEvento() {
  const idEditando = el.eventoIdEditando ? el.eventoIdEditando.value.trim() : "";
  const titulo = (el.eventoTitulo ? el.eventoTitulo.value : "").trim();
  const descricao = (el.eventoDescricao ? el.eventoDescricao.value : "").trim();
  const categoria = el.eventoCategoria ? el.eventoCategoria.value : "evento";
  const data = el.eventoData ? el.eventoData.value : "";

  if (!titulo || !data) {
    if (el.msgEvento) {
      el.msgEvento.className = "msg-box msg-danger";
      el.msgEvento.textContent = "Preencha o título e a data do evento.";
    }
    return;
  }

  await executarComLoading(el.btnSalvarEvento, async () => {
    try {
      if (idEditando) {
        await apiSend(`/api/eventos/${idEditando}`, "PUT", { titulo, descricao, data, categoria });
      } else {
        await apiSend("/api/eventos", "POST", { titulo, descricao, data, categoria });
      }

      cancelarEdicaoEvento();
      if (el.msgEvento) {
        el.msgEvento.className = "msg-box msg-success";
        el.msgEvento.textContent = idEditando ? "Evento atualizado com sucesso!" : "Evento salvo com sucesso!";
      }
      toast.success(idEditando ? "Evento atualizado com sucesso!" : "Evento salvo com sucesso!");
      await carregarEventos();
      setTimeout(() => { if (el.msgEvento) el.msgEvento.textContent = ""; }, 4000);
    } catch (e) {
      if (el.msgEvento) {
        el.msgEvento.className = "msg-box msg-danger";
        el.msgEvento.textContent = "Erro ao salvar evento: " + e.message;
      }
      toast.error("Erro ao salvar evento: " + e.message);
    }
  });
}

async function excluirEvento(id) {
  const evento = eventos.find(e => String(e.id) === String(id));
  const titulo = evento ? evento.titulo : "este evento";

  const ok = await confirmarAcao({
    titulo: "Excluir evento",
    mensagem: `Tem certeza que deseja excluir o evento "${titulo}"?`,
    textoConfirmar: "Excluir",
    tipo: "danger"
  });
  if (!ok) return;

  try {
    await apiSend(`/api/eventos/${id}`, "DELETE", {});
    if (el.eventoIdEditando && el.eventoIdEditando.value === String(id)) {
      cancelarEdicaoEvento();
    }
    await carregarEventos();
  } catch (e) {
    toast.error("Erro ao excluir evento: " + e.message);
  }
}

// ======================================================
// GESTÃO DE COORDENADORES / USUÁRIOS ADMINISTRATIVOS
// ======================================================
let coordenadoresLista = [];

async function carregarCoordenadores() {
  try {
    const dados = await apiGet("/api/admin-usuarios");
    coordenadoresLista = dados.usuarios || [];
    renderListaCoordenadores();
  } catch (e) {
    console.warn("Erro ao carregar coordenadores:", e);
  }
}

function renderListaCoordenadores() {
  const tbody = document.getElementById("tbodyCoordenadores");
  const counter = document.getElementById("totalCoordenadoresCounter");
  const emptyState = document.getElementById("coordenadoresEmpty");
  const searchInput = document.getElementById("searchCoordenadorInput");

  if (!tbody) return;

  const termo = (searchInput ? searchInput.value : "").trim().toLowerCase();
  const filtrados = coordenadoresLista.filter(u => !termo || u.email.toLowerCase().includes(termo));

  if (counter) counter.textContent = `${coordenadoresLista.length} cadastrados`;

  if (filtrados.length === 0) {
    tbody.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }
  if (emptyState) emptyState.classList.add("hidden");

  tbody.innerHTML = filtrados.map(u => {
    const isMestre = u.email === "admin@presenx.com";
    return `
      <tr>
        <td><strong>${escapeHtml(u.email)}</strong></td>
        <td>
          <span class="status-pill ${isMestre ? 'ativo' : 'inativo'}">
            ${isMestre ? 'Administrador Geral' : 'Coordenador'}
          </span>
        </td>
        <td class="col-acoes-prof">
          ${isMestre ? '' : `
            <button type="button" class="btn-action-delete" data-action="excluir-coordenador" data-id="${u.id}" data-email="${escapeHtml(u.email)}">
              Excluir
            </button>
          `}
        </td>
      </tr>
    `;
  }).join("");

  renderIcons();
}

async function salvarCoordenador() {
  const emailInput = document.getElementById("cadAdminEmail");
  const senhaInput = document.getElementById("cadAdminSenha");
  const btnSalvar = document.getElementById("btnSalvarCoordenador");
  const msgBox = document.getElementById("msgCoordenador");

  const email = (emailInput ? emailInput.value : "").trim().toLowerCase();
  const senha = (senhaInput ? senhaInput.value : "").trim();

  if (msgBox) msgBox.textContent = "";

  if (!email || !senha) {
    toast.warning("Preencha o e-mail e a senha inicial.");
    return;
  }
  if (senha.length < 6) {
    toast.warning("A senha deve conter no mínimo 6 caracteres.");
    return;
  }

  await executarComLoading(btnSalvar, async () => {
    try {
      await apiSend("/api/admin-usuarios", "POST", { email, senha });
      if (emailInput) emailInput.value = "";
      if (senhaInput) senhaInput.value = "";
      toast.success(`Acesso criado com sucesso para ${email}!`);
      await carregarCoordenadores();
    } catch (e) {
      toast.error(e.message || "Erro ao criar coordenador.");
    }
  });
}

async function excluirCoordenador(id, email) {
  const ok = await confirmarAcao({
    titulo: "Remover coordenador",
    mensagem: `Tem certeza que deseja remover o acesso de "${email}"?`,
    textoConfirmar: "Remover",
    tipo: "danger"
  });
  if (!ok) return;

  try {
    await apiSend(`/api/admin-usuarios/${id}`, "DELETE", {});
    toast.success("Coordenador removido com sucesso.");
    await carregarCoordenadores();
  } catch (e) {
    toast.error(e.message || "Erro ao remover coordenador.");
  }
}

// ======================================================
// GESTÃO DE BACKUP & NUVEM (FIREBASE)
// ======================================================
async function carregarStatusBackup() {
  const dot = document.getElementById("bkpDotStatus");
  const txt = document.getElementById("bkpStatusTexto");
  const msg = document.getElementById("msgBackupStatus");

  try {
    const res = await apiGet("/api/backup/status");
    if (!res || !res.ok) {
      if (txt) txt.textContent = "Não foi possível consultar status da nuvem";
      if (dot) dot.className = "telemetry-dot offline";
      return;
    }

    if (dot) dot.className = res.firebaseConectado ? "telemetry-dot online" : "telemetry-dot offline";
    if (txt) {
      txt.textContent = res.firebaseConectado
        ? "Firebase RTDB: Conectado e Sincronizado"
        : "Firebase RTDB: Desconectado (Configurar FIREBASE_SERVICE_ACCOUNT no Render)";
    }

    const t = res.totais || {};
    const countProf = document.getElementById("bkpCountProf");
    const countDisc = document.getElementById("bkpCountDisc");
    const countTurmas = document.getElementById("bkpCountTurmas");
    const countGrade = document.getElementById("bkpCountGrade");
    const countTurnos = document.getElementById("bkpCountTurnos");
    const countAdmins = document.getElementById("bkpCountAdmins");

    if (countProf) countProf.textContent = t.usuarios || 0;
    if (countDisc) countDisc.textContent = t.disciplinas || 0;
    if (countTurmas) countTurmas.textContent = t.turmas || 0;
    if (countGrade) countGrade.textContent = t.grade_horarios || 0;
    if (countTurnos) countTurnos.textContent = t.turnos_horarios || 0;
    if (countAdmins) countAdmins.textContent = t.admin_usuarios || 0;

  } catch (err) {
    if (dot) dot.className = "telemetry-dot offline";
    if (txt) txt.textContent = "Erro ao conectar com a API";
  }
}

function baixarBackupJson() {
  const token = localStorage.getItem("px_admin_token");
  if (!token) {
    toast.error("Sessão expirada. Faça login novamente.");
    return;
  }
  // Abre o download direto com token na URL
  window.location.href = `/api/backup/export?token=${encodeURIComponent(token)}`;
}

async function forcarSincronizacaoNuvem() {
  const btn = document.getElementById("btnForcarSincronizacao");
  const msg = document.getElementById("msgBackupStatus");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Sincronizando...";
  }
  if (msg) {
    msg.className = "msg-box";
    msg.textContent = "";
  }

  try {
    const res = await apiSend("/api/backup/sincronizar-nuvem", "POST", {});
    if (res && res.ok) {
      if (msg) {
        msg.className = "msg-box msg-ok";
        msg.textContent = "✓ Nuvem sincronizada com sucesso!";
      }
      toast.success("Nuvem sincronizada!");
      await carregarStatusBackup();
    } else {
      if (msg) {
        msg.className = "msg-box msg-err";
        msg.textContent = (res && res.erro) || "Erro ao sincronizar com Firebase.";
      }
      toast.error((res && res.erro) || "Erro na sincronização.");
    }
  } catch (err) {
    if (msg) {
      msg.className = "msg-box msg-err";
      msg.textContent = "Falha de rede ao sincronizar.";
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "🔄 Sincronizar com Nuvem";
    }
  }
}

async function restaurarBackupJson() {
  const fileInput = document.getElementById("inputArquivoBackup");
  const msg = document.getElementById("msgRestauracao");
  const btn = document.getElementById("btnExecutarRestauracao");

  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    if (msg) {
      msg.className = "msg-box msg-err";
      msg.textContent = "Por favor, selecione um arquivo .json de backup.";
    }
    toast.error("Selecione um arquivo .json.");
    return;
  }

  const arquivo = fileInput.files[0];
  if (!arquivo.name.endsWith(".json")) {
    if (msg) {
      msg.className = "msg-box msg-err";
      msg.textContent = "O arquivo precisa ter extensão .json.";
    }
    toast.error("Arquivo inválido (necessário .json).");
    return;
  }

  const ok = await confirmarAcao({
    titulo: "Restaurar Backup Completo",
    mensagem: `Tem certeza que deseja restaurar os dados do arquivo "${arquivo.name}"?\nTodos os registros serão importados para o banco local e salvos na nuvem.`,
    textoConfirmar: "Restaurar Dados",
    tipo: "danger"
  });
  if (!ok) return;

  if (btn) {
    btn.disabled = true;
    btn.textContent = "Restaurando dados...";
  }
  if (msg) {
    msg.className = "msg-box";
    msg.textContent = "Lendo arquivo...";
  }

  try {
    const leitor = new FileReader();
    leitor.onload = async function (e) {
      try {
        const conteudoJson = JSON.parse(e.target.result);
        if (!conteudoJson || !conteudoJson.tabelas) {
          throw new Error("Formato inválido: propriedade 'tabelas' não encontrada.");
        }

        const res = await apiSend("/api/backup/import", "POST", { tabelas: conteudoJson.tabelas });
        if (res && res.ok) {
          if (msg) {
            msg.className = "msg-box msg-ok";
            msg.textContent = "✓ Backup restaurado com sucesso no banco de dados e nuvem!";
          }
          toast.success("Backup restaurado com sucesso!");
          fileInput.value = "";
          await carregarStatusBackup();
          // Recarrega todos os módulos da interface
          await carregarDisciplinas();
          await carregarUsuariosLocais();
          await carregarTurmas();
          await carregarPainelDadosGrade();
          await carregarAvisos();
          await carregarEventos();
          await carregarCoordenadores();
        } else {
          if (msg) {
            msg.className = "msg-box msg-err";
            msg.textContent = (res && res.erro) || "Erro ao processar restauração.";
          }
          toast.error((res && res.erro) || "Erro ao restaurar.");
        }
      } catch (errJson) {
        if (msg) {
          msg.className = "msg-box msg-err";
          msg.textContent = "Erro ao interpretar JSON: " + errJson.message;
        }
        toast.error("JSON inválido.");
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = "📤 Restaurar Dados";
        }
      }
    };
    leitor.readAsText(arquivo, "UTF-8");
  } catch (err) {
    if (msg) {
      msg.className = "msg-box msg-err";
      msg.textContent = "Falha ao ler o arquivo selecionado.";
    }
    if (btn) {
      btn.disabled = false;
      btn.textContent = "📤 Restaurar Dados";
    }
  }
}

window.sair = function () {
  localStorage.removeItem("px_admin_token");
  window.location.href = "./login-gestao.html";
};

// ======================================================
// INICIALIZAÇÃO
// ======================================================
async function start() {
  renderIcons();
  initNavegacao();

  if (el.filtroData) el.filtroData.value = todayKey();
  if (el.avisoExpiracao) el.avisoExpiracao.min = todayKey();
  if (el.eventoData) el.eventoData.min = todayKey();

  // Listeners de Professores
  if (el.btnSalvarProfessor) el.btnSalvarProfessor.addEventListener("click", salvarProfessor);
  if (el.btnCancelarEdicao) el.btnCancelarEdicao.addEventListener("click", cancelarEdicaoProfessor);
  if (el.searchInput) el.searchInput.addEventListener("input", renderListaProfessores);

  // Botões do cabeçalho
  const btnNovo = document.getElementById("btnNovoProfessor");
  if (btnNovo) {
    btnNovo.addEventListener("click", () => {
      cancelarEdicaoProfessor();
      if (el.cadNome) el.cadNome.focus();
    });
  }

  const btnNovaD = document.getElementById("btnNovaDisciplina");
  if (btnNovaD) {
    btnNovaD.addEventListener("click", () => {
      cancelarEdicaoDisciplina();
      if (el.discNomeInput) el.discNomeInput.focus();
    });
  }

  // Dropdown de seleção de disciplinas no professor
  const btnDropDisc = document.getElementById("btnDropdownDisciplinas");
  const menuDropDisc = document.getElementById("menuDropdownDisciplinas");
  if (btnDropDisc && menuDropDisc) {
    btnDropDisc.addEventListener("click", (e) => {
      e.stopPropagation();
      menuDropDisc.classList.toggle("hidden");
    });
    menuDropDisc.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  // Dropdown de seleção de professores na disciplina
  const btnDropProf = document.getElementById("btnDropdownProfessores");
  const menuDropProf = document.getElementById("menuDropdownProfessores");
  if (btnDropProf && menuDropProf) {
    btnDropProf.addEventListener("click", (e) => {
      e.stopPropagation();
      menuDropProf.classList.toggle("hidden");
    });
    menuDropProf.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  document.addEventListener("click", () => {
    if (menuDropDisc && !menuDropDisc.classList.contains("hidden")) {
      menuDropDisc.classList.add("hidden");
    }
    if (menuDropProf && !menuDropProf.classList.contains("hidden")) {
      menuDropProf.classList.add("hidden");
    }
  });

  if (el.tbodyProfessores) {
    el.tbodyProfessores.addEventListener("click", (event) => {
      const botao = event.target.closest("button[data-action]");
      if (!botao) return;
      const uid = botao.dataset.uid;
      const acao = botao.dataset.action;
      if (acao === "editar") iniciarEdicaoProfessor(uid);
      if (acao === "alternar") alternarAtivoProfessor(uid);
      if (acao === "excluir") excluirProfessor(uid, usuarios[uid]?.nome || uid);
    });
  }

  // Listeners de Disciplinas
  if (el.btnSalvarDisciplina) el.btnSalvarDisciplina.addEventListener("click", salvarDisciplina);
  const btnCancDisc = document.getElementById("btnCancelarEdicaoDisciplina");
  if (btnCancDisc) btnCancDisc.addEventListener("click", cancelarEdicaoDisciplina);
  if (el.searchDisciplinaInput) el.searchDisciplinaInput.addEventListener("input", renderListaDisciplinas);

  if (el.tbodyDisciplinas) {
    el.tbodyDisciplinas.addEventListener("click", (event) => {
      const botao = event.target.closest("button[data-action]");
      if (!botao) return;
      const id = botao.dataset.id;
      const acao = botao.dataset.action;
      if (acao === "editar") {
        iniciarEdicaoDisciplina(id);
      } else if (acao === "excluir" || acao === "excluir-disciplina") {
        excluirDisciplina(id);
      }
    });
  }

  // Listeners de Turmas
  const btnNovaT = document.getElementById("btnNovaTurma");
  if (btnNovaT) {
    btnNovaT.addEventListener("click", () => {
      cancelarEdicaoTurma();
      if (el.turmaIdInput) el.turmaIdInput.focus();
    });
  }

  if (el.searchTurmaInput) el.searchTurmaInput.addEventListener("input", renderListaTurmas);
  if (el.filtroTurmaPavilhao) el.filtroTurmaPavilhao.addEventListener("change", renderListaTurmas);
  if (el.filtroTurmaTurno) el.filtroTurmaTurno.addEventListener("change", renderListaTurmas);
  if (el.btnSalvarTurma) el.btnSalvarTurma.addEventListener("click", salvarTurma);
  if (el.btnCancelarEdicaoTurma) el.btnCancelarEdicaoTurma.addEventListener("click", cancelarEdicaoTurma);

  if (el.tbodyTurmas) {
    el.tbodyTurmas.addEventListener("click", (event) => {
      const botao = event.target.closest("button[data-action]");
      if (!botao) return;
      const id = botao.dataset.id;
      const acao = botao.dataset.action;
      if (acao === "editar" || acao === "editar-turma") {
        iniciarEdicaoTurma(id);
      } else if (acao === "excluir" || acao === "excluir-turma") {
        excluirTurma(id);
      }
    });
  }

  // Listeners de Grade
  if (el.gradeSeletorTurma) {
    el.gradeSeletorTurma.addEventListener("change", () => {
      carregarGradeDaTurma(el.gradeSeletorTurma.value);
    });
  }
  const btnSalvarGradeH = document.getElementById("btnSalvarGradeHeader");
  if (btnSalvarGradeH) btnSalvarGradeH.addEventListener("click", salvarGradeSemanalCompleta);
  const btnSalvarGradeDireto = document.getElementById("btnSalvarGradeDireto");
  if (btnSalvarGradeDireto) btnSalvarGradeDireto.addEventListener("click", salvarGradeSemanalCompleta);
  if (el.btnCopiarGradeModal) el.btnCopiarGradeModal.addEventListener("click", abrirModalCopiarGrade);

  if (el.tbodyGradeSemanal) {
    el.tbodyGradeSemanal.addEventListener("click", (e) => {
      const td = e.target.closest(".grade-cell-slot");
      if (!td) return;
      abrirModalSlot(td.dataset.dia, td.dataset.horario);
    });
  }

  const btnSlotSalvar = document.getElementById("btnSlotSalvar");
  if (btnSlotSalvar) btnSlotSalvar.addEventListener("click", salvarSlotEditado);
  const btnSlotCancelar = document.getElementById("btnSlotCancelar");
  if (btnSlotCancelar) btnSlotCancelar.addEventListener("click", fecharModalSlot);
  const btnSlotRemover = document.getElementById("btnSlotRemover");
  if (btnSlotRemover) btnSlotRemover.addEventListener("click", removerSlotEditado);

  const selSlotDisc = document.getElementById("selectSlotDisciplina");
  const selSlotProf = document.getElementById("selectSlotProfessor");
  if (selSlotDisc && selSlotProf) {
    selSlotDisc.addEventListener("change", () => {
      const discNome = selSlotDisc.value.trim();
      if (discNome && mapaProfessoresPorDisciplina[discNome]) {
        const primeiroProf = mapaProfessoresPorDisciplina[discNome].split(",")[0].trim();
        selSlotProf.value = primeiroProf;
      }
    });
  }

  const btnCopiarConf = document.getElementById("btnCopiarGradeConfirmar");
  if (btnCopiarConf) btnCopiarConf.addEventListener("click", confirmarCopiarGrade);
  const btnCopiarCanc = document.getElementById("btnCopiarGradeCancelar");
  if (btnCopiarCanc) btnCopiarCanc.addEventListener("click", fecharModalCopiarGrade);

  // Listeners de Relatórios
  if (el.btnGerarRelatorio) {
    el.btnGerarRelatorio.addEventListener("click", () => {
      dataSelecionada = el.filtroData.value || todayKey();
      paginaRelatorio = 0;
      carregarPresencasPorData();
    });
  }
  if (el.filtroData) {
    el.filtroData.addEventListener("change", () => {
      dataSelecionada = el.filtroData.value || todayKey();
      paginaRelatorio = 0;
      carregarPresencasPorData();
    });
  }
  if (el.filtroProfessor) {
    el.filtroProfessor.addEventListener("change", () => {
      professorFiltro = el.filtroProfessor.value;
      paginaRelatorio = 0;
      buildTabela();
    });
  }
  if (el.btnPaginaAnterior) {
    el.btnPaginaAnterior.addEventListener("click", () => {
      paginaRelatorio--;
      buildTabela();
    });
  }
  if (el.btnPaginaProxima) {
    el.btnPaginaProxima.addEventListener("click", () => {
      paginaRelatorio++;
      buildTabela();
    });
  }
  if (el.btnExport) el.btnExport.addEventListener("click", exportCSV);
  if (el.btnImprimirFrequencia) el.btnImprimirFrequencia.addEventListener("click", imprimirFolhaFrequencia);

  // Listeners Assistente RFID & Modal de Vinculação
  if (el.btnRfidFechar) el.btnRfidFechar.addEventListener("click", fecharBannerRfid);
  if (el.btnRfidPreencher) el.btnRfidPreencher.addEventListener("click", preencherUidDesconhecido);
  if (el.btnRfidVincular) el.btnRfidVincular.addEventListener("click", abrirModalVincularCartao);
  if (el.btnModalVincularCancelar) el.btnModalVincularCancelar.addEventListener("click", fecharModalVincularCartao);
  if (el.btnModalVincularConfirmar) el.btnModalVincularConfirmar.addEventListener("click", confirmarVinculoCartao);

  // Listeners de Avisos
  if (el.btnSalvarAviso) el.btnSalvarAviso.addEventListener("click", salvarAviso);
  if (el.btnCancelarEdicaoAviso) el.btnCancelarEdicaoAviso.addEventListener("click", cancelarEdicaoAviso);
  if (el.searchAvisoInput) el.searchAvisoInput.addEventListener("input", renderListaAvisos);

  const btnNovoAvH = document.getElementById("btnNovoAvisoHeader");
  if (btnNovoAvH) {
    btnNovoAvH.addEventListener("click", () => {
      cancelarEdicaoAviso();
      if (el.avisoTitulo) el.avisoTitulo.focus();
    });
  }

  if (el.tbodyAvisos) {
    el.tbodyAvisos.addEventListener("click", (event) => {
      const botao = event.target.closest("button[data-action]");
      if (!botao) return;
      const id = botao.dataset.id;
      const acao = botao.dataset.action;
      if (acao === "editar-aviso") {
        iniciarEdicaoAviso(id);
      } else if (acao === "excluir-aviso") {
        excluirAviso(id);
      }
    });
  }

  // Listeners de Eventos
  if (el.btnSalvarEvento) el.btnSalvarEvento.addEventListener("click", salvarEvento);
  if (el.btnCancelarEdicaoEvento) el.btnCancelarEdicaoEvento.addEventListener("click", cancelarEdicaoEvento);
  if (el.searchEventoInput) el.searchEventoInput.addEventListener("input", renderListaEventos);

  const btnNovoEvH = document.getElementById("btnNovoEventoHeader");
  if (btnNovoEvH) {
    btnNovoEvH.addEventListener("click", () => {
      cancelarEdicaoEvento();
      if (el.eventoTitulo) el.eventoTitulo.focus();
    });
  }

  if (el.tbodyEventos) {
    el.tbodyEventos.addEventListener("click", (event) => {
      const botao = event.target.closest("button[data-action]");
      if (!botao) return;
      const id = botao.dataset.id;
      const acao = botao.dataset.action;
      if (acao === "editar-evento") {
        iniciarEdicaoEvento(id);
      } else if (acao === "excluir-evento") {
        excluirEvento(id);
      }
    });
  }

  // Listeners de Coordenadores
  const btnSalvarCoord = document.getElementById("btnSalvarCoordenador");
  if (btnSalvarCoord) btnSalvarCoord.addEventListener("click", salvarCoordenador);

  const searchCoordInput = document.getElementById("searchCoordenadorInput");
  if (searchCoordInput) searchCoordInput.addEventListener("input", renderListaCoordenadores);

  const tbodyCoord = document.getElementById("tbodyCoordenadores");
  if (tbodyCoord) {
    tbodyCoord.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action='excluir-coordenador']");
      if (!btn) return;
      excluirCoordenador(btn.dataset.id, btn.dataset.email);
    });
  }

  // Listeners de Turnos
  const btnSalvarTurnosH = document.getElementById("btnSalvarTurnosHeader");
  if (btnSalvarTurnosH) btnSalvarTurnosH.addEventListener("click", salvarConfigTurnos);

  document.querySelectorAll(".input-hora-turno").forEach(inp => {
    aplicarMascaraHora(inp);
  });

  // Listeners de Backup & Nuvem
  const btnBkpRapido = document.getElementById("btnBaixarBackupRapido");
  if (btnBkpRapido) btnBkpRapido.addEventListener("click", baixarBackupJson);

  const btnBkpCompleto = document.getElementById("btnBaixarBackupCompleto");
  if (btnBkpCompleto) btnBkpCompleto.addEventListener("click", baixarBackupJson);

  const btnForcarSinc = document.getElementById("btnForcarSincronizacao");
  if (btnForcarSinc) btnForcarSinc.addEventListener("click", forcarSincronizacaoNuvem);

  const btnRestaurar = document.getElementById("btnExecutarRestauracao");
  if (btnRestaurar) btnRestaurar.addEventListener("click", restaurarBackupJson);

  // Carregamento de dados
  await carregarDisciplinas();
  await carregarUsuariosLocais();
  await carregarTurmas();
  await carregarPainelDadosGrade();
  await carregarPresencasPorData();
  await carregarAvisos();
  await carregarEventos();
  await carregarConfigTurnos();

  // Detecção inicial de cartão RFID e monitoramento de leitores
  await verificarCartaoDesconhecido();
  await carregarMonitoramentoLeitores();

  // Relógio e Data do cabeçalho
  atualizarSubtituloHoje();
  setInterval(() => {
    if (el.lastUpdate) el.lastUpdate.textContent = nowBRTime();
    atualizarSubtituloHoje();
  }, 1000);

  // Auto-refresh a cada 10s
  setInterval(() => {
    carregarPresencasPorData();
    carregarAvisos();
    carregarEventos();
    carregarPainelDadosGrade();
  }, 10000);

  // Verificação periódica de cartão RFID desconhecido a cada 3s
  setInterval(verificarCartaoDesconhecido, 3000);

  // Monitoramento periódico dos leitores RFID a cada 5s
  setInterval(carregarMonitoramentoLeitores, 5000);

  renderIcons();
}

window.sair = async function () {
  try {
    await apiSend("/api/logout", "POST", {});
  } catch (e) {}
  localStorage.removeItem("px_admin_token");
  window.location.replace("./login-gestao.html");
};

start();