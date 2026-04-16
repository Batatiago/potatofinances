// Head injeta metadados da pagina no documento HTML.
import Head from "next/head";
// Hooks React para estado, memoizacao e ciclo de vida.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Componentes menores da tela para facilitar manutencao e desempenho.
import { ConfirmModal } from "../components/dashboard/ConfirmModal";
import { HistorySection } from "../components/dashboard/HistorySection";
import { InvestmentBoxes } from "../components/dashboard/InvestmentBoxes";
import { OverviewSection } from "../components/dashboard/OverviewSection";
import { PeriodSelector } from "../components/dashboard/PeriodSelector";
import { SummaryCards } from "../components/dashboard/SummaryCards";
import { TopBar } from "../components/dashboard/TopBar";
import { TransactionModal } from "../components/dashboard/TransactionModal";

// Constantes da regra de negocio e visual.
import { CATEGORIA_CORES, CATEGORIAS_DESPESA, CATEGORIAS_RECEITA, MESES } from "../lib/dashboard/constants";
// Helpers puros para formatacao, calculos e desenho dos graficos.
import {
	adicionarMeses,
	calcularDespesasPorCategoria,
	calcularSaldoGlobal,
	calcularSeriesAnuais,
	calcularTotaisCaixinhas,
	calcularTotaisPeriodo,
	calcularValoresParcelas,
	desenharGraficoBarras,
	desenharGraficoDonut,
	formatarDataInput,
	formatarDataVisual,
	formatarMoeda,
	normalizarCaixinhas,
	normalizarTransacoes,
	obterListaFiltrada,
	obterTransacoesPeriodo,
} from "../lib/dashboard/utils";

// Pagina principal da dashboard financeira.
export default function Dashboard() {
	const [hojeISO, setHojeISO] = useState("");

	// Flag para controlar quando os dados persistidos ja foram carregados no cliente.
	const [dadosCarregados, setDadosCarregados] = useState(false);

	// Tema visual atual do app.
	const [tema, setTema] = useState("light");

	// Estado de filtro e periodo da visualizacao.
	const [filtroAtual, setFiltroAtual] = useState("todas");
	const [mesSelecionado, setMesSelecionado] = useState(0);
	const [anoSelecionado, setAnoSelecionado] = useState(0);

	// Dados persistidos da aplicacao.
	const [transacoes, setTransacoes] = useState([]);
	const [caixinhas, setCaixinhas] = useState([]);

	// Controle dos modais e fluxo de edicao/exclusao.
	const [modalAberto, setModalAberto] = useState(false);
	const [confirmAberto, setConfirmAberto] = useState(false);
	const [transacaoEmEdicaoId, setTransacaoEmEdicaoId] = useState(null);
	const [exclusaoPendente, setExclusaoPendente] = useState(null);

	// Campos do formulario de transacao.
	const [tipo, setTipo] = useState("despesa");
	const [descricao, setDescricao] = useState("");
	const [valor, setValor] = useState("");
	const [data, setData] = useState("");
	const [categoria, setCategoria] = useState("Outros");
	const [formaPagamento, setFormaPagamento] = useState("Cartão");
	const [parcelado, setParcelado] = useState(false);
	const [parcelas, setParcelas] = useState("");
	const [caixinhasSelecionadas, setCaixinhasSelecionadas] = useState([]);
	const [novaCaixinha, setNovaCaixinha] = useState("");
	const [metaNovaCaixinha, setMetaNovaCaixinha] = useState("");
	const [erroDescricao, setErroDescricao] = useState("");
	const [erroParcelas, setErroParcelas] = useState("");

	// Referencias dos canvases dos graficos.
	const barCanvasRef = useRef(null);
	const donutCanvasRef = useRef(null);

	// Categorias disponiveis no select conforme tipo.
	const categoriasAtuais = tipo === "receita" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

	// Carrega dados persistidos somente no cliente apos o primeiro mount.
	useEffect(() => {
		if (typeof window === "undefined") return;
		const hojeAtual = new Date();
		setHojeISO(formatarDataInput(hojeAtual));
		setMesSelecionado(hojeAtual.getMonth());
		setAnoSelecionado(hojeAtual.getFullYear());
		setData(formatarDataInput(hojeAtual));

		const temaSalvo = localStorage.getItem("temaDashboard");
		if (temaSalvo === "dark" || temaSalvo === "light") {
			setTema(temaSalvo);
		}
		setTransacoes(normalizarTransacoes(JSON.parse(localStorage.getItem("transacoes") || "[]")));
		setCaixinhas(normalizarCaixinhas(JSON.parse(localStorage.getItem("caixinhasInvestimento") || "[]")));
		setDadosCarregados(true);
	}, []);

	// Aplica tema no body e salva preferencia.
	useEffect(() => {
		document.body.classList.toggle("dark-theme", tema === "dark");
		if (!dadosCarregados) return;
		localStorage.setItem("temaDashboard", tema);
	}, [tema, dadosCarregados]);

	// Trava scroll quando modal principal esta aberto.
	useEffect(() => {
		document.body.classList.toggle("modal-open", modalAberto);
	}, [modalAberto]);

	// Persiste transacoes no navegador.
	useEffect(() => {
		if (!dadosCarregados) return;
		localStorage.setItem("transacoes", JSON.stringify(transacoes));
	}, [transacoes, dadosCarregados]);

	// Persiste caixinhas no navegador.
	useEffect(() => {
		if (!dadosCarregados) return;
		localStorage.setItem("caixinhasInvestimento", JSON.stringify(caixinhas));
	}, [caixinhas, dadosCarregados]);

	// Garante categoria valida ao trocar tipo.
	useEffect(() => {
		if (tipo === "investimento") return;
		if (!categoriasAtuais.includes(categoria)) {
			setCategoria(categoriasAtuais[0]);
		}
	}, [tipo, categoria, categoriasAtuais]);

	// Fecha modais com ESC.
	useEffect(() => {
		const onKeydown = (evento) => {
			if (evento.key !== "Escape") return;
			if (confirmAberto) {
				setConfirmAberto(false);
				setExclusaoPendente(null);
				return;
			}
			if (modalAberto) {
				fecharModal();
			}
		};
		document.addEventListener("keydown", onKeydown);
		return () => document.removeEventListener("keydown", onKeydown);
	}, [confirmAberto, modalAberto]);

	// Derivados de periodo e filtros (memoizados para evitar recalculo caro).
	const transacoesPeriodo = useMemo(
() => obterTransacoesPeriodo(transacoes, mesSelecionado, anoSelecionado),
		[transacoes, mesSelecionado, anoSelecionado],
	);
	const listaFiltrada = useMemo(() => obterListaFiltrada(transacoesPeriodo, filtroAtual), [transacoesPeriodo, filtroAtual]);
	const totaisPeriodo = useMemo(() => calcularTotaisPeriodo(transacoesPeriodo), [transacoesPeriodo]);
	const saldoGlobal = useMemo(() => calcularSaldoGlobal(transacoes), [transacoes]);
	const totaisCaixinhas = useMemo(() => calcularTotaisCaixinhas(caixinhas, transacoesPeriodo), [caixinhas, transacoesPeriodo]);
	const despesasPorCategoria = useMemo(() => calcularDespesasPorCategoria(transacoesPeriodo), [transacoesPeriodo]);
	const totalDonut = useMemo(() => Object.values(despesasPorCategoria).reduce((acc, valor) => acc + valor, 0), [despesasPorCategoria]);
	const anualSeries = useMemo(() => calcularSeriesAnuais(transacoes, anoSelecionado), [transacoes, anoSelecionado]);

	// Renderiza grafico de barras quando dados ou tamanho mudam.
	useEffect(() => {
		const canvas = barCanvasRef.current;
		if (!canvas) return undefined;
		const desenhar = () => desenharGraficoBarras(canvas, anualSeries, MESES);
		desenhar();
		window.addEventListener("resize", desenhar);
		return () => window.removeEventListener("resize", desenhar);
	}, [anualSeries]);

	// Renderiza grafico de rosca quando dados ou tamanho mudam.
	useEffect(() => {
		const canvas = donutCanvasRef.current;
		if (!canvas) return undefined;
		const desenhar = () => desenharGraficoDonut(canvas, despesasPorCategoria, totalDonut);
		desenhar();
		window.addEventListener("resize", desenhar);
		return () => window.removeEventListener("resize", desenhar);
	}, [despesasPorCategoria, totalDonut]);

	// Texto derivado do saldo global.
	const saldoStatus = saldoGlobal > 0 ? "Saldo positivo" : saldoGlobal < 0 ? "Saldo negativo" : "Saldo neutro";
	const totalInvestidoCaixinhas = useMemo(() => Object.values(totaisCaixinhas).reduce((acc, v) => acc + v, 0), [totaisCaixinhas]);

	// Alterna tema claro/escuro.
	const alternarTema = useCallback(() => setTema((atual) => (atual === "dark" ? "light" : "dark")), []);

	// Limpa formulario para nova criacao.
	const abrirModalCriacao = useCallback(() => {
		setTransacaoEmEdicaoId(null);
		setTipo("despesa");
		setDescricao("");
		setValor("");
		setData(formatarDataInput(new Date()));
		setCategoria("Outros");
		setFormaPagamento("Cartão");
		setParcelado(false);
		setParcelas("");
		setCaixinhasSelecionadas([]);
		setNovaCaixinha("");
		setMetaNovaCaixinha("");
		setErroDescricao("");
		setErroParcelas("");
		setModalAberto(true);
	}, []);

	// Fecha modal principal e remove erros de validacao.
	const fecharModal = useCallback(() => {
		setModalAberto(false);
		setErroDescricao("");
		setErroParcelas("");
	}, []);

	// Preenche formulario para editar uma transacao existente.
	const iniciarEdicao = useCallback((t) => {
		setTransacaoEmEdicaoId(t.id);
		setTipo(t.tipo);
		setDescricao(t.descricao);
		setValor(String(t.valor));
		setData(t.data);
		setCategoria(t.categoria || "Outros");
		setFormaPagamento(t.formaPagamento || "Cartão");
		setParcelado(false);
		setParcelas("");
		setCaixinhasSelecionadas(t.caixinhas || []);
		setErroDescricao("");
		setErroParcelas("");
		setModalAberto(true);
	}, []);

	// Localiza parcelas relacionadas para permitir exclusao em lote.
	const obterParcelasRelacionadas = useCallback(
(transacao) => {
			if (!transacao.parcelaAtual || !transacao.totalParcelas) return [transacao];
			if (transacao.parcelamentoId) {
				return transacoes.filter((t) => t.parcelamentoId === transacao.parcelamentoId);
			}
			return transacoes.filter(
(t) =>
					t.tipo === "despesa" &&
					t.descricao === transacao.descricao &&
					t.categoria === transacao.categoria &&
					t.totalParcelas === transacao.totalParcelas &&
					t.parcelaAtual !== null,
			);
		},
		[transacoes],
	);

	// Abre confirmacao de exclusao com contexto da transacao.
	const abrirConfirmacaoExclusao = useCallback(
(transacao) => {
			const relacionadas = obterParcelasRelacionadas(transacao);
			setExclusaoPendente({
idAtual: transacao.id,
idsRelacionadas: relacionadas.map((t) => t.id),
				ehParcelada: relacionadas.length > 1,
			});
			setConfirmAberto(true);
		},
		[obterParcelasRelacionadas],
	);

	// Fecha modal de confirmacao.
	const fecharConfirmacao = useCallback(() => {
		setConfirmAberto(false);
		setExclusaoPendente(null);
	}, []);

	// Exclui somente o item atual selecionado.
	const apagarAtual = useCallback(() => {
		if (!exclusaoPendente) return;
		setTransacoes((prev) => prev.filter((t) => t.id !== exclusaoPendente.idAtual));
		fecharConfirmacao();
	}, [exclusaoPendente, fecharConfirmacao]);

	// Exclui todas as parcelas do mesmo grupo.
	const apagarTodas = useCallback(() => {
		if (!exclusaoPendente) return;
		const ids = new Set(exclusaoPendente.idsRelacionadas);
		setTransacoes((prev) => prev.filter((t) => !ids.has(t.id)));
		fecharConfirmacao();
	}, [exclusaoPendente, fecharConfirmacao]);

	// Cria nova caixinha e ja marca ela no formulario.
	const adicionarCaixinha = useCallback(() => {
		const nomeLimpo = novaCaixinha.trim();
		const meta = Number.parseFloat(metaNovaCaixinha);
		if (!nomeLimpo) return;
		if (Number.isNaN(meta) || meta <= 0) return;
		if (caixinhas.some((c) => c.nome.toLowerCase() === nomeLimpo.toLowerCase())) return;
		setCaixinhas((prev) => [...prev, { nome: nomeLimpo, meta }]);
		setCaixinhasSelecionadas((prev) => [...prev, nomeLimpo]);
		setNovaCaixinha("");
		setMetaNovaCaixinha("");
	}, [caixinhas, metaNovaCaixinha, novaCaixinha]);

	// Remove caixinha do cadastro e das transacoes existentes.
	const excluirCaixinha = useCallback((nome) => {
		setCaixinhas((prev) => prev.filter((c) => c.nome !== nome));
		setTransacoes((prev) =>
			prev.map((t) =>
				!Array.isArray(t.caixinhas)
					? t
					: {
						...t,
						caixinhas: t.caixinhas.filter((item) => item !== nome),
					},
			),
		);
		setCaixinhasSelecionadas((prev) => prev.filter((item) => item !== nome));
	}, []);

	// Marca/desmarca uma caixinha no formulario de investimento.
	const toggleCaixinhaSelecionada = useCallback((nome) => {
		setCaixinhasSelecionadas((prev) =>
			prev.includes(nome) ? prev.filter((item) => item !== nome) : [...prev, nome],
		);
	}, []);

	// Salva criacao ou edicao da transacao.
	const onSubmit = useCallback(
(evento) => {
			evento.preventDefault();
			setErroDescricao("");
			setErroParcelas("");

			const descricaoDigitada = descricao.trim();
			const numeroValor = Number.parseFloat(valor);
			const descricaoFinal = tipo === "investimento" ? descricaoDigitada || "Investimento" : descricaoDigitada;
			const forma = tipo === "despesa" ? formaPagamento || "Cartão" : null;

			if (!descricaoFinal && tipo !== "investimento") {
				setErroDescricao("Informe a descrição para despesas e receitas.");
				return;
			}
			if (Number.isNaN(numeroValor) || numeroValor <= 0) return;
			if (!data) return;
			if (!["receita", "despesa", "investimento"].includes(tipo)) return;

			if (transacaoEmEdicaoId) {
				setTransacoes((prev) =>
					prev.map((t) => {
						if (t.id !== transacaoEmEdicaoId) return t;
						const eraParcelada = Boolean(t.parcelaAtual && t.totalParcelas);
						const atualizado = {
							...t,
							descricao: descricaoFinal,
							valor: numeroValor,
							data,
							tipo,
							categoria: tipo === "investimento" ? "Investimentos" : categoria || "Outros",
							formaPagamento: forma,
							caixinhas: tipo === "investimento" ? caixinhasSelecionadas : [],
						};
						if (!eraParcelada || tipo !== "despesa") {
							atualizado.parcelaAtual = null;
							atualizado.totalParcelas = null;
							atualizado.parcelamentoId = null;
						}
						return atualizado;
					}),
				);
			} else {
				const categoriaFinal = tipo === "investimento" ? "Investimentos" : categoria || "Outros";
				const selecionadas = tipo === "investimento" ? caixinhasSelecionadas : [];
				const parcelasDigitadas = Number.parseInt(parcelas, 10);
				const isParcelada = tipo === "despesa" && (parcelado || parcelasDigitadas > 1);
				const totalParcelas = isParcelada ? Number.parseInt(parcelas, 10) : 1;

				if (isParcelada && (!totalParcelas || totalParcelas < 2 || totalParcelas > 48)) {
					setErroParcelas("Informe entre 2 e 48 parcelas.");
					return;
				}

				if (isParcelada) {
					const parcelamentoId = `parc-${Math.random().toString(36).slice(2, 10)}`;
					const valoresParcelas = calcularValoresParcelas(numeroValor, totalParcelas);
					setTransacoes((prev) => [
						...prev,
						...valoresParcelas.map((valorParcela, indice) => ({
id: `tx-${Math.random().toString(36).slice(2, 10)}`,
descricao: descricaoFinal,
valor: valorParcela,
tipo,
data: adicionarMeses(data, indice),
categoria: categoriaFinal,
formaPagamento: forma,
parcelaAtual: indice + 1,
totalParcelas,
parcelamentoId,
caixinhas: [],
})),
					]);
				} else {
					setTransacoes((prev) => [
						...prev,
						{
							id: `tx-${Math.random().toString(36).slice(2, 10)}`,
							descricao: descricaoFinal,
							valor: numeroValor,
							tipo,
							data,
							categoria: categoriaFinal,
							formaPagamento: forma,
							parcelaAtual: null,
							totalParcelas: null,
							parcelamentoId: null,
							caixinhas: selecionadas,
						},
					]);
				}
			}

			const dataLancada = new Date(`${data}T00:00:00`);
			setMesSelecionado(dataLancada.getMonth());
			setAnoSelecionado(dataLancada.getFullYear());
			fecharModal();
		},
		[
			caixinhasSelecionadas,
			categoria,
			data,
			descricao,
			fecharModal,
			formaPagamento,
			parcelado,
			parcelas,
			tipo,
			transacaoEmEdicaoId,
			valor,
		],
	);

	return (
<>
			<Head>
				<title>Potato | Dashboard</title>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<link rel="shortcut icon" href="/img/potato.png" type="image/x-icon" />
			</Head>

			<TopBar tema={tema} onToggleTema={alternarTema} onOpenModal={abrirModalCriacao} />

			<main className="container">
				<PeriodSelector
					meses={MESES}
					anoSelecionado={anoSelecionado}
					mesSelecionado={mesSelecionado}
					onPrevYear={() => setAnoSelecionado((a) => a - 1)}
					onNextYear={() => setAnoSelecionado((a) => a + 1)}
					onSelectMonth={setMesSelecionado}
				/>

				<SummaryCards totaisPeriodo={totaisPeriodo} saldoGlobal={saldoGlobal} saldoStatus={saldoStatus} formatarMoeda={formatarMoeda} />

				<nav className="tabs" aria-label="Abas">
					<button className="tab active" type="button">Visão geral</button>
				</nav>

				<OverviewSection
					anoSelecionado={anoSelecionado}
					barCanvasRef={barCanvasRef}
					donutCanvasRef={donutCanvasRef}
					totalDonut={totalDonut}
					despesasPorCategoria={despesasPorCategoria}
					categoriaCores={CATEGORIA_CORES}
				/>

				<InvestmentBoxes
					caixinhas={caixinhas}
					totaisCaixinhas={totaisCaixinhas}
					totalInvestidoCaixinhas={totalInvestidoCaixinhas}
					formatarMoeda={formatarMoeda}
				/>

				<HistorySection
					meses={MESES}
					mesSelecionado={mesSelecionado}
					anoSelecionado={anoSelecionado}
					transacoesPeriodo={transacoesPeriodo}
					filtroAtual={filtroAtual}
					onFilterChange={setFiltroAtual}
					listaFiltrada={listaFiltrada}
					hojeISO={hojeISO}
					formatarDataVisual={formatarDataVisual}
					formatarMoeda={formatarMoeda}
					onEdit={iniciarEdicao}
					onDelete={abrirConfirmacaoExclusao}
				/>
			</main>

			<TransactionModal
				modalAberto={modalAberto}
				onClose={fecharModal}
				onSubmit={onSubmit}
				tipo={tipo}
				setTipo={setTipo}
				descricao={descricao}
				setDescricao={setDescricao}
				erroDescricao={erroDescricao}
				setErroDescricao={setErroDescricao}
				valor={valor}
				setValor={setValor}
				data={data}
				setData={setData}
				categoriasAtuais={categoriasAtuais}
				categoria={categoria}
				setCategoria={setCategoria}
				formaPagamento={formaPagamento}
				setFormaPagamento={setFormaPagamento}
				caixinhas={caixinhas}
				caixinhasSelecionadas={caixinhasSelecionadas}
				onToggleCaixinha={toggleCaixinhaSelecionada}
				onExcluirCaixinha={excluirCaixinha}
				novaCaixinha={novaCaixinha}
				setNovaCaixinha={setNovaCaixinha}
				metaNovaCaixinha={metaNovaCaixinha}
				setMetaNovaCaixinha={setMetaNovaCaixinha}
				onAdicionarCaixinha={adicionarCaixinha}
				parcelado={parcelado}
				setParcelado={setParcelado}
				parcelas={parcelas}
				setParcelas={setParcelas}
				erroParcelas={erroParcelas}
				setErroParcelas={setErroParcelas}
			/>

			<ConfirmModal
				confirmAberto={confirmAberto}
				exclusaoPendente={exclusaoPendente}
				onClose={fecharConfirmacao}
				onDeleteCurrent={apagarAtual}
				onDeleteAll={apagarTodas}
			/>
		</>
	);
}
