import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EditToolbar } from "@/components/home/bento/EditToolbar";

const TEST_LAYOUT = {
  about: { x: 30, y: 130, w: 240, h: 230 },
  calendar: { x: 350, y: 130, w: 160, h: 175 },
  music: { x: 340, y: 440, w: 260, h: 56 },
  photos: { x: 605, y: 130, w: 250, h: 245 },
  blog: { x: 30, y: 390, w: 290, h: 170 },
  hanabi: { x: 350, y: 532, w: 220, h: 65 },
  "clock-lcd": { x: 350, y: 330, w: 200, h: 80 },
  "clock-analog": { x: 660, y: 395, w: 120, h: 120 },
  likes: { x: 790, y: 440, w: 80, h: 85 },
} as const;

describe("EditToolbar", () => {
  const onEnter = vi.fn();
  const onExit = vi.fn();
  const onDiscard = vi.fn();
  const onServerAccepted = vi.fn();
  const fetchMock = vi.fn();

  beforeEach(() => {
    onEnter.mockReset();
    onExit.mockReset();
    onDiscard.mockReset();
    onServerAccepted.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function setup({ editMode, isAdmin }: { editMode: boolean; isAdmin: boolean }) {
    return render(
      <EditToolbar
        editMode={editMode}
        isAdmin={isAdmin}
        onEnter={onEnter}
        onExit={onExit}
        onDiscard={onDiscard}
        currentLayout={TEST_LAYOUT}
        onServerAccepted={onServerAccepted}
      />,
    );
  }

  it("not in edit mode: shows only the enter button", () => {
    setup({ editMode: false, isAdmin: false });
    expect(
      screen.getByRole("button", { name: /enter edit mode/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /discard/i })).toBeNull();
  });

  it("in edit mode: shows only discard + save (no save-with-key)", () => {
    setup({ editMode: true, isAdmin: false });
    expect(screen.getByRole("button", { name: /discard/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /save with key/i })).toBeNull();
    expect(screen.queryByLabelText(/layout key/i)).toBeNull();
  });

  it("non-admin save: exits edit mode locally and does not hit the API", async () => {
    const user = userEvent.setup();
    setup({ editMode: true, isAdmin: false });
    await user.click(screen.getByRole("button", { name: /^save$/i }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(onExit).toHaveBeenCalled();
    expect(onServerAccepted).not.toHaveBeenCalled();
  });

  it("admin save: 200 path calls onServerAccepted with the returned positions and exits", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ positions: { about: { x: 1, y: 2, w: 240, h: 230 } } }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    setup({ editMode: true, isAdmin: true });
    await user.click(screen.getByRole("button", { name: /^save$/i }));
    await waitFor(() =>
      expect(onServerAccepted).toHaveBeenCalledWith({
        about: { x: 1, y: 2, w: 240, h: 230 },
      }),
    );
    expect(onExit).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/bento-layout",
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("admin save: 401 path shows save-failed and keeps user in edit mode", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 }),
    );
    setup({ editMode: true, isAdmin: true });
    await user.click(screen.getByRole("button", { name: /^save$/i }));
    await waitFor(() =>
      expect(screen.getByText(/save failed/i)).toBeInTheDocument(),
    );
    expect(onExit).not.toHaveBeenCalled();
    expect(onServerAccepted).not.toHaveBeenCalled();
  });
});
