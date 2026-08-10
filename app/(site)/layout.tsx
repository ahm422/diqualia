import { ChatWidget } from "../components/ChatWidget";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { ReferenceInteractions } from "../components/ReferenceInteractions";

export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="diq-cur" id="cur" aria-hidden="true" />
      <div className="diq-curR" id="cur-r" aria-hidden="true" />
      <ReferenceInteractions />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <ChatWidget />
    </>
  );
}
