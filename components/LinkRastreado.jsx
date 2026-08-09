"use client";

import { enviarEvento } from "@/lib/hooks";

/**
 * Link que registra a intenção de cadastro antes de navegar.
 * Existe como componente separado para que as seções estáticas
 * (Localização e Rodapé) possam continuar sendo Server Components,
 * com só este pedacinho rodando no cliente.
 */
export function LinkCadastro({ href, origem, className, children }) {
  return (
    <a
      href={href}
      className={className}
      onClick={() =>
        enviarEvento({ event: "inicio_cadastro", origem, destino: href })
      }
    >
      {children}
    </a>
  );
}
