// Seletores principais
const titulo = document.getElementById("titulo");
const descricao = document.getElementById("descricao");
const observacao = document.getElementById("observacao");
const prioridade = document.getElementById("prioridade");
const statusProgresso = document.getElementById("statusProgresso");
const lista = document.getElementById("lista");
const overlay = document.getElementById("overlay");
const criarTarefa = document.getElementById("criarTarefa");
const busca = document.getElementById("busca");
const modalAcao = document.getElementById("modalAcao");
const modalAparencia = document.getElementById("modalAparencia");
const modalConfirmarExclusao = document.getElementById("modalConfirmarExclusao");
const mensagemExclusao = document.getElementById("mensagemExclusao");
const mensagemObservacao = document.getElementById("mensagemObservacao");
const ordenarPor = document.getElementById("ordenarPor");
const filtrarPrioridade = document.getElementById("filtrarPrioridade");
const filtrarStatus = document.getElementById("filtrarStatus");

let tarefaAtual = null;
let idTarefaParaExcluir = null;

// ===================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ===================================
document.addEventListener("DOMContentLoaded", () => {
  carregarPreferenciaAparencia();
  inicializarDropdownsCustomizados();
  buscarTarefas();
});

// ===================================
// SISTEMA DE DROPDOWNS CUSTOMIZADOS
// ===================================
function inicializarDropdownsCustomizados() {
  document.querySelectorAll('.dropdown-custom').forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const items = dropdown.querySelectorAll('.dropdown-item');
    const selectOriginal = dropdown.parentElement ? dropdown.parentElement.querySelector('select') : null;

    if (dropdown.dataset.initialized === "true") return;
    dropdown.dataset.initialized = "true";

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.dropdown-custom').forEach(d => {
        if (d !== dropdown) d.classList.remove('ativo');
      });
      dropdown.classList.toggle('ativo');
    });

    items.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = item.getAttribute('data-value');
        const text = item.innerText;

        const labelSpan = trigger.querySelector('span');
        if (labelSpan) labelSpan.innerText = text;
        
        items.forEach(i => i.classList.remove('ativo'));
        item.classList.add('ativo');

        if (selectOriginal) {
          selectOriginal.value = value;
          // Executa busca apenas para os filtros do cabeçalho
          if (selectOriginal.id === "ordenarPor" || selectOriginal.id === "filtrarPrioridade" || selectOriginal.id === "filtrarStatus") {
            buscarTarefas();
          }
        }

        dropdown.classList.remove('ativo');
      });
    });
  });

  // Fecha todos os dropdowns ao clicar fora
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-custom').forEach(d => d.classList.remove('ativo'));
  });
}

function resetFormCriarTarefa() {
  const formCriar = document.querySelector("#criarTarefa form");
  if (formCriar) formCriar.reset();

  // Reseta visualmente o texto do gatilho dos dropdowns no modal
  const prioTrigger = document.querySelector("#criarTarefa #prioridade + .dropdown-custom .dropdown-trigger span");
  if (prioTrigger) prioTrigger.innerText = "Média";

  const statusTrigger = document.querySelector("#criarTarefa #statusProgresso + .dropdown-custom .dropdown-trigger span");
  if (statusTrigger) statusTrigger.innerText = "⌬ Pendente";

  // Reseta classes ativas das opções no modal
  document.querySelectorAll("#criarTarefa .dropdown-item").forEach(item => {
    const val = item.getAttribute("data-value");
    if (val === "media" || val === "pendente") {
      item.classList.add("ativo");
    } else {
      item.classList.remove("ativo");
    }
  });
}

// ===================================
// GERENCIAMENTO DE MODAIS E OVERLAY
// ===================================
function abrirModal() {
  fecharTodosModais();
  document.body.style.overflow = "hidden";
  overlay.classList.add("active");
  criarTarefa.classList.add("active");
}

function fecharModal() {
  document.body.style.overflow = ""; 
  overlay.classList.remove("active");
  document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
}

function abrirModalAcao(id) {
  fecharTodosModais();
  tarefaAtual = id;
  overlay.classList.add("active");
  modalAcao.classList.add("active");
}

function fecharModalAcao() {
  fecharTodosModais();
}

function abrirModalAparencia() {
  fecharTodosModais();
  overlay.classList.add("active");
  modalAparencia.classList.add("active");
}

function fecharModalAparencia() {
  fecharTodosModais();
}

function solicitarExclusaoTarefa(id) {
  fecharTodosModais();
  idTarefaParaExcluir = id;
  overlay.classList.add("active");
  if (modalConfirmarExclusao) modalConfirmarExclusao.classList.add("active");
}

function fecharModalExclusao() {
  fecharTodosModais();
}

function fecharTodosModais() {
  overlay.classList.remove("active");
  document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
  document.querySelectorAll('.dropdown-custom').forEach(d => d.classList.remove('ativo'));

  const textoAcaoInput = document.getElementById("textoAcao");
  if (textoAcaoInput) textoAcaoInput.value = "";

  idTarefaParaExcluir = null;
}

if (overlay) {
  overlay.addEventListener("click", fecharTodosModais);
}

// ===================================
// SISTEMA DE APARÊNCIA E PAPEL DE PAREDE
// ===================================
function alterarModo(modo) {
  if (modo === "escuro") {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }
  salvarPreferenciaAparencia();
}

function alterarCor(primaria, hover, textMuted) {
  document.documentElement.style.setProperty('--primary-color', primaria);
  document.documentElement.style.setProperty('--primary-hover', hover);
  if (textMuted) {
    document.documentElement.style.setProperty('--text-muted', textMuted);
  }
  salvarPreferenciaAparencia();
}

function uploadPapelParede(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const base64Image = e.target.result;
      document.documentElement.style.setProperty('--bg-image', `url('${base64Image}')`);
      const bgUrlInput = document.getElementById("bgUrl");
      if (bgUrlInput) bgUrlInput.value = "";
      salvarPreferenciaAparencia();
    };
    reader.readAsDataURL(file);
  }
}

function aplicarPapelParede() {
  const bgUrlInput = document.getElementById("bgUrl");
  const bgFileInput = document.getElementById("bgFile");
  const url = bgUrlInput ? bgUrlInput.value.trim() : "";

  if (url) {
    document.documentElement.style.setProperty('--bg-image', `url('${url}')`);
    if (bgFileInput) bgFileInput.value = "";
    salvarPreferenciaAparencia();
  }
}

function removerPapelParede() {
  document.documentElement.style.setProperty('--bg-image', 'none');
  const bgUrlInput = document.getElementById("bgUrl");
  const bgFileInput = document.getElementById("bgFile");
  if (bgUrlInput) bgUrlInput.value = "";
  if (bgFileInput) bgFileInput.value = "";
  salvarPreferenciaAparencia();
}

function salvarPreferenciaAparencia() {
  const styles = getComputedStyle(document.documentElement);

  const aparencia = {
    escuro: document.body.classList.contains("dark-theme"),
    primaria: styles.getPropertyValue('--primary-color').trim(),
    hover: styles.getPropertyValue('--primary-hover').trim(),
    textMuted: styles.getPropertyValue('--text-muted').trim(),
    bgImage: styles.getPropertyValue('--bg-image').trim()
  };

  localStorage.setItem("aparencia_wel_todo", JSON.stringify(aparencia));
}

function carregarPreferenciaAparencia() {
  const aparencia = JSON.parse(localStorage.getItem("aparencia_wel_todo"));
  if (!aparencia) return;

  if (aparencia.escuro) {
    document.body.classList.add("dark-theme");
  }

  if (aparencia.primaria) {
    document.documentElement.style.setProperty('--primary-color', aparencia.primaria);
  }

  if (aparencia.hover) {
    document.documentElement.style.setProperty('--primary-hover', aparencia.hover);
  }

  if (aparencia.textMuted) {
    document.documentElement.style.setProperty('--text-muted', aparencia.textMuted);
  }

  if (aparencia.bgImage && aparencia.bgImage !== 'none') {
    document.documentElement.style.setProperty('--bg-image', aparencia.bgImage);
    
    if (!aparencia.bgImage.startsWith("url('data:")) {
      const urlLimpa = aparencia.bgImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
      const inputBg = document.getElementById("bgUrl");
      if (inputBg) inputBg.value = urlLimpa;
    }
  }
}

// ===================================
// LÓGICA DAS TAREFAS
// ===================================
function buscarTarefas() {
  let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];

  // 1. Filtro por Busca de Texto
  const termo = busca ? busca.value.toLowerCase().trim() : "";
  if (termo) {
    tarefas = tarefas.filter(t => 
      t.titulo.toLowerCase().includes(termo) || 
      t.descricao.toLowerCase().includes(termo)
    );
  }

  // 2. Filtro por Prioridade
  const prioFiltro = filtrarPrioridade ? filtrarPrioridade.value : "todas";
  if (prioFiltro !== "todas") {
    tarefas = tarefas.filter(t => t.prioridade === prioFiltro);
  }

  // 3. Filtro por Status e Conclusão
  const statusFiltro = filtrarStatus ? filtrarStatus.value : "todos";

  if (statusFiltro === "pendente") {
    tarefas = tarefas.filter(t => !t.concluida && (t.statusProgresso || "pendente") === "pendente");
  } else if (statusFiltro === "em_andamento") {
    tarefas = tarefas.filter(t => !t.concluida && t.statusProgresso === "em_andamento");
  } else if (statusFiltro === "concluida") {
    tarefas = tarefas.filter(t => t.concluida);
  }

  // 4. Ordenação
  const criterio = ordenarPor ? ordenarPor.value : "data_desc";
  const pesosPrioridade = { alta: 3, media: 2, baixa: 1 };

  tarefas.sort((a, b) => {
    if (a.fixada !== b.fixada) {
      return a.fixada ? -1 : 1;
    }

    switch (criterio) {
      case "prioridade":
        return pesosPrioridade[b.prioridade] - pesosPrioridade[a.prioridade];

      case "data_asc":
        return new Date(a.criadaEm) - new Date(b.criadaEm);

      case "data_desc":
        return new Date(b.criadaEm) - new Date(a.criadaEm);

      case "titulo":
        return a.titulo.localeCompare(b.titulo, "pt-BR", { sensitivity: "base" });

      default:
        return 0;
    }
  });

  inserirTarefas(tarefas);
}

function formatarData(isoString) {
  if (!isoString) return "";
  const data = new Date(isoString);
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function inserirTarefas(tarefas) {
  lista.innerHTML = "";

  if (tarefas.length === 0) {
    lista.innerHTML = "<p style='color: var(--text-muted);'>Nenhuma tarefa encontrada.</p>";
    return;
  }

  tarefas.forEach(tarefa => {
    const li = document.createElement("li");
    const stProgresso = tarefa.statusProgresso || "pendente";

    if (tarefa.concluida) li.classList.add("concluida");
    if (tarefa.fixada) li.classList.add("fixada");

    const rotuloStatus = stProgresso === "em_andamento" ? "ꆜ Em andamento" : "⌬ Pendente";

    li.innerHTML = `
      <div class="card-header">
        <h5>${tarefa.titulo}</h5>
        <div class="card-actions-top">
          <box-icon 
            name="pin" 
            type="${tarefa.fixada ? 'solid' : 'regular'}"
            class="pin-btn ${tarefa.fixada ? 'active' : ''}" 
            onclick="alternarFixar(${tarefa.id})"
            title="${tarefa.fixada ? 'Desafixar' : 'Fixar no topo'}">
          </box-icon>
          <box-icon 
            name="trash-alt" 
            class="trash-btn" 
            onclick="solicitarExclusaoTarefa(${tarefa.id})"
            title="Excluir tarefa">
          </box-icon>
        </div>
      </div>

      <div class="badge-container">
        <!-- DROPDOWN DE PRIORIDADE EDITÁVEL NO CARD -->
        <div class="dropdown-custom dropdown-badge badge-${tarefa.prioridade}">
          <div class="dropdown-trigger">
            <span>${tarefa.prioridade}</span>
            <span class="seta">▼</span>
          </div>
          <div class="dropdown-menu">
            <div 
              class="dropdown-item ${tarefa.prioridade === 'baixa' ? 'ativo' : ''}" 
              data-value="baixa"
              onclick="alterarPrioridade(${tarefa.id}, 'baixa')"
            >
              Baixa
            </div>
            <div 
              class="dropdown-item ${tarefa.prioridade === 'media' ? 'ativo' : ''}" 
              data-value="media"
              onclick="alterarPrioridade(${tarefa.id}, 'media')"
            >
              Média
            </div>
            <div 
              class="dropdown-item ${tarefa.prioridade === 'alta' ? 'ativo' : ''}" 
              data-value="alta"
              onclick="alterarPrioridade(${tarefa.id}, 'alta')"
            >
              Alta
            </div>
          </div>
        </div>

        <span class="data-registro">Criado: ${formatarData(tarefa.criadaEm)}</span>
      </div>

      <!-- DROPDOWN CUSTOMIZADO DE STATUS DE PROGRESSO -->
      <div class="status-select-container" style="display: ${tarefa.concluida ? 'none' : 'block'};">
        <div class="dropdown-custom dropdown-card">
          <div class="dropdown-trigger">
            <span>${rotuloStatus}</span>
            <span class="seta">▼</span>
          </div>
          <div class="dropdown-menu">
            <div 
              class="dropdown-item ${stProgresso === 'pendente' ? 'ativo' : ''}" 
              data-value="pendente"
              onclick="alterarStatusProgresso(${tarefa.id}, 'pendente')"
            >
              ⌬ Pendente
            </div>
            <div 
              class="dropdown-item ${stProgresso === 'em_andamento' ? 'ativo' : ''}" 
              data-value="em_andamento"
              onclick="alterarStatusProgresso(${tarefa.id}, 'em_andamento')"
            >
              ꆜ Em andamento
            </div>
          </div>
        </div>
      </div>

      <div class="checkbox-container">
        <input
          type="checkbox"
          ${tarefa.concluida ? "checked" : ""}
          onchange="alterarStatus(${tarefa.id}, this.checked)"
        >
        <span>Concluída</span>
      </div>

      <h5 style="font-size: 13px; color: var(--text-muted);">Descrição</h5>
      <p id="desc">${tarefa.descricao}</p>

      <hr>

      <h5 style="font-size: 13px; color: var(--text-muted);">Observação:</h5>
      <input
        class="obs-input"
        id="obs-${tarefa.id}"
        type="text"
        value="${tarefa.observacao || ""}"
      >
      <button
        class="salvar-btn"
        onclick="salvarObservacao(${tarefa.id})">
        Salvar observação
      </button>

      <hr>

      <h5 style="font-size: 13px; color: var(--text-muted);">Ações realizadas:</h5>
      <section class="acoes">
        ${(tarefa.acoes || []).map(acao => `
          <div class="acao-item">
            <span>• ${acao.texto}</span>
            <box-icon
              class="trash-btn"
              name="trash-alt"
              style="width:16px; height:16px;"
              onclick="removerAcao(${tarefa.id}, ${acao.id})">
            </box-icon>
          </div>
        `).join("")}
      </section>

      <button
        class="salvar-btn"
        onclick="abrirModalAcao(${tarefa.id})">
        + Nova ação
      </button>
    `;

    lista.appendChild(li);
  });

  inicializarDropdownsCustomizados();
}

// ===================================
// NOTIFICAÇÕES (TOAST)
// ===================================
function confirmarExclusaoTarefa() {
  if (idTarefaParaExcluir !== null) {
    deletarTarefa(idTarefaParaExcluir);
    fecharModalExclusao();
    exibirMensagemExclusao("Tarefa excluída com sucesso!");
  }
}

function exibirMensagemExclusao(texto) {
  if (!mensagemExclusao) return;
  mensagemExclusao.innerText = texto;
  mensagemExclusao.style.display = "block";

  setTimeout(() => {
    mensagemExclusao.style.display = "none";
  }, 3000);
}

function exibirMensagemObservacao(texto) {
  if (!mensagemObservacao) return;
  mensagemObservacao.innerText = texto;
  mensagemObservacao.style.display = "block";

  setTimeout(() => {
    mensagemObservacao.style.display = "none";
  }, 3000);
}

// ===================================
// AÇÕES E MUTAÇÕES DE TAREFAS
// ===================================
function novaTarefa(event) {
  event.preventDefault();

  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];

  const nova = {
    id: Date.now(),
    titulo: titulo.value.trim(),
    prioridade: prioridade.value,
    statusProgresso: statusProgresso.value,
    descricao: descricao.value.trim(),
    observacao: observacao ? observacao.value.trim() : "",
    concluida: false,
    fixada: false,
    criadaEm: new Date().toISOString(),
    acoes: []
  };

  if (nova.titulo && nova.descricao) {
    tarefas.push(nova);
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    resetFormCriarTarefa();
    fecharModal();
    buscarTarefas();
  } else {
    alert("Preencha todos os campos obrigatórios.");
  }
}

function alternarFixar(id) {
  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
  const tarefa = tarefas.find(t => t.id === id);

  if (tarefa) {
    tarefa.fixada = !tarefa.fixada;
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    buscarTarefas();
  }
}

function deletarTarefa(id) {
  let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
  tarefas = tarefas.filter(t => t.id !== id);
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
  buscarTarefas();
}

function alterarPrioridade(id, novaPrioridade) {
  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
  const tarefa = tarefas.find(t => t.id === id);

  if (tarefa) {
    tarefa.prioridade = novaPrioridade;
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    buscarTarefas();
  }
}

function alterarStatusProgresso(id, novoStatus) {
  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
  const tarefa = tarefas.find(t => t.id === id);

  if (tarefa) {
    tarefa.statusProgresso = novoStatus;
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    buscarTarefas();
  }
}

function alterarStatus(id, concluida) {
  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
  const tarefa = tarefas.find(t => t.id === id);

  if (tarefa) {
    tarefa.concluida = concluida;
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    buscarTarefas();
  }
}

function salvarObservacao(id) {
  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
  const tarefa = tarefas.find(t => t.id === id);
  const inputObs = document.getElementById(`obs-${id}`);

  if (tarefa && inputObs) {
    tarefa.observacao = inputObs.value.trim();
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    buscarTarefas();
    exibirMensagemObservacao("Observação salva com sucesso!");
  }
}

function salvarNovaAcao(event) {
  event.preventDefault();
  if (!tarefaAtual) return;

  const textoAcaoInput = document.getElementById("textoAcao");
  const texto = textoAcaoInput ? textoAcaoInput.value.trim() : "";

  if (!texto) return;

  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
  const tarefa = tarefas.find(t => t.id === tarefaAtual);

  if (tarefa) {
    if (!tarefa.acoes) tarefa.acoes = [];
    tarefa.acoes.push({
      id: Date.now(),
      texto: texto
    });
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    fecharModalAcao();
    buscarTarefas();
  }
}

function removerAcao(tarefaId, acaoId) {
  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
  const tarefa = tarefas.find(t => t.id === tarefaId);

  if (tarefa && tarefa.acoes) {
    tarefa.acoes = tarefa.acoes.filter(a => a.id !== acaoId);
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    buscarTarefas();
  }
}