import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

  const { data: letters, error } = await supabaseAdmin
    .from("letters")
    .select("*")
    .eq("open_date", today)
    .is("reminded_at", null)
    .not("user_id", "is", null);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!letters || letters.length === 0) {
    return Response.json({
      message: "今天没有需要提醒的信件",
      today,
    });
  }

  for (const letter of letters) {
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(letter.user_id);

    if (userError || !userData.user?.email) {
      console.error(userError);
      continue;
    }

    const imageHtml = letter.image_url
      ? `
        <div style="margin:20px 0;">
          <img
            src="${letter.image_url}"
            style="
              max-width:100%;
              border-radius:12px;
              box-shadow:0 2px 8px rgba(0,0,0,0.1);
            "
          />
        </div>
      `
      : "";

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [userData.user.email],
      subject: "未来已来：你有一封来自过去的信",
      html: `
        <div style="
          max-width:600px;
          margin:0 auto;
          padding:40px 20px;
          font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
          background:#ffffff;
          color:#333;
        ">
          <div style="text-align:center;">
            <h1 style="
              margin-bottom:10px;
              color:#111827;
              font-size:32px;
            ">
              📩 未来已来
            </h1>

            <p style="
              color:#6b7280;
              font-size:16px;
              margin-bottom:30px;
            ">
              一封来自过去的信，已经抵达今天。
            </p>
          </div>

          ${imageHtml}

          <div style="
            background:#f8fafc;
            padding:20px;
            border-radius:12px;
            margin:24px 0;
          ">
            <p style="margin:0;color:#6b7280;">
              信件标题
            </p>

            <h2 style="
              margin-top:10px;
              color:#111827;
            ">
              ${letter.title}
            </h2>
          </div>

          <div style="text-align:center;margin:35px 0;">
            <a
              href="https://time-letter-rho.vercel.app/letters/${letter.id}"
              style="
                background:#111827;
                color:white;
                text-decoration:none;
                padding:14px 28px;
                border-radius:10px;
                display:inline-block;
                font-weight:600;
              "
            >
              打开这封信
            </a>
          </div>

          <hr style="
            border:none;
            border-top:1px solid #e5e7eb;
            margin:30px 0;
          ">

          <p style="
            text-align:center;
            color:#9ca3af;
            font-size:14px;
          ">
            时光信箱 · 写给未来的自己
          </p>
        </div>
      `,
    });

    await supabaseAdmin
      .from("letters")
      .update({
        reminded_at: new Date().toISOString(),
      })
      .eq("id", letter.id);
  }

  return Response.json({
    message: "提醒邮件发送完成",
    count: letters.length,
  });
}