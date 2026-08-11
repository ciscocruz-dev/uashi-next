"use client";

import { useEffect, useRef, useState } from "react";
import { usaMenosMovimento } from "@/lib/hooks";


/* As etapas descrevem o que a máquina faz por dentro — de propósito
   diferente da seção "Como funciona", que descreve o que a pessoa faz.
   Os itens vêm dos pacotes de lavagem, não de suposição. */
const ETAPAS = [
  {
    titulo: "Alta pressão",
    texto: "A sujeira mais pesada sai antes de qualquer coisa tocar a lataria.",
  },
  {
    titulo: "Espuma e escovas",
    texto: "A espuma cobre o carro e as escovas trabalham sem contato manual.",
  },
  {
    titulo: "Rodas e chassi",
    texto: "Jatos direcionados para as rodas e para embaixo do carro.",
  },
  {
    titulo: "Cera líquida",
    texto: "Camada de proteção aplicada antes da saída.",
  },
  {
    titulo: "Secagem",
    texto: "Ar em alta vazão. Você sai pronto para seguir viagem.",
  },

  {
    titulo: "Pronto!",
    texto: "Carro limpo, seco e protegido. Siga viagem.",
    fim: true,
  },

];

const ARCOS = 6;        // arcos em cena ao mesmo tempo
const VOLTAS = 4.2;     // quantos arcos passam do começo ao fim da rolagem
const CORES = ["ambar", "vermelho", "creme"];
const BOLHAS = 20;      // espumas em cena ao mesmo tempo

/**
 * Variação de cada bolha (altura, tamanho, duração, trajeto).
 *
 * Calculado aqui e não no CSS porque CSS não tem operador de módulo:
 * `calc(var(--b) % 5)` parece funcionar mas é inválido — o `%` ali é
 * unidade de porcentagem, não resto de divisão. A declaração inteira é
 * descartada em silêncio, e foi por isso que a espuma não aparecia.
 *
 * O sorteio é determinístico (função do índice, sem Math.random) para o
 * servidor e o cliente renderizarem igual — com valores aleatórios o
 * React acusaria diferença na hidratação.
 */
function estiloDaBolha(i) {
  const sorteio = (semente) => {
    const x = Math.sin(i * 12.9898 + semente * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  return {
    "--topo": `${(4 + sorteio(1) * 86).toFixed(1)}%`,
    "--tam": `${(11 + sorteio(2) * 32).toFixed(0)}px`,
    "--duracao": `${(8 + sorteio(3) * 7).toFixed(1)}s`,
    "--atraso": `${(-sorteio(4) * 13).toFixed(1)}s`,
    "--percurso": `${(54 + sorteio(5) * 24).toFixed(0)}vw`,
    "--subida": `${(12 + sorteio(6) * 26).toFixed(0)}vh`,
  };
}

export default function Tunel() {
  const secao = useRef(null);
  const palco = useRef(null);
  const arcos = useRef([]);
  const trilha = useRef(null);
  const contador = useRef(null);
  const titulo = useRef(null);
  const descricao = useRef(null);
  const cronometro = useRef(null);
  const reduzido = usaMenosMovimento();

  const atualizarTitulo = (elemento, texto) => {
    elemento.textContent = texto;

    const palavras = texto.split(" ");

    elemento.innerHTML = "";

    palavras.forEach((palavra) => {
      const span = document.createElement("span");
      span.textContent = palavra + " ";
      elemento.appendChild(span);
    });

    const spans = Array.from(elemento.children);

    if (spans.length < 2) return;

    const primeiraLinha = spans[0].offsetTop;

    spans.forEach((span) => {
      if (span.offsetTop > primeiraLinha) {
        span.classList.add("destaque-ambar");
      }
    });
  };

  useEffect(() => {
    if (reduzido) return;

    const alvo = secao.current;
    if (!alvo) return;

    /* Laço contínuo de requestAnimationFrame, e não listener de scroll.
       Dois motivos:

       1. O evento scroll não é confiável nesta página: o body tem
          overflow-x hidden, o que o transforma num container de rolagem
          próprio, e o evento deixa de chegar ao window de forma
          consistente. Medindo, ele disparava uma vez e parava.

       2. Mesmo onde o evento funciona, o navegador o entrega com atraso
          durante rolagem rápida. Ler a posição a cada quadro mantém os
          etapas coladas na rolagem, sem lag.

       O custo é um rAF por quadro, e só enquanto a seção está visível —
       o IntersectionObserver abaixo desliga o laço fora dela. */
    let rodando = false;
    let quadroId = 0;
    let ultimaEtapa = -1;

    const desenhar = () => {
      const caixa = alvo.getBoundingClientRect();
      const rolavel = caixa.height - window.innerHeight;

      if (rolavel > 0) {
        let p = -caixa.top / rolavel;
        p = Math.min(Math.max(p, 0), 1);

        const indice = Math.min(Math.floor(p * ETAPAS.length), ETAPAS.length - 1);
        if (indice !== ultimaEtapa) {
          ultimaEtapa = indice;
          /* Escreve no DOM em vez de usar estado do React.
             Motivo medido: um setState aqui provoca re-render, e o
             re-render interrompia este próprio laço de animação — o
             desenho parava na primeira troca de etapa. Além disso,
             re-renderizar a seção a 60fps é desperdício: só três textos
             mudam, e mudam poucas vezes. */
          const etapa = ETAPAS[indice];
          if (contador.current) {
            contador.current.textContent = `Etapa ${indice + 1} de ${ETAPAS.length}`;
          }
          if (titulo.current) {
            atualizarTitulo(titulo.current, etapa.titulo);
          }
          if (descricao.current) descricao.current.textContent = etapa.texto;
          palco.current?.classList.toggle("chegou", !!etapa.fim);
        }

        if (trilha.current) {
          trilha.current.style.transform = `scaleX(${p.toFixed(4)})`;
        }

        /* Cronômetro da travessia. Não é enfeite: os 5 minutos são a
           promessa central da marca, e ver o tempo correndo enquanto se
           atravessa a lavagem torna o número concreto. */
        if (cronometro.current) {
          const segundos = Math.round(p * 300); // 5 min = 300s
          const m = Math.floor(segundos / 60);
          const ss = String(segundos % 60).padStart(2, "0");
          cronometro.current.textContent = `${m}:${ss}`;
        }

        /* Cada arco tem uma posição fixa no túnel e avança com a
           rolagem. A escala cresce em exponencial porque é isso que dá
           sensação de perspectiva: longe as coisas mudam de tamanho
           devagar, perto mudam rápido. Crescimento linear pareceria um
           círculo inflando.

           O alcance da escala é calibrado por desempenho, não por gosto:
           numa versão anterior ia até 17× e o arco maior passava de
           25.000px de largura — com box-shadow desfocado em vários
           deles, a taxa de quadros caía para cerca de 1fps. */
        for (let i = 0; i < arcos.current.length; i++) {
          const el = arcos.current[i];
          if (!el) continue;

          const fase = (p * VOLTAS + i / ARCOS) % 1;
          const escala = 0.06 * Math.exp(fase * 3.3);

          let opacidade = 1;
          if (fase < 0.12) opacidade = fase / 0.12;
          else if (fase > 0.82) opacidade = (1 - fase) / 0.18;

          /* teto de opacidade: o pedido é que os arcos fiquem discretos,
             então mesmo no auge eles não chegam a cheio */
          el.style.transform = `translate(-50%, 50%) scale(${escala.toFixed(4)})`;
          el.style.opacity = (opacidade * 0.42).toFixed(3);
        }
      }

      if (rodando) quadroId = window.requestAnimationFrame(desenhar);
    };

    const ligar = () => {
      if (rodando) return;
      rodando = true;
      quadroId = window.requestAnimationFrame(desenhar);
    };
    const desligar = () => {
      rodando = false;
      window.cancelAnimationFrame(quadroId);
    };

    /* desenha uma vez já na montagem, para a seção não começar em branco */
    desenhar();

    if (!("IntersectionObserver" in window)) {
      ligar();
      return desligar;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => (e.isIntersecting ? ligar() : desligar()));
      },
      { threshold: 0 }
    );
    observador.observe(alvo);

    return () => {
      observador.disconnect();
      desligar();
    };
  }, [reduzido]);

  return (
    <section
      id="tunel"
      className={`tunel${reduzido ? " sem-animacao" : ""}`}
      ref={secao}
      aria-label="Por dentro da lavagem"
    >
      <div className="tunel-palco" ref={palco}>
        {/* profundidade: escurece o centro, como o fim do túnel */}
        <div className="tunel-profundidade" aria-hidden="true" />

        {/* arcos vindo do fundo, formando o túnel */}
        <div className="tunel-arcos" aria-hidden="true">
          {Array.from({ length: ARCOS }).map((_, i) => (
            <span
              key={i}
              ref={(el) => (arcos.current[i] = el)}
              className={`tunel-arco cor-${CORES[i % CORES.length]}`}
            />
          ))}
        </div>

        {/* escovas rotativas nas laterais */}
        <div className="tunel-escova esquerda" aria-hidden="true">
          <span className="tunel-cerdas" />
        </div>
        <div className="tunel-escova direita" aria-hidden="true">
          <span className="tunel-cerdas" />
        </div>

        {/* espuma saindo das laterais e flutuando pela seção */}
        <div className="tunel-espuma" aria-hidden="true">
          {Array.from({ length: BOLHAS }).map((_, i) => (
            <span key={i} style={estiloDaBolha(i)} />
          ))}
        </div>

        {/* texto da etapa */}
        <div className="tunel-conteudo">
          <div className="tunel-etapa">
            <span className="tunel-etapa-contador" ref={contador}>
              Etapa 1 de 5
            </span>
            <h2
              className="tunel-etapa-titulo"
              ref={titulo}
            >
              {ETAPAS[0].titulo}
            </h2>
            <p className="tunel-etapa-texto" ref={descricao}>
              {ETAPAS[0].texto}
            </p>
                {/* cronômetro da travessia */}
        <div className="tunel-cronometro" aria-hidden="true">
          <span className="tunel-cronometro-valor" ref={cronometro}>0:00</span>
          <span className="tunel-cronometro-rotulo">na pista</span>
        </div>

          </div>

          <div className="tunel-trilha" aria-hidden="true">
            <span className="tunel-trilha-preenchimento" ref={trilha} />
          </div>
           <div className="tunel-continuar" aria-hidden="true">
            <span>Avaçar</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Versão sem movimento: quem pede menos animação recebe as etapas
          como lista, sem túnel nem rolagem longa. */}
      <ol className="tunel-lista">
        {ETAPAS.map((e, i) => (
          <li key={e.titulo}>
            <span className="tunel-lista-num">{i + 1}</span>
            <div>
              <strong>{e.titulo}</strong>
              <p>{e.texto}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
