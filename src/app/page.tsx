import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Experiments</h1>
      <Link
        href="/experiments/usage-widget"
        className="text-blue-600 underline hover:text-blue-800"
      >
        AI Usage Widget Prototype
      </Link>
    </main>
  );
}
