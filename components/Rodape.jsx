export default function Rodape() {
  return (
    <footer className="rodape">
      <div className="container">
        <div className="rodape-caixa">
          <div className="rodape-topo">
            <div className="rodape-marca">
              <img src="/img/logo.png" alt="Uashi" className="rodape-logo" width={97} height={48} />
              <p>
                Limpeza expressa para o seu carro em poucos minutos.
              </p>
              <a href="/cadastro" className="rodape-btn">
                Fazer cadastro
              </a>
            </div>

            <nav className="rodape-nav" aria-label="Navegação do rodapé">
              <div>
                <p className="rodape-titulo">Uashi</p>
                <ul>
                  <li><a href="#inicio">Início</a></li>
                  <li><a href="#como-funciona">Como funciona</a></li>
                  <li><a href="#beneficios">Benefícios</a></li>
                  <li><a href="#precos">Preços</a></li>
                  <li><a href="#como-chegar">Como chegar</a></li>
                  <li><a href="#faq">Dúvidas</a></li>
                </ul>
              </div>
              <div>
                <p className="rodape-titulo">Links</p>
                <ul>
                  <li><a href="#localizacao">Cadastrar</a></li>
                  <li><a href="#app">Baixar o app</a></li>
                </ul>
              </div>
              <div>
                <p className="rodape-titulo">Legal</p>
                <ul>
                  <li><a href="#termos">Termos de uso</a></li>
                  <li><a href="#politica">Política de privacidade</a></li>
                </ul>
              </div>
            </nav>
          </div>

          <div className="rodape-base">
            <span>© 2026 Uashi. Todos os direitos reservados.</span>
            <span>Av. Engenheiro Roberto Freire — Natal, RN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
