"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Letter = {
  id: number;
  title: string;
  content: string;
  open_date: string;
  created_at: string;
  image_url: string | null;
};

export default function LettersPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  function getDaysLeft(openDate: string) {
    const today = new Date();
    const target = new Date(openDate);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  useEffect(() => {
    async function loadLetters() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setEmail(user.email || "");

      const { data, error } = await supabase
        .from("letters")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage("信件加载失败，请稍后重试。");
        setLoading(false);
        return;
      }

      setLetters(data || []);
      setLoading(false);
    }

    loadLetters();
  }, []);

  async function deleteLetter(id: number) {
    const confirmed = window.confirm("确定要删除这封信吗？删除后无法恢复。");

    if (!confirmed) return;

    const { error } = await supabase.from("letters").delete().eq("id", id);

    if (error) {
      setErrorMessage("删除失败，请稍后重试。");
      return;
    }

    setLetters((currentLetters) =>
      currentLetters.filter((letter) => letter.id !== id)
    );
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-[#FAF8F3] text-[#2F3432] px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo/leaf.svg"
              alt="Time Letter logo"
              width={36}
              height={36}
              priority
            />
            <span className="text-lg font-semibold">Time Letter</span>
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-full border border-[#E0D8CE] bg-white/60 px-4 py-2 text-sm text-[#6F7471] transition hover:bg-white"
          >
            退出登录
          </button>
        </header>

        <section className="mt-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">我的信箱</h1>
            <p className="mt-3 text-sm text-[#6F7471]">
              当前登录：{email || "加载中..."}
            </p>
          </div>

          <Link
            href="/write"
            className="inline-flex w-fit rounded-full bg-[#D9F1EE] px-6 py-3 text-sm font-medium text-[#2F3432] transition hover:bg-[#C7E8E3]"
          >
            写新信
          </Link>
        </section>

        {errorMessage && (
          <p className="mt-8 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        {loading && (
          <p className="mt-12 text-sm text-[#6F7471]">信件加载中...</p>
        )}

        {!loading && letters.length === 0 && (
          <section className="mt-12 rounded-3xl border border-[#E8E1D8] bg-white/70 px-8 py-12 text-center shadow-sm">
            <h2 className="text-2xl font-semibold">还没有信件</h2>
            <p className="mt-3 text-sm text-[#6F7471]">
              写下第一封信，留给未来某一天的自己。
            </p>

            <Link
              href="/write"
              className="mt-8 inline-flex rounded-full bg-[#D9F1EE] px-6 py-3 text-sm font-medium transition hover:bg-[#C7E8E3]"
            >
              开始写信
            </Link>
          </section>
        )}

        {!loading && letters.length > 0 && (
          <section className="mt-10 grid gap-5">
            {letters.map((letter) => {
              const isOpen = new Date(letter.open_date) <= new Date();

              return (
                <article
                  key={letter.id}
                  className="rounded-3xl border border-[#E8E1D8] bg-white/70 p-6 shadow-sm"
                >
                  {isOpen ? (
                    <>
                      <div className="mb-5 inline-flex rounded-full bg-[#EAF7F4] px-3 py-1 text-xs font-medium text-[#2F6F66]">
                        未来已来
                      </div>

                      <Link href={`/letters/${letter.id}`}>
                        <h2 className="text-2xl font-semibold transition hover:text-[#2F6F66]">
                          {letter.title || "未命名信件"}
                        </h2>
                      </Link>

                      <p className="mt-3 text-sm text-[#6F7471]">
                        你与过去的自己重逢了。
                      </p>

                      <div className="mt-5 grid gap-2 text-sm text-[#6F7471]">
                        <p>开启日期：{letter.open_date}</p>
                        <p>
                          创建时间：
                          {new Date(letter.created_at).toLocaleString()}
                        </p>
                      </div>

                      {letter.image_url && (
                        <img
                          src={letter.image_url}
                          alt="信件图片"
                          className="mt-5 block w-40 rounded-2xl border border-[#E8E1D8]"
                        />
                      )}

                      <p className="mt-5 line-clamp-3 whitespace-pre-wrap leading-7 text-[#3F4542]">
                        {letter.content}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mb-5 inline-flex rounded-full bg-[#F4E6E0] px-3 py-1 text-xs font-medium text-[#8A5A4A]">
                        时间封存中
                      </div>

                      <h2 className="text-2xl font-semibold">
                        📩 来自过去的一封信
                      </h2>

                      <div className="mt-5 grid gap-2 text-sm text-[#6F7471]">
                        <p>开启日期：{letter.open_date}</p>
                        <p>
                          距离开启还有{" "}
                          <span className="font-semibold text-[#2F6F66]">
                            {getDaysLeft(letter.open_date)}
                          </span>{" "}
                          天
                        </p>
                      </div>

                      <p className="mt-5 leading-7 text-[#6F7471]">
                        这封信已经被时间封存。当开启日期到来时，未来的你将收到来自今天的问候。
                      </p>
                    </>
                  )}

<div className="mt-6 flex flex-wrap gap-3">
  {!isOpen && (
    <Link
      href={`/letters/edit/${letter.id}`}
      className="rounded-full border border-[#E0D8CE] bg-white/60 px-4 py-2 text-sm transition hover:bg-white"
    >
      编辑
    </Link>
  )}

  <button
    onClick={() => deleteLetter(letter.id)}
    className="rounded-full border border-[#E0D8CE] bg-white/60 px-4 py-2 text-sm text-[#8A5A4A] transition hover:bg-white"
  >
    删除
  </button>
</div>
                
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}