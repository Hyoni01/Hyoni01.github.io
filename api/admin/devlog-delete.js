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

  const { password, postId, images } = req.body;
  if (password !== PASS) return res.status(401).json({ error: '비밀번호가 틀렸어요.' });

  const octokit = new Octokit({ auth: TOKEN });

  try {
    // devlog.js 읽기
    const { data: fileData } = await octokit.repos.getContent({
      owner: OWNER, repo: REPO, path: 'js/devlog.js',
    });
    const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');

    const match = currentContent.match(/const POSTS = \[([\s\S]*)\];/);
    if (!match) return res.status(500).json({ error: 'devlog.js 파싱 실패' });

    const posts = new Function(`const POSTS = [${match[1]}]; return POSTS;`)();

    // 해당 글 제거
    const filtered = posts.filter(p => p.id !== postId);
    if (filtered.length === posts.length) {
      return res.status(404).json({ error: '글을 찾을 수 없어요.' });
    }

    // 새 devlog.js 내용 생성
    // ($& 같은 문자가 본문에 있어도 안전하게 함수로 치환)
    const entries = filtered.map(serializePost).join('');
    const updated = currentContent.replace(
      /const POSTS = \[[\s\S]*\];/,
      () => `const POSTS = [${entries}\n];`
    );

    // devlog.js 커밋
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER, repo: REPO,
      path: 'js/devlog.js',
      message: `delete devlog: ${postId}`,
      content: Buffer.from(updated).toString('base64'),
      sha: fileData.sha,
    });

    // 이미지 폴더 통째로 정리 — 글에서 지웠지만 파일만 남은 것까지 같이 치워요
    const paths = new Set(images || []);
    if (/^post-[A-Za-z0-9_-]+$/.test(postId)) {
      try {
        const { data: dir } = await octokit.repos.getContent({
          owner: OWNER, repo: REPO, path: `img/devlog/${postId}`,
        });
        if (Array.isArray(dir)) dir.forEach(f => { if (f.type === 'file') paths.add(f.path); });
      } catch (e) {
        // 폴더가 없으면 넘어가요
      }
    }

    if (paths.size > 0) {
      for (const imgPath of paths) {
        try {
          const { data: imgData } = await octokit.repos.getContent({
            owner: OWNER, repo: REPO, path: imgPath,
          });
          await octokit.repos.deleteFile({
            owner: OWNER, repo: REPO, path: imgPath,
            message: `remove image: ${imgPath}`,
            sha: imgData.sha,
          });
        } catch (e) {
          // 이미 없으면 무시
        }
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
