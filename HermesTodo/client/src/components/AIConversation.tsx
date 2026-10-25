import { Sparkles } from "lucide-react";

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

export function AIConversation({
  messages,
  options,
  loading,
  onOption
}: {
  messages: ConversationTurn[];
  options: string[];
  loading: boolean;
  onOption(option: string): void;
}) {
  if (messages.length === 0) {
    return (
      <div className="ai-empty-state">
        <span className="ai-orb"><Sparkles aria-hidden="true" size={40} /></span>
        <h2>AI 任务规划器</h2>
        <p>说个目标，我来帮你拆成小步。</p>
        <button type="button" className="ai-example" onClick={() => onOption("罗马必打卡景点")}>罗马必打卡景点</button>
      </div>
    );
  }
  return (
    <div className="ai-conversation" aria-live="polite">
      {messages.map((message, index) => (
        <div key={`${message.role}-${index}`} className={`chat-turn chat-${message.role}`}>
          <span>{message.role === "user" ? "你" : "Hermes AI"}</span>
          <p>{message.content}</p>
        </div>
      ))}
      {loading ? <div className="chat-turn chat-assistant"><span>Hermes AI</span><p>正在整理…</p></div> : null}
      {options.length ? <div className="ai-options">{options.map((option) => <button key={option} type="button" disabled={loading} onClick={() => onOption(option)}>{option}</button>)}</div> : null}
    </div>
  );
}
