"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, use, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Letter = {
  id: number;
  title: string;
  content: string;
  open_date: string;
  created_at: string;
  image_url: string | null;
};

export default function LetterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [letter, setLetter] = useState<Letter | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadLetter() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("letters")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setErrorMessage("信件加载失败，请稍后重试。");
        setLoading(false);
        return;
      }

      setLetter(data);
      setLoading(false);
    }

    loadLetter();
  }, [id]);

  const isOpened = letter ? new Date(letter.open_date) <= new Date() : false;

  return (
    <main className="min-h-screen bg-[#FAF8F3] text-[#2F3432] px-6 py-8">
      <div className="mx-auto max-w-3xl">
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

          <Link
            href="/letters"
            className="rounded-full border border-[#E0D8CE] bg-white/60 px-4 py-2 text-sm text-[#6F7471] transition hover:bg-white"
          >
            返回我的信箱
          </Link>
        </header>

        {loading && (
          <p className="mt-12 text-sm text-[#6F7471]">信件加载中...</p>
        )}

        {errorMessage && (
          <p className="mt-8 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        {!loading && letter && (
          <article className="mt-12 rounded-3xl border border-[#E8E1D8] bg-white/70 p-6 shadow-sm md:p-8">
            {isOpened ? (
              <>
                <div className="mb-5 inline-flex rounded-full bg-[#EAF7F4] px-3 py-1 text-xs font-medium text-[#2F6F66]">
                  未来已来
                </div>

                <h1 className="text-4xl font-semibold tracking-tight">
                  {letter.title || "未命名信件"}
                </h1>

                <p className="mt-4 text-sm text-[#6F7471]">
                  你与过去的自己重逢了。
                </p>

                <div className="mt-6 grid gap-2 text-sm text-[#6F7471]">
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
                    className="mt-8 max-h-[520px] w-full rounded-2xl border border-[#E8E1D8] object-cover"
                  />
                )}

                <div className="mt-8 border-t border-[#E8E1D8] pt-8">
                  <p className="whitespace-pre-wrap text-base leading-8 text-[#3F4542]">
                    {letter.content}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="mb-5 inline-flex rounded-full bg-[#F4E6E0] px-3 py-1 text-xs font-medium text-[#8A5A4A]">
                  时间封存中
                </div>

                <h1 className="text-4xl font-semibold tracking-tight">
                  📩 来自过去的一封信
                </h1>

                <div className="mt-6 grid gap-2 text-sm text-[#6F7471]">
                  <p>开启日期：{letter.open_date}</p>
                  <p>到开启日期后才能查看标题和正文。</p>
                </div>

                <p className="mt-8 rounded-2xl bg-[#FFFCF7] px-5 py-5 leading-8 text-[#6F7471]">
                  这封信已经被时间封存。当开启日期到来时，未来的你将收到来自今天的问候。
                </p>
              </>
            )}
          </article>
        )}
      </div>
    </main>
  );
}