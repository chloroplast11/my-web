"use client";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView, type Theme } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import type { PartialBlock } from "@blocknote/core";
import { useEffect } from "react";

// Match the editor canvas to the site's surface color so it doesn't pop
// as a white sheet against the cream paper background.
const surfaceTheme: Theme = {
  colors: {
    editor: { background: "#fbf6ec" },
  },
};

export function PostEditor({
  initialContent, onChange,
}: { initialContent?: unknown; onChange: (blocks: unknown) => void }) {
  const editor = useCreateBlockNote({
    initialContent: (initialContent as PartialBlock[] | undefined) ?? undefined,
  });

  useEffect(() => {
    const unsub = editor.onChange(() => onChange(editor.document));
    return () => { unsub?.(); };
  }, [editor, onChange]);

  return <BlockNoteView editor={editor} theme={surfaceTheme} />;
}
