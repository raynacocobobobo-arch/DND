import type { AISuggestion } from "../../../shared/contracts";

const chineseNumbers = "零一二两三四五六七八九十百千万壹贰叁肆伍陆柒捌玖拾";
const numberToken = `[0-9${chineseNumbers}]+`;
const unitToken = "(?:章节|章|节|部分|部|篇|类别|类|事项|项|点)";
const structuralPatterns = [
  new RegExp(`^第${numberToken}${unitToken}(?:\\s*[:：、.．\\-)）]?\\s*.*)?$`, "iu"),
  new RegExp(`^${numberToken}[、.．\\-)）\\s]+${unitToken}(?:\\s*[:：、.．\\-)）]?\\s*.*)?$`, "iu"),
  /^(?:part|section|chapter)\s*[0-9ivxlcdm]+(?:\s*[:：、.．\-)）]?\s*.*)?$/iu,
  /^[0-9ivxlcdm]+[、.．\-)）\s]+(?:part|section|chapter)(?:\s*[:：、.．\-)）]?\s*.*)?$/iu
];

function truncate(value: string, maxLength: number): string {
  return Array.from(value).slice(0, maxLength).join("");
}

function cleanLine(raw: string): string {
  return raw
    .trim()
    .replace(/^[|\-•·*\s]+/u, "")
    .replace(/^[0-9一二三四五六七八九十]+[、.．)）\-\s]+/u, "")
    .replace(/\s+/gu, " ")
    .replace(/^[|｜,，;；:]+|[|｜,，;；:]+$/gu, "")
    .trim();
}

function cleanTitle(raw: string): string {
  let value = cleanLine(raw).normalize("NFKC");
  for (const word of ["建议", "确保", "避免", "提前", "记得", "检查", "确认一下", "最好", "需要", "把", "放在", "放到"]) {
    value = value.replaceAll(word, "");
  }
  value = value.replace(/（.*?）|\(.*?\)/gu, "");
  value = value.split(/[,，。.：:]/u, 1)[0]?.trim() ?? "";
  return truncate(value, 12);
}

function isStructuralHeading(value: string): boolean {
  const text = value.replace(/^[#>\-•·*\s]+/u, "").trim();
  return structuralPatterns.some((pattern) => pattern.test(text));
}

function categoryFromHeading(value: string): string {
  if (!isStructuralHeading(value)) {
    return "";
  }
  let text = value.replace(/^[#>\-•·*\s]+/u, "").trim();
  text = text
    .replace(new RegExp(`^第${numberToken}${unitToken}\\s*[:：、.．\\-)）]?\\s*`, "iu"), "")
    .replace(new RegExp(`^${numberToken}[、.．\\-)）\\s]+${unitToken}\\s*[:：、.．\\-)）]?\\s*`, "iu"), "")
    .replace(/^(?:part|section|chapter)\s*[0-9ivxlcdm]+\s*[:：、.．\-)）]?\s*/iu, "");
  return truncate(cleanLine(text), 18);
}

function isExplanation(value: string): boolean {
  if (isStructuralHeading(value)) {
    return true;
  }
  const words = ["为什么", "为何", "原因", "因为", "所以", "说明", "攻略", "总结", "背景", "原则", "逻辑", "麻烦", "不方便", "很难", "比较难", "别进去", "不要进去", "神恶魔", "什么"];
  return words.some((word) => value.includes(word)) || (Array.from(value).length <= 24 && /[。！？!?]$/u.test(value));
}

function guessContext(raw: string): string {
  const first = raw
    .split(/\r?\n/u)
    .map(cleanLine)
    .find(Boolean);
  if (first && !isStructuralHeading(first) && Array.from(first).length <= 12) {
    return first;
  }
  if (/欧洲|旅行|护照|酒店|航班/u.test(raw)) return "旅行清单";
  if (/拍摄|分镜|设备/u.test(raw)) return "拍摄清单";
  if (/婚礼/u.test(raw)) return "婚礼清单";
  if (/账|发票|收款/u.test(raw)) return "财务清单";
  return "导入清单";
}

export function parseImportedListLocally(raw: string, contextHint = ""): AISuggestion[] {
  const context = contextHint.trim() || guessContext(raw);
  const headerWords = ["名称", "事项", "待办", "清单", "类别", "分类", "备注", "优先级", "序号", "title", "note", "priority"];
  const results: AISuggestion[] = [];
  const seen = new Set<string>();
  let category = "导入清单";

  for (const rawLine of raw.replace(/\r/gu, "\n").split("\n")) {
    const line = cleanLine(rawLine);
    if (Array.from(line).length < 2) continue;
    const columns = line.split(/[\t|｜]/u).map(cleanLine).filter(Boolean);
    const lower = line.toLowerCase();
    const headerHits = headerWords.filter((word) => lower.includes(word.toLowerCase())).length;
    if (headerWords.some((word) => lower === word.toLowerCase()) || (columns.length > 1 && headerHits >= 2)) {
      continue;
    }
    if (isExplanation(line)) {
      const structuralCategory = categoryFromHeading(line);
      if (structuralCategory) category = structuralCategory;
      continue;
    }
    if (
      Array.from(line).length <= 18 &&
      columns.length <= 1 &&
      !/[,，]/u.test(line) &&
      (/[：:]\s*$/u.test(rawLine) || /^#/u.test(rawLine.trim()))
    ) {
      category = truncate(cleanLine(line.replaceAll("#", "")), 18);
      continue;
    }

    const title = cleanTitle(columns[0] ?? line);
    if (Array.from(title).length < 2 || isExplanation(title)) continue;
    const key = title.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const noteSource = columns.length > 1 ? columns.slice(1).join("；") : line;
    const note = noteSource === title ? "" : truncate(noteSource.trim().replace(/\s+/gu, " "), 100);
    results.push({ title, category, note, context, priority: "medium" });
  }

  return results;
}
