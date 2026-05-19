import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BpmControl } from "./BpmControl";

describe("BpmControl", () => {
  it("renders BPM and adjusts on +/- click", () => {
    const onChange = vi.fn();
    render(<BpmControl bpm={100} min={40} max={200} onChange={onChange} />);
    expect(screen.getByText("100")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "+10 BPM" }));
    expect(onChange).toHaveBeenCalledWith(110);
    fireEvent.click(screen.getByRole("button", { name: "-5 BPM" }));
    expect(onChange).toHaveBeenCalledWith(95);
  });

  it("clamps at min and max", () => {
    const onChange = vi.fn();
    render(<BpmControl bpm={42} min={40} max={200} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "-5 BPM" }));
    expect(onChange).toHaveBeenCalledWith(40);
  });
});
