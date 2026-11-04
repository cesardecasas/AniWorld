import { MessageState } from "../components/ui/States";

export default function NotFound() {
  return (
    <MessageState eyebrow="404" title="This page was lost to the ages">
      Whatever was here has vanished from the archive, or never existed at all.
    </MessageState>
  );
}
