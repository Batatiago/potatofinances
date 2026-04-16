import React from "react";

// Modal de criacao/edicao de transacao com campos dinamicos por tipo.
export const TransactionModal = React.memo(function TransactionModal({
	modalAberto,
	onClose,
	onSubmit,
	tipo,
	setTipo,
	descricao,
	setDescricao,
	erroDescricao,
	setErroDescricao,
	valor,
	setValor,
	data,
	setData,
	categoriasAtuais,
	categoria,
	setCategoria,
	formaPagamento,
	setFormaPagamento,
	caixinhas,
	caixinhasSelecionadas,
	onToggleCaixinha,
	onExcluirCaixinha,
	novaCaixinha,
	setNovaCaixinha,
	metaNovaCaixinha,
	setMetaNovaCaixinha,
	onAdicionarCaixinha,
	parcelado,
	setParcelado,
	parcelas,
	setParcelas,
	erroParcelas,
	setErroParcelas,
}) {
	return (
		<div
			className={`modal-overlay ${modalAberto ? "open" : ""}`}
			id="modalOverlay"
			aria-hidden={modalAberto ? "false" : "true"}
			onClick={(e) => {
				if (e.target.id === "modalOverlay") onClose();
			}}
		>
			<section className="modal" id="modalTransacao" role="dialog" aria-modal="true" aria-labelledby="tituloModal">
				<header className="modal-header">
					<h3 id="tituloModal">Nova transação</h3>
					<button className="close-modal" id="btnFecharModal" type="button" aria-label="Fechar" onClick={onClose}>
						×
					</button>
				</header>

				<form id="formTransacao" onSubmit={onSubmit}>
					<div className="tipo-toggle" aria-label="Tipo de transação">
						<button className={`tipo-btn despesa ${tipo === "despesa" ? "active" : ""}`} id="btnTipoDespesa" type="button" onClick={() => setTipo("despesa")}>
							Despesa
						</button>
						<button className={`tipo-btn receita ${tipo === "receita" ? "active" : ""}`} id="btnTipoReceita" type="button" onClick={() => setTipo("receita")}>
							Receita
						</button>
						<button className={`tipo-btn investimento ${tipo === "investimento" ? "active" : ""}`} id="btnTipoInvestimento" type="button" onClick={() => setTipo("investimento")}>
							Investimento
						</button>
						<input type="hidden" id="tipo" value={tipo} readOnly />
					</div>

					<label className="field-label" htmlFor="descricao">Descrição</label>
					<input
						type="text"
						id="descricao"
						placeholder={tipo === "investimento" ? "Opcional para investimento" : "Ex: Supermercado"}
						value={descricao}
						onChange={(e) => {
							setDescricao(e.target.value);
							setErroDescricao("");
						}}
						onInput={(e) => {
							setDescricao(e.target.value);
							setErroDescricao("");
						}}
					/>
					{erroDescricao ? <small className="empty-state">{erroDescricao}</small> : null}

					<label className="field-label" htmlFor="valor">Valor (R$)</label>
					<input
						type="number"
						id="valor"
						placeholder="0,00"
						step="0.01"
						min="0.01"
						required
						value={valor}
						onChange={(e) => setValor(e.target.value)}
						onInput={(e) => setValor(e.target.value)}
					/>

					<div className="form-grid-2">
						<div id="categoriaWrap" style={{ display: tipo === "investimento" ? "none" : "block" }}>
							<label className="field-label" htmlFor="categoria">Categoria</label>
							<select id="categoria" required value={categoria} onChange={(e) => setCategoria(e.target.value)}>
								{categoriasAtuais.map((item) => (
									<option key={item} value={item}>{item}</option>
								))}
							</select>
						</div>

						<div>
							<label className="field-label" htmlFor="data">Data</label>
							<input
								type="date"
								id="data"
								required
								value={data}
								onChange={(e) => setData(e.target.value)}
								onInput={(e) => setData(e.target.value)}
							/>
						</div>
					</div>

					<div className="pagamento-wrap" id="pagamentoWrap" style={{ display: tipo === "despesa" ? "grid" : "none" }}>
						<label className="field-label" htmlFor="formaPagamento">Forma de pagamento</label>
						<select id="formaPagamento" value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
							<option value="Cartão">Cartão</option>
							<option value="Boleto">Boleto</option>
							<option value="Pix">Pix</option>
							<option value="Dinheiro">Dinheiro</option>
						</select>
					</div>

					<div className="investimento-wrap" id="investimentoWrap" style={{ display: tipo === "investimento" ? "grid" : "none" }}>
						<label className="field-label">Caixinhas</label>
						<div id="listaCaixinhas" className="caixinhas-list">
							{caixinhas.length === 0 ? (
								<small className="empty-state">Nenhuma caixinha cadastrada ainda.</small>
							) : (
								caixinhas.map(({ nome }) => (
									<label key={nome} className="caixinha-item">
										<div className="caixinha-item-main">
											<input type="checkbox" checked={caixinhasSelecionadas.includes(nome)} onChange={() => onToggleCaixinha(nome)} />
											<span>{nome}</span>
										</div>
										<button type="button" className="caixinha-delete" data-excluir-caixinha={nome} onClick={() => onExcluirCaixinha(nome)}>
											Excluir
										</button>
									</label>
								))
							)}
						</div>
						<div className="caixinha-add-row">
							<input
								type="text"
								id="inputNovaCaixinha"
								placeholder="Digite o nome da nova caixinha"
								value={novaCaixinha}
								onChange={(e) => setNovaCaixinha(e.target.value)}
								onInput={(e) => setNovaCaixinha(e.target.value)}
							/>
							<input
								type="number"
								id="inputMetaCaixinha"
								placeholder="Meta (R$)"
								min="0.01"
								step="0.01"
								value={metaNovaCaixinha}
								onChange={(e) => setMetaNovaCaixinha(e.target.value)}
								onInput={(e) => setMetaNovaCaixinha(e.target.value)}
							/>
							<button className="btn-ghost" id="btnAdicionarCaixinha" type="button" onClick={onAdicionarCaixinha}>Adicionar caixinha</button>
						</div>
					</div>

					<div className="parcel-wrap" id="parcelWrap" style={{ display: tipo === "despesa" ? "grid" : "none" }}>
						<label>
							<input
								type="checkbox"
								id="parcelado"
								checked={parcelado}
								onChange={(e) => {
									setParcelado(e.target.checked);
									if (!e.target.checked) setParcelas("");
									setErroParcelas("");
								}}
								onInput={(e) => {
									setParcelado(e.target.checked);
									if (!e.target.checked) setParcelas("");
									setErroParcelas("");
								}}
							/>{" "}
							Despesa parcelada
						</label>
						<input
							type="number"
							id="parcelas"
							min="2"
							max="48"
							placeholder="Número de parcelas"
							disabled={!parcelado}
							value={parcelas}
							onChange={(e) => {
								setParcelas(e.target.value);
								setErroParcelas("");
							}}
							onInput={(e) => {
								setParcelas(e.target.value);
								setErroParcelas("");
							}}
						/>
						{erroParcelas ? <small className="empty-state">{erroParcelas}</small> : null}
					</div>

					<button className="btn-primary" type="submit">Salvar transação</button>
				</form>
			</section>
		</div>
	);
});
