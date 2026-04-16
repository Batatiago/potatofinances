// Testes unitarios dos helpers puros da dashboard.
const {
	adicionarMeses,
	calcularDespesasPorCategoria,
	calcularSaldoGlobal,
	calcularSeriesAnuais,
	calcularTotaisCaixinhas,
	calcularTotaisPeriodo,
	calcularValoresParcelas,
	formatarDataInput,
	formatarDataVisual,
	formatarMoeda,
	normalizarCaixinhas,
	normalizarTransacoes,
	obterListaFiltrada,
	obterTransacoesPeriodo,
} = require("../../lib/dashboard/utils");

describe("dashboard utils", () => {
	test("formatarMoeda aplica formato BRL", () => {
		expect(formatarMoeda(1234.56)).toContain("R$");
	});

	test("formatarDataInput e formatarDataVisual convertem datas", () => {
		const data = new Date("2026-04-16T00:00:00");
		expect(formatarDataInput(data)).toBe("2026-04-16");
		expect(formatarDataVisual("2026-04-16")).toBe("16/04/2026");
	});

	test("normalizarTransacoes aplica defaults", () => {
		const lista = normalizarTransacoes([{ tipo: "foo", valor: "10" }]);
		expect(lista[0].tipo).toBe("despesa");
		expect(lista[0].valor).toBe(10);
		expect(lista[0].descricao).toBeTruthy();
	});

	test("normalizarCaixinhas remove invalidas e converte strings", () => {
		const caixinhas = normalizarCaixinhas(["Viagem", { nome: "", meta: 100 }, { nome: "Casa", meta: "500" }]);
		expect(caixinhas).toEqual([{ nome: "Viagem", meta: 0 }, { nome: "Casa", meta: 500 }]);
	});

	test("adicionarMeses respeita virada de mes", () => {
		expect(adicionarMeses("2026-01-31", 1)).toBe("2026-02-28");
	});

	test("calcularValoresParcelas distribui centavos corretamente", () => {
		const parcelas = calcularValoresParcelas(10, 3);
		const soma = parcelas.reduce((acc, v) => acc + v, 0);
		expect(parcelas.length).toBe(3);
		expect(Number(soma.toFixed(2))).toBe(10);
	});

	test("obterTransacoesPeriodo e obterListaFiltrada funcionam com filtro", () => {
		const transacoes = [
			{ id: "1", data: "2026-04-16", tipo: "receita", valor: 100 },
			{ id: "2", data: "2026-04-12", tipo: "despesa", valor: 50 },
			{ id: "3", data: "2026-03-12", tipo: "despesa", valor: 80 },
		];
		const periodo = obterTransacoesPeriodo(transacoes, 3, 2026);
		expect(periodo.length).toBe(2);
		expect(obterListaFiltrada(periodo, "despesa").length).toBe(1);
	});

	test("calcularTotaisPeriodo retorna somas e contagens", () => {
		const totais = calcularTotaisPeriodo([
			{ tipo: "receita", valor: 100 },
			{ tipo: "despesa", valor: 40 },
			{ tipo: "investimento", valor: 20 },
			{ tipo: "despesa", valor: 10 },
		]);
		expect(totais).toEqual({ receitas: 100, despesas: 50, investimentos: 20, qtdReceitas: 1, qtdDespesas: 2 });
	});

	test("calcularSaldoGlobal considera apenas pix/dinheiro em despesas", () => {
		const saldo = calcularSaldoGlobal([
			{ tipo: "receita", valor: 1000 },
			{ tipo: "despesa", valor: 200, formaPagamento: "Cartão" },
			{ tipo: "despesa", valor: 150, formaPagamento: "Pix" },
		]);
		expect(saldo).toBe(850);
	});

	test("calcularTotaisCaixinhas divide investimento entre caixinhas", () => {
		const totais = calcularTotaisCaixinhas(
			[{ nome: "Viagem", meta: 1000 }, { nome: "Casa", meta: 2000 }],
			[{ tipo: "investimento", valor: 200, caixinhas: ["Viagem", "Casa"] }],
		);
		expect(totais.Viagem).toBe(100);
		expect(totais.Casa).toBe(100);
	});

	test("calcularDespesasPorCategoria agrega categorias", () => {
		const despesas = calcularDespesasPorCategoria([
			{ tipo: "despesa", categoria: "Alimentação", valor: 50 },
			{ tipo: "despesa", categoria: "Alimentação", valor: 20 },
			{ tipo: "despesa", categoria: "Lazer", valor: 30 },
		]);
		expect(despesas).toEqual({ "Alimentação": 70, Lazer: 30 });
	});

	test("calcularSeriesAnuais monta 12 meses por tipo", () => {
		const series = calcularSeriesAnuais([
			{ tipo: "receita", valor: 100, data: "2026-01-10" },
			{ tipo: "despesa", valor: 20, data: "2026-01-11" },
			{ tipo: "investimento", valor: 10, data: "2026-02-11" },
		], 2026);
		expect(series.receitas[0]).toBe(100);
		expect(series.despesas[0]).toBe(20);
		expect(series.investimentos[1]).toBe(10);
	});
});
