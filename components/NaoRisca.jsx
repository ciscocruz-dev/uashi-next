"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconeBrilho } from "./IconeBrilho";
import { enviarEvento, usaMenosMovimento } from "@/lib/hooks";

const BULLETS = [
  "Sem contato manual",
  "Processo padronizado",
  "Lava embaixo do carro",
  "Água e produto sempre limpos",
];

/* Mesmo path da lataria no SVG, no mesmo viewBox (420x200): é o que
   garante que a sujeira caia exatamente sobre o carro. */
const CAMINHO_LATARIA =
  "M42 150 L36 120 Q40 104 62 100 L108 96 L142 66 Q150 60 164 59 L252 59 " +
  "Q268 60 278 70 L306 97 L352 106 Q374 112 378 126 L380 150 Z";
const VB_W = 420;
const VB_H = 200;

const LIMITE = 0.92; // fração da sujeira que precisa sair
const RAIO_CSS = 38; // "esponja", em pixels de tela

export default function NaoRisca() {
  const canvasRef = useRef(null);
  const escovaRef = useRef(null);
  const reduzido = usaMenosMovimento();

  // sujo | limpo | saindo | voltando
  const [estado, setEstado] = useState("sujo");
  const [lavando, setLavando] = useState(false);

  const dados = useRef({
    ctx: null,
    dpr: 1,
    pixelsIniciais: 0,
    ultimoPonto: null,
    movimentos: 0,
    temporizadores: [],
  });

  /* raio em pixels do canvas: precisa levar o devicePixelRatio em
     conta, senão a esponja fica com metade do tamanho em tela retina */
  const raio = useCallback(() => RAIO_CSS * dados.current.dpr, []);

  const recorteDoCarro = useCallback(() => {
    const canvas = canvasRef.current;
    const escalaX = canvas.width / VB_W;
    const escalaY = canvas.height / VB_H;

    const p = new Path2D();
    p.addPath(new Path2D(CAMINHO_LATARIA), new DOMMatrix([escalaX, 0, 0, escalaY, 0, 0]));

    // um pouco de sujeira nas rodas também
    const rodas = new Path2D();
    [112, 300].forEach((cx) => {
      rodas.moveTo((cx + 27) * escalaX, 152 * escalaY);
      rodas.ellipse(cx * escalaX, 152 * escalaY, 27 * escalaX, 27 * escalaY, 0, 0, Math.PI * 2);
    });
    p.addPath(rodas);

    return p;
  }, []);

  const contarSujeira = useCallback(() => {
    const { ctx } = dados.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return 0;
    try {
      const px = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let n = 0;
      for (let i = 3; i < px.length; i += 4 * 12) if (px[i] > 40) n++;
      return n;
    } catch {
      return 0;
    }
  }, []);

  const pintarSujeira = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    dados.current.ctx = ctx;

    const dpr = window.devicePixelRatio || 1;
    dados.current.dpr = dpr;

    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;

    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.clip(recorteDoCarro());

    const esc = canvas.width / VB_W;

    // base de barro
    ctx.fillStyle = "rgba(120, 88, 54, 0.72)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // manchas
    for (let i = 0; i < 34; i++) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(132, 106, 80, ${(0.35 + Math.random() * 0.45).toFixed(2)})`;
      ctx.ellipse(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        (14 + Math.random() * 34) * esc,
        (10 + Math.random() * 22) * esc,
        Math.random() * Math.PI,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // respingos
    for (let i = 0; i < 150; i++) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(72, 50, 26, ${(0.3 + Math.random() * 0.5).toFixed(2)})`;
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        (1 + Math.random() * 4.5) * esc,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.restore();

    dados.current.pixelsIniciais = contarSujeira();
  }, [recorteDoCarro, contarSujeira]);

  const apagar = useCallback(
    (x, y) => {
      const { ctx } = dados.current;
      const r = raio();
      ctx.globalCompositeOperation = "destination-out";
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(0.6, "rgba(0,0,0,0.8)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    },
    [raio]
  );

  const apagarTrilha = useCallback(
    (x, y) => {
      const d = dados.current;
      if (!d.ultimoPonto) {
        apagar(x, y);
      } else {
        const dx = x - d.ultimoPonto.x;
        const dy = y - d.ultimoPonto.y;
        const passos = Math.max(1, Math.ceil(Math.hypot(dx, dy) / (raio() / 3)));
        for (let i = 0; i <= passos; i++) {
          apagar(d.ultimoPonto.x + (dx * i) / passos, d.ultimoPonto.y + (dy * i) / passos);
        }
      }
      d.ultimoPonto = { x, y };
    },
    [apagar, raio]
  );

  const agendar = useCallback((fn, ms) => {
    dados.current.temporizadores.push(setTimeout(fn, ms));
  }, []);

   const reiniciar = useCallback(() => {
    dados.current.temporizadores.forEach(clearTimeout);
    dados.current.temporizadores = [];
    dados.current.ultimoPonto = null;
    dados.current.movimentos = 0;
    setLavando(false);

    // Esconde primeiro, repinta depois: se repintar antes, a sujeira
    // reaparece sobre o carro que ainda está saindo do quadro.
    setEstado("voltando");
    agendar(() => {
      pintarSujeira();
      setEstado("sujo");
    }, 60);
    agendar(() => setEstado("sujo"), 520);
  }, [pintarSujeira, agendar]);

  const ficouLimpo = useCallback(() => {
    if (estado !== "sujo") return;
    setEstado("limpo");
    enviarEvento({ event: "demo_lavagem_concluida" });

    agendar(() => setEstado("saindo"), 950);
    agendar(reiniciar, 2150);
  }, [estado, agendar, reiniciar]);

  /* pinta ao montar e repinta quando o tamanho muda */
  useEffect(() => {
    if (reduzido) {
      pintarSujeira();
      setEstado("limpo");
      return;
    }

    pintarSujeira();

    if (!("ResizeObserver" in window)) return;
    let timer;
    const obs = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (estado === "sujo") pintarSujeira();
      }, 160);
    });
    obs.observe(canvasRef.current);

    return () => {
      obs.disconnect();
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduzido, pintarSujeira]);

  /* limpa os temporizadores ao desmontar */
  useEffect(() => {
    const d = dados.current;
    return () => d.temporizadores.forEach(clearTimeout);
  }, []);

   /* A escova acompanha o ponteiro. Mexo no style direto, sem estado:
     um setState por movimento de mouse re-renderizaria a seção dezenas
     de vezes por segundo sem necessidade. */
  const moverEscova = (evento) => {
    const escova = escovaRef.current;
    if (!escova) return;
    const cena = escova.parentElement.getBoundingClientRect();
    escova.style.left = `${evento.clientX - cena.left}px`;
    escova.style.top = `${evento.clientY - cena.top}px`;
    escova.style.opacity = "1";
  };

  const esconderEscova = () => {
    if (escovaRef.current) escovaRef.current.style.opacity = "0";
  };

  /* quando o carro fica limpo o canvas para de receber ponteiro, então
     a escova precisa sair de cena por aqui */
  useEffect(() => {
    if (estado !== "sujo") esconderEscova();
  }, [estado]);

  const posicao = (evento) => {
    const canvas = canvasRef.current;
    const r = canvas.getBoundingClientRect();
    const escala = canvas.width / r.width;
    return {
      x: (evento.clientX - r.left) * escala,
      y: (evento.clientY - r.top) * escala,
    };
  };

  const aoMover = (evento) => {
    if (estado !== "sujo") return;
    moverEscova(evento);  
    if (evento.pointerType !== "mouse" && evento.pressure === 0 && evento.buttons === 0) return;

    setLavando(true);
    const p = posicao(evento);
    apagarTrilha(p.x, p.y);

    dados.current.movimentos += 1;
    if (dados.current.movimentos % 6 === 0) {
      const inicial = dados.current.pixelsIniciais;
      if (inicial && 1 - contarSujeira() / inicial >= LIMITE) ficouLimpo();
    }
  };

  const classes = ["lavagem", lavando && "lavando", estado !== "sujo" && estado]
    .filter(Boolean)
    .join(" ");

  return (
    <section id="seguranca" className="protege">
      <div className="container protege-grid">
        <div className="protege-texto">
          <span className="etiqueta">Segurança</span>
          <h2 className="protege-titulo">
            Lavagem segura
            <br />
            <span className="destaque-azul">sem riscar</span>
          </h2>
          <p className="protege-desc">
            A Uashi usa a <strong>Istobal M&apos;Wash2</strong>, sistema de lavagem automatizada que cuida da lataria com tecnologia de referência mundial.
          </p>
          <ul className="protege-lista">
            {BULLETS.map((b) => (
              <li key={b}>
                <IconeBrilho classe="protege-ico" />
                {b}
              </li>
            ))}
          </ul>

          <a href="#localizacao" className="local-btn protege-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
              <path d="M9 4v14M15 6v14" />
            </svg>
            Encontrar loja
          </a>
        </div>

        <div className="protege-visual">
          <div
            className={classes}
            tabIndex={0}
            aria-label="Demonstração interativa: mova o cursor sobre o carro para tirar a sujeira. Pressione Enter para limpar de uma vez."
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (estado === "sujo") ficouLimpo();
              }
            }}
          >
            <div className="lavagem-cena">
              <div className="lavagem-piso" aria-hidden="true" />

              <div className="lavagem-movel">
                <svg className="lavagem-carro" viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <defs>
                    <linearGradient id="latariaUashi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C8CED6" />
                      <stop offset="58%" stopColor="#A6AEB9" />
                      <stop offset="100%" stopColor="#838C99" />
                    </linearGradient>
                    <linearGradient id="vidroUashi" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#5EA0DC" />
                      <stop offset="100%" stopColor="#1F5F9E" />
                    </linearGradient>
                  </defs>
                  <ellipse className="lavagem-sombra" cx="210" cy="176" rx="150" ry="11" fill="#000" opacity="0.28" />
                  <path className="lavagem-lataria" d={CAMINHO_LATARIA} fill="url(#latariaUashi)" />
                  <path d="M150 92 L172 70 Q176 67 184 67 L204 67 L204 92 Z" fill="url(#vidroUashi)" />
                  <path d="M214 67 L246 67 Q256 68 262 74 L280 92 L214 92 Z" fill="url(#vidroUashi)" />
                  <path d="M60 124 L360 128" stroke="#7B848F" strokeWidth="2.5" />
                  <rect x="360" y="116" width="20" height="11" rx="4" fill="#FCB406" />
                  <rect x="38" y="118" width="16" height="9" rx="4" fill="#F3201C" />
                  <g className="lavagem-roda">
                    <circle cx="112" cy="152" r="27" fill="#14181E" />
                    <circle cx="112" cy="152" r="11" fill="#9AA3AC" />
                  </g>
                  <g className="lavagem-roda">
                    <circle cx="300" cy="152" r="27" fill="#14181E" />
                    <circle cx="300" cy="152" r="11" fill="#9AA3AC" />
                  </g>
                </svg>

                <canvas
                  className="lavagem-sujeira"
                  ref={canvasRef}
                  aria-hidden="true"
                  onPointerMove={aoMover}
                  onPointerDown={(e) => {
                    dados.current.ultimoPonto = null;
                    if (estado === "sujo") {
                      const p = posicao(e);
                      apagarTrilha(p.x, p.y);
                    }
                  }}
                 onPointerLeave={() => {
                    dados.current.ultimoPonto = null;
                    esconderEscova();
                  }}
                  onPointerEnter={(e) => {
                    if (estado === "sujo") moverEscova(e);
                  }}
                />

                <div className="lavagem-fumaca" aria-hidden="true">
                  <span /><span /><span /><span />
                </div>
              </div>

              <div className="lavagem-brilho" aria-hidden="true" />

              <div className="lavagem-estrelas" aria-hidden="true">
                <span>✦</span><span>✦</span><span>✦</span>
              </div>
              {/* escova giratória que substitui o cursor. Fica fora do
                  .lavagem-movel de propósito: lá dentro ela seria
                  arrastada pela animação de saída do carro. */}
              <div className="lavagem-escova" ref={escovaRef} aria-hidden="true">
                <span className="lavagem-escova-cerdas" />
                <span className="lavagem-escova-eixo" />
              </div>
            </div>

               

            <p className="lavagem-dica">
              <span className="dica-mouse">Mova o mouse sobre o carro para lavar</span>
              <span className="dica-toque">Arraste o dedo sobre o carro para lavar</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
