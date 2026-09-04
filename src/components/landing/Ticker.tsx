import { TICKER } from "../../lib/landing";

// Fita rolante do pé do hero, como na referência. A lista é renderizada duas
// vezes e o keyframe anda -50%, então a emenda é invisível.
// `motion-reduce` respeita quem pediu menos animação no sistema.
export function Ticker() {
  return (
    <div
      className="relative overflow-hidden border-y border-white/8 bg-bg-2/70 py-3.5"
      aria-hidden
    >
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {TICKER.map((item) => (
              <li
                key={item}
                className="flex items-center whitespace-nowrap text-[0.78rem] text-text-faint"
              >
                <span className="px-7">{item}</span>
                <span className="h-3.5 w-px bg-white/12" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
