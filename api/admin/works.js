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
      path:  'js/works.js',
    });

    const content = Buffer.from(data.content, 'base64').toString('utf-8');

    // WORKS 배열만 추출해서 JSON으로 반환
    const match = content.match(/const WORKS = \[([\s\S]*)\];/);
    if (!match) return res.status(500).json({ error: 'works.js 파싱 실패' });

    // eval 대신 Function으로 안전하게 파싱
    const works = new Function(`const WORKS = [${match[1]}]; return WORKS;`)();

    return res.status(200).json({ works, sha: data.sha });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}