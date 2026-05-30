"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("登录失败：" + error.message);
      return;
    }

    alert("登录成功");
    window.location.href = "/letters";
  }

  return (
    <main style={{ minHeight: "100vh", padding: "60px", background: "#f5f5f5" }}>
      <h1>登录账号</h1>

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

        <button onClick={handleLogin} style={{ padding: "12px", fontSize: "18px", cursor: "pointer" }}>
          登录
        </button>

        <Link href="/register">还没有账号？去注册</Link>
      </div>
    </main>
  );
}