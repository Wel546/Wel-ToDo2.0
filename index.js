// Seletores
const titulo = document.getElementById("titulo");
const descricao = document.getElementById("descricao");
const observacao = document.getElementById("observacao");
const lista = document.getElementById("lista");
const overlay = document.getElementById("overlay");
const criarTarefa = document.getElementById("criarTarefa");
const busca = document.getElementById("busca");

let tarefaAtual = null;

// Modal
function abrirModal() {
  overlay.classList.add("active");
  criarTarefa.classList.add("active");
}

function fecharModal() {
  overlay.classList.remove("active");
  criarTarefa.classList.remove("active");
}

// Buscar tarefas
function buscarTarefas() {
  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
  inserirTarefas(tarefas);
}

// Inserir tarefas
function inserirTarefas(tarefas) {

  lista.innerHTML = "";

  if (tarefas.length === 0) {
    lista.innerHTML = "<h6>Nenhuma tarefa registrada</h6>";
    return;
  }

  tarefas.forEach(tarefa => {

    const li = document.createElement("li");

    if (tarefa.concluida) {
      li.classList.add("concluida");
    }

li.innerHTML = `
  <h5>${tarefa.titulo}</h5>

  <div class="checkbox-container">
    <input
      type="checkbox"
      ${tarefa.concluida ? "checked" : ""}
      onchange="alterarStatus(${tarefa.id}, this.checked)"
    >
    <span>Concluída</span>
  </div>

  <h5>Descrição</h5>
  
  <p>${tarefa.descricao}</p>

  <hr>

  <h5 id="h5obs">Observação:</h5>

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

  <h5>Ações realizadas:</h5>

  <section class="acoes">

    ${(tarefa.acoes || []).map(acao => `
      <div class="acao-item">

        <span>${acao.texto}</span>

        <box-icon
          class="trash"
          name="trash-alt"
          onclick="removerAcao(${tarefa.id}, ${acao.id})">
        </box-icon>
        </div>

        <hr>
      
    `).join("")}

  </section>


  <button
    class="salvar-btn"
    onclick="abrirModalAcao(${tarefa.id})">
    Nova ação
  </button>

  <div class="t">
    <box-icon
      name="trash-alt"
      onclick="deletarTarefa(${tarefa.id})">
    </box-icon>
  </div>
`;
    lista.appendChild(li);

  });

}

function abrirModalAcao(id) {
  tarefaAtual = id;
  overlay.classList.add("active");
  modalAcao.classList.add("active");
}

function fecharModalAcao() {
  modalAcao.classList.remove("active");
  document.getElementById("textoAcao").value = "";
}

function salvarNovaAcao(event) {
  event.preventDefault();

  const texto = document.getElementById("textoAcao").value.trim();
  if (!texto) return;

  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];

  const tarefa = tarefas.find(t => t.id === tarefaAtual);

  if (!tarefa.acoes) tarefa.acoes = [];

  tarefa.acoes.push({
    id: Date.now(),
    texto

  overlay.classList.remove("active");
  });

  localStorage.setItem("tarefas", JSON.stringify(tarefas));

  fecharModalAcao();

  overlay.classList.remove("active");

  buscarTarefas();
}

function removerAcao(idTarefa, idAcao) {
  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];

  const tarefa = tarefas.find(t => t.id === idTarefa);

  tarefa.acoes = tarefa.acoes.filter(a => a.id !== idAcao);

  localStorage.setItem("tarefas", JSON.stringify(tarefas));

  buscarTarefas();
}

// Nova tarefa
function novaTarefa(event) {

  event.preventDefault();

  const tarefas =
    JSON.parse(localStorage.getItem("tarefas")) || [];

  const nova = {
    id: Date.now(),
    titulo: titulo.value.trim(),
    descricao: descricao.value.trim(),
    observacao: observacao.value.trim(),
    concluida: false
  };

  if (nova.titulo && nova.descricao) {

    tarefas.push(nova);

    localStorage.setItem(
      "tarefas",
      JSON.stringify(tarefas)
    );

    document
      .querySelector("#criarTarefa form")
      .reset();

    fecharModal();
    buscarTarefas();

  } else {

    alert("Preencha os campos obrigatórios.");

  }

}

// Salvar observação
function salvarObservacao(id) {

  const tarefas =
    JSON.parse(localStorage.getItem("tarefas")) || [];

  const tarefa =
    tarefas.find(t => t.id === id);

  if (!tarefa) return;

  tarefa.observacao =
    document.getElementById(`obs-${id}`).value;

  localStorage.setItem(
    "tarefas",
    JSON.stringify(tarefas)
  );

  alert("Observação salva!");
}

// Alterar status
function alterarStatus(id, concluida) {

  const tarefas =
    JSON.parse(localStorage.getItem("tarefas")) || [];

  const tarefa =
    tarefas.find(t => t.id === id);

  if (!tarefa) return;

  tarefa.concluida = concluida;

  localStorage.setItem(
    "tarefas",
    JSON.stringify(tarefas)
  );

  buscarTarefas();
}

// Deletar
function deletarTarefa(id) {

  let tarefas =
    JSON.parse(localStorage.getItem("tarefas")) || [];

  tarefas =
    tarefas.filter(t => t.id !== id);

  localStorage.setItem(
    "tarefas",
    JSON.stringify(tarefas)
  );

  buscarTarefas();
}

// Pesquisa
function pesquisarTarefa() {

  const termo =
    busca.value.toLowerCase();

  const itens =
    document.querySelectorAll("#lista li");

  itens.forEach(item => {

    const titulo =
      item.querySelector("h5")
      .innerText
      .toLowerCase();

    item.classList.toggle(
      "oculto",
      !titulo.includes(termo)
    );

  });

}

// ESC
document.addEventListener("keydown", event => {

  if (
    event.key === "Escape" &&
    criarTarefa.classList.contains("active")
  ) {
    fecharModal();
  }

});

// Inicializar
buscarTarefas();
