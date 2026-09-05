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
    // devlog.js 읽기
    const { data: fileData } = await octokit.repos.getContent({
      owner: OWNER, repo: REPO, path: 'js/devlog.js',
    });
    const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');

    // POSTS 배열 파싱
    const match = currentContent.match(/const POSTS = \[([\s\S]*)\];/);
    if (!match) return res.status(500).json({ error: 'devlog.js 파싱 실패' });

    const posts = new Function(`const POSTS = [${match[1]}]; return POSTS;`)();

    // 해당 글 찾아서 교체
    const idx = posts.findIndex(p => p.id === post.id);
    if (idx === -1) return res.status(404).json({ error: '글을 찾을 수 없어요.' });

    posts[idx] = {
      id: post.id,
      game: post.game,
      title: post.title,
      title_en: post.title_en,
      date: post.date,
      tags: post.tags || [],
      thumb: post.thumb,
      excerpt: post.excerpt,
      excerpt_en: post.excerpt_en,
      content: post.content ?? '',
    };

    // 새 devlog.js 내용 생성
    // ($& 같은 문자가 본문에 있어도 안전하게 함수로 치환)
    const entries = posts.map(serializePost).join('');
    const updated = currentContent.replace(
      /const POSTS = \[[\s\S]*\];/,
      () => `const POSTS = [${entries}\n];`
    );

    // 삭제된 이미지 파일 제거 (있으면)
    if (post.removedImages && post.removedImages.length > 0) {
      for (const imgPath of post.removedImages) {
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
          // 이미지가 이미 없으면 무시
        }
      }
    }

    // devlog.js 커밋
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER, repo: REPO,
      path: 'js/devlog.js',
      message: `update devlog: ${post.id}`,
      content: Buffer.from(updated).toString('base64'),
      sha: fileData.sha,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
