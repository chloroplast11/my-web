import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[5vw] py-6">
      <Link href="/" className="font-serif text-xl">Chuck <em className="text-accent not-italic">Chen</em></Link>
      <div className="hidden gap-8 text-sm md:flex">
        <Link href="/#about">About</Link>
        <Link href="/blog">Writing</Link>
        <Link href="/photos">Photos</Link>
        <Link href="/#contact">Contact</Link>
      </div>
    </nav>
  );
}
