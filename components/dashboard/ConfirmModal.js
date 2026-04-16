import React from "react";

// Modal de confirmacao para apagar transacao simples ou parcelada.
export const ConfirmModal = React.memo(function ConfirmModal({ confirmAberto, exclusaoPendente, onClose, onDeleteCurrent, onDeleteAll }) {
	return (
		<div
			className={`confirm-overlay ${confirmAberto ? "open" : ""}`}
			id="confirmOverlay"
			aria-hidden={confirmAberto ? "false" : "true"}
			onClick={(e) => {
				if (e.target.id === "confirmOverlay") onClose();
			}}
		>
			<section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirmTitulo">
				<h3 id="confirmTitulo">Confirmar exclusão</h3>
				<p id="confirmMensagem">
					{exclusaoPendente?.ehParcelada
						? "Esta é uma despesa parcelada. Você quer apagar apenas esta parcela ou todas as parcelas (todos os meses)?"
						: "Deseja realmente apagar esta transação?"}
				</p>
				<div className="confirm-actions">
					<button className="btn-ghost" id="btnConfirmCancelar" type="button" onClick={onClose}>Cancelar</button>
					<button className="btn-ghost" id="btnConfirmAtual" type="button" onClick={onDeleteCurrent}>
						{exclusaoPendente?.ehParcelada ? "Apagar só esta parcela" : "Apagar transação"}
					</button>
					<button className="btn-primary" id="btnConfirmTodas" type="button" onClick={onDeleteAll} style={{ display: exclusaoPendente?.ehParcelada ? "inline-flex" : "none" }}>
						Apagar todos os meses
					</button>
				</div>
			</section>
		</div>
	);
});
