import React from "react";

// Bloco de visualizacao com grafico anual e rosca por categoria.
export const OverviewSection = React.memo(function OverviewSection({ anoSelecionado, barCanvasRef, donutCanvasRef, totalDonut, despesasPorCategoria, categoriaCores }) {
	return (
		<section className="overview-grid">
			<article className="panel chart-panel">
				<h3 id="barTitle">Visão anual - {anoSelecionado}</h3>
				<canvas ref={barCanvasRef} id="barChart" aria-label="Gráfico anual de receitas, despesas e investimentos" />
			</article>

			<article className="panel donut-panel">
				<h3>Gastos por categoria</h3>
				<canvas ref={donutCanvasRef} id="donutChart" aria-label="Gráfico de gastos por categoria" />
				<div className="legend" id="donutLegend">
					{totalDonut <= 0 ? (
						<span>
							<i style={{ background: "#e9eef7" }} />Sem dados
						</span>
					) : (
						Object.entries(despesasPorCategoria).map(([cat]) => (
							<span key={cat}>
								<i style={{ background: categoriaCores[cat] || categoriaCores.Outros }} />
								{cat}
							</span>
						))
					)}
				</div>
			</article>
		</section>
	);
});
