import { describe, expect, test } from "vitest";

import { normalizeAITaskTitle, normalizeContextName } from "../src/domain/normalization";

describe("context name normalization", () => {
  test("trims and case-folds while preserving punctuation", () => {
    expect(normalizeContextName("  Work-出差！  ")).toBe("work-出差!");
  });

  test("does not merge names that differ by punctuation", () => {
    expect(normalizeContextName("旅行-A")).not.toBe(normalizeContextName("旅行A"));
  });
});

describe("AI task title normalization", () => {
  test("removes whitespace, punctuation, and symbols after case-folding", () => {
    expect(normalizeAITaskTitle(" 身份 证（正本）! 📌 ")).toBe("身份证正本");
    expect(normalizeAITaskTitle("Hotel Order")).toBe("hotelorder");
  });
});
