import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">404</div>
      <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">The page you were looking for doesn't exist.</p>
      <Link to="/" className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
        Back to Dashboard
      </Link>
    </div>
  );
}
