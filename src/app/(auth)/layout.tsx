import GuestGuard from "@/components/GuestGuard";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="auth-shell">
            <GuestGuard>{children}</GuestGuard>
        </main>
    );
}
