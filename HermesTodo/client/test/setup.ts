import "@testing-library/jest-dom/vitest";

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { queryClient } from "../src/api/queryClient";

afterEach(() => {
  if (typeof document !== "undefined") cleanup();
  queryClient.clear();
  if (typeof localStorage !== "undefined") localStorage.clear();
  if (typeof window !== "undefined") window.history.replaceState({}, "", "/");
});
