/**
 * Perguntas do FAQ.
 *
 * Ficam neste arquivo, e não dentro do componente, porque o Faq.jsx é
 * um Client Component: quando um Server Component importa um dado de
 * um módulo "use client", ele recebe uma referência de cliente e não o
 * valor em si. Como o app/page.js precisa desta lista para gerar o
 * JSON-LD no servidor, os dados moram aqui e os dois lados importam
 * daqui — garantindo também que a marcação e o texto visível nunca
 * divirjam.
 */
export const PERGUNTAS = [
  {
    pergunta: "Quanto tempo demora a lavagem na Uashi?",
    resposta:
      "Cerca de 5 minutos na lavagem Largada. Os níveis mais completos levam um pouco mais: até 8 minutos na Pole Position.",
  },
  {
    pergunta: "Preciso sair do carro durante a lavagem?",
    resposta:
      "Não. Você mostra o QR code do app na entrada, segue lentamente pela pista e continua dentro do veículo do início ao fim.",
  },
  {
    pergunta: "Preciso agendar horário?",
    resposta:
      "Não. A ideia da Uashi é justamente acabar com a espera do lava jato tradicional: você chega, gera o QR code no app e entra na pista por ordem de chegada.",
  },
  {
    pergunta: "A máquina risca a pintura do carro?",
    resposta:
      "Não. A Uashi opera com a Istobal M'Wash2, da fabricante espanhola Istobal, referência mundial em lavagem automática. O processo é 100% automatizado, sem pano e sem contato manual, então não existe o risco de esfregar sujeira de volta na lataria.",
  },
  {
    pergunta: "Quais são os níveis de lavagem e quanto custa cada um?",
    resposta:
      "São quatro: Largada por R$34,90, Volta Completa por R$49,90, Pódio por R$54,90 e Pole Position por R$74,90. A diferença está no que cada um inclui, da lavagem com alta pressão até chassi e pretinho nos pneus. Aspirador (R$7,00) e pretinho nos pneus (R$8,00) também podem ser contratados à parte.",
  },
  {
    pergunta: "Como funciona o pagamento?",
    resposta:
      "Pelo aplicativo da Uashi, antes de entrar na pista: você escolhe o nível de lavagem, paga e o app gera o seu QR code. Não tem balcão para negociar nem surpresa na saída.",
  },
  {
    pergunta: "Existe restrição de tamanho ou altura do veículo?",
    resposta:
      "Sim. A pista atende veículos de até 2,30 m de altura. Picapes grandes, vans altas e alguns SUVs maiores não passam nesta unidade.",
  },
  {
    pergunta: "Onde fica a unidade da Uashi?",
    resposta:
      "Na Av. Engenheiro Roberto Freire, em Natal, no Rio Grande do Norte. O endereço completo e a rota no mapa estão na seção Como chegar.",
  },
];
