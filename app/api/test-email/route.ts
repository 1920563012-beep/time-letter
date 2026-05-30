import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: ["1920563012@qq.com"],
      subject: "时光信箱测试邮件",
      html: `
        <h1>未来已来</h1>
        <p>这是时光信箱发送的第一封测试邮件。</p>
      `,
    });

    return Response.json(data);
  } catch (error) {
    return Response.json(error);
  }
}