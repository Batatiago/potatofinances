// Seleciona elementos do formulário.
const form = document.getElementById("formTransacao");
const descricaoInput = document.getElementById("descricao");
const valorInput = document.getElementById("valor");
const dataInput = document.getElementById("data");
const tipoInput = document.getElementById("tipo");
const categoriaInput = document.getElementById("categoria");
const categoriaWrap = document.getElementById("categoriaWrap");
const parceladoInput = document.getElementById("parcelado");
const parcelasInput = document.getElementById("parcelas");
const parcelWrap = document.getElementById("parcelWrap");
const investimentoWrap = document.getElementById("investimentoWrap");
const listaCaixinhasEl = document.getElementById("listaCaixinhas");
const btnAdicionarCaixinha = document.getElementById("btnAdicionarCaixinha");
const inputNovaCaixinha = document.getElementById("inputNovaCaixinha");
const inputMetaCaixinha = document.getElementById("inputMetaCaixinha");

// Seleciona botões visuais para trocar tipo.
const btnTipoDespesa = document.getElementById("btnTipoDespesa");
const btnTipoReceita = document.getElementById("btnTipoReceita");
const btnTipoInvestimento = document.getElementById("btnTipoInvestimento");

// Seleciona elementos do modal de nova transação.
const modalOverlay = document.getElementById("modalOverlay");
const modalTransacao = document.getElementById("modalTransacao");
const btnAbrirModal = document.getElementById("btnAbrirModal");
const btnFecharModal = document.getElementById("btnFecharModal");
const btnTema = document.getElementById("btnTema");
const confirmOverlay = document.getElementById("confirmOverlay");
const confirmMensagem = document.getElementById("confirmMensagem");
const btnConfirmCancelar = document.getElementById("btnConfirmCancelar");
const btnConfirmAtual = document.getElementById("btnConfirmAtual");
const btnConfirmTodas = document.getElementById("btnConfirmTodas");

// Seleciona cartões de resumo.
const totalReceitasEl = document.getElementById("totalReceitas");
const totalDespesasEl = document.getElementById("totalDespesas");
const saldoEl = document.getElementById("saldo");
const saldoStatusEl = document.getElementById("saldoStatus");
const totalInvestimentosEl = document.getElementById("totalInvestimentos");
const qtdReceitasEl = document.getElementById("qtdReceitas");
const qtdDespesasEl = document.getElementById("qtdDespesas");

// Seleciona elementos de período e histórico.
const selectedYearEl = document.getElementById("selectedYear");
const monthButtonsEl = document.getElementById("monthButtons");
const historyTitleEl = document.getElementById("historyTitle");
const barTitleEl = document.getElementById("barTitle");
const listaTransacoes = document.getElementById("listaTransacoes");
const caixinhasCardsEl = document.getElementById("caixinhasCards");
const caixinhasResumoEl = document.getElementById("caixinhasResumo");

// Seleciona botões de navegação do ano.
const prevYearBtn = document.getElementById("prevYear");
const nextYearBtn = document.getElementById("nextYear");

// Seleciona filtros da lista.
const filtroTodasBtn = document.getElementById("filtroTodas");
const filtroReceitasBtn = document.getElementById("filtroReceitas");
const filtroDespesasBtn = document.getElementById("filtroDespesas");
const filtroInvestimentosBtn = document.getElementById("filtroInvestimentos");

// Seleciona canvas e legenda dos gráficos.
const barChartCanvas = document.getElementById("barChart");
const donutChartCanvas = document.getElementById("donutChart");
const donutLegendEl = document.getElementById("donutLegend");

// Nomes dos meses para interface.
const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Categorias por tipo.
const categoriasDespesa = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Lazer",
  "Educação",
  "Roupas",
  "Tecnologia",
  "Outros"
];

const categoriasReceita = ["Salário", "Salário Abbraccio", "Freelance", "Outros"];

// Cores da rosca por categoria.
const categoriaCores = {
  Moradia: "#7e55f6",
  "Alimentação": "#e34195",
  Saúde: "#f5aa14",
  Tecnologia: "#00b985",
  Lazer: "#3a7fed",
  Transporte: "#eb7e21",
  Educação: "#7e8bff",
  Roupas: "#3ab3d6",
  Salário: "#08b670",
  "Salário Abbraccio": "#05995c",
  Freelance: "#34b67a",
  Investimentos: "#4bb8ff",
  Outros: "#8fa1c0"
};

// Recupera transações e caixinhas salvas.
let transacoes = normalizarTransacoes(JSON.parse(localStorage.getItem("transacoes")) || []);
let caixinhas = normalizarCaixinhas(JSON.parse(localStorage.getItem("caixinhasInvestimento")) || []);

// Guarda edição atual. Quando null, está em modo de criação.
let transacaoEmEdicaoId = null;
let exclusaoPendente = null;

// Define período inicial como mês/ano atual.
const hoje = new Date();
let mesSelecionado = hoje.getMonth();
let anoSelecionado = hoje.getFullYear();

// Filtro inicial do histórico.
let filtroAtual = "todas";

// Data padrão do formulário.
dataInput.value = formatarDataInput(hoje);

// Atualiza texto do botão de tema conforme estado atual.
function atualizarTextoBotaoTema() {
  const dark = document.body.classList.contains("dark-theme");
  btnTema.textContent = dark ? "☀️ Modo claro" : "🌙 Modo noturno";
}

// Aplica tema e salva preferência.
function aplicarTema(tema) {
  document.body.classList.toggle("dark-theme", tema === "dark");
  localStorage.setItem("temaDashboard", tema);
  atualizarTextoBotaoTema();
}

// Alterna tema.
function alternarTema() {
  const darkAtivo = document.body.classList.contains("dark-theme");
  aplicarTema(darkAtivo ? "light" : "dark");
}

// Formata número em moeda brasileira.
function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Converte Date para yyyy-mm-dd.
function formatarDataInput(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

// Converte yyyy-mm-dd para dd/mm/yyyy.
function formatarDataVisual(isoDate) {
  const [ano, mes, dia] = isoDate.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Normaliza transações antigas para o formato novo.
function normalizarTransacoes(lista) {
  return lista.map((item) => {
    const dataSegura = typeof item.data === "string" && item.data ? item.data : formatarDataInput(new Date());

    return {
      id: item.id || `tx-${Math.random().toString(36).slice(2, 10)}`,
      descricao: item.descricao || "Transação sem descrição",
      valor: Number(item.valor) || 0,
      tipo: ["receita", "despesa", "investimento"].includes(item.tipo) ? item.tipo : "despesa",
      data: dataSegura,
      categoria: item.categoria || "Outros",
      parcelaAtual: item.parcelaAtual || null,
      totalParcelas: item.totalParcelas || null,
      parcelamentoId: item.parcelamentoId || null,
      caixinhas: Array.isArray(item.caixinhas) ? item.caixinhas : []
    };
  });
}

// Normaliza caixinhas salvas para o formato objeto { nome, meta }.
function normalizarCaixinhas(lista) {
  return lista
    .map((item) => {
      if (typeof item === "string") {
        return { nome: item, meta: 0 };
      }

      return {
        nome: (item?.nome || "").trim(),
        meta: Number(item?.meta) || 0
      };
    })
    .filter((item) => item.nome);
}

// Persiste dados.
function salvar() {
  localStorage.setItem("transacoes", JSON.stringify(transacoes));
  localStorage.setItem("caixinhasInvestimento", JSON.stringify(caixinhas));
}

// Retorna transações do mês/ano selecionados.
function obterTransacoesDoPeriodo() {
  return transacoes.filter((t) => {
    const data = new Date(`${t.data}T00:00:00`);
    return data.getMonth() === mesSelecionado && data.getFullYear() === anoSelecionado;
  });
}

// Aplica filtro do histórico.
function filtrarPorTipo(lista) {
  if (filtroAtual === "todas") return lista;
  return lista.filter((t) => t.tipo === filtroAtual);
}

// Renderiza botões de mês.
function renderizarBotoesMes() {
  monthButtonsEl.innerHTML = "";

  meses.forEach((mesNome, indice) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `chip ${indice === mesSelecionado ? "active" : ""}`;
    btn.textContent = mesNome;

    btn.addEventListener("click", () => {
      mesSelecionado = indice;
      atualizarDashboard();
    });

    monthButtonsEl.appendChild(btn);
  });
}

// Atualiza estado dos filtros de histórico.
function atualizarBotoesFiltro() {
  [filtroTodasBtn, filtroReceitasBtn, filtroDespesasBtn, filtroInvestimentosBtn].forEach((btn) => {
    btn.classList.remove("active");
  });

  if (filtroAtual === "todas") filtroTodasBtn.classList.add("active");
  if (filtroAtual === "receita") filtroReceitasBtn.classList.add("active");
  if (filtroAtual === "despesa") filtroDespesasBtn.classList.add("active");
  if (filtroAtual === "investimento") filtroInvestimentosBtn.classList.add("active");
}

// Define tipo e atualiza botões visuais.
function definirTipo(tipo) {
  const categoriaAnterior = categoriaInput.value;
  tipoInput.value = tipo;

  btnTipoDespesa.classList.toggle("active", tipo === "despesa");
  btnTipoReceita.classList.toggle("active", tipo === "receita");
  btnTipoInvestimento.classList.toggle("active", tipo === "investimento");

  popularCategoriasPorTipo(tipo, categoriaAnterior);
  atualizarEstadoParcelamento();
  atualizarEstadoInvestimento();
}

// Recarrega opções de categoria por tipo.
function popularCategoriasPorTipo(tipo, categoriaAtual = "") {
  categoriaInput.innerHTML = "";

  const opcoes = tipo === "receita" ? categoriasReceita : categoriasDespesa;

  opcoes.forEach((categoria) => {
    const option = document.createElement("option");
    option.value = categoria;
    option.textContent = categoria;
    categoriaInput.appendChild(option);
  });

  if (opcoes.includes(categoriaAtual)) {
    categoriaInput.value = categoriaAtual;
  } else {
    categoriaInput.value = opcoes[0];
  }
}

// Mostra/oculta seção de parcelamento.
function atualizarEstadoParcelamento() {
  const tipo = tipoInput.value;
  const parcelado = parceladoInput.checked;
  const deveExibir = tipo === "despesa";

  parcelWrap.style.display = deveExibir ? "grid" : "none";
  parcelasInput.disabled = !(deveExibir && parcelado);

  if (!deveExibir || !parcelado) {
    parcelasInput.value = "";
  }
}

// Mostra/oculta seção específica de investimentos.
function atualizarEstadoInvestimento() {
  const investimentoAtivo = tipoInput.value === "investimento";
  investimentoWrap.style.display = investimentoAtivo ? "grid" : "none";
  categoriaWrap.style.display = investimentoAtivo ? "none" : "block";
  descricaoInput.placeholder = investimentoAtivo ? "Opcional para investimento" : "Ex: Supermercado";
}

// Renderiza checkboxes de caixinhas.
function renderizarCaixinhas(selecionadas = []) {
  listaCaixinhasEl.innerHTML = "";

  if (caixinhas.length === 0) {
    const vazio = document.createElement("small");
    vazio.className = "empty-state";
    vazio.textContent = "Nenhuma caixinha cadastrada ainda.";
    listaCaixinhasEl.appendChild(vazio);
    return;
  }

  caixinhas.forEach(({ nome }) => {
    const label = document.createElement("label");
    label.className = "caixinha-item";

    const main = document.createElement("div");
    main.className = "caixinha-item-main";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = nome;
    input.checked = selecionadas.includes(nome);

    const texto = document.createElement("span");
    texto.textContent = nome;

    main.appendChild(input);
    main.appendChild(texto);

    const btnExcluir = document.createElement("button");
    btnExcluir.type = "button";
    btnExcluir.className = "caixinha-delete";
    btnExcluir.textContent = "Excluir";
    btnExcluir.setAttribute("data-excluir-caixinha", nome);
    btnExcluir.setAttribute("aria-label", `Excluir caixinha ${nome}`);

    label.appendChild(main);
    label.appendChild(btnExcluir);
    listaCaixinhasEl.appendChild(label);
  });
}

// Retorna as caixinhas marcadas no formulário.
function obterCaixinhasSelecionadas() {
  return Array.from(listaCaixinhasEl.querySelectorAll("input[type='checkbox']:checked")).map((el) => el.value);
}

// Exclui uma caixinha e remove referência dela nas transações.
function excluirCaixinha(nome) {
  caixinhas = caixinhas.filter((caixinha) => caixinha.nome !== nome);

  transacoes = transacoes.map((transacao) => {
    if (!Array.isArray(transacao.caixinhas) || transacao.caixinhas.length === 0) return transacao;
    return {
      ...transacao,
      caixinhas: transacao.caixinhas.filter((item) => item !== nome)
    };
  });

  salvar();
  renderizarCaixinhas(obterCaixinhasSelecionadas().filter((item) => item !== nome));
  atualizarDashboard();
}

// Abre modal.
function abrirModal() {
  modalOverlay.classList.add("open");
  modalOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  descricaoInput.focus();
}

// Fecha modal.
function fecharModal() {
  modalOverlay.classList.remove("open");
  modalOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  btnAbrirModal.focus();
}

// Prepara formulário para criar nova transação.
function prepararModoCriacao() {
  transacaoEmEdicaoId = null;
  form.reset();
  dataInput.value = formatarDataInput(new Date());
  definirTipo("despesa");
  renderizarCaixinhas([]);
  inputNovaCaixinha.value = "";
  inputMetaCaixinha.value = "";
}

// Preenche formulário para editar transação existente.
function iniciarEdicao(transacao) {
  transacaoEmEdicaoId = transacao.id;
  definirTipo(transacao.tipo);

  descricaoInput.value = transacao.descricao;
  valorInput.value = transacao.valor;
  dataInput.value = transacao.data;

  if (transacao.tipo !== "investimento") {
    categoriaInput.value = transacao.categoria;
  }

  renderizarCaixinhas(transacao.caixinhas || []);

  // Parcelamento não é reaplicado no modo edição para evitar gerar novas parcelas.
  parceladoInput.checked = false;
  parcelasInput.value = "";
  atualizarEstadoParcelamento();

  abrirModal();
}

// Remove transação.
function apagarTransacao(id) {
  transacoes = transacoes.filter((t) => t.id !== id);
  salvar();
  atualizarDashboard();
}

// Retorna todas as parcelas relacionadas a uma transação parcelada.
function obterParcelasRelacionadas(transacao) {
  if (!transacao.parcelaAtual || !transacao.totalParcelas) {
    return [transacao];
  }

  if (transacao.parcelamentoId) {
    return transacoes.filter((t) => t.parcelamentoId === transacao.parcelamentoId);
  }

  // Fallback para dados antigos sem parcelamentoId.
  return transacoes.filter((t) => {
    const mesmoGrupoBase =
      t.tipo === "despesa" &&
      t.descricao === transacao.descricao &&
      t.categoria === transacao.categoria &&
      t.totalParcelas === transacao.totalParcelas &&
      t.parcelaAtual !== null;
    return mesmoGrupoBase;
  });
}

// Abre modal de confirmação de exclusão.
function abrirConfirmacaoExclusao(transacao) {
  const relacionadas = obterParcelasRelacionadas(transacao);
  const ehParcelada = relacionadas.length > 1;

  exclusaoPendente = {
    idAtual: transacao.id,
    idsRelacionadas: relacionadas.map((t) => t.id),
    ehParcelada
  };

  confirmMensagem.textContent = ehParcelada
    ? "Esta é uma despesa parcelada. Você quer apagar apenas esta parcela ou todas as parcelas (todos os meses)?"
    : "Deseja realmente apagar esta transação?";

  btnConfirmAtual.textContent = ehParcelada ? "Apagar só esta parcela" : "Apagar transação";
  btnConfirmTodas.style.display = ehParcelada ? "inline-flex" : "none";

  confirmOverlay.classList.add("open");
  confirmOverlay.setAttribute("aria-hidden", "false");
}

// Fecha modal de confirmação.
function fecharConfirmacaoExclusao() {
  exclusaoPendente = null;
  confirmOverlay.classList.remove("open");
  confirmOverlay.setAttribute("aria-hidden", "true");
}

// Desenha gráfico anual (12 meses): receitas, despesas e investimentos.
function desenharGraficoBarrasAnual(ano) {
  const ctx = barChartCanvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = barChartCanvas.clientWidth;
  const height = 320;

  barChartCanvas.width = Math.floor(width * dpr);
  barChartCanvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const receitasMes = Array(12).fill(0);
  const despesasMes = Array(12).fill(0);
  const investimentosMes = Array(12).fill(0);

  transacoes.forEach((t) => {
    const data = new Date(`${t.data}T00:00:00`);
    if (data.getFullYear() !== ano) return;

    const mes = data.getMonth();
    if (t.tipo === "receita") receitasMes[mes] += t.valor;
    if (t.tipo === "despesa") despesasMes[mes] += t.valor;
    if (t.tipo === "investimento") investimentosMes[mes] += t.valor;
  });

  const maxValor = Math.max(1, ...receitasMes, ...despesasMes, ...investimentosMes);

  const paddingLeft = 42;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 36;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Eixos.
  ctx.strokeStyle = "#5f729633";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(paddingLeft, paddingTop);
  ctx.lineTo(paddingLeft, height - paddingBottom);
  ctx.lineTo(width - paddingRight, height - paddingBottom);
  ctx.stroke();

  const grupoLargura = chartWidth / 12;
  const barLargura = Math.max(3, grupoLargura / 5);

  for (let i = 0; i < 12; i += 1) {
    const baseX = paddingLeft + i * grupoLargura + grupoLargura / 2;
    const baseY = height - paddingBottom;

    const hR = (receitasMes[i] / maxValor) * (chartHeight - 18);
    const hD = (despesasMes[i] / maxValor) * (chartHeight - 18);
    const hI = (investimentosMes[i] / maxValor) * (chartHeight - 18);

    ctx.fillStyle = "#08b670";
    ctx.fillRect(baseX - barLargura - 2, baseY - hR, barLargura, hR);

    ctx.fillStyle = "#ff3f67";
    ctx.fillRect(baseX + 1, baseY - hD, barLargura, hD);

    ctx.fillStyle = "#4bb8ff";
    ctx.fillRect(baseX + barLargura + 4, baseY - hI, barLargura, hI);

    ctx.fillStyle = "#8a9dbc";
    ctx.font = "11px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(meses[i], baseX + 3, baseY + 16);
  }

  // Legenda do gráfico.
  ctx.textAlign = "left";
  ctx.font = "12px Segoe UI";

  ctx.fillStyle = "#08b670";
  ctx.fillRect(paddingLeft, 4, 10, 10);
  ctx.fillStyle = "#9fb0d1";
  ctx.fillText("Receitas", paddingLeft + 14, 13);

  ctx.fillStyle = "#ff3f67";
  ctx.fillRect(paddingLeft + 88, 4, 10, 10);
  ctx.fillStyle = "#9fb0d1";
  ctx.fillText("Despesas", paddingLeft + 102, 13);

  ctx.fillStyle = "#4bb8ff";
  ctx.fillRect(paddingLeft + 176, 4, 10, 10);
  ctx.fillStyle = "#9fb0d1";
  ctx.fillText("Investimentos", paddingLeft + 190, 13);

  if (maxValor === 1 && receitasMes.every((v) => v === 0) && despesasMes.every((v) => v === 0) && investimentosMes.every((v) => v === 0)) {
    ctx.fillStyle = "#8a9dbc";
    ctx.fillText("Sem dados no ano selecionado", paddingLeft, 30);
  }
}

// Desenha gráfico de rosca por categoria (mês atual selecionado).
function desenharGraficoDonut(transacoesPeriodo) {
  const despesas = transacoesPeriodo.filter((t) => t.tipo === "despesa");
  const porCategoria = {};

  despesas.forEach((t) => {
    porCategoria[t.categoria] = (porCategoria[t.categoria] || 0) + t.valor;
  });

  const itens = Object.entries(porCategoria);
  const total = itens.reduce((acc, [, valor]) => acc + valor, 0);

  const ctx = donutChartCanvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = donutChartCanvas.clientWidth;
  const height = 260;
  const size = Math.min(width, 260);

  donutChartCanvas.width = Math.floor(width * dpr);
  donutChartCanvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const raio = Math.max(40, size / 2 - 24);
  const espessura = Math.max(18, raio * 0.28);

  if (total <= 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, raio, 0, Math.PI * 2);
    ctx.lineWidth = espessura;
    ctx.strokeStyle = "#e9eef7";
    ctx.stroke();

    ctx.fillStyle = "#8a9dbc";
    ctx.font = "14px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText("Sem despesas", cx, cy + 5);

    donutLegendEl.innerHTML = "<span><i style='background:#e9eef7'></i>Sem dados</span>";
    return;
  }

  let anguloInicial = -Math.PI / 2;
  donutLegendEl.innerHTML = "";

  itens.forEach(([categoria, valor]) => {
    const proporcao = valor / total;
    const anguloFinal = anguloInicial + Math.PI * 2 * proporcao;
    const cor = categoriaCores[categoria] || categoriaCores.Outros;

    ctx.beginPath();
    ctx.arc(cx, cy, raio, anguloInicial, anguloFinal);
    ctx.lineWidth = espessura;
    ctx.strokeStyle = cor;
    ctx.stroke();

    const itemLegenda = document.createElement("span");
    itemLegenda.innerHTML = `<i style=\"background:${cor}\"></i>${categoria}`;
    donutLegendEl.appendChild(itemLegenda);

    anguloInicial = anguloFinal;
  });

  ctx.fillStyle = "#0f1d3a";
  ctx.font = "bold 16px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText(formatarMoeda(total), cx, cy + 5);
}

// Renderiza histórico com ações de editar/apagar.
function renderizarHistorico(transacoesPeriodo) {
  const listaFiltrada = filtrarPorTipo(transacoesPeriodo)
    .slice()
    .sort((a, b) => b.data.localeCompare(a.data));

  listaTransacoes.innerHTML = "";

  if (listaFiltrada.length === 0) {
    const vazio = document.createElement("li");
    vazio.className = "empty-state";
    vazio.textContent = "Nenhuma transação neste mês para o filtro selecionado.";
    listaTransacoes.appendChild(vazio);
    return;
  }

  const hojeISO = formatarDataInput(new Date());

  listaFiltrada.forEach((t) => {
    const item = document.createElement("li");
    item.className = "transaction-item";

    const parcelaTexto = t.parcelaAtual && t.totalParcelas ? ` • Parcela ${t.parcelaAtual}/${t.totalParcelas}` : "";
    const futuroTexto = t.data > hojeISO ? '<span class="future-badge">Futura</span>' : "";
    const caixinhasTexto = t.tipo === "investimento" && t.caixinhas?.length > 0 ? ` • Caixinhas: ${t.caixinhas.join(", ")}` : "";

    item.innerHTML = `
      <div class=\"transaction-main\">
        <strong>${t.descricao} ${futuroTexto}</strong>
        <span>${t.categoria} • ${formatarDataVisual(t.data)}${parcelaTexto}${caixinhasTexto}</span>
      </div>
      <div class=\"transaction-actions\">
        <span class=\"transaction-value ${t.tipo}\">${t.tipo === "despesa" ? "-" : "+"}${formatarMoeda(t.valor)}</span>
        <button class=\"action-btn\" data-acao=\"editar\" data-id=\"${t.id}\">Editar</button>
        <button class=\"action-btn danger\" data-acao=\"apagar\" data-id=\"${t.id}\">Apagar</button>
      </div>
    `;

    listaTransacoes.appendChild(item);
  });
}

// Renderiza os cards visuais das caixinhas de investimento.
function renderizarCaixinhasVisuais(transacoesPeriodo) {
  const investimentos = transacoesPeriodo.filter((t) => t.tipo === "investimento");
  const totais = {};

  caixinhas.forEach(({ nome }) => {
    totais[nome] = 0;
  });

  investimentos.forEach((transacao) => {
    const selecionadas = transacao.caixinhas?.length ? transacao.caixinhas : [];
    if (selecionadas.length === 0) return;

    // Divide o valor igualmente entre as caixinhas selecionadas.
    const valorPorCaixinha = transacao.valor / selecionadas.length;
    selecionadas.forEach((nome) => {
      totais[nome] = (totais[nome] || 0) + valorPorCaixinha;
    });
  });

  const totalInvestido = Object.values(totais).reduce((acc, valor) => acc + valor, 0);
  caixinhasResumoEl.textContent = `Total: ${formatarMoeda(totalInvestido)}`;

  caixinhasCardsEl.innerHTML = "";

  if (caixinhas.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "empty-state";
    vazio.textContent = "Nenhuma caixinha criada ainda.";
    caixinhasCardsEl.appendChild(vazio);
    return;
  }

  caixinhas.forEach(({ nome, meta }) => {
    const valor = totais[nome] || 0;
    const percentualMeta = meta > 0 ? Math.min(100, (valor / meta) * 100) : 0;

    const card = document.createElement("article");
    card.className = "caixinha-card";
    card.innerHTML = `
      <h4>${nome}</h4>
      <div class="caixinha-bar"><span style="width:${percentualMeta.toFixed(1)}%"></span></div>
      <div class="caixinha-meta">
        <strong>${formatarMoeda(valor)}</strong>
        <small>${meta > 0 ? `Meta: ${formatarMoeda(meta)} • ${percentualMeta.toFixed(1)}%` : "Meta não definida"}</small>
      </div>
    `;
    caixinhasCardsEl.appendChild(card);
  });
}

// Atualiza dashboard completo.
function atualizarDashboard() {
  const transacoesPeriodo = obterTransacoesDoPeriodo();

  const receitas = transacoesPeriodo
    .filter((t) => t.tipo === "receita")
    .reduce((acc, t) => acc + t.valor, 0);

  const despesas = transacoesPeriodo
    .filter((t) => t.tipo === "despesa")
    .reduce((acc, t) => acc + t.valor, 0);

  const investimentos = transacoesPeriodo
    .filter((t) => t.tipo === "investimento")
    .reduce((acc, t) => acc + t.valor, 0);

  const qtdReceitas = transacoesPeriodo.filter((t) => t.tipo === "receita").length;
  const qtdDespesas = transacoesPeriodo.filter((t) => t.tipo === "despesa").length;

  const saldo = receitas - despesas - investimentos;

  selectedYearEl.textContent = String(anoSelecionado);
  historyTitleEl.textContent = `${meses[mesSelecionado]} - ${anoSelecionado} (${transacoesPeriodo.length} transações)`;
  barTitleEl.textContent = `Visão anual - ${anoSelecionado}`;

  totalReceitasEl.textContent = formatarMoeda(receitas);
  totalDespesasEl.textContent = formatarMoeda(despesas);
  saldoEl.textContent = formatarMoeda(saldo);
  qtdReceitasEl.textContent = String(qtdReceitas);
  qtdDespesasEl.textContent = String(qtdDespesas);
  totalInvestimentosEl.textContent = formatarMoeda(investimentos);

  if (saldo > 0) saldoStatusEl.textContent = "Saldo positivo";
  if (saldo === 0) saldoStatusEl.textContent = "Saldo neutro";
  if (saldo < 0) saldoStatusEl.textContent = "Saldo negativo";

  saldoEl.classList.toggle("positive", saldo >= 0);
  saldoEl.classList.toggle("negative", saldo < 0);

  renderizarBotoesMes();
  atualizarBotoesFiltro();
  renderizarCaixinhasVisuais(transacoesPeriodo);
  renderizarHistorico(transacoesPeriodo);
  desenharGraficoBarrasAnual(anoSelecionado);
  desenharGraficoDonut(transacoesPeriodo);
}

// Soma meses para geração de parcelas futuras.
function adicionarMeses(isoDate, quantidade) {
  const data = new Date(`${isoDate}T00:00:00`);
  const diaOriginal = data.getDate();

  data.setMonth(data.getMonth() + quantidade);

  if (data.getDate() < diaOriginal) {
    data.setDate(0);
  }

  return formatarDataInput(data);
}

// Divide valor total em parcelas.
function calcularValoresParcelas(valorTotal, totalParcelas) {
  const baseCentavos = Math.floor((valorTotal * 100) / totalParcelas);
  const totalBase = baseCentavos * totalParcelas;
  const sobra = Math.round(valorTotal * 100 - totalBase);

  return Array.from({ length: totalParcelas }, (_, i) => {
    const centavos = baseCentavos + (i < sobra ? 1 : 0);
    return centavos / 100;
  });
}

// Envio do formulário.
form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const descricaoDigitada = descricaoInput.value.trim();
  const valor = Number.parseFloat(valorInput.value);
  const data = dataInput.value;
  const tipo = tipoInput.value;
  const descricao = tipo === "investimento" ? (descricaoDigitada || "Investimento") : descricaoDigitada;

  if (!descricao && tipo !== "investimento") return;
  if (Number.isNaN(valor) || valor <= 0) return;
  if (!data) return;
  if (!["receita", "despesa", "investimento"].includes(tipo)) return;

  if (transacaoEmEdicaoId) {
    const alvo = transacoes.find((t) => t.id === transacaoEmEdicaoId);
    if (!alvo) return;

    const eraParcelada = Boolean(alvo.parcelaAtual && alvo.totalParcelas);
    alvo.descricao = descricao;
    alvo.valor = valor;
    alvo.data = data;
    alvo.tipo = tipo;
    alvo.categoria = tipo === "investimento" ? "Investimentos" : (categoriaInput.value || "Outros");
    alvo.caixinhas = tipo === "investimento" ? obterCaixinhasSelecionadas() : [];
    if (!eraParcelada || tipo !== "despesa") {
      alvo.parcelaAtual = null;
      alvo.totalParcelas = null;
      alvo.parcelamentoId = null;
    }
  } else {
    const categoria = tipo === "investimento" ? "Investimentos" : (categoriaInput.value || "Outros");
    const caixinhasSelecionadas = tipo === "investimento" ? obterCaixinhasSelecionadas() : [];

    const isParcelada = tipo === "despesa" && parceladoInput.checked;
    const totalParcelas = isParcelada ? Number.parseInt(parcelasInput.value, 10) : 1;

    if (isParcelada && (!totalParcelas || totalParcelas < 2)) return;

    if (isParcelada) {
      const parcelamentoId = `parc-${Math.random().toString(36).slice(2, 10)}`;
      const valoresParcelas = calcularValoresParcelas(valor, totalParcelas);

      valoresParcelas.forEach((valorParcela, indice) => {
        transacoes.push({
          id: `tx-${Math.random().toString(36).slice(2, 10)}`,
          descricao,
          valor: valorParcela,
          tipo,
          data: adicionarMeses(data, indice),
          categoria,
          parcelaAtual: indice + 1,
          totalParcelas,
          parcelamentoId,
          caixinhas: []
        });
      });
    } else {
      transacoes.push({
        id: `tx-${Math.random().toString(36).slice(2, 10)}`,
        descricao,
        valor,
        tipo,
        data,
        categoria,
        parcelaAtual: null,
        totalParcelas: null,
        parcelamentoId: null,
        caixinhas: caixinhasSelecionadas
      });
    }
  }

  salvar();

  const dataLancada = new Date(`${data}T00:00:00`);
  mesSelecionado = dataLancada.getMonth();
  anoSelecionado = dataLancada.getFullYear();

  atualizarDashboard();
  prepararModoCriacao();
  fecharModal();
});

// Delegação de cliques dos botões editar/apagar no histórico.
listaTransacoes.addEventListener("click", (evento) => {
  const botao = evento.target.closest("button[data-acao]");
  if (!botao) return;

  const id = botao.getAttribute("data-id");
  const acao = botao.getAttribute("data-acao");
  const transacao = transacoes.find((t) => t.id === id);
  if (!transacao) return;

  if (acao === "editar") {
    iniciarEdicao(transacao);
    return;
  }

  if (acao === "apagar") {
    abrirConfirmacaoExclusao(transacao);
  }
});

// Filtros de histórico.
filtroTodasBtn.addEventListener("click", () => {
  filtroAtual = "todas";
  atualizarDashboard();
});

filtroReceitasBtn.addEventListener("click", () => {
  filtroAtual = "receita";
  atualizarDashboard();
});

filtroDespesasBtn.addEventListener("click", () => {
  filtroAtual = "despesa";
  atualizarDashboard();
});

filtroInvestimentosBtn.addEventListener("click", () => {
  filtroAtual = "investimento";
  atualizarDashboard();
});

// Navegação entre anos.
prevYearBtn.addEventListener("click", () => {
  anoSelecionado -= 1;
  atualizarDashboard();
});

nextYearBtn.addEventListener("click", () => {
  anoSelecionado += 1;
  atualizarDashboard();
});

// Botões de tipo no modal.
btnTipoDespesa.addEventListener("click", () => definirTipo("despesa"));
btnTipoReceita.addEventListener("click", () => definirTipo("receita"));
btnTipoInvestimento.addEventListener("click", () => definirTipo("investimento"));

// Controle de parcelamento.
parceladoInput.addEventListener("change", atualizarEstadoParcelamento);

// Abertura/fechamento do modal.
btnAbrirModal.addEventListener("click", () => {
  prepararModoCriacao();
  abrirModal();
});

btnFecharModal.addEventListener("click", () => {
  prepararModoCriacao();
  fecharModal();
});

// Adiciona caixinha via prompt.
btnAdicionarCaixinha.addEventListener("click", () => {
  const nomeLimpo = inputNovaCaixinha.value.trim();
  const meta = Number.parseFloat(inputMetaCaixinha.value);

  if (!nomeLimpo) return;
  if (Number.isNaN(meta) || meta <= 0) return;

  if (caixinhas.some((c) => c.nome.toLowerCase() === nomeLimpo.toLowerCase())) return;

  caixinhas.push({ nome: nomeLimpo, meta });
  salvar();
  renderizarCaixinhas([nomeLimpo]);
  inputNovaCaixinha.value = "";
  inputMetaCaixinha.value = "";
  inputNovaCaixinha.focus();
});

// Tema claro/escuro.
btnTema.addEventListener("click", alternarTema);

// Fecha modal ao clicar fora.
modalOverlay.addEventListener("click", (evento) => {
  if (evento.target === modalOverlay) {
    prepararModoCriacao();
    fecharModal();
  }
});

// Fecha modal com ESC.
document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && confirmOverlay.classList.contains("open")) {
    fecharConfirmacaoExclusao();
    return;
  }

  if (evento.key === "Escape" && modalOverlay.classList.contains("open")) {
    prepararModoCriacao();
    fecharModal();
  }
});

// Evita fechar modal ao clicar dentro dele.
modalTransacao.addEventListener("click", (evento) => {
  evento.stopPropagation();
});

// Excluir caixinha diretamente na lista do formulário.
listaCaixinhasEl.addEventListener("click", (evento) => {
  const botao = evento.target.closest("button[data-excluir-caixinha]");
  if (!botao) return;
  const nome = botao.getAttribute("data-excluir-caixinha");
  if (!nome) return;
  excluirCaixinha(nome);
});

// Botões de confirmação da exclusão sem usar pop-up nativo.
btnConfirmCancelar.addEventListener("click", fecharConfirmacaoExclusao);

btnConfirmAtual.addEventListener("click", () => {
  if (!exclusaoPendente) return;
  apagarTransacao(exclusaoPendente.idAtual);
  fecharConfirmacaoExclusao();
});

btnConfirmTodas.addEventListener("click", () => {
  if (!exclusaoPendente) return;
  const ids = new Set(exclusaoPendente.idsRelacionadas);
  transacoes = transacoes.filter((t) => !ids.has(t.id));
  salvar();
  atualizarDashboard();
  fecharConfirmacaoExclusao();
});

// Fecha confirmação ao clicar fora do modal.
confirmOverlay.addEventListener("click", (evento) => {
  if (evento.target === confirmOverlay) fecharConfirmacaoExclusao();
});

// Responsividade dos gráficos.
window.addEventListener("resize", atualizarDashboard);

// Estado inicial.
const temaSalvo = localStorage.getItem("temaDashboard");
if (temaSalvo === "dark" || temaSalvo === "light") {
  aplicarTema(temaSalvo);
} else {
  aplicarTema("light");
}

renderizarCaixinhas([]);
definirTipo("despesa");
atualizarEstadoParcelamento();
atualizarDashboard();
