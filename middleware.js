import { NextResponse } from "next/server";

/**
 * Senha no dashboard.
 *
 * O dashboard mostra nome e e-mail de todos os leads. Numa URL pública,
 * qualquer pessoa que adivinhasse o endereço veria a base inteira — o
 * que é vazamento de dado pessoal e problema de LGPD. Por isso a
 * proteção roda aqui, no middleware: ela barra antes de a página
 * sequer ser renderizada.
 *
 * Configure no .env.local e no painel da hospedagem:
 *   DASHBOARD_USUARIO=uashi
 *   DASHBOARD_SENHA=uma-senha-longa
 */
export function middleware(request) {
  const usuario = process.env.DASHBOARD_USUARIO;
  const senha = process.env.DASHBOARD_SENHA;

  /* Sem senha configurada, BLOQUEIA. É de propósito: se o padrão fosse
     liberar, esquecer a variável deixaria a base de leads aberta. */
  if (!usuario || !senha) {
    return new NextResponse(
      "Dashboard sem senha configurada. Defina DASHBOARD_USUARIO e DASHBOARD_SENHA.",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  const cabecalho = request.headers.get("authorization");

  if (cabecalho?.startsWith("Basic ")) {
    try {
      const decodificado = atob(cabecalho.slice(6));
      const separador = decodificado.indexOf(":");
      const u = decodificado.slice(0, separador);
      const s = decodificado.slice(separador + 1);

      if (u === usuario && s === senha) return NextResponse.next();
    } catch {
      // cabeçalho malformado cai no 401 abaixo
    }
  }

  return new NextResponse("Acesso restrito", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Dashboard Uashi", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export const config = {
  matcher: "/dashboard/:path*",
};
