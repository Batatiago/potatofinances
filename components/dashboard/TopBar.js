import React from "react";

// Cabecalho principal com identidade e acoes globais da dashboard.
export const TopBar = React.memo(function TopBar({ tema, onToggleTema, onOpenModal }) {
	return (
		<header className="topbar">
			<div className="brand">
				<img src="/img/potato.png" alt="Logo do projeto" />
				<div>
					<h1>Potato Finances</h1>
					<p>Controle financeiro pessoal</p>
				</div>
			</div>
			<div className="topbar-actions">
				<button className="btn-ghost" id="btnTema" type="button" aria-label="Alternar tema" onClick={onToggleTema}>
					{tema === "dark" ? "☀️" : "🌙"}
				</button>
				<button className="btn-primary" id="btnAbrirModal" type="button" onClick={onOpenModal}>
					+ Nova transação
				</button>
			</div>
		</header>
	);
});
