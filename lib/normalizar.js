/**
 * Normalização de nome e e-mail.
 *
 * Este módulo é a fonte única da verdade: as mesmas regras rodam no
 * servidor do site e dentro do Apps Script da planilha. Se as duas
 * pontas normalizassem diferente, a checagem de duplicado falharia.
 */

/* Provedores em que o ponto no nome de usuário é ignorado pelo
   servidor de e-mail (joao.silva@gmail.com == joaosilva@gmail.com). */
const IGNORAM_PONTO = ["gmail.com", "googlemail.com"];

/* Partículas que ficam em minúscula no meio de nomes brasileiros. */
const PARTICULAS = ["de", "da", "do", "das", "dos", "e", "di", "du", "del", "van", "von", "la"];

/**
 * Limpa e padroniza o nome.
 *
 * - NFC: acento composto e acento pré-composto viram a mesma coisa.
 *   Sem isso "José" digitado no iPhone e no Windows podem virar duas
 *   pessoas diferentes na planilha.
 * - Remove caracteres de controle e qualquer coisa que não seja letra,
 *   espaço, hífen ou apóstrofo.
 * - Colapsa espaços repetidos.
 * - Capitaliza cada palavra, deixando as partículas em minúscula.
 */
export function normalizarNome(valor) {
  const bruto = String(valor ?? "")
    .normalize("NFC")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .replace(/[^\p{L}\p{M}\s'-]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!bruto) return "";

  return bruto
    .split(" ")
    .map((palavra, indice) => {
      const minuscula = palavra.toLocaleLowerCase("pt-BR");
      // partícula fica minúscula, menos se for a primeira palavra
      if (indice > 0 && PARTICULAS.includes(minuscula)) return minuscula;
      // preserva hífens compostos: "Anna-Maria"
      return minuscula
        .split("-")
        .map((parte) =>
          parte ? parte.charAt(0).toLocaleUpperCase("pt-BR") + parte.slice(1) : parte
        )
        .join("-");
    })
    .join(" ");
}

/**
 * Limpa o e-mail para GUARDAR: minúsculo, sem espaço, NFC.
 * Mantém pontos e "+alias", porque é este endereço que será usado
 * para escrever de verdade para a pessoa.
 */
export function normalizarEmail(valor) {
  return String(valor ?? "")
    .normalize("NFC")
    .replace(/\s+/g, "")
    .toLowerCase();
}

/**
 * Gera a CHAVE de comparação do e-mail, usada só para detectar
 * duplicado. Diferente do e-mail guardado:
 *
 * - remove o "+alias" (joao+teste@gmail.com -> joao@gmail.com)
 * - em Gmail, remove os pontos do usuário
 * - googlemail.com é tratado como gmail.com
 *
 * Assim a pessoa não se cadastra três vezes com variações do mesmo
 * endereço, mas continuamos guardando o endereço como ela digitou.
 */
export function chaveEmail(valor) {
  const email = normalizarEmail(valor);
  const arroba = email.lastIndexOf("@");
  if (arroba < 1) return email;

  let usuario = email.slice(0, arroba);
  let dominio = email.slice(arroba + 1);

  const mais = usuario.indexOf("+");
  if (mais > 0) usuario = usuario.slice(0, mais);

  if (dominio === "googlemail.com") dominio = "gmail.com";
  if (IGNORAM_PONTO.includes(dominio)) usuario = usuario.replace(/\./g, "");

  return `${usuario}@${dominio}`;
}

/** Validação de e-mail: suficiente e sem falso negativo comum. */
export function emailValido(valor) {
  const email = normalizarEmail(valor);
  if (email.length < 6 || email.length > 254) return false;
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) return false;
  if (email.includes("..")) return false;
  return true;
}

/** Nome precisa de pelo menos duas palavras com 2+ letras. */
export function nomeValido(valor) {
  const nome = normalizarNome(valor);
  const partes = nome.split(" ").filter((p) => p.length >= 2);
  return partes.length >= 2 && nome.length >= 5;
}
