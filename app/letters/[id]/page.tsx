"use client";

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

      setLetter(data);
    }

    loadLetter();
  }, [id]);

  if (!letter) {
    return <p style={{ padding: "60px" }}>加载中...</p>;
  }

  const isOpened = new Date(letter.open_date) <= new Date();

  return (
    <main style={{ minHeight: "100vh", padding: "60px", background: "#f5f5f5" }}>
      <Link href="/letters">
        <button style={{ marginBottom: "20px", padding: "8px 16px", cursor: "pointer" }}>
          返回我的信箱
        </button>
      </Link>
  
      {isOpened ? (
        <>
        <p
  style={{
    color: "#2563eb",
    fontWeight: "bold",
    fontSize: "20px",
    marginBottom: "10px",
  }}
>
  ✨ 未来已来
</p>

<p
  style={{
    color: "#666",
    marginBottom: "25px",
  }}
>
  你与过去的自己重逢了。
</p>
          <h1>{letter.title}</h1>
  
          <p>
            <strong>开启日期：</strong>
            {letter.open_date}
          </p>
  
          <p>
            <strong>创建时间：</strong>
            {new Date(letter.created_at).toLocaleString()}
          </p>
  
          <hr style={{ margin: "20px 0" }} />
          {letter.image_url && (
  <img
    src={letter.image_url}
    alt="信件图片"
    style={{
      maxWidth: "100%",
      borderRadius: "12px",
      marginBottom: "20px",
    }}
  />
)}

<p>{letter.content}</p>
        </>
      ) : (
        <>
        <>
  <h1>📩 来自过去的一封信</h1>

  <p>
    <strong>开启日期：</strong>
    {letter.open_date}
  </p>

  <p style={{ color: "#666", lineHeight: "1.8" }}>
    这封信已经被时间封存。
    <br />
    当开启日期到来时，
    <br />
    未来的你将收到来自今天的问候。
  </p>
</>
  
          <p>
            <strong>开启日期：</strong>
            {letter.open_date}
          </p>
  
          <p style={{ color: "gray" }}>
            到开启日期后才能查看标题和正文。
          </p>
        </>
      )}
    </main>
  );
}