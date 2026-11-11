import ReactMarkdown from "react-markdown";

const components = {
  p: ({ children }) => <p className="mb-3 leading-[1.65] last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1.5 pl-5 leading-[1.6] last:mb-0 marker:text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1.5 pl-5 leading-[1.6] last:mb-0 marker:text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => <h3 className="mb-2 mt-4 text-[16px] font-semibold first:mt-0">{children}</h3>,
  h2: ({ children }) => <h3 className="mb-2 mt-4 text-[15.5px] font-semibold first:mt-0">{children}</h3>,
  h3: ({ children }) => <h3 className="mb-1.5 mt-3.5 text-[15px] font-semibold first:mt-0">{children}</h3>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline decoration-[#0A84FF]/50 underline-offset-2"
      style={{ color: "#0A84FF" }}
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded-[5px] px-1.5 py-0.5 font-mono text-[13px]" style={{ background: "var(--nav-hover)" }}>
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-[10px] p-3 text-[13px] last:mb-0" style={{ background: "var(--nav-hover)" }}>
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-2 pl-3 italic text-muted-foreground last:mb-0" style={{ borderColor: "var(--glass-border)" }}>
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4" style={{ borderColor: "var(--hairline)" }} />,
};

export default function MarkdownMessage({ children }) {
  return (
    <div className="text-[15px] text-foreground/95">
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}