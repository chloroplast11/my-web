"use client";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import type { PartialBlock } from "@blocknote/core";
import { useEffect } from "react";

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

  return <BlockNoteView editor={editor} theme="light" />;
}
