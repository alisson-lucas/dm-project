import { BrandMark } from "../BrandMark";

// Selo circular que encosta na borda de cima do card de oferta. É o mesmo
// símbolo da marca, só que no tamanho grande, onde o texto do anel ainda é
// legível.
export function OfferSeal() {
  return (
    <div
      aria-hidden
      className="absolute left-1/2 top-0 z-20 h-[104px] w-[104px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cream/20 bg-bg p-1.5"
    >
      <BrandMark
        ringText
        className="h-full w-full text-cream"
        monogramClass="fill-accent-2"
      />
    </div>
  );
}
