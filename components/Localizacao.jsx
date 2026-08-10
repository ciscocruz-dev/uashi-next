import { LinkCadastro } from "./LinkRastreado";

/**
 * Server Component: nada aqui precisa de JavaScript no cliente,
 * exceto o link rastreado, que é um componente cliente isolado.
 */
export default function Localizacao() {
  return (
    <section id="localizacao" className="local">
      <div className="container">
        <div className="local-topo">
          <span className="etiqueta">Localização</span>
          <h2 className="local-titulo">
            Como <span className="destaque-ambar">chegar</span>
          </h2>
        </div>

        <div className="local-grid">
          <div className="local-content">
            <div className="local-card">
              <h3 className="local-endereco">Av. Engenheiro Roberto Freire</h3>
              <p className="local-complemento">122, Capim Macio — Natal, RN</p>
              <p className="local-complemento">Fácil de chegar, rápido de usar e pronto para deixar seu carro impecável.</p>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Av.+Engenheiro+Roberto+Freire,+Natal+-+RN"
                className="local-btn-vazado"
                target="_blank"
                rel="noopener"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><path d="M9 4v14M15 6v14" />
                </svg>
                Abrir no mapa
              </a>
            </div>


            <div>
            </div>
            <img src="/img/frente-loja.png" alt="Localização da Uashi" />
          </div>


          <div className="local-mapa">
            <iframe
              src="https://www.google.com/maps?q=Av.+Engenheiro+Roberto+Freire,+Natal+-+RN&output=embed"
              title="Mapa com a localização da Uashi na Av. Engenheiro Roberto Freire, em Natal"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
