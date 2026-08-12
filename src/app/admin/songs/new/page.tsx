import { SongForm } from "@/components/admin/SongForm";
import Link from "next/link";

export const metadata = {
  title: "Add New Song — Admin | WeWorship",
};

export default function NewSongPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/songs"
          className="text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
        >
          ← Back to Song Management
        </Link>
      </div>

      <h1 className="text-3xl font-black text-[var(--color-primary)] mb-8">
        Add New Worship Song
      </h1>

      <SongForm />
    </div>
  );
}
