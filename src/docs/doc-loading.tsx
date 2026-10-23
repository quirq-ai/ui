import { Center } from "@astryxdesign/core/Center";
import { Spinner } from "@astryxdesign/core/Spinner";

/** Fallback while a docs route resolves its params. */
export function DocLoading() {
  return (
    <Center width="100%" minHeight={480}>
      <Spinner label="Loading" />
    </Center>
  );
}
