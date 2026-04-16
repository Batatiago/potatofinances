const React = require("react");
const { createRoot } = require("react-dom/client");
const { act } = React;

jest.mock("next/head", () => ({
  __esModule: true,
  default: ({ children }) => React.createElement(React.Fragment, null, children),
}));

const Dashboard = require("../../pages/index").default;

function click(el) {
  act(() => {
    el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  });
}

function input(el, value) {
  act(() => {
    el.value = value;
    el.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
}

function change(el) {
  act(() => {
    el.dispatchEvent(new window.Event("change", { bubbles: true }));
  });
}

function submitForm(form) {
  act(() => {
    form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  });
}

function findTransactionItemByText(text) {
  const items = Array.from(document.querySelectorAll("#listaTransacoes .transaction-item"));
  return items.find((item) => {
    const descricao = item.querySelector(".transaction-main strong")?.textContent?.trim() || "";
    return descricao === text;
  });
}

describe("Dashboard declarative functional validation", () => {
  let container;
  let root;

  beforeAll(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
  });

  function mountDashboard() {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    const mockCtx = {
      setTransform() {},
      clearRect() {},
      beginPath() {},
      moveTo() {},
      lineTo() {},
      arc() {},
      stroke() {},
      fillRect() {},
      fillText() {},
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 1,
      font: "",
      textAlign: "left",
    };

    Object.defineProperty(window.HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: () => mockCtx,
    });

    act(() => {
      root.render(React.createElement(Dashboard));
    });

    const bar = document.getElementById("barChart");
    const donut = document.getElementById("donutChart");
    Object.defineProperty(bar, "clientWidth", { configurable: true, value: 720 });
    Object.defineProperty(donut, "clientWidth", { configurable: true, value: 280 });

    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
  }

  beforeEach(() => {
    localStorage.clear();
    mountDashboard();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    document.body.className = "";
  });

  test("validates creation, filters, totals and deletion flow", () => {
    const today = new Date().toISOString().slice(0, 10);

    click(document.getElementById("btnTema"));
    expect(localStorage.getItem("temaDashboard")).toBeTruthy();

    click(document.getElementById("btnAbrirModal"));
    click(document.getElementById("btnTipoReceita"));
    input(document.getElementById("descricao"), "Receita QA");
    input(document.getElementById("valor"), "1500");
    input(document.getElementById("data"), today);
    submitForm(document.getElementById("formTransacao"));

    click(document.getElementById("btnAbrirModal"));
    click(document.getElementById("btnTipoDespesa"));
    input(document.getElementById("descricao"), "Despesa QA");
    input(document.getElementById("valor"), "300");
    input(document.getElementById("data"), today);
    const formaPagamento = document.getElementById("formaPagamento");
    formaPagamento.value = "Pix";
    change(formaPagamento);
    submitForm(document.getElementById("formTransacao"));

    click(document.getElementById("btnAbrirModal"));
    click(document.getElementById("btnTipoInvestimento"));
    input(document.getElementById("inputNovaCaixinha"), "Caixinha QA");
    input(document.getElementById("inputMetaCaixinha"), "1000");
    click(document.getElementById("btnAdicionarCaixinha"));
    input(document.getElementById("valor"), "500");
    input(document.getElementById("data"), today);
    submitForm(document.getElementById("formTransacao"));

    expect(document.getElementById("totalReceitas").textContent).not.toContain("R$ 0,00");
    expect(document.getElementById("totalDespesas").textContent).not.toContain("R$ 0,00");
    expect(document.getElementById("totalInvestimentos").textContent).not.toContain("R$ 0,00");
    expect(document.getElementById("caixinhasCards").textContent).toContain("Caixinha QA");

    click(document.getElementById("filtroReceitas"));
    expect(document.getElementById("listaTransacoes").textContent).toContain("Receita QA");
    expect(document.getElementById("listaTransacoes").textContent).not.toContain("Despesa QA");

    click(document.getElementById("filtroTodas"));
    const itemReceita = findTransactionItemByText("Receita QA");
    click(itemReceita.querySelector("button[data-acao='apagar']"));
    click(document.getElementById("btnConfirmAtual"));
    expect(findTransactionItemByText("Receita QA")).toBeFalsy();
  });

  test("covers validations, edit flow and saldo rule", () => {
    const today = new Date().toISOString().slice(0, 10);

    click(document.getElementById("btnAbrirModal"));
    click(document.getElementById("btnTipoDespesa"));
    input(document.getElementById("descricao"), "");
    input(document.getElementById("valor"), "100");
    input(document.getElementById("data"), today);
    submitForm(document.getElementById("formTransacao"));
    expect(JSON.parse(localStorage.getItem("transacoes") || "[]").length).toBe(0);

    input(document.getElementById("descricao"), "Despesa Parcelas Invalidas");
    const parcelado = document.getElementById("parcelado");
    parcelado.checked = true;
    change(parcelado);
    input(document.getElementById("parcelas"), "60");
    submitForm(document.getElementById("formTransacao"));
    expect(JSON.parse(localStorage.getItem("transacoes") || "[]").length).toBe(0);

    click(document.getElementById("btnTipoReceita"));
    input(document.getElementById("descricao"), "Receita Saldo");
    input(document.getElementById("valor"), "1000");
    input(document.getElementById("data"), today);
    submitForm(document.getElementById("formTransacao"));

    click(document.getElementById("btnAbrirModal"));
    click(document.getElementById("btnTipoDespesa"));
    input(document.getElementById("descricao"), "Despesa Cartao");
    input(document.getElementById("valor"), "200");
    input(document.getElementById("data"), today);
    const formaPagamento = document.getElementById("formaPagamento");
    formaPagamento.value = "Cartão";
    change(formaPagamento);
    submitForm(document.getElementById("formTransacao"));

    click(document.getElementById("btnAbrirModal"));
    click(document.getElementById("btnTipoDespesa"));
    input(document.getElementById("descricao"), "Despesa Pix");
    input(document.getElementById("valor"), "150");
    input(document.getElementById("data"), today);
    formaPagamento.value = "Pix";
    change(formaPagamento);
    submitForm(document.getElementById("formTransacao"));

    expect(document.getElementById("saldo").textContent).toContain("850");

    const itemEditar = findTransactionItemByText("Despesa Cartao");
    click(itemEditar.querySelector("button[data-acao='editar']"));
    input(document.getElementById("descricao"), "Despesa Cartao Editada");
    submitForm(document.getElementById("formTransacao"));

    expect(findTransactionItemByText("Despesa Cartao Editada")).toBeTruthy();
    expect(findTransactionItemByText("Despesa Cartao")).toBeFalsy();
  });
});
