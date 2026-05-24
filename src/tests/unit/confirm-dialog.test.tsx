import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

describe("ConfirmDialog", () => {
  it("does not render when closed", () => {
    render(
      <ConfirmDialog
        open={false}
        title='Delete "post"?'
        onCancel={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.queryByText(/Delete "post"\?/)).toBeNull();
  });

  it("calls onCancel when Cancel is clicked", async () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title='Delete "post"?'
        onCancel={onCancel}
        onConfirm={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when Delete is clicked", async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open
        title='Delete "post"?'
        onCancel={() => {}}
        onConfirm={onConfirm}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when Escape is pressed", async () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title='Delete "post"?'
        onCancel={onCancel}
        onConfirm={() => {}}
      />,
    );
    await userEvent.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
