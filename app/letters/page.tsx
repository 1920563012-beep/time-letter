"use client";

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
  

  function getDaysLeft(openDate: string) {
    const today = new Date();
    const target = new Date(openDate);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  useEffect(() => {
    async function loadLetters() {
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
        console.error(error);
        return;
      }

      setLetters(data || []);
    }

    loadLetters();
  }, []);

  async function deleteLetter(id: number) {
    const { error } = await supabase.from("letters").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert("删除失败");
      return;
    }

    setLetters(letters.filter((letter) => letter.id !== id));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main style={{ minHeight: "100vh", padding: "60px", background: "#f5f5f5" }}>
      <h1>我的信箱</h1>

      <p style={{ color: "#666", marginTop: "10px" }}>当前登录：{email}</p>

      <div style={{ marginTop: "20px", marginBottom: "30px" }}>
        <Link href="/write">
          <button style={{ padding: "10px 20px", marginRight: "10px", cursor: "pointer" }}>
            写新信
          </button>
        </Link>

        <button onClick={handleLogout} style={{ padding: "10px 20px", cursor: "pointer" }}>
          退出登录
        </button>
      </div>

      {letters.length === 0 && <p style={{ marginTop: "20px" }}>还没有保存任何信件。</p>}

      {letters.map((letter) => (
        <div
          key={letter.id}
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            marginTop: "20px",
            maxWidth: "700px",
          }}
        >
          {new Date(letter.open_date) <= new Date() ? (
            <>
              <p style={{ color: "#2563eb", fontWeight: "bold", marginBottom: "10px" }}>
                ✨ 未来已来
              </p>

              <p style={{ color: "#666", marginBottom: "15px" }}>
                你与过去的自己重逢了。
              </p>

              <Link href={`/letters/${letter.id}`}>
                <h2 style={{ cursor: "pointer", color: "#2563eb" }}>{letter.title}</h2>
              </Link>

              <p>
                <strong>开启日期：</strong>
                {letter.open_date}
              </p>

              <p>
                <strong>创建时间：</strong>
                {new Date(letter.created_at).toLocaleString()}
              </p>

              <hr style={{ margin: "15px 0" }} />

{letter.image_url && (
  <img
    src={letter.image_url}
    alt="信件图片"
    style={{
      width: "160px",
      borderRadius: "12px",
      marginBottom: "15px",
      display: "block",
    }}
  />
)}

<p>{letter.content}</p>

              <p>{letter.content}</p>
            </>
          ) : (
            <>
              <h2>📩 来自过去的一封信</h2>

              <p>
                <strong>开启日期：</strong>
                {letter.open_date}
              </p>

              <p style={{ color: "#666", marginTop: "10px", lineHeight: "1.8" }}>
                这封信已经被时间封存。
                <br />
                当开启日期到来时，
                <br />
                未来的你将收到来自今天的问候。
              </p>

              <p style={{ color: "#2563eb", marginTop: "10px", fontWeight: "bold" }}>
                距离开启还有 {getDaysLeft(letter.open_date)} 天
              </p>
            </>
          )}

          <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
            {new Date(letter.open_date) <= new Date() && (
              <Link href={`/letters/edit/${letter.id}`}>
                <button style={{ padding: "8px 16px", cursor: "pointer" }}>编辑</button>
              </Link>
            )}

            <button
              onClick={() => deleteLetter(letter.id)}
              style={{ padding: "8px 16px", cursor: "pointer" }}
            >
              删除
            </button>
          </div>
        </div>
      ))}
    </main>
  );
}
