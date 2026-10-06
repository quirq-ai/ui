// PathText: a file path that prefers to wrap after a slash. Each "/" is followed by a <wbr>
// break opportunity, and the caller keeps overflow-wrap:anywhere as the last resort, so a
// narrow column reads "papers/verification/" then "snapshot-diffs.md". Server-safe.
import { Fragment } from "react";

export function PathText({ path }: { path: string }) {
  const parts = path.split("/");
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 ? (
            <>
              /<wbr />
            </>
          ) : null}
        </Fragment>
      ))}
    </>
  );
}
