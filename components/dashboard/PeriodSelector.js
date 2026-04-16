import React from "react";

// Controle de ano e mes para navegar no periodo analisado.
export const PeriodSelector = React.memo(function PeriodSelector({ meses, anoSelecionado, mesSelecionado, onPrevYear, onNextYear, onSelectMonth }) {
	return (
		<section className="month-area">
			<div className="year-control" aria-label="Controle de ano">
				<button id="prevYear" type="button" aria-label="Ano anterior" onClick={onPrevYear}>
					&lt;
				</button>
				<strong id="selectedYear">{anoSelecionado}</strong>
				<button id="nextYear" type="button" aria-label="Próximo ano" onClick={onNextYear}>
					&gt;
				</button>
			</div>
			<div className="month-filter" id="monthButtons" aria-label="Meses do ano">
				{meses.map((mesNome, indice) => (
					<button
						key={mesNome}
						type="button"
						className={`chip ${indice === mesSelecionado ? "active" : ""}`}
						onClick={() => onSelectMonth(indice)}
					>
						{mesNome}
					</button>
				))}
			</div>
		</section>
	);
});
