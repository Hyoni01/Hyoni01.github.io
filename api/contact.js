import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('USER:', process.env.GMAIL_USER);
  console.log('PASS length:', process.env.GMAIL_PASS?.length);

  return res.status(200).json({
    user: process.env.GMAIL_USER,
    passLength: process.env.GMAIL_PASS?.length
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: '모든 항목을 입력해주세요.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,   // Gmail 앱 비밀번호
    },
  });

  try {
    await transporter.sendMail({
      from: `"${name}" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `[Hyoni 문의] ${subject}`,
      text: `이름: ${name}\n이메일: ${email}\n\n${message}`,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '전송 실패. 다시 시도해주세요.' });
  }
}