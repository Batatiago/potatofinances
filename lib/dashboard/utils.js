import { CATEGORIA_CORES } from "./constants";

// Formata numero para moeda BRL no padrao pt-BR.
export function formatarMoeda(valor) {
	return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Converte Date para string yyyy-mm-dd para input type=date.
export function formatarDataInput(data) {
	const ano = data.getFullYear();
	const mes = String(data.getMonth() + 1).padStart(2, "0");
	const dia = String(data.getDate()).padStart(2, "0");
	return `${ano}-${mes}-${dia}`;
}

// Converte yyyy-mm-dd para formato de exibicao dd/mm/yyyy.
export function formatarDataVisual(isoDate) {
	const [ano, mes, dia] = isoDate.split("-");
	return `${dia}/${mes}/${ano}`;
}

// Normaliza transacoes salvas para o schema esperado pelo app.
export function normalizarTransacoes(lista) {
	return lista.map((item) => {
		const dataSegura = typeof item.data === "string" && item.data ? item.data : formatarDataInput(new Date());
		return {
			id: item.id || `tx-${Math.random().toString(36).slice(2, 10)}`,
			descricao: item.descricao || "Transação sem descrição",
			valor: Number(item.valor) || 0,
			tipo: ["receita", "despesa", "investimento"].includes(item.tipo) ? item.tipo : "despesa",
			data: dataSegura,
			categoria: item.categoria || "Outros",
			formaPagamento: item.formaPagamento || (item.tipo === "despesa" ? "Cartão" : null),
			parcelaAtual: item.parcelaAtual || null,
			totalParcelas: item.totalParcelas || null,
			parcelamentoId: item.parcelamentoId || null,
			caixinhas: Array.isArray(item.caixinhas) ? item.caixinhas : [],
		};
	});
}

// Normaliza caixinhas antigas e remove entradas invalidas.
export function normalizarCaixinhas(lista) {
	return lista
		.map((item) => {
			if (typeof item === "string") return { nome: item, meta: 0 };
			return { nome: (item?.nome || "").trim(), meta: Number(item?.meta) || 0 };
		})
		.filter((item) => item.nome);
}

// Soma meses mantendo comportamento correto para finais de mes.
export function adicionarMeses(isoDate, quantidade) {
	const data = new Date(`${isoDate}T00:00:00`);
	const diaOriginal = data.getDate();
	data.setMonth(data.getMonth() + quantidade);
	if (data.getDate() < diaOriginal) data.setDate(0);
	return formatarDataInput(data);
}

// Divide valor total em parcelas com distribuicao exata de centavos.
export function calcularValoresParcelas(valorTotal, totalParcelas) {
	const baseCentavos = Math.floor((valorTotal * 100) / totalParcelas);
	const totalBase = baseCentavos * totalParcelas;
	const sobra = Math.round(valorTotal * 100 - totalBase);
	return Array.from({ length: totalParcelas }, (_, i) => {
		const centavos = baseCentavos + (i < sobra ? 1 : 0);
		return centavos / 100;
	});
}

// Filtra transacoes para o periodo de mes/ano em foco.
export function obterTransacoesPeriodo(transacoes, mesSelecionado, anoSelecionado) {
	return transacoes.filter((t) => {
		const d = new Date(`${t.data}T00:00:00`);
		return d.getMonth() === mesSelecionado && d.getFullYear() === anoSelecionado;
	});
}

// Aplica filtro por tipo e ordena por data descrescente.
export function obterListaFiltrada(transacoesPeriodo, filtroAtual) {
	const base = filtroAtual === "todas" ? transacoesPeriodo : transacoesPeriodo.filter((t) => t.tipo === filtroAtual);
	return base.slice().sort((a, b) => b.data.localeCompare(a.data));
}

// Calcula os totais de receitas, despesas e investimentos do periodo.
export function calcularTotaisPeriodo(transacoesPeriodo) {
	const receitas = transacoesPeriodo.filter((t) => t.tipo === "receita").reduce((acc, t) => acc + t.valor, 0);
	const despesas = transacoesPeriodo.filter((t) => t.tipo === "despesa").reduce((acc, t) => acc + t.valor, 0);
	const investimentos = transacoesPeriodo.filter((t) => t.tipo === "investimento").reduce((acc, t) => acc + t.valor, 0);
	const qtdReceitas = transacoesPeriodo.filter((t) => t.tipo === "receita").length;
	const qtdDespesas = transacoesPeriodo.filter((t) => t.tipo === "despesa").length;
	return { receitas, despesas, investimentos, qtdReceitas, qtdDespesas };
}

// Calcula saldo global: receitas - despesas pagas em dinheiro/pix.
export function calcularSaldoGlobal(transacoes) {
	const receitasNoSaldo = transacoes.filter((t) => t.tipo === "receita").reduce((acc, t) => acc + t.valor, 0);
	const despesasNoSaldo = transacoes
		.filter((t) => t.tipo === "despesa" && ["Dinheiro", "Pix"].includes(t.formaPagamento || ""))
		.reduce((acc, t) => acc + t.valor, 0);
	return receitasNoSaldo - despesasNoSaldo;
}

// Calcula totais acumulados por caixinha no periodo.
export function calcularTotaisCaixinhas(caixinhas, transacoesPeriodo) {
	const base = {};
	caixinhas.forEach(({ nome }) => {
		base[nome] = 0;
	});
	transacoesPeriodo
		.filter((t) => t.tipo === "investimento")
		.forEach((t) => {
			const selecionadas = t.caixinhas?.length ? t.caixinhas : [];
			if (!selecionadas.length) return;
			const valorPorCaixinha = t.valor / selecionadas.length;
			selecionadas.forEach((nome) => {
				base[nome] = (base[nome] || 0) + valorPorCaixinha;
			});
		});
	return base;
}

// Agrupa despesas por categoria para grafico e legenda.
export function calcularDespesasPorCategoria(transacoesPeriodo) {
	const map = {};
	transacoesPeriodo
		.filter((t) => t.tipo === "despesa")
		.forEach((t) => {
			map[t.categoria] = (map[t.categoria] || 0) + t.valor;
		});
	return map;
}

// Monta serie anual de receitas, despesas e investimentos por mes.
export function calcularSeriesAnuais(transacoes, anoSelecionado) {
	const receitas = Array(12).fill(0);
	const despesas = Array(12).fill(0);
	const investimentos = Array(12).fill(0);
	transacoes.forEach((t) => {
		const d = new Date(`${t.data}T00:00:00`);
		if (d.getFullYear() !== anoSelecionado) return;
		const mes = d.getMonth();
		if (t.tipo === "receita") receitas[mes] += t.valor;
		if (t.tipo === "despesa") despesas[mes] += t.valor;
		if (t.tipo === "investimento") investimentos[mes] += t.valor;
	});
	return { receitas, despesas, investimentos };
}

// Desenha grafico de barras anual no canvas.
export function desenharGraficoBarras(canvas, anualSeries, meses) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	const dpr = window.devicePixelRatio || 1;
	const width = canvas.clientWidth || 720;
	const height = 320;
	canvas.width = Math.floor(width * dpr);
	canvas.height = Math.floor(height * dpr);
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, width, height);

	const { receitas, despesas, investimentos } = anualSeries;
	const maxValor = Math.max(1, ...receitas, ...despesas, ...investimentos);
	const paddingLeft = 42;
	const paddingRight = 16;
	const paddingTop = 20;
	const paddingBottom = 36;
	const chartWidth = width - paddingLeft - paddingRight;
	const chartHeight = height - paddingTop - paddingBottom;

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
		const hR = (receitas[i] / maxValor) * (chartHeight - 18);
		const hD = (despesas[i] / maxValor) * (chartHeight - 18);
		const hI = (investimentos[i] / maxValor) * (chartHeight - 18);
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
}

// Desenha grafico de rosca por categoria no canvas.
export function desenharGraficoDonut(canvas, despesasPorCategoria, totalDonut) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	const dpr = window.devicePixelRatio || 1;
	const width = canvas.clientWidth || 280;
	const height = 260;
	const size = Math.min(width, 260);
	canvas.width = Math.floor(width * dpr);
	canvas.height = Math.floor(height * dpr);
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, width, height);

	const cx = width / 2;
	const cy = height / 2;
	const raio = Math.max(40, size / 2 - 24);
	const espessura = Math.max(18, raio * 0.28);
	if (totalDonut <= 0) {
		ctx.beginPath();
		ctx.arc(cx, cy, raio, 0, Math.PI * 2);
		ctx.lineWidth = espessura;
		ctx.strokeStyle = "#e9eef7";
		ctx.stroke();
		ctx.fillStyle = "#8a9dbc";
		ctx.font = "14px Segoe UI";
		ctx.textAlign = "center";
		ctx.fillText("Sem despesas", cx, cy + 5);
		return;
	}
	let anguloInicial = -Math.PI / 2;
	Object.entries(despesasPorCategoria).forEach(([cat, val]) => {
		const proporcao = val / totalDonut;
		const anguloFinal = anguloInicial + Math.PI * 2 * proporcao;
		ctx.beginPath();
		ctx.arc(cx, cy, raio, anguloInicial, anguloFinal);
		ctx.lineWidth = espessura;
		ctx.strokeStyle = CATEGORIA_CORES[cat] || CATEGORIA_CORES.Outros;
		ctx.stroke();
		anguloInicial = anguloFinal;
	});
	ctx.fillStyle = "#0f1d3a";
	ctx.font = "bold 16px Segoe UI";
	ctx.textAlign = "center";
	ctx.fillText(formatarMoeda(totalDonut), cx, cy + 5);
}
