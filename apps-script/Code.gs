/**
 * Uashi — recebedor de leads na planilha
 *
 * Cole este arquivo no Apps Script da sua planilha e publique como
 * aplicativo da web. O passo a passo está no COMO-INSTALAR.md.
 *
 * O que ele faz:
 *  1. confere o segredo compartilhado (só o site pode gravar)
 *  2. normaliza e valida os dados
 *  3. calcula a "chave" do e-mail e procura duplicado
 *  4. grava a linha, com trava para dois envios simultâneos não
 *     furarem a checagem de duplicado
 */

/* ======= CONFIGURAÇÃO ======= */

// Precisa ser IGUAL ao SHEETS_SEGREDO do site (.env.local).
// Troque por uma frase longa e aleatória.
const SEGREDO = "TROQUE-POR-UMA-FRASE-LONGA-E-ALEATORIA";

// Nome da aba onde os leads vão. Deve existir na planilha.
const ABA = "Leads";

/* Colunas, na ordem em que serão gravadas.
   A "chave_email" é interna, só para achar duplicado — pode ficar
   oculta na planilha, mas não apague a coluna. */
const COLUNAS = [
  "data_hora",
  "nome",
  "email",
  "chave_email",
  "plano",
  "origem",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "url",
];

const COLUNA_CHAVE = COLUNAS.indexOf("chave_email") + 1; // 1-based

/* ======= NORMALIZAÇÃO =======
   A regra da chave do e-mail é a MESMA do lib/normalizar.js no site.
   Se mudar de um lado, mude do outro, senão a checagem de duplicado
   deixa de funcionar. */

const IGNORAM_PONTO = ["gmail.com", "googlemail.com"];

function normalizarEmail(valor) {
  return String(valor == null ? "" : valor)
    .normalize("NFC")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function chaveEmail(valor) {
  var email = normalizarEmail(valor);
  var arroba = email.lastIndexOf("@");
  if (arroba < 1) return email;

  var usuario = email.slice(0, arroba);
  var dominio = email.slice(arroba + 1);

  var mais = usuario.indexOf("+");
  if (mais > 0) usuario = usuario.slice(0, mais);

  if (dominio === "googlemail.com") dominio = "gmail.com";
  if (IGNORAM_PONTO.indexOf(dominio) !== -1) usuario = usuario.replace(/\./g, "");

  return usuario + "@" + dominio;
}

/* O nome já chega normalizado pelo site; aqui é só uma limpeza de
   segurança, para o caso de alguém chamar o endpoint direto. */
function limparNome(valor) {
  return String(valor == null ? "" : valor)
    .normalize("NFC")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function emailValido(valor) {
  var email = normalizarEmail(valor);
  if (email.length < 6 || email.length > 254) return false;
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) return false;
  if (email.indexOf("..") !== -1) return false;
  return true;
}

/* ======= PLANILHA ======= */

function pegarAba() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(ABA);

  if (!aba) {
    aba = planilha.insertSheet(ABA);
  }

  // cria o cabeçalho na primeira execução
  if (aba.getLastRow() === 0) {
    aba.appendRow(COLUNAS);
    aba.setFrozenRows(1);
    aba.getRange(1, 1, 1, COLUNAS.length).setFontWeight("bold");
  }

  return aba;
}

function jaExiste(aba, chave) {
  var ultima = aba.getLastRow();
  if (ultima < 2) return false;

  // lê só a coluna da chave, não a planilha inteira
  var valores = aba.getRange(2, COLUNA_CHAVE, ultima - 1, 1).getValues();
  for (var i = 0; i < valores.length; i++) {
    if (String(valores[i][0]).trim().toLowerCase() === chave) return true;
  }
  return false;
}

/* ======= RESPOSTA ======= */

function responder(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ======= ENTRADA ======= */

function doPost(e) {
  try {
    var corpo = JSON.parse(e.postData.contents || "{}");

    if (corpo.segredo !== SEGREDO) {
      return responder({ ok: false, motivo: "nao_autorizado" });
    }

    var nome = limparNome(corpo.nome);
    var email = normalizarEmail(corpo.email);
    var chave = chaveEmail(email);

    if (!nome || nome.length < 5) {
      return responder({ ok: false, motivo: "nome_invalido" });
    }
    if (!emailValido(email)) {
      return responder({ ok: false, motivo: "email_invalido" });
    }

    /* A trava é essencial: sem ela, dois envios ao mesmo tempo podem
       os dois passar pela checagem de duplicado antes de qualquer um
       gravar, e a planilha fica com a linha repetida. */
    var trava = LockService.getScriptLock();
    if (!trava.tryLock(20000)) {
      return responder({ ok: false, motivo: "ocupado" });
    }

    try {
      var aba = pegarAba();

      if (jaExiste(aba, chave)) {
        return responder({ ok: false, motivo: "duplicado" });
      }

      aba.appendRow([
        new Date(),
        nome,
        email,
        chave,
        corpo.plano || "",
        corpo.origem || "",
        corpo.utm_source || "",
        corpo.utm_medium || "",
        corpo.utm_campaign || "",
        corpo.utm_term || "",
        corpo.utm_content || "",
        corpo.gclid || "",
        corpo.fbclid || "",
        corpo.url || "",
      ]);

      return responder({ ok: true });
    } finally {
      trava.releaseLock();
    }
  } catch (erro) {
    console.error("Falha ao gravar lead:", erro);
    return responder({ ok: false, motivo: "erro_interno" });
  }
}

/* Um GET simples só para você conferir no navegador que a publicação
   está de pé. Não devolve nenhum dado da planilha. */
function doGet() {
  return responder({ ok: true, servico: "uashi-leads", pronto: true });
}
