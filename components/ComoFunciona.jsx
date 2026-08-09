"use client";

import { useRef } from "react";
import { useNaTela } from "@/lib/hooks";

const PASSOS = [
  {
    numero: "1º passo",
    titulo: "Chegou",
    texto: "Dirija até a unidade na Av. Roberto Freire, 122, em Natal.",
    icone: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 16h14l1-5-2-4H6L4 11z" />
        <circle cx="8" cy="16.5" r="1.6" /><circle cx="16" cy="16.5" r="1.6" />
      </svg>
    ),
  },
  {
    numero: "2º passo",
    titulo: "Abriu o app",
    texto: "Escolha o tipo de lavagem no app Uashi e gere o seu QR code.",
    icone: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="6" y="2" width="12" height="20" rx="2.5" />
        <path d="M10 6h4M10 10h1M13 10h1M10 13h4M10 16h1M13 16h1" />
      </svg>
    ),
  },
  {
    numero: "3º passo",
    titulo: "Passou pela pista",
    texto: "Siga lentamente, sem sair do carro, enquanto a máquina faz o resto.",
    icone: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 17h16l-1-6-2-4H7L5 11z" />
        <path d="M2 10h2M20 10h2" />
        <circle cx="8" cy="17.5" r="1.5" /><circle cx="16" cy="17.5" r="1.5" />
      </svg>
    ),
  },
  {
    numero: "4º passo",
    titulo: "Foi embora",
    texto: "Carro limpo em 5 minutos. Pronto para seguir viagem.",
    icone: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6 L9 17 L4 12" />
      </svg>
    ),
  },
];

export default function ComoFunciona() {
  const palco = useRef(null);
  // a animação do carro é CSS; aqui só pausamos quando sai da tela
  const visivel = useNaTela(palco);

  return (
    <section id="como-funciona" className="processo">
      <div className="container">
        <div className="processo-topo">
          <span className="etiqueta">Simples assim</span>
          <h2 className="processo-titulo">
            Lave o carro em <span style={{ color: "#FCB406" }}>4 passos</span>
          </h2>
        </div>

        <div className={`processo-palco${visivel ? "" : " pausado"}`} ref={palco}>
          {/* pista com o carrinho, atrás dos cards */}
          <div className="pista" aria-hidden="true">
            <div className="pista-veiculo">
              {/* Atenção: o SVG é desenhado virado para a esquerda e o CSS
                  o espelha com scaleX(-1) para ele apontar no sentido do
                  movimento. Por isso as lanternas parecem trocadas aqui:
                  o âmbar (x=4) é o farol e aparece na FRENTE depois do
                  espelhamento; o vermelho escuro (x=110) é a traseira. */}
              <svg className="pista-carro" viewBox="0 0 120 52" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 40 L4 28 Q6 20 20 18 L38 16 L52 5 Q57 2 66 2 L86 2 Q95 3 100 8 L110 17 Q116 19 117 26 L117 40 Z" fill="#FF1E00" />
                <path d="M56 15 L66 6 Q68 5 72 5 L78 5 L78 15 Z" fill="#0A1A4D" />
                <path d="M83 5 L88 5 Q93 6 96 9 L103 15 L83 15 Z" fill="#0A1A4D" />
                <path d="M14 30 L112 31" stroke="#C41500" strokeWidth="2" />
                <rect x="110" y="22" width="8" height="6" rx="2" fill="#8E1000" />
                <rect x="4" y="23" width="6" height="5" rx="2" fill="#FCB406" />
                <circle cx="30" cy="41" r="10" fill="#12161C" />
                <circle cx="30" cy="41" r="4" fill="#8B93A0" />
                <circle cx="92" cy="41" r="10" fill="#12161C" />
                <circle cx="92" cy="41" r="4" fill="#8B93A0" />
              </svg>
            </div>
          </div>

          {/* cards, na frente da pista */}
          <div className="processo-cards">
            {PASSOS.map((passo) => (
              <article className="passo" key={passo.titulo}>
                <div className="passo-icone">{passo.icone}</div>
                <span className="passo-numero">{passo.numero}</span>
                <h3 className="passo-titulo">{passo.titulo}</h3>
                <p className="passo-texto">{passo.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
