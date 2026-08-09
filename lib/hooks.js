"use client";

import { useEffect, useState } from "react";

/**
 * Detecta se a pessoa pediu menos movimento no sistema.
 * Começa em false para o servidor e o cliente renderizarem igual;
 * o valor real chega no primeiro efeito.
 */
export function usaMenosMovimento() {
  const [reduzido, setReduzido] = useState(false);

  useEffect(() => {
    const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduzido(consulta.matches);

    const aoMudar = (e) => setReduzido(e.matches);
    consulta.addEventListener("change", aoMudar);
    return () => consulta.removeEventListener("change", aoMudar);
  }, []);

  return reduzido;
}

/**
 * Direção da rolagem (1 descendo, -1 subindo) e um "impulso" que
 * decai, proporcional à velocidade da rolagem.
 *
 * Devolve um objeto mutável (não estado) de propósito: quem usa isso
 * são laços de animação em requestAnimationFrame, e disparar
 * re-render a cada quadro de scroll seria desperdício.
 */
export function useDirecaoDaRolagem(impulsoMaximo = 520) {
  const [ref] = useState(() => ({ direcao: 1, impulso: 0 }));

  useEffect(() => {
    let ultimoY = window.scrollY;

    const aoRolar = () => {
      const y = window.scrollY;
      const delta = y - ultimoY;
      if (delta > 0) ref.direcao = 1;
      else if (delta < 0) ref.direcao = -1;
      ref.impulso = Math.min(Math.abs(delta) * 14, impulsoMaximo);
      ultimoY = y;
    };

    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, [ref, impulsoMaximo]);

  return ref;
}

/**
 * Avisa quando o elemento entra ou sai da tela.
 * Usado para pausar animações fora de vista e para disparar
 * entradas uma única vez.
 */
export function useNaTela(ref, { umaVez = false, limite = 0 } = {}) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const alvo = ref.current;
    if (!alvo) return;

    if (!("IntersectionObserver" in window)) {
      setVisivel(true);
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            setVisivel(true);
            if (umaVez) observador.disconnect();
          } else if (!umaVez) {
            setVisivel(false);
          }
        });
      },
      { threshold: limite }
    );

    observador.observe(alvo);
    return () => observador.disconnect();
  }, [ref, umaVez, limite]);

  return visivel;
}

/**
 * Faz o celular flutuar. Recebe o índice para que dois celulares
 * na mesma página não subam e desçam em sincronia.
 *
 * O anime.js entra por import estático (pacote npm), então não há
 * mais dependência de CDN como na versão em HTML puro.
 */
export function useCelularFlutuante(ref, indice = 0) {
  const reduzido = usaMenosMovimento();

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento || reduzido) return;

    let animacoes = [];
    let cancelado = false;

    import("animejs").then(({ animate }) => {
      if (cancelado || !ref.current) return;

      animacoes = [
        animate(elemento, {
          translateY: [0, -16],
          duration: 3200 + indice * 400,
          ease: "inOutSine",
          loop: true,
          alternate: true,
        }),
        animate(elemento, {
          rotate: [-0.7, 0.7],
          duration: 5200 + indice * 600,
          ease: "inOutSine",
          loop: true,
          alternate: true,
        }),
      ];
    });

    return () => {
      cancelado = true;
      animacoes.forEach((a) => a?.revert?.());
      elemento.style.transform = "";
    };
  }, [ref, indice, reduzido]);
}

/**
 * Envia um evento para o dataLayer do Google Tag Manager.
 */
export function enviarEvento(dados) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(dados);
}
