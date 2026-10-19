import AuthGuard from "@/mods/auth/components/AuthGuard";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <div className="app-shell">
                <Navbar />
                <div className="app-shell__body">
                    <Sidebar />
                    <main className="page">{children}</main>
                </div>
            </div>
        </AuthGuard>
    );
}
