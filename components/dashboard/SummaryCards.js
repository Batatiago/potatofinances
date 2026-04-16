import React from "react";

// Cards de resumo financeiro do periodo e saldo global.
export const SummaryCards = React.memo(function SummaryCards({ totaisPeriodo, saldoGlobal, saldoStatus, formatarMoeda }) {
	return (
		<section className="cards">
			<article className="card">
				<div className="card-header">
					<h2>Saldo atual</h2>
					<span className="icon">$</span>
				</div>
				<p className={`amount ${saldoGlobal >= 0 ? "positive" : "negative"}`} id="saldo">
					{formatarMoeda(saldoGlobal)}
				</p>
				<small id="saldoStatus">{saldoStatus}</small>
			</article>

			<article className="card">
				<div className="card-header">
					<h2>Receitas</h2>
					<span className="icon">+</span>
				</div>
				<p className="amount positive" id="totalReceitas">
					{formatarMoeda(totaisPeriodo.receitas)}
				</p>
				<small>
					<span id="qtdReceitas">{totaisPeriodo.qtdReceitas}</span> transações
				</small>
			</article>

			<article className="card">
				<div className="card-header">
					<h2>Despesas</h2>
					<span className="icon danger">-</span>
				</div>
				<p className="amount negative" id="totalDespesas">
					{formatarMoeda(totaisPeriodo.despesas)}
				</p>
				<small>
					<span id="qtdDespesas">{totaisPeriodo.qtdDespesas}</span> transações
				</small>
			</article>

			<article className="card">
				<div className="card-header">
					<h2>Investimentos</h2>
					<span className="icon">📊</span>
				</div>
				<p className="amount" id="totalInvestimentos">
					{formatarMoeda(totaisPeriodo.investimentos)}
				</p>
				<small>total em transações de investimento</small>
			</article>
		</section>
	);
});
