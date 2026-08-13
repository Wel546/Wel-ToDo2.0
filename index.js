// Seletores principais
const titulo = document.getElementById("titulo");
const descricao = document.getElementById("descricao");
const observacao = document.getElementById("observacao");
const prioridade = document.getElementById("prioridade");
const lista = document.getElementById("lista");
const overlay = document.getElementById("overlay");
const criarTarefa = document.getElementById("criarTarefa");
const busca = document.getElementById("busca");
const modalAcao = document.getElementById("modalAcao");
const modalAparencia = document.getElementById("modalAparencia");
const ordenarPor = document.getElementById("ordenarPor");
const filtrarPrioridade = document.getElementById("filtrarPrioridade");

let tarefaAtual = null;

// ===================================
// SISTEMA DE DROPDOWNS CUSTOMIZADOS
// ===================================
function inicializarDropdownsCustomizados() {
  document.querySelectorAll('.dropdown-custom').forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const items = dropdown.querySelectorAll('.dropdown-item');
    const selectOriginal = dropdown.parentElement.querySelector('select');

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.dropdown-custom').forEach(d => {
        if (d !== dropdown) d.classList.remove('ativo');
      });
      dropdown.classList.toggle('ativo');
    });

    items.forEach(item => {
      item.addEventListener('click', () => {
        trigger.querySelector('span').innerText = item.innerText;
        
        items.forEach(i => i.classList.remove('ativo'));
        item.classList.add('ativo');

        if (selectOriginal) {
          selectOriginal.value = item.getAttribute('data-value');
          buscarTarefas();
        }

        dropdown.classList.remove('ativo');
      });
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-custom').forEach(d => d.classList.remove('ativo'));
  });
}

// ===================================
// SISTEMA DE APARÊNCIA E PAPEL DE PAREDE
// ===================================

function abrirModalAparencia() {
  overlay.classList.add("active");
  modalAparencia.classList.add("active");
}

function fecharModalAparencia() {
  modalAparencia.classList.remove("active");
  overlay.classList.remove("active");
}

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

// Upload de arquivo local do computador
function uploadPapelParede(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const base64Image = e.target.result;
      document.documentElement.style.setProperty('--bg-image', `url('${base64Image}')`);
      document.getElementById("bgUrl").value = ""; // limpa o campo de URL
      salvarPreferenciaAparencia();
    };
    reader.readAsDataURL(file);
  }
}

// Aplicação via URL de imagem
function aplicarPapelParede() {
  const url = document.getElementById("bgUrl").value.trim();
  if (url) {
    document.documentElement.style.setProperty('--bg-image', `url('${url}')`);
    document.getElementById("bgFile").value = ""; // limpa o input de arquivo
    salvarPreferenciaAparencia();
  }
}

// Removendo o papel de parede
function removerPapelParede() {
  document.documentElement.style.setProperty('--bg-image', 'none');
  document.getElementById("bgUrl").value = "";
  document.getElementById("bgFile").value = "";
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
    
    // Se for URL externa, preenche o campo correspondente
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

  const termo = busca.value.toLowerCase().trim();
  if (termo) {
    tarefas = tarefas.filter(t => 
      t.titulo.toLowerCase().includes(termo) || 
      t.descricao.toLowerCase().includes(termo)
    );
  }

  const prioFiltro = filtrarPrioridade.value;
  if (prioFiltro !== "todas") {
    tarefas = tarefas.filter(t => t.prioridade === prioFiltro);
  }

  const criterio = ordenarPor.value;
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

    if (tarefa.concluida) li.classList.add("concluida");
    if (tarefa.fixada) li.classList.add("fixada");

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
            onclick="deletarTarefa(${tarefa.id})"
            title="Excluir tarefa">
          </box-icon>
        </div>
      </div>

      <div class="badge-container">
        <span class="badge badge-${tarefa.prioridade}">${tarefa.prioridade}</span>
        <span class="data-registro">Criado: ${formatarData(tarefa.criadaEm)}</span>
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
        style="background-color: var(--text-muted);"
        onclick="abrirModalAcao(${tarefa.id})">
        + Nova ação
      </button>
    `;

    lista.appendChild(li);
  });
}

// Modais
function abrirModal() {
  overlay.classList.add("active");
  criarTarefa.classList.add("active");
}

function fecharModal() {
  overlay.classList.remove("active");
  criarTarefa.classList.remove("active");
}

function abrirModalAcao(id) {
  tarefaAtual = id;
  overlay.classList.add("active");
  modalAcao.classList.add("active");
}

function fecharModalAcao() {
  modalAcao.classList.remove("active");
  document.getElementById("textoAcao").value = "";
  overlay.classList.remove("active");
}

function fecharTodosModais() {
  overlay.classList.remove("active");
  criarTarefa.classList.remove("active");
  modalAcao.classList.remove("active");
  modalAparencia.classList.remove("active");
  document.getElementById("textoAcao").value = "";
}

overlay.addEventListener("click", fecharTodosModais);

// Ações
function novaTarefa(event) {
  event.preventDefault();

  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];

  const nova = {
    id: Date.now(),
    titulo: titulo.value.trim(),
    prioridade: prioridade.value,
    descricao: descricao.value.trim(),
    observacao: observacao.value.trim(),
    concluida: false,
    fixada: false,
    criadaEm: new Date().toISOString(),
    acoes: []
  };

  if (nova.titulo && nova.descricao) {
    tarefas.push(nova);
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    document.querySelector("#criarTarefa form").reset();
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

  if (tarefa) {
    tarefa.observacao = document.getElementById(`obs-${id}`).value;
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    alert("Observação salva com sucesso!");
  }
}

function salvarNovaAcao(event) {
  event.preventDefault();
  const texto = document.getElementById("textoAcao").value.trim();
  if (!texto) return;

  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
  const tarefa = tarefas.find(t => t.id === tarefaAtual);

  if (tarefa) {
    if (!tarefa.acoes) tarefa.acoes = [];
    tarefa.acoes.push({ id: Date.now(), texto });
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    fecharModalAcao();
    buscarTarefas();
  }
}

function removerAcao(idTarefa, idAcao) {
  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
  const tarefa = tarefas.find(t => t.id === idTarefa);

  if (tarefa) {
    tarefa.acoes = tarefa.acoes.filter(a => a.id !== idAcao);
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
    buscarTarefas();
  }
}

function deletarTarefa(id) {
  if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;

  let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
  tarefas = tarefas.filter(t => t.id !== id);
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
  buscarTarefas();
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") fecharTodosModais();
});

// Inicialização
carregarPreferenciaAparencia();
inicializarDropdownsCustomizados();
buscarTarefas();