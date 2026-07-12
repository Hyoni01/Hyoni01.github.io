import { Octokit } from '@octokit/rest';

const OWNER = process.env.GITHUB_OWNER;
const REPO  = process.env.GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;
const PASS  = process.env.ADMIN_PASSWORD;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password, work } = req.body;
  if (password !== PASS) return res.status(401).json({ error: '비밀번호가 틀렸어요.' });

  const octokit = new Octokit({ auth: TOKEN });

  try {
    // 1. 이미지 파일들 커밋
    const imagePaths = [];
    for (let i = 0; i < work.images.length; i++) {
      const { base64, ext } = work.images[i];
      const path = `img/works/${work.id}/${String(i + 1).padStart(2, '0')}.${ext}`;
      await octokit.repos.createOrUpdateFileContents({
        owner: OWNER, repo: REPO,
        path, message: `upload: ${work.id} image ${i + 1}`,
        content: base64,
      });
      imagePaths.push(path);
    }

    // 2. works.js 읽기
    const { data: fileData } = await octokit.repos.getContent({
      owner: OWNER, repo: REPO, path: 'js/works.js',
    });
    const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');

    // 3. 새 항목 생성
    const newEntry = `
  {
    id: "${work.id}",
    category: "${work.category}",
    title: "${work.title}",
    title_en: "${work.title_en}",
    year: ${new Date().getFullYear()},
    order: ${work.order},     
    thumb: "${imagePaths[0] || ''}",
    images: ${JSON.stringify(imagePaths)},
    tags: ${JSON.stringify(work.tags)},
    description: "${work.description}",
    description_en: "${work.description_en}",
  },`;

    // 4. works.js 맨 앞에 삽입
    const updated = currentContent.replace(
      'const WORKS = [',
      `const WORKS = [${newEntry}`
    );

    // 5. works.js 커밋
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER, repo: REPO,
      path: 'js/works.js',
      message: `add work: ${work.id}`,
      content: Buffer.from(updated).toString('base64'),
      sha: fileData.sha,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}