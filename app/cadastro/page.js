"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { enviarEvento } from "@/lib/hooks";
import { enviarLead } from "./acoes";

const PLANOS = {
  largada: "Largada",
  "volta-completa": "Volta completa",
  podio: "Pódio",
  "pole-position": "Pole position",
};

const estadoInicial = { nome: "", email: "", verificacao: "" };

/* SHA-256 da chave do e-mail: é o formato que o Google Ads espera em
   conversões avançadas, e não permite recuperar o endereço. */
async function gerarHash(texto) {
  if (!texto || !window.crypto?.subtle) return "";
  const bytes = new TextEncoder().encode(texto);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function Cadastro() {
  const busca = useSearchParams();
  const planoSlug = busca.get("plano");
  const planoNome = planoSlug ? PLANOS[planoSlug] || "Plano selecionado" : "Plano selecionado";

  const [form, setForm] = useState(estadoInicial);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [emailDuplicado, setEmailDuplicado] = useState(false);
  const [erro, setErro] = useState(null);
  const [campoComErro, setCampoComErro] = useState(null);
  const [origem, setOrigem] = useState({});

  /* UTMs, gclid e fbclid: da URL na primeira visita, depois do cookie */
  useEffect(() => {
    const chaves = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content","gclid","fbclid"];
    const params = new URLSearchParams(window.location.search);
    const daUrl = {};
    let achou = false;
    chaves.forEach((c) => { const v = params.get(c); if (v) { daUrl[c] = v; achou = true; } });

    if (achou) {
      const validade = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      document.cookie = `uashi_origem=${encodeURIComponent(JSON.stringify(daUrl))}; expires=${validade.toUTCString()}; path=/; SameSite=Lax`;
      setOrigem(daUrl);
      return;
    }

    const bruto = document.cookie.split(";").map((p) => p.trim())
      .find((p) => p.startsWith("uashi_origem="));
    if (!bruto) return;
    try { setOrigem(JSON.parse(decodeURIComponent(bruto.slice("uashi_origem=".length)))); } catch {}
  }, []);

  useEffect(() => {
    if (!planoSlug) return;
    enviarEvento({
      event: "inicio_cadastro",
      origem: "plano",
      plano: planoNome,
      destino: "/cadastro?plano=" + planoSlug,
    });
  }, [planoNome, planoSlug]);

  const aoMudar = (evento) => {
    const { name, value } = evento.target;
    setForm((atual) => ({ ...atual, [name]: value }));
  };

  const aoEnviar = async (evento) => {
    evento.preventDefault();
    if (enviando) return;

    setEnviando(true);
    setErro(null);
    setCampoComErro(null);

    const resposta = await enviarLead({
      nome: form.nome,
      email: form.email,
      verificacao: form.verificacao,
      plano: planoSlug ? planoNome : "",
      origem: planoSlug ? "plano" : "landing",
      ...origem,
      url_full: window.location.href,
    });

    setEnviando(false);

    if (!resposta.ok) {
      if (resposta.duplicado) {
        setEmailDuplicado(true);
        setErro(null);
        setCampoComErro(null);
        setForm(estadoInicial);
        enviarEvento({ event: "cadastro_duplicado", plano: planoNome });
        return;
      }

      setErro(resposta.erro || "Não conseguimos enviar. Tente novamente.");
      setCampoComErro(resposta.campo || null);
      return;
    }

    /* Evento de conversão. Sem nome e sem e-mail de propósito: mandar
       dado pessoal para o dataLayer alimenta o GA4, e a política do
       Google proíbe dado que identifique a pessoa. O que vai é a chave
       do e-mail em hash, que é o formato aceito nas conversões
       avançadas do Google Ads. */
    enviarEvento({
      event: "lead",
      form_id: "uashi_cadastro",
      plano: planoNome,
      origem: planoSlug ? "plano" : "landing",
      email_hash: await gerarHash(resposta.chave),
      ...origem,
    });

    setSucesso(true);
    setForm(estadoInicial);
  };

  return (
    <main className="cadastro-page">
      <div className="container cadastro-shell">
        <header className="cadastro-topbar">
          <img src="/img/logo.png" alt="Uashi" className="cadastro-logo" width={124} height={54} />
        </header>

        <div className="cadastro-grid">
          <div className="cadastro-copy">
            <span className="etiqueta">Direto para a pista</span>
            <h1 className="cadastro-titulo">Crie sua conta</h1>
            <p className="cadastro-desc">
              Cadastre-se para escolher seu plano, liberar o pagamento pelo app e aproveitar uma lavagem rápida, prática e sem complicação.
            </p>

          </div>

          <div className="cadastro-form-wrap">
            {sucesso || emailDuplicado ? (
              <div className="cadastro-sucesso" role="status" aria-live="polite">
                <div className="cadastro-sucesso-icone" aria-hidden="true">✓</div>
                <h2>{emailDuplicado ? "Você já está cadastrado" : "Enviado com sucesso!"}</h2>
                <p>
                  {emailDuplicado
                    ? "Este e-mail já está na nossa lista. Você pode voltar para a página inicial e continuar navegando."
                    : "Sua conta foi registrada com sucesso."}
                </p>
                <a href="/" className="cadastro-voltar cadastro-voltar-sucesso">Voltar para o início</a>
              </div>
            ) : (
              <form className="cadastro-form" onSubmit={aoEnviar}>
                <div className="cadastro-form-header">
                  <h2>Dados da conta</h2>
                </div>

                <label>
                  <span>Nome</span>
                  <input
                    type="text"
                    name="nome"
                    value={form.nome}
                    onChange={aoMudar}
                    placeholder="Seu nome completo"
                    required
                    aria-invalid={campoComErro === "nome" || undefined}
                  />
                </label>

                <label>
                  <span>E-mail</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={aoMudar}
                    placeholder="seuemail@email.com"
                    required
                    aria-invalid={campoComErro === "email" || undefined}
                  />
                </label>


                {/* honeypot anti-spam: fora da tela, invisível para
                    pessoas, atrativo para robô */}
                <div className="cadastro-honeypot" aria-hidden="true">
                  <label htmlFor="cad-verificacao">Não preencha</label>
                  <input
                    id="cad-verificacao"
                    type="text"
                    name="verificacao"
                    value={form.verificacao}
                    onChange={aoMudar}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {erro && (
                  <p className="cadastro-erro" role="alert">
                    {erro}
                  </p>
                )}

                <button type="submit" className="cadastro-btn" disabled={enviando}>
                  {enviando ? "Enviando..." : "Enviar"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* useSearchParams precisa de uma fronteira de Suspense; sem ela o
   next build acusa erro ao gerar a página estaticamente. */
export default function CadastroPage() {
  return (
    <Suspense fallback={null}>
      <Cadastro />
    </Suspense>
  );
}
