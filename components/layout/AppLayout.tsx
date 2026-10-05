import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
