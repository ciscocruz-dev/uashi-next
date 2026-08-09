import Script from "next/script";

/**
 * Google Tag Manager.
 *
 * Um container só, e dentro dele você configura o GA4 e a conversão do
 * Google Ads. Prefiro assim a colar o gtag direto: os IDs ficam no GTM
 * e você troca tag sem mexer no código nem publicar de novo.
 *
 * Configure NEXT_PUBLIC_GTM_ID no .env.local (formato GTM-XXXXXXX).
 * Sem a variável, nada é injetado — então ambiente de teste não
 * contamina os dados de produção.
 */
export function GoogleTagScript() {
  const id = process.env.NEXT_PUBLIC_GTM_ID;
  if (!id) return null;

  return (
    <Script id="gtm" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');`}
    </Script>
  );
}

/** Alternativa sem JavaScript. Vai logo depois da abertura do <body>. */
export function GoogleTagNoScript() {
  const id = process.env.NEXT_PUBLIC_GTM_ID;
  if (!id) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${id}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
