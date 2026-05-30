"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert("注册失败：" + error.message);
      return;
    }

    alert("注册成功！请打开你的邮箱，点击 Supabase 发送的确认链接。确认完成后，再返回这里登录。");
  }

  return (
    <main style={{ minHeight: "100vh", padding: "60px", background: "#f5f5f5" }}>
      <h1>注册账号</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "400px", marginTop: "30px" }}>
        <input
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "12px", fontSize: "16px" }}
        />

        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "12px", fontSize: "16px" }}
        />

        <button onClick={handleRegister} style={{ padding: "12px", fontSize: "18px", cursor: "pointer" }}>
          注册
        </button>

        <Link href="/login">已有账号？去登录</Link>
      </div>
    </main>
  );
}