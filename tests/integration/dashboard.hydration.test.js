const { TextDecoder, TextEncoder } = require("util");

if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;

const React = require("react");
const { renderToString } = require("react-dom/server");
const { hydrateRoot } = require("react-dom/client");
const { act } = React;

jest.mock("next/head", () => ({
  __esModule: true,
  default: ({ children }) => React.createElement(React.Fragment, null, children),
}));

const Dashboard = require("../../pages/index").default;

describe("Dashboard hydration", () => {
  beforeAll(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;

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
  });

  test("nao deve gerar erro de hydration com dados no localStorage", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const transacoesPersistidas = [
      { id: "r1", tipo: "receita", descricao: "Receita Persistida", valor: 1000, data: "2026-04-16", categoria: "Salário" },
      { id: "d1", tipo: "despesa", descricao: "Despesa Persistida", valor: 200, data: "2026-04-16", categoria: "Outros", formaPagamento: "Pix" },
    ];

    const caixinhasPersistidas = [{ nome: "Reserva", meta: 5000 }];

    const originalWindow = global.window;
    const originalLocalStorage = global.localStorage;

    let html;
    try {
      delete global.window;
      delete global.localStorage;
      html = renderToString(React.createElement(Dashboard));
    } finally {
      global.window = originalWindow;
      global.localStorage = originalLocalStorage;
    }

    localStorage.setItem("temaDashboard", "dark");
    localStorage.setItem("transacoes", JSON.stringify(transacoesPersistidas));
    localStorage.setItem("caixinhasInvestimento", JSON.stringify(caixinhasPersistidas));

    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    let root;
    await act(async () => {
      root = hydrateRoot(container, React.createElement(Dashboard));
      await Promise.resolve();
    });

    const errorLog = consoleErrorSpy.mock.calls.map((args) => args.join(" ")).join("\n");
    expect(errorLog).not.toMatch(/hydration|did not match|server-rendered|Hydration failed/i);
    expect(document.getElementById("totalReceitas").textContent).not.toContain("R$ 0,00");

    await act(async () => {
      root.unmount();
    });

    container.remove();
    consoleErrorSpy.mockRestore();
  });
});
