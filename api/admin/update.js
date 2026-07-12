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
    // works.js 읽기
    const { data: fileData } = await octokit.repos.getContent({
      owner: OWNER, repo: REPO, path: 'js/works.js',
    });
    const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');

    // WORKS 배열 파싱
    const match = currentContent.match(/const WORKS = \[([\s\S]*)\];/);
    if (!match) return res.status(500).json({ error: 'works.js 파싱 실패' });

    const works = new Function(`const WORKS = [${match[1]}]; return WORKS;`)();

    // 해당 작품 찾아서 교체
    const idx = works.findIndex(w => w.id === work.id);
    if (idx === -1) return res.status(404).json({ error: '작품을 찾을 수 없어요.' });

    works[idx] = {
      id: work.id,
      order: work.order,
      category: work.category,
      title: work.title,
      title_en: work.title_en,
      year: work.year,
      thumb: work.images[0] || '',
      images: work.images,
      tags: work.tags,
      description: work.description,
      description_en: work.description_en,
    };

    // 새 works.js 내용 생성
    const newEntries = works.map(w => `
  {
    id: "${w.id}",
    order: ${w.order},
    category: "${w.category}",
    title: "${w.title}",
    title_en: "${w.title_en}",
    year: ${w.year},
    thumb: "${w.thumb || ''}",
    images: ${JSON.stringify(w.images)},
    tags: ${JSON.stringify(w.tags || [])},
    description: "${w.description}",
    description_en: "${w.description_en}",
  },`).join('');

    const updated = currentContent.replace(
      /const WORKS = \[[\s\S]*\];/,
      `const WORKS = [${newEntries}\n];`
    );

    // 삭제된 이미지 파일 커밋에서 제거 (있으면)
    if (work.removedImages && work.removedImages.length > 0) {
      for (const imgPath of work.removedImages) {
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

    // works.js 커밋
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER, repo: REPO,
      path: 'js/works.js',
      message: `update work: ${work.id}`,
      content: Buffer.from(updated).toString('base64'),
      sha: fileData.sha,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}