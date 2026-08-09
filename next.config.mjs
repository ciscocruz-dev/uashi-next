import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // fixa a raiz do projeto para o rastreamento de arquivos, evitando
  // que o Next escolha um lockfile de um diretório acima
  outputFileTracingRoot: raiz,
};

export default nextConfig;
