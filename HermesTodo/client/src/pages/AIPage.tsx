import { useQueryClient } from "@tanstack/react-query";
import { HeraldicIcon } from "../components/HeraldicIcon";
import { useState, type FormEvent } from "react";

import type { AIPlanResult, AISuggestion } from "../../../shared/contracts";
import { apiRequest } from "../api/client";
import { AIConversation, type ConversationTurn } from "../components/AIConversation";
import { AISuggestionList } from "../components/AISuggestionList";
import { HeraldicDivider } from "../components/HeraldicArt";
import { AILogo } from "../components/AILogo";
import { ImportListDialog } from "../components/ImportListDialog";
import { DataExchangeDialog } from "../components/DataExchangeDialog";

function suggestionKey(title: string): string {
  return title.normalize("NFKC").toLocaleLowerCase("zh-CN").replace(/[\p{P}\p{S}\s]+/gu, "");
}

export function AIPage() {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ConversationTurn[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [conversationContext, setConversationContext] = useState<string>();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");

  function applyResult(result: AIPlanResult) {
    if (result.reply) setMessages((current) => [...current, { role: "assistant", content: result.reply }]);
    setOptions(result.options);
    const fixedContext = conversationContext ?? result.suggestions.find((item) => item.context)?.context;
    if (fixedContext && !conversationContext) setConversationContext(fixedContext);
    setSuggestions((current) => {
      const seen = new Set(current.map((item) => suggestionKey(item.title)));
      const additions = result.suggestions
        .map((item) => ({ ...item, context: fixedContext ?? item.context }))
        .filter((item) => {
          const key = suggestionKey(item.title);
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      return [...current, ...additions];
    });
  }

  async function send(content: string) {
    const trimmed = content.trim();
    if (!trimmed || loading) return;
    const nextMessages = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setOptions([]);
    setCommitMessage("");
    setLoading(true);
    try {
      const result = await apiRequest<AIPlanResult>("/api/ai/plan", {
        method: "POST",
        body: JSON.stringify({ messages: nextMessages })
      });
      applyResult(result);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", content: error instanceof Error ? error.message : "AI 服务暂时不可用，请重试" }]);
    } finally {
      setLoading(false);
    }
  }

  async function importList(raw: string, contextHint: string) {
    setLoading(true);
    setMessages((current) => [...current, { role: "user", content: `导入清单：${contextHint || "未命名清单"}` }]);
    try {
      const result = await apiRequest<AIPlanResult>("/api/ai/import-list", {
        method: "POST",
        body: JSON.stringify({ raw, contextHint, messages })
      });
      applyResult(result);
      setImportOpen(false);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", content: error instanceof Error ? error.message : "清单解析失败，请重试" }]);
    } finally {
      setLoading(false);
    }
  }

  async function commitSuggestions() {
    const result = await apiRequest<{ createdTasks: unknown[]; skippedCount: number }>("/api/ai/commit-suggestions", {
      method: "POST",
      body: JSON.stringify({ suggestions })
    });
    setCommitMessage(`已写入 ${result.createdTasks.length} 个待办`);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["tasks"] }),
      queryClient.invalidateQueries({ queryKey: ["contexts"] })
    ]);
  }

  function clearConversation() {
    setMessages([]);
    setSuggestions([]);
    setOptions([]);
    setConversationContext(undefined);
    setCommitMessage("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(input);
  }

  return (
    <section className="page-stack ai-page">
      <header className="ios-page-header">
        <AILogo className="ai-title-logo" size={32}/>
        <h1>AI 规划器</h1>
        <div className="header-actions"><button type="button" className="icon-button" aria-label="导入长清单" title="DeepSeek 导入清单" onClick={() => setImportOpen(true)}><HeraldicIcon name="upload" size={22}/></button><button type="button" className="icon-button" aria-label="ChatGPT / AI 清单交换" title="ChatGPT / AI 清单交换" onClick={() => setExchangeOpen(true)}><HeraldicIcon name="copy" size={22}/></button><button type="button" className="icon-button" aria-label="清空对话" disabled={!messages.length && !suggestions.length} onClick={clearConversation}><HeraldicIcon name="reset" size={22}/></button></div>
      </header>
      <section className="ai-workspace">
        {messages.length === 0 ? <HeraldicDivider className="ai-ornament"/> : null}
        <AIConversation messages={messages} options={options} loading={loading} onOption={(option) => void send(option)} />
        <AISuggestionList suggestions={suggestions} />
        {commitMessage ? <p className="success-message" role="status">{commitMessage}</p> : null}
        {suggestions.length ? <button type="button" className="primary-button ai-commit-button" disabled={loading} onClick={() => void commitSuggestions()}>汇总成待办</button> : null}
        <form className="ai-composer" onSubmit={submit}>
          <label className="sr-only" htmlFor="ai-input">告诉 AI 你的目标</label>
          <textarea id="ai-input" value={input} onChange={(event) => setInput(event.target.value)} disabled={loading} rows={1} placeholder="我想完成什么？" />
          <button type="submit" aria-label={loading ? "规划中…" : "发送"} disabled={loading || !input.trim()}><HeraldicIcon name="send" size={27}/></button>
        </form>
      </section>
      {importOpen ? <ImportListDialog loading={loading} onCancel={() => setImportOpen(false)} onImport={(raw, contextHint) => void importList(raw, contextHint)} /> : null}
      {exchangeOpen ? <DataExchangeDialog onClose={() => setExchangeOpen(false)} onImported={() => {
        void Promise.all([
          queryClient.invalidateQueries({ queryKey: ["tasks"] }),
          queryClient.invalidateQueries({ queryKey: ["contexts"] })
        ]);
      }} /> : null}
    </section>
  );
}
