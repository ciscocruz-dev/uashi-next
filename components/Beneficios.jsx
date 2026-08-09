"use client";

import { useEffect, useRef } from "react";
import { usaMenosMovimento } from "@/lib/hooks";

const CARDS = [
  {
    titulo: "Você economiza tempo",
    texto: "5 minutos em vez de largar o carro e voltar depois.",
    icone: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" />
      </svg>
    ),
  },
  {
    titulo: "Você evita dor de cabeça",
    texto: "Pagamento antes pelo QR code, não tem balcão pra negociar nem surpresa na saída.",
    icone: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v20" />
        <path d="M17 6.5c0-2-2.2-3-5-3s-5 .9-5 2.8c0 4.4 10 2.2 10 6.7 0 2-2.2 3.2-5 3.2s-5-1.1-5-3" />
      </svg>
    ),
  },
  {
    titulo: "Segurança",
    texto: "Operação 100% monitorada por câmeras, sem contato manual, e você fica dentro do carro o tempo todo.",
    icone: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 8V5h3M18 5h3v3M21 16v3h-3M6 19H3v-3" />
        <circle cx="12" cy="12" r="3.4" />
      </svg>
    ),
  },
];

const SOBE = 48;
const ESCALA_MIN = 0.84;
const RECUO = 0.05; // quanto o card encolhe quando o próximo o cobre

export default function Beneficios() {
  const pilha = useRef(null);
  const reduzido = usaMenosMovimento();

  /* O travamento é do CSS (position: sticky). Aqui só calculamos, para
     cada card, o quanto ele ainda falta para chegar no ponto de
     travamento, e usamos isso como progresso da entrada. */
  useEffect(() => {
    const el = pilha.current;
    if (!el || reduzido) return;

    const cards = Array.from(el.querySelectorAll(".beneficio"));
    if (!cards.length) return;

    el.classList.add("com-animacao");

    let distancia = 320;
    let alvos = [];
    let agendado = false;

    const medir = () => {
      distancia = Math.max(260, Math.round(window.innerHeight * 0.42));
      alvos = cards.map((c) => parseFloat(getComputedStyle(c).top) || 0);
    };

    const suavizar = (p) => {
      const v = Math.min(Math.max(p, 0), 1);
      return v * v * (3 - 2 * v);
    };

    const atualizar = () => {
      agendado = false;

      const entradas = cards.map((c, i) => {
        const falta = c.getBoundingClientRect().top - alvos[i];
        return suavizar(1 - falta / distancia);
      });

      /* a opacidade fecha bem antes do movimento terminar: o card
         precisa estar 100% opaco ANTES de começar a cobrir o anterior,
         senão o texto de baixo vaza por cima */
      const opacidades = cards.map((c, i) => {
        const falta = c.getBoundingClientRect().top - alvos[i];
        return suavizar((1 - falta / distancia) / 0.5);
      });

      cards.forEach((card, j) => {
        const s = entradas[j];
        const cobertura = j + 1 < cards.length ? entradas[j + 1] : 0;

        const escala = ESCALA_MIN + (1 - ESCALA_MIN) * s - RECUO * cobertura;
        const sobe = (1 - s) * SOBE - cobertura * 8;

        card.style.opacity = opacidades[j].toFixed(3);
        card.style.transform = `translateY(${sobe.toFixed(1)}px) scale(${escala.toFixed(3)})`;
        card.style.filter =
          cobertura > 0.01 ? `brightness(${(1 - 0.07 * cobertura).toFixed(3)})` : "";
      });
    };

    const agendar = () => {
      if (agendado) return;
      agendado = true;
      window.requestAnimationFrame(atualizar);
    };

    medir();
    atualizar();

    const aoRedimensionar = () => {
      medir();
      agendar();
    };

    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", aoRedimensionar);
    // a altura do card muda quando as fontes carregam
    if (document.fonts?.ready) document.fonts.ready.then(() => { medir(); atualizar(); });

    return () => {
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", aoRedimensionar);
      el.classList.remove("com-animacao");
      cards.forEach((c) => {
        c.style.opacity = "";
        c.style.transform = "";
        c.style.filter = "";
      });
    };
  }, [reduzido]);

  return (
    <section id="beneficios" className="beneficios">
      <div className="container">
        <div className="beneficios-topo">
          <span className="etiqueta">O resultado</span>
          <h2 className="beneficios-titulo">
            Carro limpo na <span className="destaque-ambar">Uashi</span>
          </h2>
        </div>

        <div className="beneficios-pilha" ref={pilha}>
          {CARDS.map((card, i) => (
            <article className="beneficio" style={{ "--i": i }} key={card.titulo}>
              <div className="beneficio-icone">{card.icone}</div>
              <div className="beneficio-conteudo">
                <h3 className="beneficio-titulo">{card.titulo}</h3>
                <p className="beneficio-texto">{card.texto}</p>
              </div>
            </article>
          ))}

          {/* espaçador: estica o alcance do sticky para os 3 cards
              ficarem empilhados juntos por mais tempo */}
          <div className="beneficios-fim" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
