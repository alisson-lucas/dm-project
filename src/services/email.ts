import { SITE_NAME, SITE_URL, TEACHER } from "../lib/site";

// Envio de e-mail transacional.
//
// SEM DEPENDÊNCIA NOVA: fala com a API do Resend por fetch. Trocar de provedor
// (SendGrid, SES, Postmark) é reescrever a função `entregar` — o resto do
// código chama `enviarEmail` e não sabe quem entrega.
//
// SEM CHAVE CONFIGURADA, o e-mail não é enviado e o link vai pro log do
// servidor. Isso é de propósito: em desenvolvimento dá pra testar o fluxo
// inteiro sem provedor, e em produção o aluno não fica sem acesso em silêncio
// — o erro aparece no log com o link, e dá pra mandar na mão enquanto o
// provedor não está de pé.

const API = "https://api.resend.com/emails";

export interface Mensagem {
  para: string;
  assunto: string;
  html: string;
  texto: string;
}

export type ResultadoEnvio =
  | { enviado: true }
  | { enviado: false; motivo: "sem-provedor" | "falhou"; detalhe?: string };

async function entregar(m: Mensagem): Promise<ResultadoEnvio> {
  const chave = process.env.RESEND_API_KEY;
  const remetente = process.env.EMAIL_FROM;

  if (!chave || !remetente) {
    return { enviado: false, motivo: "sem-provedor" };
  }

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        authorization: `Bearer ${chave}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: remetente,
        to: [m.para],
        subject: m.assunto,
        html: m.html,
        text: m.texto,
      }),
    });

    if (!res.ok) {
      return {
        enviado: false,
        motivo: "falhou",
        detalhe: `${res.status} ${await res.text().catch(() => "")}`.slice(0, 300),
      };
    }
    return { enviado: true };
  } catch (e) {
    return { enviado: false, motivo: "falhou", detalhe: String(e).slice(0, 300) };
  }
}

export async function enviarEmail(m: Mensagem): Promise<ResultadoEnvio> {
  const r = await entregar(m);

  if (!r.enviado) {
    // O log carrega o ASSUNTO e o DESTINATÁRIO, nunca o corpo inteiro — mas o
    // link de acesso está no corpo, e sem ele não há como socorrer o aluno.
    // Por isso o texto vai junto: é log de servidor, não de navegador.
    console.error(
      `[email] não enviado (${r.motivo}) para ${m.para} — "${m.assunto}"\n${m.texto}`
    );
  }

  return r;
}

// ---------------------------------------------------------------- modelos

function layout(titulo: string, corpo: string, botao: { href: string; label: string }) {
  return `<!doctype html>
<html lang="pt-BR"><body style="margin:0;background:#0b0b0f;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:520px" cellpadding="0" cellspacing="0">
      <tr><td style="padding-bottom:24px;color:#c62c60;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase">${SITE_NAME}</td></tr>
      <tr><td style="background:#16161c;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:32px">
        <h1 style="margin:0 0 14px;color:#f4f4f6;font-size:22px;line-height:1.25">${titulo}</h1>
        <div style="color:#b3b3bd;font-size:15px;line-height:1.6">${corpo}</div>
        <a href="${botao.href}" style="display:inline-block;margin-top:24px;background:#9e224c;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 26px;border-radius:8px">${botao.label}</a>
        <p style="margin:24px 0 0;color:#7a7a86;font-size:12px;line-height:1.6">Se o botão não funcionar, copie e cole este endereço no navegador:<br><span style="color:#b3b3bd;word-break:break-all">${botao.href}</span></p>
      </td></tr>
      <tr><td style="padding-top:20px;color:#7a7a86;font-size:12px">${TEACHER.name} · ${SITE_NAME}</td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function linkDe(token: string): string {
  return `${SITE_URL}/definir-senha?token=${encodeURIComponent(token)}`;
}

export function emailDeBoasVindas(para: string, token: string, curso: string): Mensagem {
  const href = linkDe(token);
  return {
    para,
    assunto: `Seu acesso ao ${SITE_NAME} está liberado`,
    html: layout(
      "Bem-vindo! Falta só criar sua senha.",
      `<p style="margin:0">Sua compra de <strong style="color:#f4f4f6">${curso}</strong> foi confirmada e o acesso já está liberado.</p>
       <p style="margin:14px 0 0">Crie uma senha para entrar na plataforma. Este link vale por 3 dias e só pode ser usado uma vez.</p>`,
      { href, label: "Criar minha senha" }
    ),
    texto: `Sua compra de ${curso} foi confirmada.\n\nCrie sua senha em: ${href}\n\nO link vale por 3 dias e só pode ser usado uma vez.`,
  };
}

export function emailDeNovaSenha(para: string, token: string): Mensagem {
  const href = linkDe(token);
  return {
    para,
    assunto: `Link para entrar no ${SITE_NAME}`,
    html: layout(
      "Link para definir uma nova senha",
      `<p style="margin:0">Você pediu um link para entrar no ${SITE_NAME}. Ele vale por 2 horas e só pode ser usado uma vez.</p>
       <p style="margin:14px 0 0">Se não foi você, pode ignorar este e-mail — sua senha atual continua valendo.</p>`,
      { href, label: "Definir nova senha" }
    ),
    texto: `Defina uma nova senha em: ${href}\n\nO link vale por 2 horas e só pode ser usado uma vez.\nSe não foi você quem pediu, ignore este e-mail.`,
  };
}
