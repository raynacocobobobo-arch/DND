export function AILogo({ size = 30, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`ai-logo ${className}`}
      aria-hidden="true"
      style={{ width: size, height: size }}
    >
      <span className="ai-logo-mark">AI</span>
      <span className="ai-logo-spark">✦</span>
    </span>
  );
}
