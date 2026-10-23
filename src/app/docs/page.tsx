import type { Metadata } from "next";
import { IntroductionPage } from "@/docs/introduction-page";
import { countByKind } from "@/registry/catalog";

export const metadata: Metadata = { title: "Introduction" };

export default function Page() {
  return <IntroductionPage counts={countByKind()} />;
}
