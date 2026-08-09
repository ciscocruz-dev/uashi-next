"use client";

import { useEffect, useState } from "react";

/**
 * Cortina de carregamento: fundo azul, logo e uma barra.
 * Ao terminar de carregar, some e revela o site.
 *
 * Os estilos ficam no globals.css (bloco "CORTINA DE CARREGAMENTO"),
 * com todas as classes prefixadas por "loader-" para não colidirem com
 * as classes das seções — a página já tem uma ".pista", por exemplo.
 *
 * Duas garantias importantes:
 * - Sai assim que fontes e recursos estão prontos, com um mínimo curto
 *   só para a saída não piscar em carregamento vindo de cache.
 * - Se este JavaScript falhar, uma animação de CSS esconde a cortina
 *   sozinha em 4s, então ninguém fica preso numa tela morta.
 */
export default function Loader() {
  const [saindo, setSaindo] = useState(false);
  const [oculto, setOculto] = useState(false);

  useEffect(() => {
    const inicio = performance.now();
    const MINIMO = 800; // tempo mínimo em tela, em ms
    const LIMITE = 3500; // rede de segurança do lado do JS
    const SAIDA = 450; // duração do fade de saída

    let cancelado = false;
    const temporizadores = [];

    const encerrar = () => {
      if (cancelado) return;
      const espera = Math.max(0, MINIMO - (performance.now() - inicio));

      temporizadores.push(
        setTimeout(() => {
          if (cancelado) return;
          setSaindo(true);
          temporizadores.push(
            setTimeout(() => {
              if (!cancelado) setOculto(true);
            }, SAIDA)
          );
        }, espera)
      );
    };

    const prontos = [];
    if (document.fonts?.ready) prontos.push(document.fonts.ready);
    prontos.push(
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((resolve) =>
            window.addEventListener("load", resolve, { once: true })
          )
    );

    Promise.all(prontos).then(encerrar).catch(encerrar);
    temporizadores.push(setTimeout(encerrar, LIMITE));

    return () => {
      cancelado = true;
      temporizadores.forEach(clearTimeout);
    };
  }, []);

  if (oculto) return null;

  return (
    <div
      className={`loader-cortina${saindo ? " loader-saindo" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Carregando"
    >
      <div className="loader-conteudo">
        <img
          src="/img/logo.png"
          alt="Uashi"
          className="loader-logo"
          width={97}
          height={48}
        />
        <div className="loader-barra" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
