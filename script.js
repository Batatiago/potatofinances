// Seleciona elementos do formulário.
const form = document.getElementById("formTransacao");
const descricaoInput = document.getElementById("descricao");
const valorInput = document.getElementById("valor");
const dataInput = document.getElementById("data");
const tipoInput = document.getElementById("tipo");
const categoriaInput = document.getElementById("categoria");
const parceladoInput = document.getElementById("parcelado");
const parcelasInput = document.getElementById("parcelas");
const parcelWrap = document.getElementById("parcelWrap");

// Seleciona botões visuais para trocar tipo (despesa/receita).
const btnTipoDespesa = document.getElementById("btnTipoDespesa");
const btnTipoReceita = document.getElementById("btnTipoReceita");

// Seleciona elementos do modal de nova transação.
const modalOverlay = document.getElementById("modalOverlay");
const modalTransacao = document.getElementById("modalTransacao");
const btnAbrirModal = document.getElementById("btnAbrirModal");
const btnFecharModal = document.getElementById("btnFecharModal");
const btnTema = document.getElementById("btnTema");

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

// Seleciona botões de navegação do ano.
const prevYearBtn = document.getElementById("prevYear");
const nextYearBtn = document.getElementById("nextYear");

// Seleciona filtros da lista.
const filtroTodasBtn = document.getElementById("filtroTodas");
const filtroReceitasBtn = document.getElementById("filtroReceitas");
const filtroDespesasBtn = document.getElementById("filtroDespesas");

// Seleciona canvas e legenda dos gráficos.
const barChartCanvas = document.getElementById("barChart");
const donutChartCanvas = document.getElementById("donutChart");
const donutLegendEl = document.getElementById("donutLegend");

// Nomes dos meses para interface.
const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Listas de categorias por tipo de transação.
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

const categoriasReceita = ["Salário", "Salário Abbraccio", "Freelance", "Investimentos", "Outros"];

// Paleta usada no gráfico por categoria.
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
  Investimentos: "#05a3ab",
  Outros: "#8fa1c0"
};

// Recupera transações salvas e normaliza o formato.
let transacoes = normalizarTransacoes(JSON.parse(localStorage.getItem("transacoes")) || []);

// Define período inicial como mês/ano atual.
const hoje = new Date();
let mesSelecionado = hoje.getMonth();
let anoSelecionado = hoje.getFullYear();

// Filtro inicial do histórico.
let filtroAtual = "todas";

// Data padrão do formulário.
dataInput.value = formatarDataInput(hoje);

// Define texto do botão de tema conforme estado atual.
function atualizarTextoBotaoTema() {
  const dark = document.body.classList.contains("dark-theme");
  btnTema.textContent = dark ? "☀️ Modo claro" : "🌙 Modo noturno";
}

// Aplica tema (claro/escuro) e salva preferência no navegador.
function aplicarTema(tema) {
  document.body.classList.toggle("dark-theme", tema === "dark");
  localStorage.setItem("temaDashboard", tema);
  atualizarTextoBotaoTema();
}

// Alterna entre tema claro e escuro.
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

// Normaliza transações antigas para o formato novo com segurança.
function normalizarTransacoes(lista) {
  return lista.map((item) => {
    const dataSegura = typeof item.data === "string" && item.data ? item.data : formatarDataInput(new Date());

    return {
      id: item.id || `tx-${Math.random().toString(36).slice(2, 10)}`,
      descricao: item.descricao || "Transação sem descrição",
      valor: Number(item.valor) || 0,
      tipo: item.tipo === "receita" ? "receita" : "despesa",
      data: dataSegura,
      categoria: item.categoria || "Outros",
      parcelaAtual: item.parcelaAtual || null,
      totalParcelas: item.totalParcelas || null
    };
  });
}

// Persiste as transações no localStorage.
function salvar() {
  localStorage.setItem("transacoes", JSON.stringify(transacoes));
}

// Retorna transações do mês/ano selecionados.
function obterTransacoesDoPeriodo() {
  return transacoes.filter((t) => {
    const data = new Date(`${t.data}T00:00:00`);
    return data.getMonth() === mesSelecionado && data.getFullYear() === anoSelecionado;
  });
}

// Aplica filtro de tipo na lista já filtrada por período.
function filtrarPorTipo(lista) {
  if (filtroAtual === "todas") return lista;
  return lista.filter((t) => t.tipo === filtroAtual);
}

// Renderiza os botões de mês com destaque do mês ativo.
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

// Atualiza estado visual dos filtros do histórico.
function atualizarBotoesFiltro() {
  filtroTodasBtn.classList.remove("active");
  filtroReceitasBtn.classList.remove("active");
  filtroDespesasBtn.classList.remove("active");

  if (filtroAtual === "todas") filtroTodasBtn.classList.add("active");
  if (filtroAtual === "receita") filtroReceitasBtn.classList.add("active");
  if (filtroAtual === "despesa") filtroDespesasBtn.classList.add("active");
}

// Define tipo da transação e atualiza botões visuais.
function definirTipo(tipo) {
  const categoriaAnterior = categoriaInput.value;
  tipoInput.value = tipo;
  btnTipoDespesa.classList.toggle("active", tipo === "despesa");
  btnTipoReceita.classList.toggle("active", tipo === "receita");
  popularCategoriasPorTipo(tipo, categoriaAnterior);
  atualizarEstadoParcelamento();
}

// Recarrega as opções de categoria com base no tipo selecionado.
function popularCategoriasPorTipo(tipo, categoriaAtual = "") {
  const opcoes = tipo === "receita" ? categoriasReceita : categoriasDespesa;
  categoriaInput.innerHTML = "";

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

// Abre o modal e prepara foco no primeiro campo.
function abrirModal() {
  modalOverlay.classList.add("open");
  modalOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  descricaoInput.focus();
}

// Fecha o modal e devolve foco ao botão principal.
function fecharModal() {
  modalOverlay.classList.remove("open");
  modalOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  btnAbrirModal.focus();
}

// Desenha gráfico de barras real no canvas.
function desenharGraficoBarras(receitas, despesas) {
  const ctx = barChartCanvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = barChartCanvas.clientWidth;
  const height = 300;

  barChartCanvas.width = Math.floor(width * dpr);
  barChartCanvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.clearRect(0, 0, width, height);

  const padding = 30;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;

  ctx.strokeStyle = "#e6ebf3";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  const maxValor = Math.max(receitas, despesas, 1);
  const receitaAltura = (receitas / maxValor) * (chartHeight - 40);
  const despesaAltura = (despesas / maxValor) * (chartHeight - 40);

  const barLargura = Math.min(70, chartWidth / 5);
  const x1 = width / 2 - barLargura - 14;
  const x2 = width / 2 + 14;
  const baseY = height - padding;

  ctx.fillStyle = "#08b670";
  ctx.fillRect(x1, baseY - receitaAltura, barLargura, receitaAltura);

  ctx.fillStyle = "#ff3f67";
  ctx.fillRect(x2, baseY - despesaAltura, barLargura, despesaAltura);

  ctx.fillStyle = "#5f7296";
  ctx.font = "14px Segoe UI";
  ctx.fillText("Receitas", x1, baseY + 18);
  ctx.fillText("Despesas", x2, baseY + 18);

  ctx.fillStyle = "#0f1d3a";
  ctx.font = "13px Segoe UI";
  ctx.fillText(formatarMoeda(receitas), x1 - 8, baseY - receitaAltura - 8);
  ctx.fillText(formatarMoeda(despesas), x2 - 8, baseY - despesaAltura - 8);

  if (receitas === 0 && despesas === 0) {
    ctx.fillStyle = "#8a9dbc";
    ctx.font = "14px Segoe UI";
    ctx.fillText("Sem dados no período selecionado", padding + 10, padding + 20);
  }
}

// Desenha gráfico de rosca real por categoria.
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
    itemLegenda.innerHTML = `<i style="background:${cor}"></i>${categoria}`;
    donutLegendEl.appendChild(itemLegenda);

    anguloInicial = anguloFinal;
  });

  ctx.fillStyle = "#0f1d3a";
  ctx.font = "bold 16px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText(formatarMoeda(total), cx, cy + 5);
}

// Renderiza histórico do período com badges e informações extras.
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

    item.innerHTML = `
      <div class="transaction-main">
        <strong>${t.descricao} ${futuroTexto}</strong>
        <span>${t.categoria} • ${formatarDataVisual(t.data)}${parcelaTexto}</span>
      </div>
      <span class="transaction-value ${t.tipo}">${t.tipo === "receita" ? "+" : "-"}${formatarMoeda(t.valor)}</span>
    `;

    listaTransacoes.appendChild(item);
  });
}

// Atualiza toda a interface conforme período/filtros atuais.
function atualizarDashboard() {
  const transacoesPeriodo = obterTransacoesDoPeriodo();

  const receitas = transacoesPeriodo
    .filter((t) => t.tipo === "receita")
    .reduce((acc, t) => acc + t.valor, 0);

  const despesas = transacoesPeriodo
    .filter((t) => t.tipo === "despesa")
    .reduce((acc, t) => acc + t.valor, 0);

  const qtdReceitas = transacoesPeriodo.filter((t) => t.tipo === "receita").length;
  const qtdDespesas = transacoesPeriodo.filter((t) => t.tipo === "despesa").length;

  const saldo = receitas - despesas;
  const totalInvestimentos = transacoesPeriodo
    .filter((t) => t.categoria === "Investimentos")
    .reduce((acc, t) => acc + t.valor, 0);

  selectedYearEl.textContent = String(anoSelecionado);
  historyTitleEl.textContent = `${meses[mesSelecionado]} - ${anoSelecionado} (${transacoesPeriodo.length} transações)`;
  barTitleEl.textContent = `Receitas x despesas - ${meses[mesSelecionado]} ${anoSelecionado}`;

  totalReceitasEl.textContent = formatarMoeda(receitas);
  totalDespesasEl.textContent = formatarMoeda(despesas);
  saldoEl.textContent = formatarMoeda(saldo);
  qtdReceitasEl.textContent = String(qtdReceitas);
  qtdDespesasEl.textContent = String(qtdDespesas);
  totalInvestimentosEl.textContent = formatarMoeda(totalInvestimentos);

  if (saldo > 0) saldoStatusEl.textContent = "Saldo positivo";
  if (saldo === 0) saldoStatusEl.textContent = "Saldo neutro";
  if (saldo < 0) saldoStatusEl.textContent = "Saldo negativo";

  saldoEl.classList.toggle("positive", saldo >= 0);
  saldoEl.classList.toggle("negative", saldo < 0);

  renderizarBotoesMes();
  atualizarBotoesFiltro();
  renderizarHistorico(transacoesPeriodo);
  desenharGraficoBarras(receitas, despesas);
  desenharGraficoDonut(transacoesPeriodo);
}

// Soma meses em uma data (usado para gerar parcelas futuras).
function adicionarMeses(isoDate, quantidade) {
  const data = new Date(`${isoDate}T00:00:00`);
  const diaOriginal = data.getDate();

  data.setMonth(data.getMonth() + quantidade);

  if (data.getDate() < diaOriginal) {
    data.setDate(0);
  }

  return formatarDataInput(data);
}

// Divide valor total em parcelas sem perder centavos.
function calcularValoresParcelas(valorTotal, totalParcelas) {
  const baseCentavos = Math.floor((valorTotal * 100) / totalParcelas);
  const totalBase = baseCentavos * totalParcelas;
  const sobra = Math.round(valorTotal * 100 - totalBase);

  return Array.from({ length: totalParcelas }, (_, i) => {
    const centavos = baseCentavos + (i < sobra ? 1 : 0);
    return centavos / 100;
  });
}

// Exibe/oculta campo de parcelas conforme tipo selecionado.
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

// Envio do formulário para cadastrar transações.
form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const descricao = descricaoInput.value.trim();
  const valor = Number.parseFloat(valorInput.value);
  const data = dataInput.value;
  const tipo = tipoInput.value;
  const categoria = categoriaInput.value || "Outros";

  if (!descricao) return;
  if (Number.isNaN(valor) || valor <= 0) return;
  if (!data) return;
  if (!tipo) return;

  const isParcelada = tipo === "despesa" && parceladoInput.checked;
  const totalParcelas = isParcelada ? Number.parseInt(parcelasInput.value, 10) : 1;

  if (isParcelada && (!totalParcelas || totalParcelas < 2)) return;

  if (isParcelada) {
    const valoresParcelas = calcularValoresParcelas(valor, totalParcelas);

    valoresParcelas.forEach((valorParcela, indice) => {
      transacoes.push({
        id: `tx-${Math.random().toString(36).slice(2, 10)}`,
        descricao,
        valor: valorParcela,
        tipo: "despesa",
        data: adicionarMeses(data, indice),
        categoria,
        parcelaAtual: indice + 1,
        totalParcelas
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
      totalParcelas: null
    });
  }

  salvar();

  const dataLancada = new Date(`${data}T00:00:00`);
  mesSelecionado = dataLancada.getMonth();
  anoSelecionado = dataLancada.getFullYear();

  atualizarDashboard();

  form.reset();
  dataInput.value = formatarDataInput(new Date());
  definirTipo("despesa");
  atualizarEstadoParcelamento();
  fecharModal();
});

// Filtro do histórico: todas.
filtroTodasBtn.addEventListener("click", () => {
  filtroAtual = "todas";
  atualizarDashboard();
});

// Filtro do histórico: receitas.
filtroReceitasBtn.addEventListener("click", () => {
  filtroAtual = "receita";
  atualizarDashboard();
});

// Filtro do histórico: despesas.
filtroDespesasBtn.addEventListener("click", () => {
  filtroAtual = "despesa";
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

// Controle visual do tipo de transação no modal.
btnTipoDespesa.addEventListener("click", () => definirTipo("despesa"));
btnTipoReceita.addEventListener("click", () => definirTipo("receita"));

// Controle de parcelamento.
parceladoInput.addEventListener("change", atualizarEstadoParcelamento);

// Abertura e fechamento do modal.
btnAbrirModal.addEventListener("click", abrirModal);
btnFecharModal.addEventListener("click", fecharModal);
btnTema.addEventListener("click", alternarTema);

// Fecha o modal ao clicar fora da caixa branca.
modalOverlay.addEventListener("click", (evento) => {
  if (evento.target === modalOverlay) fecharModal();
});

// Fecha o modal com tecla ESC.
document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && modalOverlay.classList.contains("open")) {
    fecharModal();
  }
});

// Evita que clique interno no modal feche o overlay por propagação.
modalTransacao.addEventListener("click", (evento) => {
  evento.stopPropagation();
});

// Redesenha gráficos quando a janela muda de tamanho.
window.addEventListener("resize", atualizarDashboard);

// Estado inicial da interface.
const temaSalvo = localStorage.getItem("temaDashboard");
if (temaSalvo === "dark" || temaSalvo === "light") {
  aplicarTema(temaSalvo);
} else {
  aplicarTema("light");
}

definirTipo("despesa");
atualizarEstadoParcelamento();
atualizarDashboard();
