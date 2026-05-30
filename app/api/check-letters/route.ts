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
        <h1>📩 未来已来</h1>

        <p>你有一封来自过去的信件，今天已经可以开启。</p>

        ${imageHtml}

        <p>
          <strong>信件标题：</strong>
          ${letter.title}
        </p>

        <p>
          打开时光信箱，查看过去的自己写给今天的你：
        </p>

        <p>
          <a href="http://localhost:3000/letters/${letter.id}">
            点击查看这封信
          </a>
        </p>

        <hr />

        <p>—— 时光信箱</p>
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