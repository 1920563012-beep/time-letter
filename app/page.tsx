import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FAF8F3] text-[#2F3432] flex flex-col items-center justify-center px-6">
      <Image
        src="/logo/leaf.svg"
        alt="Time Letter logo"
        width={72}
        height={72}
        priority
      />

      <h1 className="mt-8 text-5xl md:text-6xl font-light tracking-tight">
        Time Letter
      </h1>

      <p className="mt-5 text-base md:text-lg text-[#6F7471] text-center">
        Write a letter to your future self.
      </p>

      <Link
        href="/write"
        className="mt-10 rounded-full bg-[#D9F1EE] px-8 py-3 text-base font-medium text-[#2F3432] transition hover:bg-[#C7E8E3]"
      >
        Start Writing
      </Link>

      <p className="mt-6 text-sm text-[#6F7471]">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Log in
        </Link>
      </p>
    </main>
  );
}