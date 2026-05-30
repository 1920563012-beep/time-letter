"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email || "");
      }
    }

    checkUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setEmail("");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
      }}
    >
      <h1 style={{ fontSize: "48px" }}>信箱</h1>

      <p style={{ fontSize: "20px", marginTop: "20px" }}>
        神人写信服务
      </p>
      <p
  style={{
    marginTop: "30px",
    maxWidth: "600px",
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    lineHeight: "1.8",
  }}
>
我们总以为未来很远，可当未来到来时，最想见的人往往是过去的自己。
</p>
      {email ? (
        <>
          <p style={{ marginTop: "20px", color: "#666" }}>
            当前登录：{email}
          </p>

          <div style={{ marginTop: "30px", display: "flex", gap: "15px" }}>
            <Link href="/write">
              <button style={{ padding: "12px 24px", fontSize: "18px", cursor: "pointer" }}>
                写新信
              </button>
            </Link>

            <Link href="/letters">
              <button style={{ padding: "12px 24px", fontSize: "18px", cursor: "pointer" }}>
                我的信箱
              </button>
            </Link>

            <button
              onClick={handleLogout}
              style={{ padding: "12px 24px", fontSize: "18px", cursor: "pointer" }}
            >
              退出登录
            </button>
          </div>
        </>
      ) : (
        <div style={{ marginTop: "30px", display: "flex", gap: "15px" }}>
          <Link href="/login">
            <button style={{ padding: "12px 24px", fontSize: "18px", cursor: "pointer" }}>
              登录
            </button>
          </Link>

          <Link href="/register">
            <button style={{ padding: "12px 24px", fontSize: "18px", cursor: "pointer" }}>
              注册
            </button>
          </Link>
        </div>
      )}
    </main>
  );
}