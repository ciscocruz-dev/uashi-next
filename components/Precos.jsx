"use client";

import { useRef } from "react";
import { IconeBrilho } from "./IconeBrilho";
import { enviarEvento, usaMenosMovimento, useNaTela } from "@/lib/hooks";

// TODO: trocar "/cadastro" pela URL real da página de cadastro
const PLANOS = [
  {
    slug: "largada",
    nome: "Largada",
    inteiro: "34",
    centavos: ",90",
    itens: ["Lavagem com alta pressão", "Lavagem das rodas"],
    tempo: "5 Min",
  },
  {
    slug: "volta-completa",
    nome: "Volta completa",
    inteiro: "49",
    centavos: ",90",
    itens: ["Lavagem com alta pressão", "Lavagem das rodas", "Secagem"],
    tempo: "7 Min",
  },
  {
    slug: "podio",
    nome: "Pódio",
    inteiro: "54",
    centavos: ",90",
    itens: ["Lavagem com alta pressão", "Lavagem das rodas", "Secagem", "Cera líquida"],
    tempo: "7 Min",
  },
  {
    slug: "pole-position",
    nome: "Pole position",
    inteiro: "74",
    centavos: ",90",
    itens: [
      "Lavagem com alta pressão",
      "Lavagem das rodas",
      "Secagem",
      "Cera líquida",
      "Lavagem do chassi",
      "Pretinho nos pneus",
    ],
    tempo: "8 Min",
    destaque: true,
  },
];

const EXTRAS = [
  {
    nome: "Aspirador",
    texto: "Aspire você mesmo por alguns minutos com o aspirador profissional da unidade.",
    inteiro: "7",
    centavos: ",00",
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="3" x2="10" y2="14" /><path d="M5 21l4-8h5l3 8z" /><path d="M14 13l3-9" />
      </svg>
    ),
  },
  {
    nome: "Pretinho nos pneus",
    texto: "Acabamento nos pneus, deixando-os pretos e com brilho, à parte da lavagem principal.",
    inteiro: "8",
    centavos: ",00",
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="13" r="7" /><circle cx="12" cy="13" r="2.6" />
        <path d="M19 3.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" />
      </svg>
    ),
  },
];

const IconeRelogio = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><path d="M12 7.5v5l3 2" />
  </svg>
);

export default function Precos() {
  const grade = useRef(null);
  const reduzido = usaMenosMovimento();
  const visivel = useNaTela(grade, { umaVez: true, limite: 0.18 });

  const classesGrade = [
    "precos-grid",
    !reduzido && "animar",
    !reduzido && visivel && "visivel",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section id="precos" className="precos">
      <div className="container precos-topo">
        <span className="etiqueta">Preços</span>
        <h2 className="precos-titulo">
          Qual lavagem seu carro
          <br />
          <span className="destaque-ambar">merece hoje?</span>
        </h2>
        <p className="precos-sub">Quatro níveis de lavagem em poucos minutos.</p>
      </div>

      <div className="precos-palco">
        {/* faixa da marca passando atrás dos cards */}
        <img
          src="/img/faixa-diagonal.png"
          className="precos-faixa"
          alt=""
          aria-hidden="true"
          width={1440}
          height={174}
        />

        <div className="container">
          <div className={classesGrade} ref={grade}>
            {PLANOS.map((plano, i) => (
              <article
                className={`preco-card${plano.destaque ? " is-destaque" : ""}`}
                style={{ "--i": i }}
                key={plano.slug}
              >
                {plano.destaque && <span className="preco-selo">Completo</span>}
                <h3 className="preco-nome">{plano.nome}</h3>
                <p className="preco-valor">
                  <span className="moeda">R$</span>
                  <span className="inteiro">{plano.inteiro}</span>
                  <span className="centavos">{plano.centavos}</span>
                </p>
                <ul className="preco-itens">
                  {plano.itens.map((item) => (
                    <li key={item}>
                      <IconeBrilho classe="preco-ico" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="preco-tempo">
                  <IconeRelogio />
                  {plano.tempo}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <h3 className="extras-titulo">Serviços adicionais</h3>
        <div className="extras-grid">
          {EXTRAS.map((extra) => (
            <article className="extra-card" key={extra.nome}>
              <div className="extra-ico">{extra.icone}</div>
              <div className="extra-texto">
                <h4>{extra.nome}</h4>
                <p>{extra.texto}</p>
              </div>
              <p className="extra-valor">
                <span className="moeda">R$</span>
                <span className="inteiro">{extra.inteiro}</span>
                <span className="centavos">{extra.centavos}</span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
