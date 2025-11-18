"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-48px)] flex-col items-center">
      <div className="flex min-h-[calc(screen-96px)] w-full max-w-3xl flex-col items-center justify-between px-16 py-32 sm:items-start">
        <p>The platform to create and explore sound</p>
      </div>
      <Link href={"/synth"}>Go to Synth</Link>
    </main>
  );
}
