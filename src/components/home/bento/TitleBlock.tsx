export function TitleBlock() {
  return (
    <div className="col-span-2 mb-6 md:absolute md:left-5 md:top-7 md:mb-0">
      <h1 className="font-serif text-[36px] font-bold leading-none tracking-[-0.04em] text-ink md:text-[60px] xl:text-[72px] 2xl:text-[88px]">
        Chuck Chen<span data-accent className="text-accent">.</span>
      </h1>
      <p className="mt-2 text-[10px] italic text-muted md:mt-4 xl:text-[12px] 2xl:text-[14px]">
        — a quiet corner of the internet
      </p>
    </div>
  );
}
