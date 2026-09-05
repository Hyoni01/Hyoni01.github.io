import { Octokit } from '@octokit/rest';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD)
    return res.status(401).json({ error: '비밀번호가 틀렸어요.' });

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  try {
    const { data } = await octokit.repos.getContent({
      owner: process.env.GITHUB_OWNER,
      repo:  process.env.GITHUB_REPO,
      path:  'js/devlog.js',
    });

    const content = Buffer.from(data.content, 'base64').toString('utf-8');

    // POSTS 배열만 추출해서 JSON으로 반환
    const match = content.match(/const POSTS = \[([\s\S]*)\];/);
    if (!match) return res.status(500).json({ error: 'devlog.js 파싱 실패' });

    const posts = new Function(`const POSTS = [${match[1]}]; return POSTS;`)();

    return res.status(200).json({ posts, sha: data.sha });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
