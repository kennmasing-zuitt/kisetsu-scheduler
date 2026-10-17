import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Navbar />
      <main className="page">{children}</main>
    </AuthGuard>
  );
}
