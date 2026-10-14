/**
 * A headline whose words rise into view one after another once it scrolls in
 * (see `.split` in globals.css; ScrollEffects adds the `in` class).
 * Each entry in `lines` is placed on its own line on wider screens.
 */
export function Split({ lines, className = "" }: { lines: string[]; className?: string }) {
  let index = 0;
  return (
    <span className={`split ${className}`.trim()}>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex}>
          {lineIndex > 0 && (
            <>
              {" "}
              <br className="hidden md:inline" />
            </>
          )}
          {line.split(" ").map((word, wordIndex) => (
            <span key={wordIndex}>
              {wordIndex > 0 && " "}
              <span className="w">
                <span style={{ "--i": index++ } as React.CSSProperties}>{word}</span>
              </span>
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
