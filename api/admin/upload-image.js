import { Octokit } from '@octokit/rest';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password, workId, index, base64, ext, folder, name } = req.body;
  if (password !== process.env.ADMIN_PASSWORD)
    return res.status(401).json({ error: '비밀번호가 틀렸어요.' });

  // folder / name 을 주면 그 경로로, 안 주면 기존 작품 경로 그대로
  //   작품:     img/works/{workId}/01.webp
  //   개발일지: folder="img/devlog/post-001", name="thumb" → img/devlog/post-001/thumb.webp
  const dir = folder || `img/works/${workId}`;
  if (!/^img\/[A-Za-z0-9_\-/]+$/.test(dir) || dir.includes('..'))
    return res.status(400).json({ error: '이미지 경로가 올바르지 않아요.' });

  const fileName = name || String(index + 1).padStart(2, '0');
  if (!/^[A-Za-z0-9_-]+$/.test(fileName))
    return res.status(400).json({ error: '파일 이름이 올바르지 않아요.' });

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const path = `${dir}/${fileName}.${ext}`;

  try {
    // 같은 경로에 파일이 이미 있으면 sha 를 넘겨야 덮어쓸 수 있어요
    let sha;
    try {
      const { data } = await octokit.repos.getContent({
        owner: process.env.GITHUB_OWNER,
        repo:  process.env.GITHUB_REPO,
        path,
      });
      sha = data.sha;
    } catch (e) {
      // 없으면 새로 만들면 돼요
    }

    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER,
      repo:  process.env.GITHUB_REPO,
      path,
      message: `upload: ${path}`,
      content: base64,
      sha,
    });

    return res.status(200).json({ path });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
