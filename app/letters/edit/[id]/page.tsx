"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../lib/supabase";

export default function EditLetterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [openDate, setOpenDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const newImagePreviewUrl = useMemo(() => {
    if (!newImageFile) return "";
    return URL.createObjectURL(newImageFile);
  }, [newImageFile]);

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

      setTitle(data.title || "");
      setContent(data.content || "");
      setOpenDate(data.open_date || "");
      setImageUrl(data.image_url || "");
      setLoading(false);
    }

    loadLetter();
  }, [id]);

  useEffect(() => {
    return () => {
      if (newImagePreviewUrl) {
        URL.revokeObjectURL(newImagePreviewUrl);
      }
    };
  }, [newImagePreviewUrl]);

  async function deleteStorageImage(url: string) {
    const filePath = url.split("/letter-images/")[1];

    if (!filePath) return;

    const { error } = await supabase.storage
      .from("letter-images")
      .remove([filePath]);

    if (error) {
      throw error;
    }
  }

  async function handleDeleteImage() {
    setErrorMessage("");
    setSuccessMessage("");

    if (!imageUrl) return;

    const confirmed = window.confirm("确定要删除当前图片吗？");
    if (!confirmed) return;

    try {
      await deleteStorageImage(imageUrl);

      const { error } = await supabase
        .from("letters")
        .update({
          image_url: null,
        })
        .eq("id", id);

      if (error) {
        setErrorMessage("图片记录删除失败，请稍后重试。");
        return;
      }

      setImageUrl("");
      setNewImageFile(null);
      setSuccessMessage("图片已删除。");
    } catch {
      setErrorMessage("图片文件删除失败，请稍后重试。");
    }
  }

  async function handleUpdate() {
    setErrorMessage("");
    setSuccessMessage("");

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

    let finalImageUrl = imageUrl;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (newImageFile) {
      if (imageUrl) {
        try {
          await deleteStorageImage(imageUrl);
        } catch {
          setSaving(false);
          setErrorMessage("旧图片删除失败，请稍后重试。");
          return;
        }
      }

      const fileExt = newImageFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("letter-images")
        .upload(fileName, newImageFile);

      if (uploadError) {
        setSaving(false);
        setErrorMessage("新图片上传失败，请稍后重试。");
        return;
      }

      const { data } = supabase.storage
        .from("letter-images")
        .getPublicUrl(fileName);

      finalImageUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from("letters")
      .update({
        title: title.trim(),
        content: content.trim(),
        open_date: openDate,
        image_url: finalImageUrl || null,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      setErrorMessage("更新失败，请稍后重试。");
      return;
    }

    setSuccessMessage("修改已保存。");

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
            返回信箱
          </Link>
        </header>

        <section className="mt-14">
          <h1 className="text-4xl font-semibold tracking-tight">编辑信件</h1>
          <p className="mt-3 text-sm text-[#6F7471]">
            修改这封还未开启的信。保存后，它会继续等待未来的日期。
          </p>
        </section>

        {loading && (
          <p className="mt-12 text-sm text-[#6F7471]">信件加载中...</p>
        )}

        {!loading && (
          <section className="mt-8 rounded-3xl border border-[#E8E1D8] bg-white/70 p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">信件标题</span>
                <input
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
                  rows={12}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="resize-none rounded-2xl border border-[#E0D8CE] bg-[#FFFCF7] px-4 py-3 text-base leading-7 outline-none transition focus:border-[#9BCFC8]"
                />
                <span className="text-xs text-[#8A8F8C]">
                  {content.length} characters
                </span>
              </label>

              {imageUrl && (
                <div className="rounded-2xl border border-[#E8E1D8] bg-[#FFFCF7] p-4">
                  <p className="text-sm font-medium">当前图片</p>

                  <img
                    src={imageUrl}
                    alt="当前信件图片"
                    className="mt-4 max-h-[420px] w-full rounded-2xl border border-[#E8E1D8] object-cover"
                  />

                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    className="mt-4 rounded-full border border-[#E0D8CE] bg-white/60 px-4 py-2 text-sm text-[#8A5A4A] transition hover:bg-white"
                  >
                    删除当前图片
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium">
                  {imageUrl ? "替换图片" : "添加图片"}
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setNewImageFile(e.target.files[0]);
                    }
                  }}
                  className="block w-full text-sm text-[#6F7471] file:mr-4 file:rounded-full file:border-0 file:bg-[#D9F1EE] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#2F3432] hover:file:bg-[#C7E8E3]"
                />

                {newImageFile && (
                  <div className="rounded-2xl border border-[#E8E1D8] bg-[#FFFCF7] p-4">
                    <p className="text-sm text-[#6F7471]">
                      已选择：{newImageFile.name}
                    </p>

                    {newImagePreviewUrl && (
                      <img
                        src={newImagePreviewUrl}
                        alt="新图片预览"
                        className="mt-4 max-w-xs rounded-2xl border border-[#E8E1D8]"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => setNewImageFile(null)}
                      className="mt-4 rounded-full border border-[#E0D8CE] bg-white/60 px-4 py-2 text-sm text-[#8A5A4A] transition hover:bg-white"
                    >
                      取消选择
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
                onClick={handleUpdate}
                disabled={saving}
                className="mt-2 rounded-full bg-[#D9F1EE] px-6 py-3 text-base font-medium text-[#2F3432] transition hover:bg-[#C7E8E3] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "保存中..." : "保存修改"}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}