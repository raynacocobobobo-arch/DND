export function normalizeContextName(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("zh-CN");
}

export function normalizeAITaskTitle(value: string): string {
  return normalizeContextName(value).replace(/[\p{P}\p{S}\s]+/gu, "");
}
