"use client";
import Link from "next/link";
import { useNavScrolled } from "@/components/motion/NavScroll";
import { cn } from "@/lib/cn";

export function SiteNav() {
  const scrolled = useNavScrolled();
  return (
    <nav className={cn(
      "fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[5vw] transition-all duration-300 border-b",
      scrolled ? "bg-paper/85 backdrop-blur-md py-4 border-line" : "py-6 border-transparent",
    )}>
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
