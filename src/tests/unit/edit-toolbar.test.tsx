import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EditToolbar } from "@/components/home/bento/EditToolbar";

const TEST_LAYOUT = {
  about: { x: 30, y: 130 },
  calendar: { x: 350, y: 130 },
  music: { x: 340, y: 440 },
  photos: { x: 605, y: 130 },
  blog: { x: 30, y: 390 },
  hanabi: { x: 350, y: 532 },
  "clock-lcd": { x: 350, y: 330 },
  "clock-analog": { x: 660, y: 395 },
  likes: { x: 790, y: 440 },
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

  function setup(editMode: boolean) {
    return render(
      <EditToolbar
        editMode={editMode}
        onEnter={onEnter}
        onExit={onExit}
        onDiscard={onDiscard}
        currentLayout={TEST_LAYOUT}
        onServerAccepted={onServerAccepted}
      />,
    );
  }

  it("not in edit mode: shows only the enter button", () => {
    setup(false);
    expect(screen.getByRole("button", { name: /enter edit mode/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /discard/i })).toBeNull();
  });

  it("in edit mode: shows discard / save / save with key", () => {
    setup(true);
    expect(screen.getByRole("button", { name: /discard/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save with key/i })).toBeInTheDocument();
  });

  it("save with key: opens the key input on click", async () => {
    const user = userEvent.setup();
    setup(true);
    await user.click(screen.getByRole("button", { name: /save with key/i }));
    expect(screen.getByLabelText(/layout key/i)).toBeInTheDocument();
  });

  it("save with key: 200 path calls onServerAccepted with the returned positions and exits", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ positions: { about: { x: 1, y: 2 } } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    setup(true);
    await user.click(screen.getByRole("button", { name: /save with key/i }));
    await user.type(screen.getByLabelText(/layout key/i), "secret{enter}");
    await waitFor(() =>
      expect(onServerAccepted).toHaveBeenCalledWith({ about: { x: 1, y: 2 } }),
    );
    expect(onExit).toHaveBeenCalled();
  });

  it("save with key: 401 path shows wrong-key message and keeps user in edit mode", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "invalid key" }), { status: 401 }),
    );
    setup(true);
    await user.click(screen.getByRole("button", { name: /save with key/i }));
    await user.type(screen.getByLabelText(/layout key/i), "nope{enter}");
    await waitFor(() => expect(screen.getByText(/wrong key/i)).toBeInTheDocument());
    expect(onExit).not.toHaveBeenCalled();
    expect(onServerAccepted).not.toHaveBeenCalled();
  });
});
