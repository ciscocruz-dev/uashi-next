"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { enviarEvento } from "@/lib/hooks";

const PLANOS = {
  largada: "Largada",
  "volta-completa": "Volta completa",
  podio: "Pódio",
  "pole-position": "Pole position",
};

const estadoInicial = { nome: "", email: "", senha: "" };

export default function CadastroPage() {
  const busca = useSearchParams();
  const planoSlug = busca.get("plano");
  const planoNome = planoSlug ? PLANOS[planoSlug] || "Plano selecionado" : "Plano selecionado";

  const [form, setForm] = useState(estadoInicial);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

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
    setEnviando(true);

    await new Promise((resolver) => setTimeout(resolver, 600));

    const payload = {
      event: "cadastro_enviado",
      nome: form.nome,
      email: form.email,
      plano: planoNome,
      origem: planoSlug ? "plano" : "landing",
    };

    enviarEvento(payload);
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "cadastro_enviado", payload);
    }

    setEnviando(false);
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
            {sucesso ? (
              <div className="cadastro-sucesso" role="status" aria-live="polite">
                <div className="cadastro-sucesso-icone" aria-hidden="true">✓</div>
                <h2>Enviado com sucesso!</h2>
                <p>
                  Sua conta foi registrada com sucesso.
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
                  />
                </label>

                <label>
                  <span>Senha</span>
                  <input
                    type="password"
                    name="senha"
                    value={form.senha}
                    onChange={aoMudar}
                    placeholder="Crie sua senha"
                    minLength={6}
                    required
                  />
                </label>

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
