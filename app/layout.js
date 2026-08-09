import localFont from "next/font/local";
import Loader from "@/components/Loader";
import { GoogleTagScript, GoogleTagNoScript } from "@/components/GoogleTag";  // ← adicionar
import "./globals.css";

/* Titan One embutida no projeto em vez de baixada do Google.
   Motivos: o build não depende de rede (roda offline e em CI sem
   internet), não há requisição a domínio externo em produção e não há
   salto de layout. A fonte é licenciada em SIL Open Font License 1.1,
   que permite a redistribuição — a licença está em
   app/fonts/LICENSE-TitanOne.txt.

   Se preferir buscar do Google, troque por:
     import { Titan_One } from "next/font/google";
     const titanOne = Titan_One({ weight: "400", subsets: ["latin", "latin-ext"],
       display: "swap", variable: "--fonte-titan" }); */
const titanOne = localFont({
  src: [
    { path: "./fonts/titan-one-latin-400-normal.woff2", weight: "400", style: "normal" },
  ],
  display: "swap",
  variable: "--fonte-titan",
});

export const metadata = {
  title: "Lava Rápido em Natal: Lavagem em 5 Minutos | Uashi",
  description:
    "Lava rápido em Natal com tecnologia Istobal: carro limpo em 5 minutos, sem sair do veículo, na Av. Engenheiro Roberto Freire. Conheça a Uashi.",
  alternates: { canonical: "https://uashi.com.br/" },
  icons: { icon: "/img/logo.png" },
  openGraph: {
    title: "Lava Rápido em Natal: Lavagem em 5 Minutos | Uashi",
    description:
      "Carro limpo em 5 minutos, sem sair do veículo. A partir de R$34,90, na Av. Engenheiro Roberto Freire, em Natal.",
    url: "https://uashi.com.br/",
    siteName: "Uashi",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={titanOne.variable}>
        <body>
        <GoogleTagNoScript />
        <Loader />
        {children}
        <GoogleTagScript />
      </body>
    </html>
  );
}
