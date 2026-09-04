"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnGhost } from "../lib/ui";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      className={btnGhost}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
    >
      Sair
    </button>
  );
}
