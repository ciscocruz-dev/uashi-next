# Uashi — Landing Page (Next.js)

Lava rápido automatizado · Av. Engenheiro Roberto Freire, Natal/RN
Palavra-chave focal: **lava rápido em Natal**

Next.js 15 (App Router) + React 19. Conversão da versão em HTML/CSS/JS
puros, com paridade visual verificada seção por seção.

---

## Rodar

```bash
npm install
npm run dev     # desenvolvimento em http://localhost:3000
npm run build   # build de produção
npm start       # servir o build
```

Não precisa de variável de ambiente nem de chave de API.

## Estrutura

```
uashi-landing/
├── app/
│   ├── layout.js        metadata, Open Graph e a fonte
│   ├── page.js          monta as seções e gera o JSON-LD do FAQ
│   ├── globals.css       o CSS inteiro (~1800 linhas, por seção)
│   └── fonts/            Titan One embutida + licença OFL
├── components/           uma seção por arquivo
├── lib/
│   ├── hooks.js          hooks compartilhados de animação e rastreamento
│   └── perguntas.js      dados do FAQ (usados na tela e no JSON-LD)
└── public/img/           logo, celular, faixa e estrela
```

---

## Decisões da conversão

### CSS global, não CSS Modules

O `globals.css` é o mesmo arquivo da versão em HTML, organizado em
blocos por seção. Mantive assim de propósito: o resultado visual já
estava validado ao pixel, e fatiar em Modules exigiria reescrever todos
os seletores com risco de quebrar espaçamentos calibrados no design.

Se um dia quiser migrar para Modules, o caminho natural é ir seção por
seção, comparando alturas antes e depois (foi assim que validei esta
conversão).

### Anime.js como pacote, não CDN

Na versão em HTML o Anime.js vinha de CDN, e por isso o código tinha
toda uma arquitetura de proteção contra o CDN cair. Aqui ele é
dependência do `package.json` e entra por `import()` dinâmico dentro do
hook — versionado, empacotado e sem depender de rede de terceiros.

### Fonte embutida em vez de `next/font/google`

A Titan One está em `app/fonts/`, carregada por `next/font/local`.
Motivos: o build não depende de rede (roda offline e em CI), não há
requisição a domínio externo em produção e não há salto de layout. A
fonte é licenciada em **SIL Open Font License 1.1**, que permite a
redistribuição (licença em `app/fonts/LICENSE-TitanOne.txt`).

Para buscar do Google em vez disso, o `app/layout.js` tem a alternativa
comentada.

### `next/image` só onde paga

Usado apenas em `app-celular.png` (253 KB, a mais pesada do projeto),
onde o Next serve WebP/AVIF sob medida. A logo (1 KB) e a estrela (1 KB)
não teriam ganho, e a faixa diagonal usa larguras em `%` acima de 100%
em algumas seções, o que o `next/image` não acompanha bem. Cada caso
está comentado no código.

### Server Components onde dá

`Localizacao`, `Rodape` e `ChipLoja` não têm JavaScript no cliente. Os
links que precisam registrar evento usam o `LinkCadastro`, um componente
cliente minúsculo — assim só ele vai para o bundle, não a seção inteira.

### Dados do FAQ fora do componente

`lib/perguntas.js` não tem `"use client"` de propósito: o `app/page.js`
precisa dessa lista no servidor para gerar o JSON-LD, e um Server
Component que importa dado de um módulo `"use client"` recebe uma
referência de cliente, não o valor. Com os dados num módulo neutro, a
marcação estruturada e o texto na tela vêm da mesma fonte e não podem
divergir.

---

## Paridade com a versão em HTML

Comparei as duas rodando lado a lado, medindo a altura de cada seção:

| Seção | HTML | Next |
|---|---|---|
| Hero | 913 | 913 |
| Chips | 277 | 277 |
| Como funciona | 642 | 642 |
| Não risca | 670 | 670 |
| Benefícios | 2150 | 2150 |
| Preços | 1095 | 1095 |
| Como chegar | 601 | 601 |
| Dúvidas | 683 | 683 |
| CTA | 552 | 552 |
| **Documento inteiro** | **7906** | **7906** |

Funcionalidades verificadas no build de produção: scrollspy nas 5
seções, esteira de chips em sentidos opostos, carrinho da pista,
lavagem interativa, acordeão do FAQ, os dois celulares flutuando,
rastreamento no dataLayer e zero overflow horizontal de 1920 a 320px.
Sem erros de console.

---

## PENDÊNCIAS antes de publicar

### 1. URLs que faltam

| O quê | Onde |
|---|---|
| Página de cadastro | `Precos.jsx`, `Localizacao.jsx`, `Faq.jsx`, `Rodape.jsx` |
| App Store e Google Play | `CtaApp.jsx` e `Rodape.jsx` |
| Download do app (header) | `Header.jsx` — constante `LINK_APP` |
| Redes sociais | `Rodape.jsx` — ainda não existem no layout |

Todas marcadas com `// TODO` ou `{/* TODO */}`.

### 2. Endereço — CORRIGIR ANTES DE PUBLICAR

Em `Localizacao.jsx` o endereço aparece como
`[NÚMERO], [BAIRRO] — Natal, RN` de propósito, para não publicar
informação errada.

O design original trazia **"Lagoa Nova"**, mas isso está incorreto: a
Av. Engenheiro Roberto Freire começa em **Capim Macio** e termina em
**Ponta Negra**, passando também por Parque das Dunas. Lagoa Nova não
fica nessa avenida.

Endereço errado prejudica o SEO local, a ficha do Google Perfil da
Empresa e a rota de quem vai dirigir até lá. Corrigir em dois lugares:
`Localizacao.jsx` e `Rodape.jsx`.

Depois disso, vale adicionar dados estruturados `LocalBusiness` com o
endereço completo (hoje só existe o `FAQPage`).

### 3. Assets

- **Logo em SVG** (ou PNG 2x/3x): o arquivo atual tem 97×48px e é
  exibido a 34-38px de altura, o que fica levemente borrado em retina.
- **Foto real do carro** para a seção "não risca" (hoje é ilustração
  SVG dentro do componente).
- **Celular sem os chips** + cada chip separado, se quiser que os chips
  flutuem em ritmo próprio (hoje flutuam junto, porque vêm embutidos no
  PNG).

### 4. Fonte do corpo — licença da SF Pro

Corpo usa **SF Pro** pela pilha de fonte do sistema
(`-apple-system, BlinkMacSystemFont, ...`). Em iPhone e Mac renderiza a
SF Pro de verdade; em Android e Windows cai no Roboto/Segoe UI.

**A licença da Apple não permite hospedar o arquivo da SF Pro num
site**, por isso a pilha do sistema. Consequência: o texto tem aparência
levemente diferente entre um iPhone e um Android. Para consistência
total, a recomendação é a **Inter** (equivalente livre da SF,
praticamente indistinguível) — é trocar `--font-texto` no
`globals.css`.

### 5. Afirmações que precisam de confirmação

- **"Não risca a pintura"**: os argumentos usados hoje são de
  *processo* (sem contato manual, automatizado, padronizado). Com a
  **ficha técnica da Istobal M'Wash2** dá para trocar por argumentos
  técnicos de verdade, que são mais fortes. Sem a ficha, evitar
  afirmações sobre material de escova, densidade etc.
- **Altura máxima de 2,30 m**: veio do briefing, confirmar.
- **"Por ordem de chegada / sem fila"**: confirmar que a operação
  realmente não terá agendamento.
- **Mapa do Google**: não foi possível verificar o carregamento no
  ambiente de teste (rede restrita). Usa `output=embed`, que não exige
  chave de API. Confirmar que aparece após publicar.

---

## Rastreamento (GTM)

Eventos enviados ao `dataLayer`:

| Evento | Quando | Campos |
|---|---|---|
| `escolha_plano` | clique em "Quero esse" | `plano`, `valor`, `destino` |
| `inicio_cadastro` | clique em "Fazer cadastro" | `origem`, `destino` |
| `demo_lavagem_concluida` | usuário termina de lavar o carro na demo | — |

`escolha_plano` é o dado mais útil da página: saber qual nível de
lavagem as pessoas escolhem muda a decisão de qual plano destacar na
mídia paga.

Ressalva: evento em clique de link disputa com a navegação. O GTM
normalmente dá conta; para garantia total, configurar a tag com
`transport_type: beacon`.

O container do GTM ainda não está instalado. No App Router, o caminho
é o componente `<Script>` do `next/script` no `app/layout.js`, com
`strategy="afterInteractive"`.

---

## Acessibilidade

- Link "pular para o conteúdo" no início.
- Acordeão do FAQ em `<details>` nativo: abre com Enter/Espaço e
  funciona mesmo sem o JavaScript da animação.
- A demo de lavagem aceita Enter para completar (não há como esfregar
  com teclado).
- Foco visível em elementos interativos.
- Todas as animações respeitam `prefers-reduced-motion`: as esteiras
  param, os cards de benefícios viram lista comum, o carrinho da pista
  para e a lavagem já aparece limpa.

---

## Notas de estratégia

A página foi construída para a **Fase 1** definida pelo cliente: gerar
fluxo para a unidade da Av. Roberto Freire. Por isso:

- Assinatura não é oferecida (os 4 níveis são lavagem avulsa).
- Franquia (Fase 3) não aparece em nenhum lugar.
- A palavra-chave focal é "lava rápido em Natal", e não "lava jato em
  Natal" (que tem mais volume), porque descreve o que a Uashi de fato
  é, tem busca em crescimento e concorrência baixa. Nenhuma marca do
  setor investe em SEO local em Natal hoje.

### Decisões de design que se afastam do layout original

1. **Benefícios:** de 6 itens para 3, cortando o que os chips já diziam.
2. **FAQ:** pergunta com mais peso e resposta em texto normal. No
   layout era o inverso; com 8 itens, o que a pessoa escaneia é a lista
   de perguntas.
3. **Como chegar:** mantido o botão "Abrir no mapa" ao lado do "Fazer
   cadastro". A seção se chama "Como chegar" — tirar a rota removeria a
   função dela.
4. **Sem a logo repetida** nos cards de preço: 4 logos lado a lado
   enfraquecem a marca. A estrela ✦ da logo já aparece nos itens.
5. **Carrinho da pista** espelhado e em vermelho: no desenho original
   ele atravessava a pista de marcha à ré, e o branco se perdia contra
   os cards.
