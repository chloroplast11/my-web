"use client";
import { useState, useTransition } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { cn } from "@/lib/cn";

type Props = {
  action: () => Promise<unknown>;
  itemLabel: string;
  className?: string;
  buttonLabel?: string;
};

export function DeleteButton({
  action,
  itemLabel,
  className,
  buttonLabel = "Delete",
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("text-red-700 text-sm", className)}
      >
        {buttonLabel}
      </button>
      <ConfirmDialog
        open={open}
        title={`Delete "${itemLabel}"?`}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          startTransition(() => {
            void action();
          });
        }}
        confirmLabel={isPending ? "Deleting…" : "Delete"}
      />
    </>
  );
}
