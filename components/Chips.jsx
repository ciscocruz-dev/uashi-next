"use client";

import { useEffect, useRef } from "react";
import { IconeBrilho } from "./IconeBrilho";
import { usaMenosMovimento, useDirecaoDaRolagem, useNaTela } from "@/lib/hooks";

const LINHA_1 = [
  "Economiza tempo",
  "Sem fila",
  "Prático",
  "Só R$34,90",
  "Pelo app",
];

const LINHA_2 = [
  "5 minutos",
  "Sem sair do carro",
  "Pintura segura",
  "Pagamento fácil",
  "Mais conforto",
];

const VELOCIDADE = 46; // px por segundo, no repouso
const DECAIMENTO = 0.9; // quanto do impulso sobra a cada quadro

function Chip({ texto }) {
  return (
    <span className="chip">
      <IconeBrilho classe="chip-ico" />
      {texto}
    </span>
  );
}

export default function Chips() {
  const secao = useRef(null);
  const trilha1 = useRef(null);
  const trilha2 = useRef(null);

  const reduzido = usaMenosMovimento();
  const rolagem = useDirecaoDaRolagem();
  const visivel = useNaTela(secao);

  /* Duas linhas andam sozinhas em sentidos opostos. Ao descer a
     página, a de cima vai da esquerda para a direita e a de baixo da
     direita para a esquerda; ao subir, os dois sentidos se invertem.

     Feito com requestAnimationFrame em vez de biblioteca: para uma
     esteira que precisa trocar de sentido no meio do movimento,
     controlar o deslocamento diretamente é mais preciso do que
     interromper e recriar uma animação. */
  useEffect(() => {
    if (reduzido) return;

    const linhas = [
      { el: trilha1.current, direcao: -1 },
      { el: trilha2.current, direcao: 1 },
    ].filter((l) => l.el);

    if (!linhas.length) return;

    let trilhas = [];

    const montar = () => {
      trilhas = [];

      linhas.forEach(({ el, direcao }) => {
        const pai = el.parentElement;
        if (!el.dataset.base) el.dataset.base = el.innerHTML;
        const base = el.dataset.base;

        // largura de uma cópia
        el.innerHTML = base;
        const larguraBase = el.scrollWidth;
        if (!larguraBase) return;

        // quantas cópias formam um ciclo mais largo que a linha visível
        const porCiclo = Math.max(
          1,
          Math.ceil(pai.clientWidth / larguraBase) + 1
        );
        const ciclo = base.repeat(porCiclo);

        // dois ciclos: enquanto um sai, o outro entra
        el.innerHTML = ciclo + ciclo;

        /* O tamanho do ciclo é a distância do primeiro chip de uma
           cópia até o primeiro chip da cópia seguinte. Medir por
           scrollWidth/2 erraria por meio "gap" (o vão entre as duas
           cópias não entra na conta), e esse erro aparece como um
           pequeno salto na emenda a cada volta. */
        const filhos = el.children;
        const metade = filhos.length / 2;
        const larguraCiclo =
          filhos[metade].getBoundingClientRect().left -
          filhos[0].getBoundingClientRect().left;

        trilhas.push({ el, direcao, largura: larguraCiclo, deslocamento: 0 });
      });
    };

    montar();

    let quadroId = 0;
    let anterior = null;

    const quadro = (agora) => {
      if (anterior === null) anterior = agora;
      // trava saltos depois de a aba ficar inativa
      const dt = Math.min((agora - anterior) / 1000, 0.05);
      anterior = agora;

      if (visivel) {
        const velocidade = VELOCIDADE + rolagem.impulso;
        rolagem.impulso *= DECAIMENTO;
        if (rolagem.impulso < 0.5) rolagem.impulso = 0;

        trilhas.forEach((t) => {
          t.deslocamento -= velocidade * dt * t.direcao * rolagem.direcao;

          // mantém dentro de um ciclo, para a emenda ficar invisível
          t.deslocamento %= t.largura;
          if (t.deslocamento > 0) t.deslocamento -= t.largura;

          t.el.style.transform = `translate3d(${t.deslocamento.toFixed(2)}px,0,0)`;
        });
      }

      quadroId = window.requestAnimationFrame(quadro);
    };

    quadroId = window.requestAnimationFrame(quadro);

    /* remonta quando a largura da tela muda (ignora a barra de
       endereço do celular, que altera só a altura) */
    let timer;
    let larguraAnterior = window.innerWidth;
    const aoRedimensionar = () => {
      if (window.innerWidth === larguraAnterior) return;
      larguraAnterior = window.innerWidth;
      clearTimeout(timer);
      timer = setTimeout(montar, 180);
    };
    window.addEventListener("resize", aoRedimensionar);

    // as fontes mudam a largura dos chips ao carregar
    if (document.fonts?.ready) document.fonts.ready.then(montar);

    return () => {
      window.cancelAnimationFrame(quadroId);
      window.removeEventListener("resize", aoRedimensionar);
      clearTimeout(timer);
    };
  }, [reduzido, visivel, rolagem]);

  return (
    <section
      className={`chips${reduzido ? " sem-animacao" : ""}`}
      id="chips"
      ref={secao}
      aria-label="Diferenciais da Uashi"
    >
      {/* direcao -1: anda da esquerda para a direita ao descer a página */}
      <div className="chips-linha">
        <div className="chips-trilha" ref={trilha1}>
          {LINHA_1.map((t) => (
            <Chip key={t} texto={t} />
          ))}
        </div>
      </div>

      {/* direcao 1: anda da direita para a esquerda ao descer a página */}
      <div className="chips-linha">
        <div className="chips-trilha" ref={trilha2}>
          {LINHA_2.map((t) => (
            <Chip key={t} texto={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
