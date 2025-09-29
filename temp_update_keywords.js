/* eslint-disable */
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'components/sweet-spot/ui/sections/KeywordsSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replaceOnce = (pattern, replacement, label) => {
  const next = content.replace(pattern, replacement);
  if (next === content) {
    throw new Error(`Failed to replace ${label}`);
  }
  content = next;
};

replaceOnce(
  /import type { TabKey } from ['\"]@\/components\/sweet-spot\/types['\"];\r?\n/,
  "import type { UIKey } from '../../types';\r\n",
  'TabKey import'
);

replaceOnce(
  /  const VALID_TABS: TabKey\[] = \['passions', 'talents', 'impact', 'potentiel'\] as const;\r\n\r\n  const mapOldToNew: Record<string, TabKey> = { utilite: 'impact', viabilite: 'potentiel' };\r\n  const normalizedActiveTab: TabKey = \(\(\): TabKey => {\r\n    const t = uiState.activeTab as string;\r\n    if \(VALID_TABS.includes\(t as TabKey\)\) return t as TabKey;\r\n    if \(t in mapOldToNew\) return mapOldToNew\[t\];\r\n    return 'passions';\r\n  }\)\(\);\r\n\r\n  const keywordsByTab: Record<TabKey, string\[]> = useMemo\(\r\n    \(\) => \({\r\n      passions: state.userKeywords\?\.passions ?? \[],\r\n      talents: state.userKeywords\?\.talents ?? \[],\r\n      impact: state.userKeywords\?\.utilite ?? \[],\r\n      potentiel: state.userKeywords\?\.viabilite ?? \[],\r\n    }\),\r\n    \[state.userKeywords\],\r\n  \);\r\n\r\n  const activeKeywords = keywordsByTab\[normalizedActiveTab\] ?? \[];\r\n\r\n/,
  `  const VALID_TABS: UIKey[] = ['passions', 'talents', 'impact', 'potentiel'];

  const normalizeTab = (t: string): UIKey => {
    if (t === 'utilite') return 'impact';
    if (t === 'viabilite') return 'potentiel';
    return (VALID_TABS as string[]).includes(t) ? (t as UIKey) : 'passions';
  };

  const activeTab = normalizeTab(uiState.activeTab);

  const keywordsByTab: Record<UIKey, string[]> = useMemo(
    () => ({
      passions: state.userKeywords?.passions ?? [],
      talents: state.userKeywords?.talents ?? [],
      impact: state.userKeywords?.utilite ?? [],
      potentiel: state.userKeywords?.viabilite ?? [],
    }),
    [state.userKeywords],
  );

`,
  'normalize block'
);

if (/normalizedActiveTab/.test(content)) {
  content = content.replace(/normalizedActiveTab/g, 'activeTab');
}

replaceOnce(
  /const currentKeywords = keywordsByTab\[activeTab\];/,
  'const currentKeywords = keywordsByTab[activeTab] ?? [];',
  'current keywords fallback'
);

replaceOnce(
  /        <div className="mb-4 flex min-h-\[40px\] flex-wrap items-center gap-2">\r?\n          \{activeKeywords.length > 0 \? \(\r?\n            activeKeywords.map\(\(keyword\) => \(\r?\n              <KeywordChip key=\{keyword\} keyword=\{keyword\} onRemove=\{removeKeywordUI\} />\r?\n            \)\)\r?\n          \) : \(\r?\n            <span className="text-sm text-white/50">\r?\n              Aucun mot-clé ajouté pour \{activeTab\}\r?\n            </span>\r?\n          \)\}\r?\n        </div>/,
  `        <div className="mb-4 flex min-h-[40px] flex-wrap items-center gap-2">
          {(keywordsByTab[activeTab] ?? []).map((keyword: string) => (
            <KeywordChip key={keyword} keyword={keyword} onRemove={removeKeywordUI} />
          ))}

          {(keywordsByTab[activeTab] ?? []).length === 0 && (
            <span className="text-sm text-white/50">
              Aucun mot-clé ajouté pour {activeTab}
            </span>
          )}
        </div>`,
  'keywords panel block'
);

replaceOnce(
  /const tabCount = keywordsByTab\[tab\]\.length;/,
  'const tabCount = (keywordsByTab[tab as UIKey] ?? []).length;',
  'tab count'
);

content = content.replace(/\r?\n/g, '\r\n');

fs.writeFileSync(filePath, content);
