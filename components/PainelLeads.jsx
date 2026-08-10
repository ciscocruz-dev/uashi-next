"use client";

import { useMemo, useState } from "react";

const PERIODOS = [
  { id: "7", rotulo: "7 dias" },
  { id: "30", rotulo: "30 dias" },
  { id: "90", rotulo: "90 dias" },
  { id: "tudo", rotulo: "Tudo" },
];

const MOEDA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function diaISO(data) {
  return data.toISOString().slice(0, 10);
}

function formatarDia(iso) {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

/** Barra horizontal simples. Sem biblioteca de gráfico: são poucas
    formas, e uma lib de chart custaria mais peso que o painel todo. */
function BarrasHorizontais({ dados, vazio }) {
  if (!dados.length) return <p className="painel-vazio">{vazio}</p>;

  const maior = Math.max(...dados.map((d) => d.valor));

  return (
    <ul className="painel-barras">
      {dados.map((d) => (
        <li key={d.rotulo}>
          <span className="painel-barra-rotulo" title={d.rotulo}>
            {d.rotulo}
          </span>
          <span className="painel-barra-trilha">
            <span
              className="painel-barra-preenchimento"
              style={{ width: `${maior ? (d.valor / maior) * 100 : 0}%` }}
            />
          </span>
          <span className="painel-barra-valor">{d.valor}</span>
        </li>
      ))}
    </ul>
  );
}

/** Colunas por dia, em SVG. */
function ColunasPorDia({ series }) {
  if (!series.length) return <p className="painel-vazio">Nenhum lead no período.</p>;

  const L = 720;
  const A = 180;
  const maior = Math.max(...series.map((d) => d.valor), 1);
  const larguraCol = L / series.length;
  const barra = Math.min(larguraCol * 0.62, 34);

  // mostra no máximo ~10 rótulos para não embolar
  const passo = Math.ceil(series.length / 10);

  return (
    <svg className="painel-colunas" viewBox={`0 0 ${L} ${A + 26}`} role="img"
         aria-label="Leads por dia">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1="0" x2={L} y1={A - A * f} y2={A - A * f}
              stroke="rgba(255,255,255,.08)" strokeWidth="1" />
      ))}
      {series.map((d, i) => {
        const altura = (d.valor / maior) * (A - 8);
        const x = i * larguraCol + (larguraCol - barra) / 2;
        return (
          <g key={d.dia}>
            <title>{`${formatarDia(d.dia)}: ${d.valor} lead(s)`}</title>
            <rect x={x} y={A - altura} width={barra} height={altura} rx="3"
                  fill="url(#gradPainel)" />
            {i % passo === 0 && (
              <text x={x + barra / 2} y={A + 18} textAnchor="middle"
                    fontSize="11" fill="rgba(255,255,255,.45)">
                {formatarDia(d.dia)}
              </text>
            )}
          </g>
        );
      })}
      <defs>
        <linearGradient id="gradPainel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FCB406" />
          <stop offset="100%" stopColor="#FF1E00" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function PainelLeads({ leads }) {
  const [periodo, setPeriodo] = useState("30");
  const [plano, setPlano] = useState("todos");
  const [fonte, setFonte] = useState("todas");
  const [investido, setInvestido] = useState("");

  /* listas para os seletores, sempre da base completa para as opções
     não desaparecerem conforme o filtro muda */
  const planos = useMemo(
    () => [...new Set(leads.map((l) => l.plano).filter(Boolean))].sort(),
    [leads]
  );
  const fontes = useMemo(
    () => [...new Set(leads.map((l) => l.utm_source || "direto"))].sort(),
    [leads]
  );

  const filtrados = useMemo(() => {
    let corte = null;
    if (periodo !== "tudo") {
      corte = new Date();
      corte.setDate(corte.getDate() - Number(periodo));
      corte.setHours(0, 0, 0, 0);
    }

    return leads.filter((l) => {
      const data = new Date(l.data);
      if (corte && data < corte) return false;
      if (plano !== "todos" && l.plano !== plano) return false;
      if (fonte !== "todas" && (l.utm_source || "direto") !== fonte) return false;
      return true;
    });
  }, [leads, periodo, plano, fonte]);

  const metricas = useMemo(() => {
    const hoje = diaISO(new Date());
    const seteDias = new Date();
    seteDias.setDate(seteDias.getDate() - 7);

    const noPeriodo = filtrados.length;
    const deHoje = filtrados.filter((l) => diaISO(new Date(l.data)) === hoje).length;
    const de7 = filtrados.filter((l) => new Date(l.data) >= seteDias).length;

    /* média por dia contando só os dias que já passaram no período,
       não o período inteiro — senão o número fica sempre subestimado */
    const dias = periodo === "tudo" ? diasCorridos(filtrados) : Number(periodo);
    const media = dias > 0 ? noPeriodo / dias : 0;

    const gasto = parseFloat(String(investido).replace(",", ".")) || 0;
    const cpl = gasto > 0 && noPeriodo > 0 ? gasto / noPeriodo : null;

    return { noPeriodo, deHoje, de7, media, cpl };
  }, [filtrados, periodo, investido]);

  const porDia = useMemo(() => {
    if (!filtrados.length) return [];

    const contagem = {};
    filtrados.forEach((l) => {
      const d = diaISO(new Date(l.data));
      contagem[d] = (contagem[d] || 0) + 1;
    });

    /* preenche os dias sem lead com zero: sem isso o gráfico mente,
       porque dias vazios simplesmente desapareceriam do eixo */
    const dias = Object.keys(contagem).sort();
    const inicio = new Date(dias[0]);
    const fim = new Date(dias[dias.length - 1]);
    const serie = [];

    for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
      const iso = diaISO(d);
      serie.push({ dia: iso, valor: contagem[iso] || 0 });
    }

    return serie.slice(-90);
  }, [filtrados]);

  const porPlano = useMemo(() => agrupar(filtrados, (l) => l.plano || "sem plano"), [filtrados]);
  const porFonte = useMemo(
    () => agrupar(filtrados, (l) => l.utm_source || "direto"),
    [filtrados]
  );
  const porCampanha = useMemo(
    () => agrupar(filtrados, (l) => l.utm_campaign || "sem campanha"),
    [filtrados]
  );

  const recentes = useMemo(
    () => [...filtrados].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 25),
    [filtrados]
  );

  return (
    <main className="painel">
      <header className="painel-topo">
        <div>
          <h1 className="painel-titulo">Painel de leads</h1>
          <p className="painel-sub">
            {leads.length} cadastro{leads.length === 1 ? "" : "s"} na base
          </p>
        </div>
        <a href="/" className="painel-link">Ver o site</a>
      </header>

      {/* ---- filtros ---- */}
      <section className="painel-filtros" aria-label="Filtros">
        <div className="painel-periodo" role="group" aria-label="Período">
          {PERIODOS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={periodo === p.id ? "ativo" : undefined}
              onClick={() => setPeriodo(p.id)}
            >
              {p.rotulo}
            </button>
          ))}
        </div>

        <label className="painel-campo">
          <span>Plano</span>
          <select value={plano} onChange={(e) => setPlano(e.target.value)}>
            <option value="todos">Todos</option>
            {planos.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        <label className="painel-campo">
          <span>Origem</span>
          <select value={fonte} onChange={(e) => setFonte(e.target.value)}>
            <option value="todas">Todas</option>
            {fontes.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </label>

        <label className="painel-campo">
          <span>Investido no período (R$)</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="1500"
            value={investido}
            onChange={(e) => setInvestido(e.target.value)}
          />
        </label>
      </section>

      {/* ---- números ---- */}
      <section className="painel-metricas" aria-label="Resumo">
        <Metrica rotulo="Leads no período" valor={metricas.noPeriodo} />
        <Metrica rotulo="Hoje" valor={metricas.deHoje} />
        <Metrica rotulo="Últimos 7 dias" valor={metricas.de7} />
        <Metrica rotulo="Média por dia" valor={metricas.media.toFixed(1)} />
        <Metrica
          rotulo="Custo por lead"
          valor={metricas.cpl === null ? "—" : MOEDA.format(metricas.cpl)}
          nota={metricas.cpl === null ? "informe o investido" : undefined}
          destaque
        />
      </section>

      {/* ---- gráficos ---- */}
      <section className="painel-bloco">
        <h2>Leads por dia</h2>
        <ColunasPorDia series={porDia} />
      </section>

      <div className="painel-colunas-duplas">
        <section className="painel-bloco">
          <h2>Por plano escolhido</h2>
          <BarrasHorizontais dados={porPlano} vazio="Nenhum lead no período." />
        </section>

        <section className="painel-bloco">
          <h2>Por origem</h2>
          <BarrasHorizontais dados={porFonte} vazio="Nenhum lead no período." />
        </section>
      </div>

      <section className="painel-bloco">
        <h2>Por campanha</h2>
        <BarrasHorizontais dados={porCampanha} vazio="Nenhum lead no período." />
      </section>

      {/* ---- tabela ---- */}
      <section className="painel-bloco">
        <h2>Últimos cadastros</h2>
        {recentes.length === 0 ? (
          <p className="painel-vazio">Nenhum lead no período.</p>
        ) : (
          <div className="painel-tabela-rolagem">
            <table className="painel-tabela">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Plano</th>
                  <th>Origem</th>
                </tr>
              </thead>
              <tbody>
                {recentes.map((l, i) => (
                  <tr key={`${l.email}-${i}`}>
                    <td>{new Date(l.data).toLocaleString("pt-BR", {
                      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                    })}</td>
                    <td>{l.nome}</td>
                    <td>{l.email}</td>
                    <td>{l.plano || "—"}</td>
                    <td>{l.utm_source || "direto"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Metrica({ rotulo, valor, nota, destaque }) {
  return (
    <div className={`painel-metrica${destaque ? " destaque" : ""}`}>
      <span className="painel-metrica-rotulo">{rotulo}</span>
      <strong className="painel-metrica-valor">{valor}</strong>
      {nota && <span className="painel-metrica-nota">{nota}</span>}
    </div>
  );
}

function agrupar(lista, obterChave) {
  const contagem = {};
  lista.forEach((item) => {
    const chave = obterChave(item);
    contagem[chave] = (contagem[chave] || 0) + 1;
  });
  return Object.entries(contagem)
    .map(([rotulo, valor]) => ({ rotulo, valor }))
    .sort((a, b) => b.valor - a.valor);
}

function diasCorridos(lista) {
  if (!lista.length) return 0;
  const datas = lista.map((l) => new Date(l.data).getTime());
  const dias = Math.ceil((Math.max(...datas) - Math.min(...datas)) / 86400000);
  return Math.max(dias, 1);
}
