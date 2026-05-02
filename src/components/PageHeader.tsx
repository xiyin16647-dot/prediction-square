import Link from "next/link";

export function PageHeader({
  title,
  backHref = "/",
}: {
  title: string;
  backHref?: string;
}) {
  return (
    <div className="flex items-center px-4 pt-1.5 pb-2.5">
      <Link
        href={backHref}
        className="size-9 rounded-full border border-line-hard flex items-center justify-center text-text text-[17px]"
      >
        ‹
      </Link>
      <div
        className="font-serif text-[19px] font-bold text-text ml-3"
        style={{ letterSpacing: "-0.2px" }}
      >
        {title}
      </div>
    </div>
  );
}
