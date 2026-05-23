import { Container } from "@/components/ui/Container";
import { TopProgressBar } from "@/components/ui/TopProgressBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopProgressBar />
      <Container as="main" className="py-16">
        {children}
      </Container>
    </>
  );
}
