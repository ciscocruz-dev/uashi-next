"use server";

import {
  chaveEmail,
  emailValido,
  nomeValido,
  normalizarEmail,
  normalizarNome,
} from "@/lib/normalizar";

/**
 * Envio do lead para a planilha.
 *
 * É Server Action de propósito: a URL do Apps Script e o segredo ficam
 * só no servidor. Se isso fosse um fetch do navegador, qualquer pessoa
 * poderia ler o endereço no código da página e escrever direto na sua
 * planilha.
 *
 * Configuração no .env.local:
 *   SHEETS_URL=https://script.google.com/macros/s/.../exec
 *   SHEETS_SEGREDO=a-mesma-frase-do-Code.gs
 */
export async function enviarLead(dados) {
  // honeypot: se o campo invisível veio preenchido, é robô.
  // Responde "ok" para ele não descobrir que foi barrado.
  if (String(dados?.verificacao ?? "").trim()) {
    return { ok: true, ignorado: true };
  }

  const nome = normalizarNome(dados?.nome);
  const email = normalizarEmail(dados?.email);

  if (!nomeValido(nome)) {
    return { ok: false, campo: "nome", erro: "Escreva seu nome e sobrenome." };
  }
  if (!emailValido(email)) {
    return { ok: false, campo: "email", erro: "Confira o e-mail digitado." };
  }

  const url = process.env.SHEETS_URL;
  const segredo = process.env.SHEETS_SEGREDO;

  if (!url || !segredo) {
    console.error(
      "[cadastro] SHEETS_URL ou SHEETS_SEGREDO não definidos. O lead NÃO foi salvo. " +
        "Veja .env.example e apps-script/COMO-INSTALAR.md"
    );
    return { ok: false, erro: "Cadastro fora do ar no momento. Tente de novo em instantes." };
  }

  try {
    const resposta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        segredo,
        nome,
        email,
        plano: dados?.plano ?? "",
        origem: dados?.origem ?? "",
        utm_source: dados?.utm_source ?? "",
        utm_medium: dados?.utm_medium ?? "",
        utm_campaign: dados?.utm_campaign ?? "",
        utm_term: dados?.utm_term ?? "",
        utm_content: dados?.utm_content ?? "",
        gclid: dados?.gclid ?? "",
        fbclid: dados?.fbclid ?? "",
        url: dados?.url_full ?? "",
      }),
      // o Apps Script responde com redirect; precisa seguir
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });

    if (!resposta.ok) {
      console.error("[cadastro] Apps Script respondeu HTTP", resposta.status);
      return { ok: false, erro: "Não conseguimos salvar agora. Tente novamente." };
    }

    const conteudo = await resposta.json().catch(() => null);

    if (conteudo?.ok) {
      /* devolvo a chave só para o site poder mandar a versão em hash
         para o Google Ads (conversões avançadas), nunca o e-mail cru */
      return { ok: true, chave: chaveEmail(email) };
    }

    if (conteudo?.motivo === "duplicado") {
      return {
        ok: false,
        campo: "email",
        duplicado: true,
        erro: "Este e-mail já está cadastrado. Você já está na nossa lista.",
      };
    }

    if (conteudo?.motivo === "nao_autorizado") {
      console.error("[cadastro] segredo recusado pelo Apps Script. Confira SHEETS_SEGREDO x SEGREDO no Code.gs");
      return { ok: false, erro: "Cadastro fora do ar no momento. Tente de novo em instantes." };
    }

    console.error("[cadastro] Apps Script recusou:", conteudo);
    return { ok: false, erro: "Não conseguimos salvar agora. Tente novamente." };
  } catch (erro) {
    console.error("[cadastro] falha ao chamar o Apps Script:", erro);
    return { ok: false, erro: "Não conseguimos salvar agora. Tente novamente." };
  }
}
