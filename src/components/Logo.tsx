import { SITE_NAME } from "../lib/site";
import { BrandMark } from "./BrandMark";

// Marca completa: selo + nome. É o que aparece em cabeçalhos e rodapés.
// Quem quiser só o selo usa <BrandMark /> direto.
export function Logo({
  className = "",
  markClassName = "h-9 w-9",
  textClassName = "text-[1.05rem]",
  withText = true,
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  withText?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark className={markClassName} />
      {withText ? (
        <span
          className={`font-extrabold tracking-[0.2em] ${textClassName}`}
        >
          {SITE_NAME}
        </span>
      ) : null}
    </span>
  );
}
