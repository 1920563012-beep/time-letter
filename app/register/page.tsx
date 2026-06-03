"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("请先输入邮箱和密码。");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("密码至少需要 6 位。");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage("注册失败，请检查邮箱或稍后重试。");
      return;
    }

    setSuccessMessage("注册成功！请打开邮箱，点击确认链接后再返回登录。");
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

          <h1 className="mt-6 text-3xl font-semibold">Register</h1>

          <p className="mt-3 text-sm text-[#6F7471] text-center">
            Create your Time Letter account.
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

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-[#6F7471] cursor-pointer">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="accent-[#9BCFC8]"
              />
              显示密码
            </label>

            <span className="text-xs text-[#8A8F8C]">至少 6 位</span>
          </div>

          {errorMessage && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="rounded-2xl bg-[#EAF7F4] px-4 py-3 text-sm text-[#2F6F66]">
              {successMessage}
            </p>
          )}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="mt-2 rounded-full bg-[#D9F1EE] px-6 py-3 text-base font-medium text-[#2F3432] transition hover:bg-[#C7E8E3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "注册中..." : "注册"}
          </button>

          <Link
            href="/login"
            className="mt-2 text-center text-sm text-[#6F7471] underline underline-offset-4"
          >
            已有账号？去登录
          </Link>
        </div>
      </section>
    </main>
  );
}