"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";

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

  useEffect(() => {
    async function loadLetter() {
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
        console.error(error);
        return;
      }

      setTitle(data.title);
      setContent(data.content);
      setOpenDate(data.open_date);
      setImageUrl(data.image_url || "");
    }

    loadLetter();
  }, [id]);

  async function deleteStorageImage(url: string) {
    const filePath = url.split("/letter-images/")[1];

    if (!filePath) return;

    const { error } = await supabase.storage
      .from("letter-images")
      .remove([filePath]);

    if (error) {
      console.error(error);
      throw error;
    }
  }

  async function handleDeleteImage() {
    if (!imageUrl) return;

    try {
      await deleteStorageImage(imageUrl);

      const { error } = await supabase
        .from("letters")
        .update({
          image_url: null,
        })
        .eq("id", id);

      if (error) {
        console.error(error);
        alert("删除图片记录失败");
        return;
      }

      setImageUrl("");
      setNewImageFile(null);
      alert("图片已删除");
    } catch {
      alert("删除图片文件失败");
    }
  }

  async function handleUpdate() {
    let finalImageUrl = imageUrl;

    if (newImageFile) {
      if (imageUrl) {
        try {
          await deleteStorageImage(imageUrl);
        } catch {
          alert("旧图片删除失败");
          return;
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("请先登录");
        window.location.href = "/login";
        return;
      }

      const fileExt = newImageFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("letter-images")
        .upload(fileName, newImageFile);

      if (uploadError) {
        console.error(uploadError);
        alert("新图片上传失败");
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
        title,
        content,
        open_date: openDate,
        image_url: finalImageUrl || null,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("更新失败");
      return;
    }

    alert("更新成功");
    window.location.href = "/letters";
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px",
        background: "#f5f5f5",
      }}
    >
      <Link href="/letters">
        <button
          style={{
            marginBottom: "20px",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          返回信箱
        </button>
      </Link>

      <h1>编辑信件</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "600px",
          marginTop: "30px",
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: "12px",
            fontSize: "16px",
          }}
        />

        <textarea
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{
            padding: "12px",
            fontSize: "16px",
          }}
        />

        <input
          type="date"
          value={openDate}
          onChange={(e) => setOpenDate(e.target.value)}
          style={{
            padding: "12px",
            fontSize: "16px",
          }}
        />

        {imageUrl && (
          <div>
            <p>当前图片：</p>

            <img
              src={imageUrl}
              alt="当前信件图片"
              style={{
                maxWidth: "100%",
                borderRadius: "12px",
                marginBottom: "10px",
              }}
            />

            <br />

            <button
              onClick={handleDeleteImage}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              删除当前图片
            </button>
          </div>
        )}

        <div>
          <p>替换图片：</p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setNewImageFile(e.target.files[0]);
              }
            }}
          />

          {newImageFile && (
            <div style={{ marginTop: "10px" }}>
              <p>已选择：{newImageFile.name}</p>

              <img
                src={URL.createObjectURL(newImageFile)}
                alt="新图片预览"
                style={{
                  maxWidth: "300px",
                  borderRadius: "12px",
                  marginTop: "10px",
                }}
              />

              <br />

              <button
                onClick={() => setNewImageFile(null)}
                style={{
                  marginTop: "10px",
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                取消选择
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleUpdate}
          style={{
            padding: "12px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          保存修改
        </button>
      </div>
    </main>
  );
}