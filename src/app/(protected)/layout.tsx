import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

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
