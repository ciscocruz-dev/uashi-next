"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { id: "inicio", rotulo: "Início" },
  { id: "como-funciona", rotulo: "Como funciona" },
  { id: "beneficios", rotulo: "Benefícios" },
  { id: "precos", rotulo: "Preços" },
  { id: "localizacao", rotulo: "Como chegar" },
  { id: "duvidas", rotulo: "Dúvidas" },
];

const LINK_APP = "/cadastro";

export default function Header() {
  const [rolando, setRolando] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [secaoAtiva, setSecaoAtiva] = useState("inicio");

  /* sombra quando sai do topo */
  useEffect(() => {
    const aoRolar = () => setRolando(window.scrollY > 8);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  /* trava a rolagem do fundo com o menu aberto */
  useEffect(() => {
    document.body.classList.toggle("menu-travado", menuAberto);
    return () => document.body.classList.remove("menu-travado");
  }, [menuAberto]);

  /* Esc fecha o menu; voltar ao desktop também */
  useEffect(() => {
    if (!menuAberto) return;

    const aoTeclar = (e) => {
      if (e.key === "Escape") setMenuAberto(false);
    };
    const aoRedimensionar = () => {
      if (window.innerWidth > 900) setMenuAberto(false);
    };

    document.addEventListener("keydown", aoTeclar);
    window.addEventListener("resize", aoRedimensionar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      window.removeEventListener("resize", aoRedimensionar);
    };
  }, [menuAberto]);

  /* Link ativo conforme a seção visível.
     A linha de leitura vem do scroll-padding-top do CSS: é o mesmo
     valor que faz a âncora parar abaixo do header, então os dois
     nunca saem de sincronia se a altura do header mudar. */
  useEffect(() => {
    let agendado = false;

    const linhaDeLeitura = () => {
      const padding = parseFloat(
        getComputedStyle(document.documentElement).scrollPaddingTop
      );
      if (!padding || Number.isNaN(padding)) {
        const cabecalho = document.querySelector(".cabecalho");
        return cabecalho ? cabecalho.getBoundingClientRect().bottom + 16 : 100;
      }
      return padding + 8; // folga para o arredondamento da rolagem
    };

    const calcular = () => {
      agendado = false;

      const limite = linhaDeLeitura();
      let escolhida = LINKS[0].id;

      LINKS.forEach(({ id }) => {
        const secao = document.getElementById(id);
        if (secao && secao.getBoundingClientRect().top <= limite) escolhida = id;
      });

      const fim =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (fim) escolhida = LINKS[LINKS.length - 1].id;

      setSecaoAtiva(escolhida);
    };

    const agendar = () => {
      if (agendado) return;
      agendado = true;
      window.requestAnimationFrame(calcular);
    };

    calcular();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    return () => {
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
    };
  }, []);

  return (
    <>
      <header className={`cabecalho${rolando ? " rolando" : ""}`}>
        <div className="cabecalho-pill">
          <a href="#inicio" className="cabecalho-logo" aria-label="Uashi — página inicial">
            {/* <img> simples: a logo tem 1 KB, então o next/image não
                traria ganho e ainda adicionaria um wrapper */}
            <img src="/img/logo.png" alt="Uashi" width={97} height={48} />
          </a>

          <nav className="cabecalho-nav" aria-label="Navegação principal">
            {LINKS.map(({ id, rotulo }) => (
              <a
                key={id}
                href={`#${id}`}
                className={secaoAtiva === id ? "ativo" : undefined}
              >
                {rotulo}
              </a>
            ))}
          </nav>

          <a href={LINK_APP} className="btn-app">
            Baixar App
          </a>

          <button
            type="button"
            className="btn-menu"
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuAberto}
            aria-controls="menu-mobile"
            onClick={() => setMenuAberto((v) => !v)}
          >
            {menuAberto ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <nav
        className={`menu-mobile${menuAberto ? " aberto" : ""}`}
        id="menu-mobile"
        aria-label="Navegação mobile"
      >
        {LINKS.map(({ id, rotulo }) => (
          <a
            key={id}
            href={`#${id}`}
            className={secaoAtiva === id ? "ativo" : undefined}
            onClick={() => setMenuAberto(false)}
          >
            {rotulo}
          </a>
        ))}
        <a href={LINK_APP} className="btn-app" onClick={() => setMenuAberto(false)}>
          Baixar App
        </a>
      </nav>
    </>
  );
}
