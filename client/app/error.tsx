"use client";

import { MessageState, buttonStyles } from "../components/ui/States";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <MessageState
      eyebrow="A disturbance"
      title="The archive could not be reached"
      action={
        <button type="button" onClick={reset} className={`${buttonStyles.secondary} mt-2`}>
          Try again
        </button>
      }
    >
      One of the services AniWorld relies on didn&apos;t answer. This usually passes within a minute.
    </MessageState>
  );
}
