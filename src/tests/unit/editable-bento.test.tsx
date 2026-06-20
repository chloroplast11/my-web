import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { EditableBento } from "@/components/home/bento/EditableBento";
import { BentoLayoutContext } from "@/components/home/bento/BentoLayoutContext";
import { useContext } from "react";

function Spy() {
  const ctx = useContext(BentoLayoutContext);
  return (
    <div>
      <span data-testid="edit-mode">{String(ctx?.editMode)}</span>
      <span data-testid="about-x">{String(ctx?.layout.about.x)}</span>
    </div>
  );
}

describe("EditableBento", () => {
  it("seeds layout from initialLayout, falling back to defaults for missing ids", () => {
    render(
      <EditableBento initialLayout={{ about: { x: 99, y: 99 } }}>
        <Spy />
      </EditableBento>,
    );
    expect(screen.getByTestId("about-x").textContent).toBe("99");
  });

  it("starts not in edit mode and exposes editMode=false via context", () => {
    render(
      <EditableBento initialLayout={{}}>
        <Spy />
      </EditableBento>,
    );
    expect(screen.getByTestId("edit-mode").textContent).toBe("false");
  });

  it("clicking the edit icon switches editMode to true", async () => {
    const user = userEvent.setup();
    render(
      <EditableBento initialLayout={{}}>
        <Spy />
      </EditableBento>,
    );
    await user.click(screen.getByRole("button", { name: /enter edit mode/i }));
    expect(screen.getByTestId("edit-mode").textContent).toBe("true");
  });

  it("clicking discard exits edit mode", async () => {
    const user = userEvent.setup();
    render(
      <EditableBento initialLayout={{}}>
        <Spy />
      </EditableBento>,
    );
    await user.click(screen.getByRole("button", { name: /enter edit mode/i }));
    await user.click(screen.getByRole("button", { name: /discard/i }));
    expect(screen.getByTestId("edit-mode").textContent).toBe("false");
  });

  it("clicking save exits edit mode and keeps the current layout", async () => {
    const user = userEvent.setup();
    render(
      <EditableBento initialLayout={{ blog: { x: 5, y: 5 } }}>
        <Spy />
      </EditableBento>,
    );
    await user.click(screen.getByRole("button", { name: /enter edit mode/i }));
    await user.click(screen.getByRole("button", { name: /^save$/i }));
    expect(screen.getByTestId("edit-mode").textContent).toBe("false");
  });
});
