"use client";

import Image from "next/image";
import { useRef } from "react";
import { useCelularFlutuante } from "@/lib/hooks";
import { ChipLoja } from "./ChipLoja";

// TODO: trocar pelos links reais das lojas
const LINK_APP_STORE = "#";
const LINK_PLAY_STORE = "#";

export default function CtaApp() {
  const celular = useRef(null);
  useCelularFlutuante(celular, 1);

  return (
    <section id="baixar-app" className="cta">
      <div className="container">
        <div className="cta-caixa">
          {/* faixa diagonal da marca. Gradiente em vez de imagem: o
              ângulo e a proporção acompanham qualquer tamanho de card,
              e não há arquivo para carregar. */}
          <div className="cta-faixa-diagonal" aria-hidden="true" />

          <div className="cta-texto">
            <span className="etiqueta">Em poucos toques</span>
            <h2 className="cta-titulo">
              Na palma
              <br />
              da <span className="destaque-ambar">sua mão</span>
            </h2>
            <p className="cta-desc">
              Escolha o pacote ideal, gere seu QR code e pague em segundos.
              Em seguida, é só seguir até a pista e sair com o carro impecável.
            </p>

            <div className="cta-lojas">
              <ChipLoja href={LINK_APP_STORE} loja="apple" />
              <ChipLoja href={LINK_PLAY_STORE} loja="google" />
            </div>
          </div>

          <div className="cta-visual">
            <Image
              ref={celular}
              src="/img/app-celular.webp"
              className="celular-flutuante cta-celular"
              alt="Tela do aplicativo Uashi com o QR code da lavagem pronto para uso"
              width={726}
              height={886}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
