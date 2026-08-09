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
          <div className="cta-texto">
            <span className="etiqueta">Em poucos toques</span>
            <h2 className="cta-titulo">
              A limpeza do seu carro <span className="destaque-ambar">na palma da mão</span>
            </h2>
            <p className="cta-desc">
              Escolha o pacote ideal, gere seu QR code e pague em segundos. Em seguida, é só seguir até a pista e sair com o carro impecável.
            </p>

            <div className="cta-lojas">
              <ChipLoja href={LINK_APP_STORE} loja="apple" />
              <ChipLoja href={LINK_PLAY_STORE} loja="google" />
            </div>
          </div>

          <div className="cta-visual">
            <Image
              src="/img/faixa-diagonal.png"
              alt=""
              className="cta-faixa-diagonal"
              width={480}
              height={480}
              aria-hidden="true"
            />
            <Image
              ref={celular}
              src="/img/app-celular.png"
              className="celular-flutuante cta-celular"
              alt="Tela do aplicativo Uashi com o QR code da lavagem pronto para uso"
              width={800}
              height={786}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
