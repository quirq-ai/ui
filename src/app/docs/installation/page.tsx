import type { Metadata } from "next";
import { InstallationPage } from "@/docs/installation-page";

export const metadata: Metadata = { title: "Installation" };

export default function Page() {
  return <InstallationPage />;
}
