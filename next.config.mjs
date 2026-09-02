/** @type {import('next').NextConfig} */
const nextConfig = {
  // O client do Prisma é um pacote com binários nativos — mantém ele fora do
  // bundle do server pra evitar problemas de tracing no build.
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
