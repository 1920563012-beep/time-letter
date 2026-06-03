"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [openDate, setOpenDate] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const imagePreviewUrl = useMemo(() => {
    if (!imageFile) return "";
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
      }
    }

    checkUser();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  async function handleSave() {
    setErrorMessage("");
    setSuccessMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (!title.trim()) {
      setErrorMessage("请填写信件标题。");
      return;
    }

    if (!content.trim()) {
      setErrorMessage("请填写信件内容。");
      return;
    }

    if (!openDate) {
      setErrorMessage("请选择开启日期。");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(openDate);

    if (selectedDate < today) {
      setErrorMessage("开启日期不能早于今天。");
      return;
    }

    setSaving(true);

    let imageUrl = "";

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("letter-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        setSaving(false);
        setErrorMessage("图片上传失败，请稍后重试。");
        return;
      }

      const { data } = supabase.storage
        .from("letter-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("letters").insert([
      {
        title: title.trim(),
        content: content.trim(),
        open_date: openDate,
        user_id: user.id,
        image_url: imageUrl,
      },
    ]);

    setSaving(false);

    if (error) {
      setErrorMessage("保存失败，请稍后重试。");
      return;
    }

    setSuccessMessage("保存成功！信件已存入你的时光信箱。");

    setTimeout(() => {
      window.location.href = "/letters";
    }, 900);
  }

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
            我的信箱
          </Link>
        </header>

        <section className="mt-14">
          <h1 className="text-4xl font-semibold tracking-tight">写一封信</h1>
          <p className="mt-3 text-sm text-[#6F7471]">
            写给未来某一天的自己。选择一个开启日期，然后把它交给时间。
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-[#E8E1D8] bg-white/70 p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">信件标题</span>
              <input
                placeholder="例如：写给一年后的自己"
                value={title}
                maxLength={100}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-2xl border border-[#E0D8CE] bg-[#FFFCF7] px-4 py-3 text-base outline-none transition focus:border-[#9BCFC8]"
              />
              <span className="text-xs text-[#8A8F8C]">
                {title.length}/100
              </span>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">开启日期</span>
              <input
                type="date"
                value={openDate}
                onChange={(e) => setOpenDate(e.target.value)}
                className="rounded-2xl border border-[#E0D8CE] bg-[#FFFCF7] px-4 py-3 text-base outline-none transition focus:border-[#9BCFC8]"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">信件内容</span>
              <textarea
                placeholder="现在的你，想对未来的自己说些什么？"
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="resize-none rounded-2xl border border-[#E0D8CE] bg-[#FFFCF7] px-4 py-3 text-base leading-7 outline-none transition focus:border-[#9BCFC8]"
              />
              <span className="text-xs text-[#8A8F8C]">
                {content.length} characters
              </span>
            </label>

            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium">添加图片</span>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile(e.target.files[0]);
                  }
                }}
                className="block w-full text-sm text-[#6F7471] file:mr-4 file:rounded-full file:border-0 file:bg-[#D9F1EE] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#2F3432] hover:file:bg-[#C7E8E3]"
              />

              {imageFile && (
                <div className="rounded-2xl border border-[#E8E1D8] bg-[#FFFCF7] p-4">
                  <p className="text-sm text-[#6F7471]">
                    已选择：{imageFile.name}
                  </p>

                  {imagePreviewUrl && (
                    <img
                      src={imagePreviewUrl}
                      alt="图片预览"
                      className="mt-4 max-w-xs rounded-2xl border border-[#E8E1D8]"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="mt-4 rounded-full border border-[#E0D8CE] bg-white/60 px-4 py-2 text-sm text-[#8A5A4A] transition hover:bg-white"
                  >
                    删除图片
                  </button>
                </div>
              )}
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
              onClick={handleSave}
              disabled={saving}
              className="mt-2 rounded-full bg-[#D9F1EE] px-6 py-3 text-base font-medium text-[#2F3432] transition hover:bg-[#C7E8E3] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "保存中..." : "保存这封信"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}