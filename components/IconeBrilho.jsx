/**
 * A estrela da logo, declarada uma única vez como <symbol> e
 * reaproveitada por <use> nos chips, nos bullets e nos planos.
 * Com dezenas de ocorrências na página, repetir o <path> inteiro
 * pesaria no DOM sem necessidade.
 */
export function DefinicaoIconeBrilho() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <symbol id="ico-brilho" viewBox="0 0 26 32">
        <path d="M11.533 32C11.533 29.8843 11.5236 28.1382 11.533 26.3917C11.5425 24.708 11.3173 23.0819 10.7253 21.484C10.3032 20.3468 9.58992 19.6755 8.52393 19.229C6.60442 18.4229 4.605 18.3942 2.58633 18.4229C1.75061 18.4328 0.915263 18.4229 0 18.2069C0.74129 17.9433 1.48331 17.6792 2.21988 17.4057C4.23382 16.6719 6.21942 15.8563 8.26133 15.2181C11.1669 14.3114 12.9317 12.2819 14.0911 9.52807C15.2507 6.77912 16.4573 4.05399 17.6446 1.31944C17.8186 0.916123 17.9965 0.51827 18.2268 0C18.0906 3.0467 17.9072 5.97298 17.8465 8.89979C17.7477 13.5439 19.2122 15.1463 23.7565 15.4916C24.4931 15.5491 25.2442 15.5016 26 15.5922C23.775 16.4033 21.4941 16.9741 19.3066 17.8516C17.4285 18.6052 16.1282 19.8385 15.274 21.7381C13.9926 24.5926 12.9837 27.5432 12.0255 30.523C11.9035 30.9065 11.7724 31.29 11.5374 31.9955L11.533 32Z" />
      </symbol>
    </svg>
  );
}

/** Uso do símbolo acima. `classe` controla tamanho e cor via CSS. */
export function IconeBrilho({ classe }) {
  return (
    <svg className={classe} aria-hidden="true">
      <use href="#ico-brilho" />
    </svg>
  );
}
