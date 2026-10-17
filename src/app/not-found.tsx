import Link from "next/link";

export default function NotFound() {
  return (
    <main className="auth-shell">
      <div className="card auth-card center">
        <p className="not-found__code">404</p>
        <h1>Page not found</h1>
        <p className="muted">The page you&apos;re looking for doesn&apos;t exist or was moved.</p>
        <Link href="/" className="btn btn--primary">
          Back to home
        </Link>
      </div>
    </main>
  );
}
