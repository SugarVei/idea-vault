import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import referenceUi from '../locales/ko-ui.js';

async function readData(name) {
  const url = new URL(`../data/${name}.json`, import.meta.url);
  return JSON.parse(await readFile(url, 'utf8'));
}

// Match keys, types and array lengths, while allowing each locale its own text.
function checkShape(actual, reference, path) {
  if (Array.isArray(reference)) {
    assert.ok(Array.isArray(actual), `${path} must be an array`);
    assert.equal(actual.length, reference.length, `${path} length`);
    reference.forEach((value, i) => checkShape(actual[i], value, `${path}[${i}]`));
  } else if (reference && typeof reference === 'object') {
    assert.ok(actual && typeof actual === 'object' && !Array.isArray(actual), `${path} must be an object`);
    assert.deepEqual(Object.keys(actual).sort(), Object.keys(reference).sort(), `${path} keys`);
    for (const [key, value] of Object.entries(reference)) {
      checkShape(actual[key], value, `${path}.${key}`);
    }
  } else {
    assert.equal(typeof actual, typeof reference, `${path} type`);
    if (typeof actual === 'string') assert.ok(actual.trim(), `${path} must have text`);
  }
}

const [seed, tutorialData] = await Promise.all([readData('seed'), readData('tutorials')]);
const textList = length => Array(length).fill('');
function projectShape(tagCount, factCount) {
  return { title: '', kind: '', line: '', lead: '', tags: textList(tagCount), facts: textList(factCount) };
}

// The public database has two cards that are not part of the offline seed.
const expectedProjects = {
  'https://sugarvei.github.io/column-drift-gallery/': projectShape(4, 3),
  'https://sugarvei.github.io/sugarv-library/': projectShape(3, 2),
};
for (const idea of seed) {
  expectedProjects[idea.url || idea.title_zh] = projectShape(idea.tags_zh.length, idea.facts.length);
}
const expectedTutorials = Object.fromEntries(Object.entries(tutorialData).map(([key, tutorial]) => [
  key, { copy: tutorial.en, captions: textList(tutorial.images.length) }
]));
const formatterInputs = {
  count: [17], confirmDelete: ['example-project'], uploading: [3, 7], jsonBatch: [13], jsonDone: [12],
};

for (const lang of ['ko', 'ja', 'es']) {
  const [{ projects, tutorials, punchDriveLive }, { default: ui }] = await Promise.all([
    import(`../locales/${lang}-content.js`), import(`../locales/${lang}-ui.js`),
  ]);
  checkShape(projects, expectedProjects, `${lang}.projects`);
  checkShape(tutorials, expectedTutorials, `${lang}.tutorials`);
  checkShape(punchDriveLive, { kind: '', line: '', lead: '', tags: textList(4) }, `${lang}.punchDriveLive`);
  checkShape(ui, referenceUi, `${lang}.ui`);
  assert.equal(ui.demo.scenes.length, 3, `${lang}.ui.demo.scenes length`);
  for (const [key, inputs] of Object.entries(formatterInputs)) {
    const path = `${lang}.ui.${key}`;
    assert.equal(typeof ui[key], 'function', `${path} must be a formatter`);
    const result = ui[key](...inputs);
    assert.equal(typeof result, 'string', `${path} output type`);
    for (const input of inputs) {
      assert.ok(result.includes(String(input)), `${path} output must include ${input}`);
    }
  }
  console.log(`${lang} OK — ${Object.keys(projects).length} projects, ${Object.keys(tutorials).length} tutorial(s), live variant and UI`);
}
