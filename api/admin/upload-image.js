import { Octokit } from '@octokit/rest';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password, workId, index, base64, ext } = req.body;
  if (password !== process.env.ADMIN_PASSWORD)
    return res.status(401).json({ error: '비밀번호가 틀렸어요.' });

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const path = `img/works/${workId}/${String(index + 1).padStart(2, '0')}.${ext}`;

  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER,
      repo:  process.env.GITHUB_REPO,
      path,
      message: `upload: ${workId} image ${index + 1}`,
      content: base64,
    });

    return res.status(200).json({ path });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}