import React from "react";

// Mostra evolucao de cada caixinha de investimento com barra de progresso.
export const InvestmentBoxes = React.memo(function InvestmentBoxes({ caixinhas, totaisCaixinhas, totalInvestidoCaixinhas, formatarMoeda }) {
	return (
		<section className="panel caixinhas-panel">
			<div className="caixinhas-header">
				<h3>Caixinhas de investimento</h3>
				<small id="caixinhasResumo">Total: {formatarMoeda(totalInvestidoCaixinhas)}</small>
			</div>
			<div id="caixinhasCards" className="caixinhas-cards">
				{caixinhas.length === 0 ? (
					<p className="empty-state">Nenhuma caixinha criada ainda.</p>
				) : (
					caixinhas.map(({ nome, meta }) => {
						const valorCaixinha = totaisCaixinhas[nome] || 0;
						const percentual = meta > 0 ? Math.min(100, (valorCaixinha / meta) * 100) : 0;
						return (
							<article key={nome} className="caixinha-card">
								<h4>{nome}</h4>
								<div className="caixinha-bar">
									<span style={{ width: `${percentual.toFixed(1)}%` }} />
								</div>
								<div className="caixinha-meta">
									<strong>{formatarMoeda(valorCaixinha)}</strong>
									<small>
										{meta > 0 ? `Meta: ${formatarMoeda(meta)} • ${percentual.toFixed(1)}%` : "Meta não definida"}
									</small>
								</div>
							</article>
						);
					})
				)}
			</div>
		</section>
	);
});
