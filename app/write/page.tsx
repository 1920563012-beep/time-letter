"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [openDate, setOpenDate] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saved, setSaved] = useState(false);

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

  async function handleSave() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("请先登录");
      window.location.href = "/login";
      return;
    }

    if (!title.trim()) {
      alert("请填写信件标题");
      return;
    }

    if (!content.trim()) {
      alert("请填写信件内容");
      return;
    }

    if (!openDate) {
      alert("请选择开启日期");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(openDate);

    if (selectedDate < today) {
      alert("开启日期不能早于今天");
      return;
    }

    let imageUrl = "";

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("letter-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error(uploadError);
        alert("图片上传失败");
        return;
      }

      const { data } = supabase.storage
        .from("letter-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("letters").insert([
      {
        title,
        content,
        open_date: openDate,
        user_id: user.id,
        image_url: imageUrl,
      },
    ]);

    if (error) {
      console.error(error);
      alert("保存失败");
      return;
    }

    setSaved(true);
    alert("保存成功！信件已存入你的时光信箱。");
    window.location.href = "/letters";
  }

  return (
    <main style={{ minHeight: "100vh", padding: "60px", background: "#f5f5f5" }}>
      <h1>写一封信</h1>

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
          placeholder="信件标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "12px", fontSize: "16px" }}
        />

        <textarea
          placeholder="什么都行..."
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ padding: "12px", fontSize: "16px" }}
        />

        <input
          type="date"
          value={openDate}
          onChange={(e) => setOpenDate(e.target.value)}
          style={{ padding: "12px", fontSize: "16px" }}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setImageFile(e.target.files[0]);
            }
          }}
        />

        {imageFile && (
          <div>
            <p>已选择：{imageFile.name}</p>

            <img
              src={URL.createObjectURL(imageFile)}
              alt="图片预览"
              style={{
                maxWidth: "300px",
                borderRadius: "12px",
                marginTop: "10px",
              }}
            />

            <br />

            <button
              onClick={() => setImageFile(null)}
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              删除图片
            </button>
          </div>
        )}

        <button
          onClick={handleSave}
          style={{ padding: "12px", fontSize: "18px", cursor: "pointer" }}
        >
          保存这封信
        </button>

        {saved && <p style={{ color: "green" }}>保存成功！信件已保存到数据库。</p>}
      </div>
    </main>
  );
}