"use client";

import { useRef } from "react";
import { LinkCadastro } from "./LinkRastreado";
import { usaMenosMovimento } from "@/lib/hooks";
import { PERGUNTAS } from "@/lib/perguntas";

const DURACAO = 300;

export default function Faq() {
  const lista = useRef(null);
  const reduzido = usaMenosMovimento();

  /* O <details> já abre e fecha sozinho, sem JavaScript. Aqui só
     interceptamos o clique para animar a altura da resposta e para
     deixar uma pergunta aberta por vez. Se isto não rodar, o acordeão
     continua funcionando no comportamento nativo do navegador. */
  const aoClicar = (evento, item) => {
    evento.preventDefault();

    const resposta = item.querySelector(".faq-resposta");
    const itens = Array.from(lista.current.querySelectorAll(".faq-item"));

    const abrir = (alvo) => {
      const r = alvo.querySelector(".faq-resposta");
      alvo.open = true;
      if (reduzido) return;
      const altura = r.scrollHeight;
      r.style.height = "0px";
      void r.offsetHeight; // força o navegador a registrar a altura zero
      r.style.transition = `height ${DURACAO}ms cubic-bezier(.2,.7,.3,1)`;
      r.style.height = `${altura}px`;
      setTimeout(() => {
        r.style.transition = "";
        r.style.height = "";
      }, DURACAO);
    };

    const fechar = (alvo, entao) => {
      const r = alvo.querySelector(".faq-resposta");
      if (reduzido) {
        alvo.open = false;
        entao?.();
        return;
      }
      r.style.height = `${r.scrollHeight}px`;
      void r.offsetHeight;
      r.style.transition = `height ${DURACAO}ms cubic-bezier(.2,.7,.3,1)`;
      r.style.height = "0px";
      setTimeout(() => {
        r.style.transition = "";
        r.style.height = "";
        alvo.open = false;
        entao?.();
      }, DURACAO);
    };

    if (item.open) {
      fechar(item);
      return;
    }

    const aberta = itens.find((outro) => outro !== item && outro.open);
    if (aberta) fechar(aberta, () => abrir(item));
    else abrir(item);

    void resposta;
  };

  return (
    <section id="duvidas" className="faq">
      <div className="container faq-grid">
        <div className="faq-lado">
          <span className="etiqueta">Dúvidas</span>
          <h2 className="faq-titulo">Perguntas <span className="destaque-ambar">frequentes</span></h2>
          <p className="faq-descricao">
            Tudo o que você precisa saber para lavar o carro de forma rápida, prática e sem complicação.
          </p>
          {/* TODO: trocar pela URL real da página de cadastro */}
          <LinkCadastro href="/cadastro?origem=faq" origem="faq" className="local-btn faq-btn">
            Fazer cadastro
          </LinkCadastro>
        </div>

        <div className="faq-lista" ref={lista}>
          {PERGUNTAS.map(({ pergunta, resposta }) => (
            <details className="faq-item" key={pergunta}>
              <summary
                className="faq-pergunta"
                onClick={(e) => aoClicar(e, e.currentTarget.parentElement)}
              >
                {pergunta}
                <span className="faq-mais" aria-hidden="true" />
              </summary>
              <div className="faq-resposta">
                <p>{resposta}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
