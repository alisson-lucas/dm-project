import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { getLessonPlayerForUser } from "../../../../../services/lessonAccess";

// Equivale ao antigo `GET /api/lessons/:id/player` do Express.
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const result = await getLessonPlayerForUser(id, user.id);

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json(result.embed);
}
