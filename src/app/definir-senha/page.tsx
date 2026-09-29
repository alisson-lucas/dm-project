import { Suspense } from "react";
import { DefinirSenhaForm } from "@/components/DefinirSenhaForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Criar senha",
  robots: { index: false, follow: false },
};

// Tela do link que chega por e-mail. O token fica na URL e vai direto pro
// corpo da requisição — nunca é mostrado nem guardado no navegador.
export default function DefinirSenhaPage() {
  return (
    <Suspense fallback={null}>
      <DefinirSenhaForm />
    </Suspense>
  );
}
