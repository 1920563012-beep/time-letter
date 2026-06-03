"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("请先输入邮箱和密码。");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage("邮箱或密码错误，请检查后重试。");
      return;
    }

    window.location.href = "/letters";
  }

  return (
    <main className="min-h-screen bg-[#FAF8F3] text-[#2F3432] flex items-center justify-center px-6">
      <section className="w-full max-w-sm rounded-3xl bg-white/70 px-8 py-10 shadow-sm border border-[#E8E1D8]">
        <div className="flex flex-col items-center">
          <Image
            src="/logo/leaf.svg"
            alt="Time Letter logo"
            width={52}
            height={52}
            priority
          />

          <h1 className="mt-6 text-3xl font-semibold">Log in</h1>

          <p className="mt-3 text-sm text-[#6F7471] text-center">
            Continue writing letters to your future self.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border border-[#E0D8CE] bg-[#FFFCF7] px-4 py-3 text-base outline-none transition focus:border-[#9BCFC8]"
          />

<input
  type={showPassword ? "text" : "password"}
  placeholder="密码"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="rounded-2xl border border-[#E0D8CE] bg-[#FFFCF7] px-4 py-3 text-base outline-none transition focus:border-[#9BCFC8]"
/>

<label className="flex items-center gap-2 text-sm text-[#6F7471] cursor-pointer">
  <input
    type="checkbox"
    checked={showPassword}
    onChange={(e) => setShowPassword(e.target.checked)}
    className="accent-[#9BCFC8]"
  />
  显示密码
</label>

          {errorMessage && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-2 rounded-full bg-[#D9F1EE] px-6 py-3 text-base font-medium text-[#2F3432] transition hover:bg-[#C7E8E3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "登录中..." : "登录"}
          </button>

          <Link
            href="/register"
            className="mt-2 text-center text-sm text-[#6F7471] underline underline-offset-4"
          >
            还没有账号？去注册
          </Link>
        </div>
      </section>
    </main>
  );
}