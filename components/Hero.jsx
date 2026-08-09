"use client";

import Image from "next/image";
import { useRef } from "react";
import { useCelularFlutuante } from "@/lib/hooks";

export default function Hero() {
  const foto = useRef(null);
  // mesma flutuação suave que o celular tinha
  useCelularFlutuante(foto, 0);

  return (
    <section id="inicio" className="hero">
      <div className="container hero-grid">
        <div className="hero-texto">
          <span className="hero-badge">
            A partir de <strong>R$34,90</strong>
          </span>

          <h1 className="hero-titulo">
            Seu carro
            <br />
            limpo
            <span className="hero-brilho">
              {/* <img> simples: são 1 KB e o tamanho é dado em em
                  (0.58em), que o next/image não acompanha */}
              <img src="/img/brilho.png" alt="" aria-hidden="true" />
            </span>{" "}
            em
            <br />
            <span className="destaque">5 minutos</span>
          </h1>

          <p className="hero-descricao">
            Gere o QR code no app, siga até a pista da Uashi e saia com o carro
            limpo em poucos minutos, sem fila e sem sair do veículo.
          </p>

          <a href="#localizacao" className="btn-contorno">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
              <path d="M9 4v14M15 6v14" />
            </svg>
            Encontrar loja
          </a>
        </div>

        <div className="hero-visual">
          <div className="hero-foto" ref={foto}>
            <Image
              src="/img/carro-espuma.jpg"
              alt="Carro coberto de espuma na pista de lavagem automática da Uashi"
              fill
              sizes="(max-width: 980px) 92vw, 46vw"
              priority
            />
          </div>
        </div>
      </div>

      {/* faixa diagonal da marca, passa por trás da foto.
          <img> simples: a faixa usa larguras em % acima de 100% em
          outras seções, o que o next/image não acompanha bem */}
      <img
        src="/img/faixa-diagonal.png"
        className="hero-faixa"
        alt=""
        aria-hidden="true"
        width={1440}
        height={174}
      />
    </section>
  );
}
