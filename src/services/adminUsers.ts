import { EnrollmentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

// Lista de alunos do painel.
//
// A coluna que importa é `travado`: aluno com matrícula ativa e sem senha
// comprou, tem acesso liberado no banco e MESMO ASSIM não consegue entrar —
// ou o e-mail não chegou, ou ele não abriu. É o caso que o link manual do
// painel existe pra resolver.

export async function listarAlunos() {
  const usuarios = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      enrollments: {
        include: { course: { select: { title: true } } },
        orderBy: { grantedAt: "desc" },
      },
    },
  });

  return usuarios.map((u) => {
    const ativas = u.enrollments.filter(
      (e) => e.status === EnrollmentStatus.ACTIVE
    );

    return {
      id: u.id,
      email: u.email,
      name: u.name,
      admin: u.role === "ADMIN",
      temSenha: u.passwordHash !== null,
      criadoEm: u.createdAt,
      cursos: ativas.map((e) => e.course.title),
      pendentes: u.enrollments.filter(
        (e) => e.status === EnrollmentStatus.PENDING
      ).length,
      travado: ativas.length > 0 && u.passwordHash === null,
    };
  });
}

export type AdminAluno = Awaited<ReturnType<typeof listarAlunos>>[number];
