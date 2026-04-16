import React from "react";

// Lista historica com filtros e acoes de editar/apagar transacoes.
export const HistorySection = React.memo(function HistorySection({
	meses,
	mesSelecionado,
	anoSelecionado,
	transacoesPeriodo,
	filtroAtual,
	onFilterChange,
	listaFiltrada,
	hojeISO,
	formatarDataVisual,
	formatarMoeda,
	onEdit,
	onDelete,
}) {
	return (
		<section className="panel history-panel">
			<div className="history-header">
				<h3 id="historyTitle">{`${meses[mesSelecionado]} - ${anoSelecionado} (${transacoesPeriodo.length} transações)`}</h3>
				<div className="pill-group">
					<button className={`pill ${filtroAtual === "todas" ? "active" : ""}`} id="filtroTodas" type="button" onClick={() => onFilterChange("todas")}>
						Todas
					</button>
					<button className={`pill ${filtroAtual === "receita" ? "active" : ""}`} id="filtroReceitas" type="button" onClick={() => onFilterChange("receita")}>
						Receitas
					</button>
					<button className={`pill ${filtroAtual === "despesa" ? "active" : ""}`} id="filtroDespesas" type="button" onClick={() => onFilterChange("despesa")}>
						Despesas
					</button>
					<button className={`pill ${filtroAtual === "investimento" ? "active" : ""}`} id="filtroInvestimentos" type="button" onClick={() => onFilterChange("investimento")}>
						Investimentos
					</button>
				</div>
			</div>
			<ul id="listaTransacoes">
				{listaFiltrada.length === 0 ? (
					<li className="empty-state">Nenhuma transação neste mês para o filtro selecionado.</li>
				) : (
					listaFiltrada.map((t) => {
						const parcelaTexto = t.parcelaAtual && t.totalParcelas ? ` • Parcela ${t.parcelaAtual}/${t.totalParcelas}` : "";
						const futuro = t.data > hojeISO;
						const pagamento = t.tipo === "despesa" ? ` • ${t.formaPagamento || "Cartão"}` : "";
						const caixTxt = t.tipo === "investimento" && t.caixinhas?.length > 0 ? ` • Caixinhas: ${t.caixinhas.join(", ")}` : "";
						return (
							<li key={t.id} className="transaction-item">
								<div className="transaction-main">
									<strong>
										{t.descricao} {futuro ? <span className="future-badge">Futura</span> : null}
									</strong>
									<span>{`${t.categoria}${pagamento} • ${formatarDataVisual(t.data)}${parcelaTexto}${caixTxt}`}</span>
								</div>
								<div className="transaction-actions">
									<span className={`transaction-value ${t.tipo}`}>{`${t.tipo === "despesa" ? "-" : "+"}${formatarMoeda(t.valor)}`}</span>
									<button className="action-btn" data-acao="editar" data-id={t.id} type="button" onClick={() => onEdit(t)}>
										Editar
									</button>
									<button className="action-btn danger" data-acao="apagar" data-id={t.id} type="button" onClick={() => onDelete(t)}>
										Apagar
									</button>
								</div>
							</li>
						);
					})
				)}
			</ul>
		</section>
	);
});
