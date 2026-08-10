/**
 * Leitura dos leads na planilha.
 *
 * Roda só no servidor: a URL e o segredo do Apps Script nunca chegam ao
 * navegador. O dashboard recebe apenas os dados já prontos.
 */
export async function buscarLeads() {
  const url = process.env.SHEETS_URL;
  const segredo = process.env.SHEETS_SEGREDO;

  if (!url || !segredo) {
    return { ok: false, erro: "configuracao", leads: [] };
  }

  const endereco = `${url}?acao=listar&segredo=${encodeURIComponent(segredo)}`;

  try {
    const resposta = await fetch(endereco, {
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
      /* 60s de cache: o dashboard fica atual o suficiente e o Apps
         Script tem cota diária de execução — sem cache, cada F5
         gastaria uma chamada. */
      next: { revalidate: 60 },
    });

    if (!resposta.ok) {
      console.error("[dashboard] Apps Script respondeu HTTP", resposta.status);
      return { ok: false, erro: "resposta", leads: [] };
    }

    const bruto = await resposta.text();
    let conteudo = null;
    try {
      conteudo = JSON.parse(bruto);
    } catch {
      console.error(
        "[dashboard] O Apps Script não devolveu JSON. Quase sempre é " +
          "publicação incorreta (falta republicar com Nova versão). " +
          "Resposta recebida:\n" + bruto.slice(0, 400)
      );
      return { ok: false, erro: "formato", leads: [] };
    }

    if (!conteudo?.ok) {
      if (conteudo?.motivo === "nao_autorizado") {
        console.error("[dashboard] segredo recusado. Confira SHEETS_SEGREDO x SEGREDO no Code.gs");
      }
      return { ok: false, erro: conteudo?.motivo || "recusado", leads: [] };
    }

    return { ok: true, leads: conteudo.leads || [] };
  } catch (erro) {
    console.error("[dashboard] falha ao ler a planilha:", erro);
    return { ok: false, erro: "rede", leads: [] };
  }
}
