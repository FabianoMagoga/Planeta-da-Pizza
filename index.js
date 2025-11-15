"use strict";
// index.ts — Pizzaria (ultra simples, COM persistência em JSON + CSV de relatórios)
// Como executar:
// 1) npm i -D typescript @types/node ts-node && npm i readline-sync
// 2) npx tsc --init (se ainda não existir tsconfig.json)
// 3) npx ts-node index.ts   (ou: npx tsc && node dist/index.js)
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var readlineSync = require("readline-sync");
var fs = require("fs");
var path = require("path");
var os = require("os");
// ================ Persistência ================
var DB_PATH = path.join(process.cwd(), "pizzaria-db.json");
var db = {
    clientes: [],
    produtos: [],
    pedidos: [],
};
var seq = 1; // id_...
var pedidoSeq = 1; // #0001 ...
function carregarDB() {
    try {
        if (fs.existsSync(DB_PATH)) {
            var raw = fs.readFileSync(DB_PATH, "utf8");
            var data = JSON.parse(raw);
            if (data === null || data === void 0 ? void 0 : data.clientes)
                db.clientes = data.clientes;
            if (data === null || data === void 0 ? void 0 : data.produtos)
                db.produtos = data.produtos;
            if (data === null || data === void 0 ? void 0 : data.pedidos)
                db.pedidos = data.pedidos;
            var maxIdNum = Math.max.apply(Math, __spreadArray(__spreadArray([0], db.clientes.map(function (c) { return parseInt((c.id || "").split("_")[1] || "0", 10); }), false), db.produtos.map(function (p) { return parseInt((p.id || "").split("_")[1] || "0", 10); }), false));
            seq = Number.isFinite(maxIdNum) ? (maxIdNum + 1) : 1;
            var maxPed = Math.max.apply(Math, __spreadArray([0], db.pedidos.map(function (p) { return p.numero; }), false));
            pedidoSeq = Number.isFinite(maxPed) ? (maxPed + 1) : 1;
        }
    }
    catch (e) {
        console.warn("Falha ao carregar o banco. Iniciando vazio. Detalhe:", e);
    }
}
function salvarDB() {
    try {
        var payload = __assign(__assign({}, db), { _meta: { seq: seq, pedidoSeq: pedidoSeq, savedAt: new Date().toISOString() } });
        fs.writeFileSync(DB_PATH, JSON.stringify(payload, null, 2), "utf8");
    }
    catch (e) {
        console.error("Falha ao salvar o banco:", e);
    }
}
// ================ Utilidades ================
var nextId = function () { return "id_".concat(seq++); };
var nextPedidoNumero = function () { return pedidoSeq++; };
var real = function (n) { return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); };
var dec = function (n) { return n.toFixed(2); }; // para CSV (ponto decimal)
var fmtData = function (iso) {
    var d = new Date(iso);
    var dd = String(d.getDate()).padStart(2, "0");
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var yy = d.getFullYear();
    var hh = String(d.getHours()).padStart(2, "0");
    var mi = String(d.getMinutes()).padStart(2, "0");
    return "".concat(dd, "/").concat(mm, "/").concat(yy, " ").concat(hh, ":").concat(mi);
};
var fmtPedido = function (n, width) {
    if (width === void 0) { width = 4; }
    return String(n).padStart(width, "0");
};
var chaveDia = function (iso) {
    var d = new Date(iso);
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var da = String(d.getDate()).padStart(2, "0");
    return "".concat(y, "-").concat(m, "-").concat(da);
};
var ts = function () {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var da = String(d.getDate()).padStart(2, "0");
    var hh = String(d.getHours()).padStart(2, "0");
    var mi = String(d.getMinutes()).padStart(2, "0");
    var ss = String(d.getSeconds()).padStart(2, "0");
    return "".concat(y).concat(m).concat(da, "-").concat(hh).concat(mi).concat(ss);
};
// === CONFIG (taxa/entrega) ===
var ENTREGA_GRATIS_MIN = 200.00;
var TAXA_ENTREGA_BASE = 8.00;
var TAXA_ENTREGA_POR_BAIRRO = {
    "centro": 5.00,
    "retiro": 6.00,
    "anhangabau": 8.00,
    "vila arens": 8.00,
    "vianelo": 7.00,
    "agasal": 12.00
};
// ==== Promoções (exibição) ====
var PROMOS_INFO = [
    { nome: "Terça Doce", regra: "10% de desconto nas Pizzas Doces às terças-feiras.", obs: "Aplica sobre os itens de Pizza Doces." },
    { nome: "Combo Pizza + Refri", regra: "R$ 5,00 de desconto se o pedido tiver pelo menos 1 Pizza e 1 Refrigerante." },
    { nome: "Cupom PLANET10", chave: "PLANET10", regra: "10% de desconto no subtotal usando o cupom PLANET10." },
    { nome: "Cupom PIX5", chave: "PIX5", regra: "R$ 5,00 de desconto no pagamento via Pix usando o cupom PIX5." },
    { nome: "Frete Grátis", regra: "Entrega gr\u00E1tis a partir de ".concat(real(ENTREGA_GRATIS_MIN), " (aplica automaticamente).") }
];
// Helpers gerais
var soDigitos = function (s) { return s.replace(/\D/g, ""); };
var normalizeCpf = function (s) { return soDigitos(s); };
var validaCpfBasico = function (s) { return normalizeCpf(s).length === 11; };
var formatCpf = function (digits) {
    var d = normalizeCpf(digits).padStart(11, "0");
    return "".concat(d.slice(0, 3), ".").concat(d.slice(3, 6), ".").concat(d.slice(6, 9), "-").concat(d.slice(9));
};
function sanitizeText(text) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
var normalizeKey = function (s) { return s ? sanitizeText(s).trim().toLowerCase() : ""; };
// Entrada de dados
function lerQuantidade(msg) {
    if (msg === void 0) { msg = "Qtd: "; }
    while (true) {
        var raw = readlineSync.question(msg).trim().replace(",", ".");
        var qtd = Number(raw);
        if (Number.isInteger(qtd) && qtd > 0)
            return qtd;
        console.log("Quantidade invalida. Use numero inteiro (ex: 1, 2, 3).");
    }
}
function lerObrigatorio(msg) {
    while (true) {
        var v = readlineSync.question(msg).trim();
        if (v)
            return v;
        console.log("Campo obrigatorio.");
    }
}
function lerDataBR(msg) {
    var s = readlineSync.question(msg).trim();
    if (!s)
        return null;
    var m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m)
        return null;
    var _ = m[0], dd = m[1], mm = m[2], yyyy = m[3];
    var d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), 0, 0, 0, 0);
    return isNaN(d.getTime()) ? null : d;
}
// ENTREGA/RETIRADA
function lerModoPedido() {
    while (true) {
        var resp = readlineSync.question("Entrega (E) ou Retirada (R)? ").trim().toUpperCase();
        if (resp.startsWith("R"))
            return { modo: "RETIRADA" };
        if (resp.startsWith("E")) {
            var endereco = lerObrigatorio("Endereco: ");
            var numero = lerObrigatorio("Numero: ");
            var bairro = readlineSync.question("Bairro (opcional, ajuda a calcular taxa): ").trim();
            var cep = readlineSync.question("CEP (opcional): ").trim();
            var referencia = readlineSync.question("Ponto de referencia (opcional): ").trim();
            return { modo: "ENTREGA", entrega: { endereco: endereco, numero: numero, bairro: bairro || undefined, cep: cep || undefined, referencia: referencia || undefined } };
        }
        console.log("Opcao invalida. Digite E para Entrega ou R para Retirada.");
    }
}
function calcularTaxaEntrega(modo, entrega, subtotalPosDesc) {
    if (modo !== "ENTREGA")
        return 0;
    if (subtotalPosDesc >= ENTREGA_GRATIS_MIN)
        return 0;
    var key = normalizeKey(entrega === null || entrega === void 0 ? void 0 : entrega.bairro);
    if (key && Object.prototype.hasOwnProperty.call(TAXA_ENTREGA_POR_BAIRRO, key)) {
        return TAXA_ENTREGA_POR_BAIRRO[key];
    }
    return TAXA_ENTREGA_BASE;
}
function calcularDescontos(itens, subtotal, forma, cupom) {
    var linhas = [];
    var hoje = new Date();
    var diaSemana = hoje.getDay(); // 0-dom ... 2-ter ...
    var hasPizza = itens.some(function (i) { return i.cat === "Pizza Salgadas"; });
    var hasBebida = itens.some(function (i) { return i.cat === "Bebida"; });
    var totalDoces = itens.filter(function (i) { return i.cat === "Pizza Doces"; }).reduce(function (s, i) { return s + i.preco * i.qtd; }, 0);
    // Terça Doce
    if (diaSemana === 2 && totalDoces > 0) {
        linhas.push({ nome: "Terça Doce (10% nas Pizzas Doces)", valor: +(totalDoces * 0.10).toFixed(2) });
    }
    // Combo Pizza + Refri
    if (hasPizza && hasBebida) {
        linhas.push({ nome: "Combo Pizza + Refri", valor: 5.00 });
    }
    // Cupom
    var cup = (cupom !== null && cupom !== void 0 ? cupom : "").trim().toUpperCase();
    if (cup === "PLANET10") {
        linhas.push({ nome: "Cupom PLANET10 (10%)", valor: +(subtotal * 0.10).toFixed(2) });
    }
    else if (cup === "PIX5" && forma === "Pix") {
        linhas.push({ nome: "Cupom PIX5", valor: 5.00 });
    }
    else if (cup && !["PLANET10", "PIX5"].includes(cup)) {
        console.log("Cupom informado é inválido ou não aplicável — será ignorado.");
    }
    var total = Math.min(subtotal, +linhas.reduce(function (s, l) { return s + l.valor; }, 0).toFixed(2));
    return { linhas: linhas, total: total };
}
// ============ Desktop & CSV ============
function resolveDesktopPath() {
    var candidates = [];
    for (var _i = 0, _a = ["OneDrive", "OneDriveConsumer", "OneDriveCommercial"]; _i < _a.length; _i++) {
        var v = _a[_i];
        var base = process.env[v];
        if (base)
            candidates.push(path.join(base, "Desktop"));
    }
    if (process.env.USERPROFILE)
        candidates.push(path.join(process.env.USERPROFILE, "Desktop"));
    candidates.push(path.join(os.homedir(), "Desktop"));
    if (process.env.USERPROFILE)
        candidates.push(path.join(process.env.USERPROFILE, "Área de Trabalho"));
    candidates.push(path.join(os.homedir(), "Área de Trabalho"));
    for (var _b = 0, candidates_1 = candidates; _b < candidates_1.length; _b++) {
        var p = candidates_1[_b];
        try {
            if (p && fs.existsSync(p) && fs.statSync(p).isDirectory())
                return p;
        }
        catch (_c) { }
    }
    return null;
}
function csvEscape(s) {
    var needsQuotes = /[",\n]/.test(s);
    var out = s.replace(/"/g, '""');
    return needsQuotes ? "\"".concat(out, "\"") : out;
}
function saveCSV(baseName, headers, rows) {
    var desktopDir = resolveDesktopPath();
    var fname = "".concat(baseName, "-").concat(ts(), ".csv");
    var targetDir = desktopDir !== null && desktopDir !== void 0 ? desktopDir : process.cwd();
    var filePath = path.join(targetDir, fname);
    var lines = [];
    lines.push(headers.map(function (h) { return csvEscape(h); }).join(","));
    for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
        var r = rows_1[_i];
        lines.push(r.map(function (v) { return csvEscape(String(v)); }).join(","));
    }
    fs.writeFileSync(filePath, lines.join("\n"), "utf8");
    console.log("\nArquivo CSV salvo em: ".concat(filePath));
    return filePath;
}
// =================== Menus ===================
function pause() { readlineSync.question("\nENTER para continuar..."); }
function menuPrincipal() {
    while (true) {
        console.clear();
        console.log("=== PLANET PIZZARIA ===");
        console.log("1) Clientes");
        console.log("2) Produtos");
        console.log("3) Novo Pedido");
        console.log("4) Listar Pedidos");
        console.log("5) Pesquisa/Relatórios");
        console.log("9) Salvar agora");
        console.log("0) Sair");
        var op = readlineSync.question("Escolha: ");
        if (op === "1")
            menuClientes();
        else if (op === "2")
            menuProdutos();
        else if (op === "3")
            fluxoPedido();
        else if (op === "4")
            listarPedidos();
        else if (op === "5")
            menuPesquisa();
        else if (op === "9") {
            salvarDB();
            console.log("Banco salvo.");
            pause();
        }
        else if (op === "0") {
            salvarDB();
            process.exit(0);
        }
    }
}
// ---- Relatórios (exibição) ----
function isPizza(cat) { return cat === "Pizza Salgadas" || cat === "Pizza Doces"; }
function relPizzasVendidasPorDia() {
    var _a;
    var mapa = new Map();
    for (var _i = 0, _b = db.pedidos; _i < _b.length; _i++) {
        var p = _b[_i];
        var qPizzas = p.itens.reduce(function (s, it) { return s + (isPizza(it.cat) ? it.qtd : 0); }, 0);
        if (qPizzas > 0) {
            var k = chaveDia(p.criadoEm);
            mapa.set(k, ((_a = mapa.get(k)) !== null && _a !== void 0 ? _a : 0) + qPizzas);
        }
    }
    var linhas = Array.from(mapa.entries()).sort(function (a, b) { return a[0].localeCompare(b[0]); });
    if (linhas.length === 0) {
        console.log("Sem vendas de pizza registradas.");
        return;
    }
    console.log("\n== PIZZAS VENDIDAS POR DIA ==");
    for (var _c = 0, linhas_1 = linhas; _c < linhas_1.length; _c++) {
        var _d = linhas_1[_c], dia = _d[0], qtd = _d[1];
        console.log("".concat(dia, ": ").concat(qtd, " pizza(s)"));
    }
}
function relPizzasVendidasNoMes() {
    var _a, _b;
    var hoje = new Date();
    var mesStr = readlineSync.question("Mes (1-12, ENTER=".concat(hoje.getMonth() + 1, "): ")).trim();
    var anoStr = readlineSync.question("Ano (ENTER=".concat(hoje.getFullYear(), "): ")).trim();
    var mes = mesStr ? Number(mesStr) : (hoje.getMonth() + 1);
    var ano = anoStr ? Number(anoStr) : hoje.getFullYear();
    if (!Number.isInteger(mes) || mes < 1 || mes > 12 || !Number.isInteger(ano) || ano < 1970) {
        console.log("Mes/ano invalidos.");
        return;
    }
    var totalMes = 0;
    var porSabor = new Map();
    var porDia = new Map();
    for (var _i = 0, _c = db.pedidos; _i < _c.length; _i++) {
        var p = _c[_i];
        var d = new Date(p.criadoEm);
        var m = d.getMonth() + 1;
        var y = d.getFullYear();
        if (m === mes && y === ano) {
            for (var _d = 0, _e = p.itens; _d < _e.length; _d++) {
                var it = _e[_d];
                if (isPizza(it.cat)) {
                    totalMes += it.qtd;
                    porSabor.set(it.nome, ((_a = porSabor.get(it.nome)) !== null && _a !== void 0 ? _a : 0) + it.qtd);
                    var k = chaveDia(p.criadoEm);
                    porDia.set(k, ((_b = porDia.get(k)) !== null && _b !== void 0 ? _b : 0) + it.qtd);
                }
            }
        }
    }
    console.log("\n== PIZZAS VENDIDAS NO MES ".concat(String(mes).padStart(2, "0"), "/").concat(ano, " =="));
    console.log("Total: ".concat(totalMes, " pizza(s)"));
    if (totalMes === 0)
        return;
    console.log("\nTop sabores (até 10):");
    var sabores = Array.from(porSabor.entries()).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 10);
    for (var _f = 0, sabores_1 = sabores; _f < sabores_1.length; _f++) {
        var _g = sabores_1[_f], nome = _g[0], qtd = _g[1];
        console.log("- ".concat(nome, ": ").concat(qtd));
    }
    console.log("\nQuebra por dia:");
    var dias = Array.from(porDia.entries()).sort(function (a, b) { return a[0].localeCompare(b[0]); });
    for (var _h = 0, dias_1 = dias; _h < dias_1.length; _h++) {
        var _j = dias_1[_h], dia = _j[0], qtd = _j[1];
        console.log("".concat(dia, ": ").concat(qtd));
    }
}
function relFaturamentoPorDia() {
    var _a;
    var mapa = new Map();
    for (var _i = 0, _b = db.pedidos; _i < _b.length; _i++) {
        var p = _b[_i];
        var k = chaveDia(p.criadoEm);
        mapa.set(k, ((_a = mapa.get(k)) !== null && _a !== void 0 ? _a : 0) + p.total);
    }
    var linhas = Array.from(mapa.entries()).sort(function (a, b) { return a[0].localeCompare(b[0]); });
    if (linhas.length === 0) {
        console.log("Sem faturamento registrado.");
        return;
    }
    console.log("\n== FATURAMENTO POR DIA ==");
    for (var _c = 0, linhas_2 = linhas; _c < linhas_2.length; _c++) {
        var _d = linhas_2[_c], dia = _d[0], total = _d[1];
        console.log("".concat(dia, ": ").concat(real(total)));
    }
}
function relFaturamentoPorMes() {
    var _a;
    var hoje = new Date();
    var mesStr = readlineSync.question("Mes (1-12, ENTER=".concat(hoje.getMonth() + 1, "): ")).trim();
    var anoStr = readlineSync.question("Ano (ENTER=".concat(hoje.getFullYear(), "): ")).trim();
    var mes = mesStr ? Number(mesStr) : (hoje.getMonth() + 1);
    var ano = anoStr ? Number(anoStr) : hoje.getFullYear();
    if (!Number.isInteger(mes) || mes < 1 || mes > 12 || !Number.isInteger(ano) || ano < 1970) {
        console.log("Mes/ano invalidos.");
        return;
    }
    var totalMes = 0;
    var porDia = new Map();
    for (var _i = 0, _b = db.pedidos; _i < _b.length; _i++) {
        var p = _b[_i];
        var d = new Date(p.criadoEm);
        var m = d.getMonth() + 1;
        var y = d.getFullYear();
        if (m === mes && y === ano) {
            totalMes += p.total;
            var k = chaveDia(p.criadoEm);
            porDia.set(k, ((_a = porDia.get(k)) !== null && _a !== void 0 ? _a : 0) + p.total);
        }
    }
    console.log("\n== FATURAMENTO ".concat(String(mes).padStart(2, "0"), "/").concat(ano, " =="));
    console.log("Total do m\u00EAs: ".concat(real(totalMes)));
    if (totalMes === 0)
        return;
    console.log("\nQuebra por dia:");
    var dias = Array.from(porDia.entries()).sort(function (a, b) { return a[0].localeCompare(b[0]); });
    for (var _c = 0, dias_2 = dias; _c < dias_2.length; _c++) {
        var _d = dias_2[_c], dia = _d[0], tot = _d[1];
        console.log("".concat(dia, ": ").concat(real(tot)));
    }
}
function relRankingSaboresPeriodo() {
    var _a, _b;
    console.log("Informe o período (dd/mm/aaaa). Deixe em branco para não filtrar.");
    var di = lerDataBR("Data inicial: ");
    var df = lerDataBR("Data final: ");
    var dIni = di ? new Date(di) : null;
    var dFim = df ? new Date(df.getTime() + 24 * 60 * 60 * 1000 - 1) : null;
    var porSaborQtd = new Map();
    var porSaborReceita = new Map();
    var totalPizzas = 0;
    for (var _i = 0, _c = db.pedidos; _i < _c.length; _i++) {
        var p = _c[_i];
        var t = new Date(p.criadoEm).getTime();
        if (dIni && t < dIni.getTime())
            continue;
        if (dFim && t > dFim.getTime())
            continue;
        for (var _d = 0, _e = p.itens; _d < _e.length; _d++) {
            var it = _e[_d];
            if (isPizza(it.cat)) {
                totalPizzas += it.qtd;
                porSaborQtd.set(it.nome, ((_a = porSaborQtd.get(it.nome)) !== null && _a !== void 0 ? _a : 0) + it.qtd);
                porSaborReceita.set(it.nome, ((_b = porSaborReceita.get(it.nome)) !== null && _b !== void 0 ? _b : 0) + it.qtd * it.preco);
            }
        }
    }
    console.log("\n== RANKING DE SABORES POR PERÍODO ==");
    console.log("Total de pizzas vendidas no per\u00EDodo: ".concat(totalPizzas));
    if (totalPizzas === 0)
        return;
    var ranking = Array.from(porSaborQtd.entries())
        .map(function (_a) {
        var _b;
        var nome = _a[0], qtd = _a[1];
        return ({ nome: nome, qtd: qtd, receita: (_b = porSaborReceita.get(nome)) !== null && _b !== void 0 ? _b : 0 });
    })
        .sort(function (a, b) { return b.qtd - a.qtd; })
        .slice(0, 15);
    console.log("\nTop sabores (até 15):");
    for (var _f = 0, ranking_1 = ranking; _f < ranking_1.length; _f++) {
        var r = ranking_1[_f];
        console.log("- ".concat(r.nome, ": ").concat(r.qtd, " un. | Receita: ").concat(real(r.receita)));
    }
}
// ---- EXPORTAÇÕES CSV ----
function exportPizzasVendidasPorDiaCSV() {
    var _a;
    var mapa = new Map();
    for (var _i = 0, _b = db.pedidos; _i < _b.length; _i++) {
        var p = _b[_i];
        var qPizzas = p.itens.reduce(function (s, it) { return s + (isPizza(it.cat) ? it.qtd : 0); }, 0);
        if (qPizzas > 0) {
            var k = chaveDia(p.criadoEm);
            mapa.set(k, ((_a = mapa.get(k)) !== null && _a !== void 0 ? _a : 0) + qPizzas);
        }
    }
    var linhas = Array.from(mapa.entries()).sort(function (a, b) { return a[0].localeCompare(b[0]); });
    if (linhas.length === 0) {
        console.log("Sem dados para exportar.");
        return;
    }
    saveCSV("pizzas_por_dia", ["data", "qtd_pizzas"], linhas.map(function (_a) {
        var dia = _a[0], qtd = _a[1];
        return [dia, String(qtd)];
    }));
}
function exportPizzasVendidasNoMesCSV() {
    var _a, _b;
    var hoje = new Date();
    var mesStr = readlineSync.question("Mes (1-12, ENTER=".concat(hoje.getMonth() + 1, "): ")).trim();
    var anoStr = readlineSync.question("Ano (ENTER=".concat(hoje.getFullYear(), "): ")).trim();
    var mes = mesStr ? Number(mesStr) : (hoje.getMonth() + 1);
    var ano = anoStr ? Number(anoStr) : hoje.getFullYear();
    if (!Number.isInteger(mes) || mes < 1 || mes > 12 || !Number.isInteger(ano) || ano < 1970) {
        console.log("Mes/ano invalidos.");
        return;
    }
    var porSabor = new Map();
    var porDia = new Map();
    for (var _i = 0, _c = db.pedidos; _i < _c.length; _i++) {
        var p = _c[_i];
        var d = new Date(p.criadoEm);
        var m = d.getMonth() + 1;
        var y = d.getFullYear();
        if (m === mes && y === ano) {
            for (var _d = 0, _e = p.itens; _d < _e.length; _d++) {
                var it = _e[_d];
                if (isPizza(it.cat)) {
                    porSabor.set(it.nome, ((_a = porSabor.get(it.nome)) !== null && _a !== void 0 ? _a : 0) + it.qtd);
                    var k = chaveDia(p.criadoEm);
                    porDia.set(k, ((_b = porDia.get(k)) !== null && _b !== void 0 ? _b : 0) + it.qtd);
                }
            }
        }
    }
    if (porSabor.size === 0) {
        console.log("Sem dados para exportar.");
        return;
    }
    saveCSV("pizzas_mes_".concat(ano, "-").concat(String(mes).padStart(2, "0"), "_por_dia"), ["data", "qtd_pizzas"], Array.from(porDia.entries()).sort(function (a, b) { return a[0].localeCompare(b[0]); }).map(function (_a) {
        var d = _a[0], q = _a[1];
        return [d, String(q)];
    }));
    saveCSV("pizzas_mes_".concat(ano, "-").concat(String(mes).padStart(2, "0"), "_por_sabor"), ["sabor", "qtd_pizzas"], Array.from(porSabor.entries()).sort(function (a, b) { return b[1] - a[1]; }).map(function (_a) {
        var s = _a[0], q = _a[1];
        return [s, String(q)];
    }));
}
function exportFaturamentoPorDiaCSV() {
    var _a;
    var mapa = new Map();
    for (var _i = 0, _b = db.pedidos; _i < _b.length; _i++) {
        var p = _b[_i];
        var k = chaveDia(p.criadoEm);
        mapa.set(k, ((_a = mapa.get(k)) !== null && _a !== void 0 ? _a : 0) + p.total);
    }
    var linhas = Array.from(mapa.entries()).sort(function (a, b) { return a[0].localeCompare(b[0]); });
    if (linhas.length === 0) {
        console.log("Sem dados para exportar.");
        return;
    }
    saveCSV("faturamento_por_dia", ["data", "total"], linhas.map(function (_a) {
        var d = _a[0], t = _a[1];
        return [d, dec(t)];
    }));
}
function exportFaturamentoPorMesCSV() {
    var _a;
    var hoje = new Date();
    var mesStr = readlineSync.question("Mes (1-12, ENTER=".concat(hoje.getMonth() + 1, "): ")).trim();
    var anoStr = readlineSync.question("Ano (ENTER=".concat(hoje.getFullYear(), "): ")).trim();
    var mes = mesStr ? Number(mesStr) : (hoje.getMonth() + 1);
    var ano = anoStr ? Number(anoStr) : hoje.getFullYear();
    if (!Number.isInteger(mes) || mes < 1 || mes > 12 || !Number.isInteger(ano) || ano < 1970) {
        console.log("Mes/ano invalidos.");
        return;
    }
    var porDia = new Map();
    for (var _i = 0, _b = db.pedidos; _i < _b.length; _i++) {
        var p = _b[_i];
        var d = new Date(p.criadoEm);
        var m = d.getMonth() + 1;
        var y = d.getFullYear();
        if (m === mes && y === ano) {
            var k = chaveDia(p.criadoEm);
            porDia.set(k, ((_a = porDia.get(k)) !== null && _a !== void 0 ? _a : 0) + p.total);
        }
    }
    if (porDia.size === 0) {
        console.log("Sem dados para exportar.");
        return;
    }
    saveCSV("faturamento_mes_".concat(ano, "-").concat(String(mes).padStart(2, "0"), "_por_dia"), ["data", "total"], Array.from(porDia.entries()).sort(function (a, b) { return a[0].localeCompare(b[0]); }).map(function (_a) {
        var d = _a[0], t = _a[1];
        return [d, dec(t)];
    }));
}
function exportRankingSaboresPeriodoCSV() {
    var _a, _b;
    console.log("Informe o período (dd/mm/aaaa). Deixe em branco para não filtrar.");
    var di = lerDataBR("Data inicial: ");
    var df = lerDataBR("Data final: ");
    var dIni = di ? new Date(di) : null;
    var dFim = df ? new Date(df.getTime() + 24 * 60 * 60 * 1000 - 1) : null;
    var porSaborQtd = new Map();
    var porSaborReceita = new Map();
    for (var _i = 0, _c = db.pedidos; _i < _c.length; _i++) {
        var p = _c[_i];
        var t = new Date(p.criadoEm).getTime();
        if (dIni && t < dIni.getTime())
            continue;
        if (dFim && t > dFim.getTime())
            continue;
        for (var _d = 0, _e = p.itens; _d < _e.length; _d++) {
            var it = _e[_d];
            if (isPizza(it.cat)) {
                porSaborQtd.set(it.nome, ((_a = porSaborQtd.get(it.nome)) !== null && _a !== void 0 ? _a : 0) + it.qtd);
                porSaborReceita.set(it.nome, ((_b = porSaborReceita.get(it.nome)) !== null && _b !== void 0 ? _b : 0) + it.qtd * it.preco);
            }
        }
    }
    if (porSaborQtd.size === 0) {
        console.log("Sem dados para exportar.");
        return;
    }
    var nomeBase = "ranking_sabores_".concat(dIni ? chaveDia(dIni.toISOString()) : "inicio", "_").concat(dFim ? chaveDia(dFim.toISOString()) : "fim");
    var rows = Array.from(porSaborQtd.entries())
        .map(function (_a) {
        var _b;
        var nome = _a[0], qtd = _a[1];
        return [nome, String(qtd), dec((_b = porSaborReceita.get(nome)) !== null && _b !== void 0 ? _b : 0)];
    });
    saveCSV(nomeBase, ["sabor", "qtd", "receita"], rows.sort(function (a, b) { return Number(b[1]) - Number(a[1]); }));
}
function exportHistoricoPorCPFCSV() {
    var cpfEntrada = readlineSync.question("CPF do cliente (apenas numeros): ").trim();
    if (!validaCpfBasico(cpfEntrada)) {
        console.log("CPF invalido.");
        return;
    }
    var cpf = normalizeCpf(cpfEntrada);
    var cli = db.clientes.find(function (c) { return c.cpf === cpf; });
    if (!cli) {
        console.log("Cliente nao encontrado.");
        return;
    }
    var pedidos = db.pedidos.filter(function (p) { return p.clienteId === cli.id; });
    if (pedidos.length === 0) {
        console.log("Cliente sem pedidos para exportar.");
        return;
    }
    var rows = [];
    for (var _i = 0, pedidos_1 = pedidos; _i < pedidos_1.length; _i++) {
        var p = pedidos_1[_i];
        var itensTxt = p.itens.map(function (i) { return "".concat(i.qtd, "x ").concat(i.nome); }).join(" | ");
        rows.push([
            "#".concat(fmtPedido(p.numero)),
            fmtData(p.criadoEm),
            p.modo,
            dec(p.subtotal),
            dec(p.descontos),
            dec(p.taxaEntrega),
            dec(p.total),
            p.forma,
            itensTxt
        ]);
    }
    saveCSV("historico_".concat(sanitizeText(cli.nome), "_").concat(cpf), ["pedido", "data", "modo", "subtotal", "descontos", "taxa_entrega", "total", "forma", "itens"], rows);
}
// ---- Menu Pesquisa / Extras / Relatórios ----
function menuPesquisa() {
    console.clear();
    console.log("=== PESQUISA / EXTRAS / RELATORIOS ===");
    console.log("1) Buscar Promoções");
    console.log("2) Buscar Formas de Pagamento");
    console.log("3) Histórico de compras por CPF");
    console.log("4) Relatório: pizzas vendidas por dia");
    console.log("5) Relatório: pizzas vendidas no mês");
    console.log("6) Relatório: faturamento por dia");
    console.log("7) Relatório: faturamento por mês");
    console.log("8) Ranking de sabores por período");
    console.log("9) Exportar CSV: pizzas vendidas por dia");
    console.log("10) Exportar CSV: pizzas vendidas no mês");
    console.log("11) Exportar CSV: faturamento por dia");
    console.log("12) Exportar CSV: faturamento por mês");
    console.log("13) Exportar CSV: ranking de sabores (período)");
    console.log("14) Exportar CSV: histórico por CPF");
    console.log("0) Voltar");
    var op = readlineSync.question("Escolha: ").trim();
    if (op === "1") {
        var termo_1 = readlineSync.question("Palavra-chave (ENTER = listar todas): ").trim().toLowerCase();
        var list = PROMOS_INFO.filter(function (p) {
            var _a;
            return !termo_1 ||
                p.nome.toLowerCase().includes(termo_1) ||
                ((_a = p.chave) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(termo_1)) ||
                p.regra.toLowerCase().includes(termo_1);
        });
        if (list.length === 0)
            console.log("Nenhuma promocao encontrada.");
        else {
            console.log("\n== PROMOÇÕES ==");
            for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
                var p = list_1[_i];
                var cup = p.chave ? " | Cupom: ".concat(p.chave) : "";
                var obs = p.obs ? " | Obs: ".concat(p.obs) : "";
                console.log("- ".concat(p.nome).concat(cup, "\n  Regra: ").concat(p.regra).concat(obs));
            }
        }
        pause();
    }
    else if (op === "2") {
        var formas = ["Dinheiro", "Credito", "Debito", "Pix", "Vale refeicao", "Alimentacao"];
        var termo_2 = readlineSync.question("Filtrar por termo (ENTER = todas): ").trim().toLowerCase();
        var list = formas.filter(function (f) { return !termo_2 || f.toLowerCase().includes(termo_2); });
        console.log("\n== FORMAS DE PAGAMENTO ACEITAS ==");
        for (var _a = 0, list_2 = list; _a < list_2.length; _a++) {
            var f = list_2[_a];
            console.log("- " + f);
        }
        pause();
    }
    else if (op === "3") {
        var cpfEntrada = readlineSync.question("CPF do cliente (apenas numeros): ").trim();
        if (!validaCpfBasico(cpfEntrada)) {
            console.log("CPF invalido.");
            pause();
            return;
        }
        var cpf_1 = normalizeCpf(cpfEntrada);
        var cli_1 = db.clientes.find(function (c) { return c.cpf === cpf_1; });
        if (!cli_1) {
            console.log("Cliente nao encontrado.");
            pause();
            return;
        }
        var pedidos = db.pedidos.filter(function (p) { return p.clienteId === cli_1.id; });
        if (pedidos.length === 0) {
            console.log("Cliente ainda nao possui pedidos.");
            pause();
            return;
        }
        var gastoTotal = pedidos.reduce(function (s, p) { return s + p.total; }, 0);
        console.log("\n== HIST\u00D3RICO DE ".concat(cli_1.nome, " (").concat(formatCpf(cli_1.cpf), ") =="));
        console.log("Pedidos: ".concat(pedidos.length, " | Gasto total: ").concat(real(gastoTotal)));
        console.log("\nÚltimos pedidos:");
        var ultimos = pedidos.slice(-5).reverse();
        for (var _b = 0, ultimos_1 = ultimos; _b < ultimos_1.length; _b++) {
            var p = ultimos_1[_b];
            console.log("- #".concat(fmtPedido(p.numero), " | ").concat(fmtData(p.criadoEm), " | ").concat(real(p.total), " | ").concat(p.modo));
            var itensTxt = p.itens.map(function (i) { return "".concat(i.qtd, "x ").concat(i.nome); }).join(", ");
            console.log("  Itens: ".concat(itensTxt));
        }
        pause();
    }
    else if (op === "4") {
        relPizzasVendidasPorDia();
        pause();
    }
    else if (op === "5") {
        relPizzasVendidasNoMes();
        pause();
    }
    else if (op === "6") {
        relFaturamentoPorDia();
        pause();
    }
    else if (op === "7") {
        relFaturamentoPorMes();
        pause();
    }
    else if (op === "8") {
        relRankingSaboresPeriodo();
        pause();
    }
    else if (op === "9") {
        exportPizzasVendidasPorDiaCSV();
        pause();
    }
    else if (op === "10") {
        exportPizzasVendidasNoMesCSV();
        pause();
    }
    else if (op === "11") {
        exportFaturamentoPorDiaCSV();
        pause();
    }
    else if (op === "12") {
        exportFaturamentoPorMesCSV();
        pause();
    }
    else if (op === "13") {
        exportRankingSaboresPeriodoCSV();
        pause();
    }
    else if (op === "14") {
        exportHistoricoPorCPFCSV();
        pause();
    }
}
// =================== Clientes ===================
function menuClientes() {
    var _a;
    console.clear();
    console.log("=== CLIENTES ===");
    console.log("1) Listar");
    console.log("2) Cadastrar");
    console.log("0) Voltar");
    var op = readlineSync.question("Escolha: ");
    if (op === "1") {
        if (db.clientes.length === 0)
            console.log("Nenhum cliente.");
        for (var _i = 0, _b = db.clientes; _i < _b.length; _i++) {
            var c = _b[_i];
            console.log("- ".concat(c.nome, " | CPF: ").concat(formatCpf(c.cpf), " | Tel: ").concat((_a = c.telefone) !== null && _a !== void 0 ? _a : "-", " | (id interno: ").concat(c.id, ")"));
        }
    }
    else if (op === "2") {
        var nome = readlineSync.question("Nome: ").trim();
        if (!nome) {
            console.log("Nome obrigatorio.");
            pause();
            return;
        }
        var cpfEntrada = readlineSync.question("CPF (apenas numeros): ").trim();
        if (!validaCpfBasico(cpfEntrada)) {
            console.log("CPF invalido.");
            pause();
            return;
        }
        var cpf_2 = normalizeCpf(cpfEntrada);
        if (db.clientes.some(function (c) { return c.cpf === cpf_2; })) {
            console.log("Já existe cliente com esse CPF.");
            pause();
            return;
        }
        var tel = readlineSync.question("Telefone (opcional): ").trim();
        var c = { id: nextId(), cpf: cpf_2, nome: nome, telefone: tel || undefined };
        db.clientes.push(c);
        console.log("OK! Cliente criado:", "".concat(c.nome, " \u2014 CPF: ").concat(formatCpf(c.cpf)));
        salvarDB();
    }
    pause();
}
// =================== Produtos ===================
function menuProdutos() {
    console.clear();
    console.log("=== PRODUTOS ===");
    console.log("1) Listar");
    console.log("2) Cadastrar");
    console.log("3) Ativar/Desativar");
    console.log("0) Voltar");
    var op = readlineSync.question("Escolha: ");
    if (op === "1") {
        if (db.produtos.length === 0)
            console.log("Nenhum produto.");
        for (var _i = 0, _a = db.produtos; _i < _a.length; _i++) {
            var p = _a[_i];
            var varTxt = (p.variantes && p.variantes.length > 0) ? " | ".concat(p.variantes.length, " variantes") : "";
            console.log("- ".concat(p.id, " | ").concat(p.nome, " | ").concat(p.categoria, " | ").concat(real(p.preco), " | ativo=").concat(p.ativo).concat(varTxt));
        }
    }
    else if (op === "2") {
        var nome = readlineSync.question("Nome: ").trim();
        console.log("\nEscolha a categoria:");
        console.log("1) Pizza Salgadas");
        console.log("2) Pizza Doces");
        console.log("3) Bebida");
        var catOp = readlineSync.question("Opção: ").trim();
        var cat = void 0;
        if (catOp === "1")
            cat = "Pizza Salgadas";
        else if (catOp === "2")
            cat = "Pizza Doces";
        else if (catOp === "3")
            cat = "Bebida";
        else {
            console.log("Opção invalida.");
            pause();
            return;
        }
        var preco = Number(readlineSync.question("Preço (ex 39.9): ").replace(",", "."));
        if (!nome || !(preco > 0)) {
            console.log("Dados invalidos.");
            pause();
            return;
        }
        // Opcional: permitir que o usuário já cadastre variantes ao criar um produto
        var querVar = readlineSync.question("Deseja cadastrar variantes (marcas/sabores)? (s/n): ").trim().toLowerCase().startsWith("s");
        var variantes = undefined;
        if (querVar) {
            variantes = [];
            console.log("Digite uma variante por linha (ENTER vazio para terminar):");
            while (true) {
                var v = readlineSync.question("Variante: ").trim();
                if (!v)
                    break;
                variantes.push(v);
            }
            if (variantes.length === 0)
                variantes = undefined;
        }
        var p = { id: nextId(), nome: nome, categoria: cat, preco: preco, ativo: true, variantes: variantes };
        db.produtos.push(p);
        console.log("OK! Produto criado:", p.id);
        salvarDB();
    }
    else if (op === "3") {
        var id_1 = readlineSync.question("ID do produto: ").trim();
        var p = db.produtos.find(function (x) { return x.id === id_1; });
        if (!p)
            console.log("Produto não encontrado.");
        else {
            p.ativo = !p.ativo;
            console.log("Produto agora ativo=".concat(p.ativo));
            salvarDB();
        }
    }
    pause();
}
// =================== Pedidos ===================
function escolherCategoria() {
    console.log("\nCategorias:");
    console.log("1) Pizza Salgadas");
    console.log("2) Bebida");
    console.log("3) Pizza Doces");
    console.log("0) Finalizar itens");
    var op = readlineSync.question("Escolha a categoria: ").trim();
    if (op === "1")
        return "Pizza Salgadas";
    if (op === "2")
        return "Bebida";
    if (op === "3")
        return "Pizza Doces";
    if (op === "0")
        return undefined;
    console.log("Opção invalida.");
    return escolherCategoria();
}
function escolherProdutoPorNumero(cat) {
    var lista = db.produtos.filter(function (p) { return p.ativo && p.categoria === cat; });
    if (lista.length === 0) {
        console.log("Não há itens ativos nessa categoria.");
        return undefined;
    }
    console.log("\n".concat(cat.toUpperCase(), " \u2014 Itens disponiveis:"));
    lista.forEach(function (p, i) {
        var varTxt = (p.variantes && p.variantes.length > 0) ? " (".concat(p.variantes.length, " variantes)") : "";
        console.log("".concat(i + 1, ") ").concat(p.nome).concat(varTxt, " \u2014 ").concat(real(p.preco)));
    });
    console.log("0) Voltar às categorias");
    var op = readlineSync.question("Escolha o numero do item: ").trim();
    if (op === "0")
        return undefined;
    var idx = Number(op);
    if (!Number.isInteger(idx) || idx < 1 || idx > lista.length) {
        console.log("Numero invalido.");
        return escolherProdutoPorNumero(cat);
    }
    return lista[idx - 1];
}
// Escolha de variante (para marcas/sabores)
function escolherVariante(prod) {
    if (!prod.variantes || prod.variantes.length === 0)
        return undefined;
    console.log("\nOp\u00E7\u00F5es para \"".concat(prod.nome, "\":"));
    prod.variantes.forEach(function (v, i) { return console.log("".concat(i + 1, ") ").concat(v)); });
    console.log("0) Voltar");
    while (true) {
        var op = readlineSync.question("Escolha a variante: ").trim();
        if (op === "0")
            return undefined;
        var idx = Number(op);
        if (Number.isInteger(idx) && idx >= 1 && idx <= prod.variantes.length) {
            return prod.variantes[idx - 1];
        }
        console.log("Opção inválida.");
    }
}
function fluxoPedido() {
    console.clear();
    console.log("=== NOVO PEDIDO ===");
    var clienteId;
    var vinc = readlineSync.question("Vincular cliente? (s/n): ").toLowerCase();
    if (vinc.startsWith("s")) {
        if (db.clientes.length === 0) {
            console.log("Sem clientes. Cadastre primeiro.");
            pause();
            return;
        }
        for (var _i = 0, _a = db.clientes; _i < _a.length; _i++) {
            var c = _a[_i];
            console.log("- ".concat(c.nome, " | CPF: ").concat(formatCpf(c.cpf)));
        }
        var cpfEntrada = readlineSync.question("Digite o CPF do cliente: ").trim();
        if (!validaCpfBasico(cpfEntrada)) {
            console.log("CPF inválido.");
            pause();
            return;
        }
        var cpf_3 = normalizeCpf(cpfEntrada);
        var cli = db.clientes.find(function (c) { return c.cpf === cpf_3; });
        if (!cli) {
            console.log("Cliente não encontrado.");
            pause();
            return;
        }
        clienteId = cli.id;
    }
    var _b = lerModoPedido(), modo = _b.modo, entrega = _b.entrega;
    var itens = [];
    while (true) {
        var cat = escolherCategoria();
        if (!cat)
            break;
        var prod = escolherProdutoPorNumero(cat);
        if (!prod)
            continue;
        var qtd = lerQuantidade("Qtd de \"".concat(prod.nome, "\": "));
        // Se houver variantes (ex.: refrigerante/suco/cerveja), perguntar qual
        var varianteEscolhida = undefined;
        if (prod.variantes && prod.variantes.length > 0) {
            var v = escolherVariante(prod);
            if (!v) {
                console.log("Variante não selecionada. Voltando...");
                continue;
            }
            varianteEscolhida = v;
        }
        var nomeComVariante = varianteEscolhida ? "".concat(prod.nome, " - ").concat(varianteEscolhida) : prod.nome;
        itens.push({
            produtoId: prod.id,
            qtd: qtd,
            nome: nomeComVariante,
            preco: prod.preco,
            cat: prod.categoria,
            variante: varianteEscolhida
        });
        console.log("Adicionado: ".concat(qtd, "x ").concat(nomeComVariante, " (").concat(real(prod.preco), " cada)."));
    }
    if (itens.length === 0) {
        console.log("Sem itens.");
        pause();
        return;
    }
    console.log("\nFormas de pagamento:");
    var formas = ["Dinheiro", "Credito", "Debito", "Pix", "Vale refeicao", "Alimentacao"];
    formas.forEach(function (f, i) { return console.log("".concat(i + 1, ") ").concat(f)); });
    var opPg = Number(readlineSync.question("Escolha o numero: ").trim());
    if (!Number.isInteger(opPg) || opPg < 1 || opPg > formas.length) {
        console.log("Opção invalida.");
        pause();
        return;
    }
    var forma = formas[opPg - 1];
    var cupom = readlineSync.question("Tem cupom promocional? (ENTER p/ pular): ").trim();
    var subtotal = itens.reduce(function (s, it) { return s + it.preco * it.qtd; }, 0);
    var _c = calcularDescontos(itens, subtotal, forma, cupom), linhasDesc = _c.linhas, totalDesc = _c.total;
    var taxaEntrega = calcularTaxaEntrega(modo, entrega, subtotal - totalDesc);
    var total = Math.max(0, subtotal - totalDesc + taxaEntrega);
    var ped = {
        numero: nextPedidoNumero(),
        clienteId: clienteId,
        itens: itens,
        subtotal: subtotal,
        descontos: totalDesc,
        promocoesAplicadas: linhasDesc.map(function (l) { return "".concat(l.nome, " (-").concat(real(l.valor), ")"); }),
        taxaEntrega: taxaEntrega,
        total: total,
        forma: forma,
        criadoEm: new Date().toISOString(),
        modo: modo,
        entrega: entrega
    };
    db.pedidos.push(ped);
    salvarDB();
    imprimirRecibo(ped);
    console.log("\n== Pedido OK ==  Pedido: #".concat(fmtPedido(ped.numero), "  Total: ").concat(real(ped.total), "  Pgto: ").concat(forma));
    pause();
}
function imprimirRecibo(p) {
    var linhas = [];
    linhas.push("===== RECIBO =====");
    linhas.push("Pedido: #".concat(fmtPedido(p.numero)));
    linhas.push("Data: ".concat(fmtData(p.criadoEm)));
    if (p.clienteId) {
        var c = db.clientes.find(function (x) { return x.id === p.clienteId; });
        if (c)
            linhas.push("Cliente: ".concat(c.nome, " \u2014 CPF: ").concat(formatCpf(c.cpf)));
    }
    linhas.push("Modo: ".concat(p.modo));
    if (p.modo === "ENTREGA" && p.entrega) {
        var addr = ["Endereco: ".concat(p.entrega.endereco, ", ").concat(p.entrega.numero)];
        if (p.entrega.bairro)
            addr.push("Bairro: ".concat(p.entrega.bairro));
        if (p.entrega.cep)
            addr.push("CEP: ".concat(p.entrega.cep));
        linhas.push(addr.join(" | "));
        if (p.entrega.referencia)
            linhas.push("Referencia: ".concat(p.entrega.referencia));
    }
    else {
        linhas.push("Retirada no balcao");
    }
    linhas.push("--------------------------------");
    for (var _i = 0, _a = p.itens; _i < _a.length; _i++) {
        var it = _a[_i];
        linhas.push("".concat(it.qtd, "x ").concat(it.nome, " @ ").concat(real(it.preco), " = ").concat(real(it.qtd * it.preco)));
    }
    linhas.push("--------------------------------");
    linhas.push("SUBTOTAL: ".concat(real(p.subtotal)));
    if (p.promocoesAplicadas.length > 0) {
        linhas.push("DESCONTOS:");
        for (var _b = 0, _c = p.promocoesAplicadas; _b < _c.length; _b++) {
            var d = _c[_b];
            linhas.push(" - " + d);
        }
        linhas.push("TOTAL DESCONTOS: -".concat(real(p.descontos)));
    }
    else {
        linhas.push("DESCONTOS: (nenhum)");
    }
    if (p.taxaEntrega > 0) {
        linhas.push("Taxa de entrega: ".concat(real(p.taxaEntrega)));
    }
    else if (p.modo === "ENTREGA") {
        linhas.push("Entrega GR\u00C1TIS (acima de ".concat(real(ENTREGA_GRATIS_MIN), ")"));
    }
    linhas.push("TOTAL: ".concat(real(p.total)));
    linhas.push("Pgto: ".concat(p.forma.toUpperCase()));
    linhas.push("Obrigado Pela Preferencia !");
    console.log("\n" + linhas.join("\n"));
    var desktopDir = resolveDesktopPath();
    var fileName = "cupom-".concat(fmtPedido(p.numero), ".txt");
    var targetDir = desktopDir !== null && desktopDir !== void 0 ? desktopDir : process.cwd();
    var filePath = path.join(targetDir, fileName);
    try {
        var textoSanitizado = sanitizeText(linhas.join("\n"));
        fs.writeFileSync(filePath, textoSanitizado, "utf8");
        if (desktopDir)
            console.log("\nCupom fiscal salvo na \u00C1rea de Trabalho: ".concat(filePath));
        else {
            console.warn("\nNão encontrei a pasta Desktop. O cupom foi salvo no diretório atual:");
            console.log(filePath);
        }
    }
    catch (err) {
        console.error("Falha ao salvar o cupom. Caminho tentado:", filePath);
    }
}
// =================== Listar pedidos ===================
function listarPedidos() {
    var _a;
    console.clear();
    console.log("=== PEDIDOS ===");
    if (db.pedidos.length === 0)
        console.log("Nenhum pedido.");
    var _loop_1 = function (p) {
        var cli = p.clienteId ? db.clientes.find(function (c) { return c.id === p.clienteId; }) : undefined;
        var nome = (_a = cli === null || cli === void 0 ? void 0 : cli.nome) !== null && _a !== void 0 ? _a : "-";
        var cpf = cli ? formatCpf(cli.cpf) : "-";
        var taxaTxt = p.taxaEntrega > 0 ? " + taxa ".concat(real(p.taxaEntrega)) : (p.modo === "ENTREGA" ? " (frete grátis)" : "");
        var descTxt = p.descontos > 0 ? " | desc: -".concat(real(p.descontos)) : "";
        console.log("- #".concat(fmtPedido(p.numero), " | ").concat(fmtData(p.criadoEm), " | modo: ").concat(p.modo, " | cliente: ").concat(nome, " (").concat(cpf, ") | itens: ").concat(p.itens.length, " | total: ").concat(real(p.total)).concat(taxaTxt).concat(descTxt));
    };
    for (var _i = 0, _b = db.pedidos; _i < _b.length; _i++) {
        var p = _b[_i];
        _loop_1(p);
    }
    pause();
}
// =================== Bootstrap ===================
carregarDB();
if (db.produtos.length === 0) {
    db.produtos.push(
    // Pizzas Salgadas
    { id: nextId(), nome: "4 Queijos", categoria: "Pizza Salgadas", preco: 47.9, ativo: true }, { id: nextId(), nome: "5 Queijos", categoria: "Pizza Salgadas", preco: 47.9, ativo: true }, { id: nextId(), nome: "Americana", categoria: "Pizza Salgadas", preco: 47.9, ativo: true }, { id: nextId(), nome: "Atum", categoria: "Pizza Salgadas", preco: 47.9, ativo: true }, { id: nextId(), nome: "Brócolis", categoria: "Pizza Salgadas", preco: 47.9, ativo: true }, { id: nextId(), nome: "Calabresa", categoria: "Pizza Salgadas", preco: 42.9, ativo: true }, { id: nextId(), nome: "Calabresa com Cheddar", categoria: "Pizza Salgadas", preco: 47.9, ativo: true }, { id: nextId(), nome: "Calabresa com Queijo", categoria: "Pizza Salgadas", preco: 47.9, ativo: true }, { id: nextId(), nome: "Chicago", categoria: "Pizza Salgadas", preco: 47.9, ativo: true }, { id: nextId(), nome: "Doritos", categoria: "Pizza Salgadas", preco: 47.9, ativo: true }, { id: nextId(), nome: "Frango com Bacon", categoria: "Pizza Salgadas", preco: 43.9, ativo: true }, { id: nextId(), nome: "Frango com Catupiry", categoria: "Pizza Salgadas", preco: 47.9, ativo: true }, { id: nextId(), nome: "Frango com Catupiry e Bacon", categoria: "Pizza Salgadas", preco: 50.9, ativo: true }, { id: nextId(), nome: "Frango com Cheddar", categoria: "Pizza Salgadas", preco: 42.9, ativo: true }, { id: nextId(), nome: "La Bonissima", categoria: "Pizza Salgadas", preco: 47.9, ativo: true }, { id: nextId(), nome: "Moda da Casa", categoria: "Pizza Salgadas", preco: 54.9, ativo: true }, { id: nextId(), nome: "Moda do Chefe", categoria: "Pizza Salgadas", preco: 49.9, ativo: true }, { id: nextId(), nome: "Mussarela", categoria: "Pizza Salgadas", preco: 39.9, ativo: true }, { id: nextId(), nome: "Portuguesa", categoria: "Pizza Salgadas", preco: 47.9, ativo: true }, { id: nextId(), nome: "Strogonoff", categoria: "Pizza Salgadas", preco: 47.9, ativo: true }, { id: nextId(), nome: "Toscana", categoria: "Pizza Salgadas", preco: 47.9, ativo: true }, 
    // Bebidas (com variantes)
    { id: nextId(), nome: "Refrigerante Lata 350ml", categoria: "Bebida", preco: 6.0, ativo: true,
        variantes: ["Coca-Cola", "Fanta Laranja", "Sukita Uva", "Sukita Laranja", "Soda"] }, { id: nextId(), nome: "Refrigerante 600ml", categoria: "Bebida", preco: 8.0, ativo: true,
        variantes: ["Coca-Cola", "Fanta Laranja", "Sukita Uva", "Sukita Laranja", "Soda"] }, { id: nextId(), nome: "Refrigerante 1L", categoria: "Bebida", preco: 12.0, ativo: true,
        variantes: ["Coca-Cola", "Fanta Laranja", "Sukita Uva", "Sukita Laranja", "Soda"] }, { id: nextId(), nome: "Refrigerante 2L", categoria: "Bebida", preco: 14.0, ativo: true,
        variantes: ["Coca-Cola", "Fanta Laranja", "Sukita Uva", "Sukita Laranja", "Soda"] }, { id: nextId(), nome: "Cerveja Lata 350ml", categoria: "Bebida", preco: 6.5, ativo: true,
        variantes: ["Heineken", "Brahma", "Skol", "Stella Artois", "Budweiser"] }, { id: nextId(), nome: "Cerveja Long Neck", categoria: "Bebida", preco: 8.5, ativo: true,
        variantes: ["Heineken", "Brahma", "Skol", "Stella Artois", "Budweiser"] }, { id: nextId(), nome: "Cerveja 600ml", categoria: "Bebida", preco: 12.5, ativo: true,
        variantes: ["Heineken", "Brahma", "Skol", "Stella Artois", "Budweiser"] }, { id: nextId(), nome: "Suco 300ml", categoria: "Bebida", preco: 7.5, ativo: true,
        variantes: ["Laranja", "Uva", "Abacaxi", "Manga", "Maracujá", "Acerola"] }, { id: nextId(), nome: "Água Mineral 500ml", categoria: "Bebida", preco: 4.0, ativo: true }, 
    // Pizzas Doces
    { id: nextId(), nome: "Pizza Doces (Banana Caramelizada)", categoria: "Pizza Doces", preco: 44.9, ativo: true }, { id: nextId(), nome: "Pizza Doces (Beijinho)", categoria: "Pizza Doces", preco: 32.9, ativo: true }, { id: nextId(), nome: "Pizza Doces (Chocolate)", categoria: "Pizza Doces", preco: 39.9, ativo: true }, { id: nextId(), nome: "Pizza Doces (Chocolate com Banana)", categoria: "Pizza Doces", preco: 45.9, ativo: true }, { id: nextId(), nome: "Pizza Doces (Chocolate com Morango)", categoria: "Pizza Doces", preco: 47.9, ativo: true }, { id: nextId(), nome: "Pizza Doces (Confete)", categoria: "Pizza Doces", preco: 40.9, ativo: true }, { id: nextId(), nome: "Pizza Doces (Cream Cookies)", categoria: "Pizza Doces", preco: 50.9, ativo: true }, { id: nextId(), nome: "Pizza Doces (Doce de Leite)", categoria: "Pizza Doces", preco: 34.9, ativo: true }, { id: nextId(), nome: "Pizza Doces (Prestigio)", categoria: "Pizza Doces", preco: 46.9, ativo: true }, { id: nextId(), nome: "Pizza Doces (Romeu e Julieta)", categoria: "Pizza Doces", preco: 45.9, ativo: true });
    salvarDB();
}
// start
menuPrincipal();
