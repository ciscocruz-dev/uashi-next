import { buscarLeads } from "./dados";
import PainelLeads from "@/components/PainelLeads";

export const metadata = {
  title: "Painel de leads | Uashi",
  robots: { index: false, follow: false },
};

/* sempre busca ao abrir; o cache de 60s está no fetch em dados.js */
export const dynamic = "force-dynamic";

const MENSAGENS = {
  configuracao:
    "Faltam as variáveis SHEETS_URL e SHEETS_SEGREDO. Cadastre no .env.local e no painel da hospedagem.",
  formato:
    "O Apps Script não respondeu em JSON. Republique com Implantar → Gerenciar implantações → Nova versão.",
  nao_autorizado:
    "O segredo foi recusado pelo Apps Script. A frase do SHEETS_SEGREDO precisa ser idêntica à do Code.gs.",
  resposta: "O Apps Script respondeu com erro. Confira a publicação.",
  rede: "Não conseguimos alcançar o Apps Script. Confira a URL.",
  recusado: "O Apps Script recusou a leitura.",
};

export default async function PaginaDashboard() {
  const resultado = await buscarLeads();

  if (!resultado.ok) {
    return (
      <main className="painel">
        <div className="painel-erro">
          <h1>Não foi possível ler a planilha</h1>
          <p>{MENSAGENS[resultado.erro] || "Erro desconhecido."}</p>
          <p className="painel-erro-dica">
            O motivo técnico está nos logs do servidor, na linha que começa
            com <code>[dashboard]</code>.
          </p>
        </div>
      </main>
    );
  }

  return <PainelLeads leads={resultado.leads} />;
}
