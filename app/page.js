import { DefinicaoIconeBrilho } from "@/components/IconeBrilho";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Chips from "@/components/Chips";
import ComoFunciona from "@/components/ComoFunciona";
import NaoRisca from "@/components/NaoRisca";
import Beneficios from "@/components/Beneficios";
import Precos from "@/components/Precos";
import Localizacao from "@/components/Localizacao";
import Faq from "@/components/Faq";
import { PERGUNTAS } from "@/lib/perguntas";
import CtaApp from "@/components/CtaApp";
import Rodape from "@/components/Rodape";
import Tunel from "@/components/Tunel";

/* Dados estruturados do FAQ gerados a partir da MESMA lista que
   renderiza as perguntas na tela, para os dois nunca divergirem.
   Nota: o Google restringiu os resultados enriquecidos de FAQ a sites
   de governo e saúde, então isto não gera mais o snippet expandido —
   segue como marcação válida que ajuda a entender a página. */
const dadosFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: PERGUNTAS.map(({ pergunta, resposta }) => ({
    "@type": "Question",
    name: pergunta,
    acceptedAnswer: { "@type": "Answer", text: resposta },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dadosFaq) }}
      />

      <a href="#inicio" className="pular-conteudo">
        Pular para o conteúdo
      </a>

      <DefinicaoIconeBrilho />
      <Header />

      <main>
        <Hero />
        <Chips />
        <ComoFunciona />
        <Tunel /> 
        <NaoRisca />
        <Precos />
        <Beneficios />
        <Localizacao />
        <Faq />
        <CtaApp />
      </main>

      <Rodape />
    </>
  );
}
