// node build/context-update/build.js && python3 build/context-update/insert.py
// Generates only the new slides; the existing generator and slide sources stay untouched.
const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');
const { T, add, section, text, render, specs, splitNoteParagraphs, speechUnits } = require('../lib');
const OUT = path.join(__dirname, '../out');
const SRC = {
  report: 'https://www.theinformation.com/articles/secret-technique-behind-openais-astra-model-sparks-security-concerns',
  raschka: 'https://sebastianraschka.com/blog/2026/openai-astra-looped-transformers.html',
  pachocki: 'https://x.com/merettm/status/2095023204993490967',
  x: 'https://x.com/Algorithon/status/2107287650881208694',
  deletion: 'https://x.com/Algorithon/status/2107318545529065613',
  azure: 'https://ai.azure.com/catalog/models/gpt-6.1-sol',
  mr: 'https://www.modelrepublic.org/articles/are-astra-and-gpt-6-1-sol-less-monitorable',
  trends: 'https://txie1.github.io/iclr2027-trends/',
};
const scripts = [
  'Astra 관련 보도로 recurrent depth가 주목받았습니다. Pachocki는 X에서 계산 깊이가 제한적이라고 설명했고, Raschka는 이 발언을 재인용하며 기술을 해설했습니다. 공개 자료만으로 Astra의 구조가 확인된 것은 아닙니다.',
  '10월 초에는 Azure 페이지의 스크린샷이 퍼졌습니다. GPT-6.1 Sol이 세 번 대신 두 번의 inference pass를 쓴다는 내용입니다. 현재 페이지에는 이 문구가 없습니다. 관련 단서이지만, Astra 구조를 직접 증명하지는 않습니다.',
  '독립 분석에서는 관련 표현이 등장한 투고가 48편에서 289편으로, 비중은 약 0.24%에서 0.67%로 늘었습니다. latent reasoning까지 포함한 제목·초록 검색입니다. 철회와 심사 전 탈락도 포함하므로 채택 논문 수와는 다릅니다.',
  '최근 연구들은 반복의 역할을 세분화합니다. 학습법과 규모 확장, 같은 계산 예산에서의 비교와 디코딩을 다룹니다. 같은 가중치가 반복마다 무엇을 계산하는지도 분석합니다. Astra 논쟁과 함께 볼 흐름이지만, Astra 때문에 투고가 늘었다고 단정할 수는 없습니다.',
];
const links = (s, items, y = 6.52) => items.forEach(([label, url], i) => text(s, label, { x: T.X + i * 3.14, y, w: 3.0, h: 0.28 }, { fontSize: 11, color: T.navy, hyperlink: { url }, underline: true }));
const box = (s, x, y, w, h, color = 'F1F3F5') => s.addShape('roundRect', { x, y, w, h, rectRadius: 0.06, fill: { color }, line: { color, transparency: 100 } });
const note = (i, evidence) => `${scripts[i]}\n\n[Sources and evidence limits — not spoken]\n${evidence}\n\n[Estimated spoken time: ${Math.round(speechUnits(scripts[i], 'ko') / 280 * 60 + 1.5)} seconds]`;
section('current_context_20261108', 'A');

add({ id: 'astra-spotlight', number: false, crumb: ['Why now?'],
  title: 'Astra put recurrent depth in the spotlight',
  cite: 'The Information (1 Sept 2026); Pachocki on X; Raschka, Ahead of AI (2 & 9 Sept 2026).',
  notes: note(0, `Anonymous-insider reporting is not a published architecture. Paywalled report: ${SRC.report}\nPachocki X (direct fetch blocked; reproduced in commentary): ${SRC.pachocki}\nRaschka: ${SRC.raschka}\nhttps://magazine.sebastianraschka.com/p/gpt-6-astra-looped-transformers-and`),
  draw: s => {
    const rows = [
      ['01 SEPT', 'A frontier-model claim', 'The Information linked Astra to recurrent depth.', 'Reported · unnamed insiders'],
      ['02 SEPT', 'A public response on X', 'Pachocki discussed bounded computation depth.', 'Response · does not confirm looping'],
      ['02–09 SEPT', 'Technical discussion in blogs', 'Raschka explained what layer reuse does—and does not imply.', 'Expert commentary · architecture still unconfirmed'],
    ];
    rows.forEach((r, i) => {
      const y = 1.55 + i * 1.23;
      text(s, r[0], { x: T.X, y: y + 0.12, w: 1.65, h: 0.4 }, { fontSize: 17, bold: true, color: T.gold });
      box(s, 2.2, y, 10.55, 1.04);
      text(s, r[1], { x: 2.45, y: y + 0.12, w: 9.9, h: 0.3 }, { fontSize: 20, bold: true });
      text(s, r[2], { x: 2.45, y: y + 0.48, w: 9.9, h: 0.28 }, { fontSize: 17 });
      text(s, r[3], { x: 2.45, y: y + 0.81, w: 9.9, h: 0.18 }, { fontSize: 10, color: T.gray });
    });
    text(s, 'A timely research question; no public Astra blueprint.', { x: T.X, y: 5.57, w: 12.3, h: 0.55 }, { fontSize: 25, bold: true, color: T.gold });
    links(s, [['Original reporting', SRC.report], ['Pachocki on X', SRC.pachocki], ['Raschka’s explanation', SRC.raschka]]);
  },
});

add({ id: 'azure-clue', number: false, crumb: ['Why now?'],
  title: 'Azure wording offered a clue about repeated passes',
  cite: '@Algorithon on X (early Oct 2026), screenshot reproduced in Philip Dowdell, Model Republic (16 Oct 2026).',
  notes: note(1, `Phrase transcribed from the reported screenshot, not independently retrieved from historical Azure. X direct access blocked.\nOriginal: ${SRC.x}\nDeletion report: ${SRC.deletion}\nReproduction: ${SRC.mr}\nCurrent page: ${SRC.azure}\nThe model in the wording is GPT-6.1 Sol. Inferring Astra's architecture from it remains speculative.`),
  draw: s => {
    text(s, 'EARLY OCTOBER 2026 · REPORTED AZURE SCREENSHOT', { x: T.X, y: 1.5, w: 12.3, h: 0.35 }, { fontSize: 15, color: T.gray, bold: true });
    box(s, T.X, 2.05, 7.65, 2.85, T.paleGold);
    text(s, 'GPT-6.1 Sol', { x: 0.8, y: 2.36, w: 6.9, h: 0.4 }, { fontSize: 23, bold: true });
    text(s, '“two inference passes\ninstead of three”', { x: 0.8, y: 3.0, w: 6.9, h: 1.15 }, { fontSize: 32, bold: true, color: T.gold });
    text(s, 'Transcribed excerpt · screenshot reproduced by Model Republic', { x: 0.8, y: 4.45, w: 6.9, h: 0.25 }, { fontSize: 11, color: T.gray });
    text(s, 'What the clue supports', { x: 8.55, y: 2.1, w: 4.2, h: 0.4 }, { fontSize: 22, bold: true });
    text(s, 'Public discussion of repeated\ninference passes.', { x: 8.55, y: 2.7, w: 4.2, h: 0.9 }, { fontSize: 20 });
    text(s, 'What remains unresolved', { x: 8.55, y: 3.9, w: 4.2, h: 0.4 }, { fontSize: 22, bold: true });
    text(s, 'Astra’s exact architecture\nand the meaning of a “pass.”', { x: 8.55, y: 4.5, w: 4.2, h: 0.9 }, { fontSize: 20 });
    text(s, 'The wording is absent from the current Azure page.', { x: T.X, y: 5.75, w: 12.3, h: 0.45 }, { fontSize: 22, color: T.gray });
    links(s, [['Original X post', SRC.x], ['Reported deletion', SRC.deletion], ['Published reproduction', SRC.mr], ['Current Azure page', SRC.azure]]);
  },
});

add({ id: 'iclr-mentions', number: false, crumb: ['Why now?'],
  title: 'Loop-related mentions rose in ICLR 2027 submissions',
  cite: 'Independent ICLR 2027 Trends analysis · OpenReview metadata snapshot: 26 Oct 2026 · shares recalculated from counts.',
  notes: note(2, `${SRC.trends}\nKeyword category: latent, looped & recurrent-depth reasoning. Pattern: latent reasoning|continuous (thought|reasoning)|looped (transformers?|language models?|models?)|recurrent[- ]depth\n2026: 48 / 19814 = 0.24225295%; 2027: 289 / 42822 = 0.67488674%. The displayed 0.67% is rounded from counts, not from the source's already rounded 0.675%. Includes withdrawn and desk-rejected submissions. These are keyword mentions, not accepted-paper counts or a pure looped-transformer census. The underlying dataset was not independently re-crawled.`),
  draw: s => {
    text(s, 'Title + abstract mentions of latent / looped / recurrent-depth reasoning', { x: T.X, y: 1.45, w: 12.3, h: 0.45 }, { fontSize: 19, color: T.gray });
    [[0.65, 'ICLR 2026', '0.24%', '48 / 19,814 submissions', 'F1F3F5', T.navy], [7.25, 'ICLR 2027', '0.67%', '289 / 42,822 submissions', T.paleGold, T.gold]].forEach(([x, yr, share, count, bg, col]) => {
      box(s, x, 2.2, 5.45, 2.75, bg);
      text(s, yr, { x: x + 0.3, y: 2.48, w: 4.85, h: 0.4 }, { fontSize: 23, bold: true, color: col });
      text(s, share, { x: x + 0.3, y: 3.05, w: 4.85, h: 0.9 }, { fontSize: 58, bold: true, color: col });
      text(s, count, { x: x + 0.3, y: 4.34, w: 4.85, h: 0.35 }, { fontSize: 19 });
    });
    s.addShape('chevron', { x: 6.35, y: 3.25, w: 0.65, h: 0.6, fill: { color: T.gray }, line: { color: T.gray } });
    text(s, 'Keyword mentions, including latent reasoning—not a count of pure looped architectures.', { x: T.X, y: 5.45, w: 12.3, h: 0.5 }, { fontSize: 18, bold: true });
    text(s, 'Includes withdrawals and desk rejections. Submission does not imply acceptance.', { x: T.X, y: 6.0, w: 12.3, h: 0.35 }, { fontSize: 15, color: T.gray });
    links(s, [['Method and source data', SRC.trends]]);
  },
});

const papers = [
  ['TRAINING', 'Closing the Loop', 'Practical training and conversion recipes', '2610.00673'],
  ['SCALING', 'Scaling Laws for\nLooped Mixture of Experts', 'Depth, sparsity, size, and data', '2609.40316'],
  ['MATCHED COMPUTE', 'SMELT', 'Compare loops at a controlled budget', '2609.01343'],
  ['DECODING', 'Decoding Looped Transformers\nBetter for (Almost) Free', 'Use intermediate-loop predictions', '2610.02185'],
  ['ROUTING', 'Shared Weights,\nSelected Computations', 'Ask what each loop actually computes', '2609.39892'],
  ['MECHANISMS', 'Looped Transformers\nunder the Jacobian Lens', 'Inspect recurrent representations', '2609.01924'],
];
add({ id: 'paper-map', number: false, crumb: ['Why now?'],
  title: 'Recent papers turn looping into concrete design choices',
  cite: 'Primary sources: six linked arXiv preprints (Sept–Oct 2026). Topic grouping: our synthesis.',
  notes: note(3, papers.map(p => `${p[1].replace(/\n/g, ' ')}: https://arxiv.org/abs/${p[3]}`).join('\n') + '\nICLR labels from https://github.com/kuoyang1999/awesome-tiny-recursive-models . Closing the Loop PDF explicitly states under review at ICLR 2027. Other live OpenReview status pages could not be retrieved (403); their arXiv research content was verified. No acceptance claim. The temporal association with Astra does not show causality.'),
  draw: s => {
    papers.forEach((p, i) => {
      const x = T.X + (i % 3) * 4.2, y = 1.55 + Math.floor(i / 3) * 2.14;
      box(s, x, y, 3.99, 1.93);
      text(s, p[0], { x: x + 0.2, y: y + 0.16, w: 3.59, h: 0.25 }, { fontSize: 12, color: T.gold, bold: true });
      text(s, p[1], { x: x + 0.2, y: y + 0.55, w: 3.59, h: 0.67 }, { fontSize: i === 3 ? 16 : 19, bold: true });
      text(s, p[2], { x: x + 0.2, y: y + 1.28, w: 3.59, h: 0.32 }, { fontSize: 12, color: T.gray });
      text(s, `arXiv:${p[3]} ↗`, { x: x + 0.2, y: y + 1.67, w: 3.59, h: 0.2 }, { fontSize: 10, color: T.navy, hyperlink: { url: `https://arxiv.org/abs/${p[3]}` }, underline: true });
    });
    text(s, 'Closing the Loop explicitly identifies itself as under review at ICLR 2027.', { x: T.X, y: 6.04, w: 12.3, h: 0.32 }, { fontSize: 16, bold: true });
    text(s, 'Other venue labels come from a public index; live OpenReview status could not be rechecked.', { x: T.X, y: 6.48, w: 12.3, h: 0.28 }, { fontSize: 12, color: T.gray });
  },
});

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.title = 'Looped Transformers — current context, 8 November 2026';
pptx.author = 'Team 5 (AGI26F)';
render(pptx);
const seconds = scripts.map(s => Math.round(speechUnits(s, 'ko') / 280 * 60 + 1.5));
fs.writeFileSync(path.join(OUT, 'current-context-manifest.json'), JSON.stringify(specs.map((s, i) => ({ n: i + 2, key: s.key, title: s.title, onSlide: s.onSlide, notes: s.notes, spokenScript: scripts[i], seconds: seconds[i] })), null, 2));
fs.writeFileSync(path.join(__dirname, 'script.ko.md'), scripts.map((s, i) => `## ${specs[i].key}\n\n${s}\n`).join('\n'));
fs.writeFileSync(path.join(OUT, 'context-update-timing.md'), `# Introductory addition\n\nFour new slides, positions 2–5. Original 149 slides and spoken notes preserved.\n\nEstimated added speech + clicks: ${seconds.reduce((a,b)=>a+b,0)} seconds.\nOriginal Session A: 27:31 / 30:00. Added source notes are reference material, not spoken script.\nOriginal per-slide numbering and cumulative-time notes are intentionally preserved; use this additive estimate for the updated session.\n\nRebuild: node build/context-update/build.js && python3 build/context-update/insert.py\n`);
pptx.write({ outputType: 'nodebuffer' }).then(splitNoteParagraphs).then(b => {
  fs.writeFileSync(path.join(OUT, 'current-context-20261108.pptx'), b);
  console.log('Wrote 4 context slides; spoken seconds:', seconds, 'total', seconds.reduce((a,b)=>a+b,0));
});
