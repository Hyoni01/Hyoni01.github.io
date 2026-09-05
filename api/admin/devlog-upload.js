import { Octokit } from '@octokit/rest';

const OWNER = process.env.GITHUB_OWNER;
const REPO  = process.env.GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;
const PASS  = process.env.ADMIN_PASSWORD;

/* 본문 HTML 에 따옴표·줄바꿈이 그대로 들어가니까 전부 JSON.stringify 로 직렬화해요.
   content 는 HTML 문자열(신규) / 블록 배열(예전 글) 둘 다 그대로 통과합니다. */
function serializePost(p) {
  return `
  {
    id: "${p.id}",
    game: ${JSON.stringify(p.game || '')},
    title: ${JSON.stringify(p.title || '')},
    title_en: ${JSON.stringify(p.title_en || '')},
    date: ${JSON.stringify(p.date || '')},
    tags: ${JSON.stringify(p.tags || [])},
    thumb: ${JSON.stringify(p.thumb || '')},
    excerpt: ${JSON.stringify(p.excerpt || '')},
    excerpt_en: ${JSON.stringify(p.excerpt_en || '')},
    content: ${JSON.stringify(p.content ?? '')},
  },`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password, post } = req.body;
  if (password !== PASS) return res.status(401).json({ error: '비밀번호가 틀렸어요.' });

  const octokit = new Octokit({ auth: TOKEN });

  try {
    // 1. devlog.js 읽기
    const { data: fileData } = await octokit.repos.getContent({
      owner: OWNER, repo: REPO, path: 'js/devlog.js',
    });
    const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');

    // 2. 새 항목을 배열 맨 앞에 삽입
    //    ($& 같은 문자가 본문에 있어도 안전하게 함수로 치환)
    const entry = serializePost(post);
    const updated = currentContent.replace(
      'const POSTS = [',
      () => `const POSTS = [${entry}`
    );

    // 3. devlog.js 커밋
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER, repo: REPO,
      path: 'js/devlog.js',
      message: `add devlog: ${post.id}`,
      content: Buffer.from(updated).toString('base64'),
      sha: fileData.sha,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
