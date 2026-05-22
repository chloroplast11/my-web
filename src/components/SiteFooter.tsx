export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-line px-[5vw] py-8 text-xs text-faint flex justify-between">
      <span>© {new Date().getFullYear()} Chuck Chen</span>
      <span>Built with Next.js · Tokyo</span>
    </footer>
  );
}
