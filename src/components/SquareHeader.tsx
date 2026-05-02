export function SquareHeader() {
  return (
    <div className="flex items-center justify-between px-[18px] pt-1.5 pb-3">
      <div>
        <div
          className="font-serif text-[26px] font-bold leading-none text-text"
          style={{ letterSpacing: "-0.6px" }}
        >
          Prediction
        </div>
        <div
          className="font-serif text-[26px] font-bold leading-none text-text italic"
          style={{ letterSpacing: "-0.6px" }}
        >
          Square
          <span
            className="font-sans not-italic align-middle ml-1.5 text-[10px] font-semibold text-accent tracking-[1px]"
          >
            先行版
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="size-9 rounded-full border border-line-hard flex items-center justify-center text-text text-base">
          ⌕
        </div>
        <div className="relative size-9 rounded-full border border-line-hard flex items-center justify-center text-text text-sm">
          ♡
          <span className="absolute top-1.5 right-2 size-1.5 rounded-full bg-no" />
        </div>
      </div>
    </div>
  );
}
