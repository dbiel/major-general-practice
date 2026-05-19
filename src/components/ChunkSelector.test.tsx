import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChunkSelector } from "./ChunkSelector";
import song from "../data/songs/major-general.json";
import type { SongData } from "../data/schema";

describe("ChunkSelector", () => {
  it("renders one row per chunk and toggles on click", () => {
    const onChange = vi.fn();
    render(<ChunkSelector song={song as SongData} selected={["v1-A"]} onChange={onChange} />);
    expect(screen.getByText(/I am the very model/)).toBeInTheDocument();

    const aRow = screen.getByLabelText(/A:/);
    expect(aRow).toBeChecked();

    const bRow = screen.getByLabelText(/B:/);
    fireEvent.click(bRow);
    expect(onChange).toHaveBeenCalledWith(["v1-A", "v1-B"]);
  });

  it("'Select all in verse' selects all couplets in that verse", () => {
    const onChange = vi.fn();
    render(<ChunkSelector song={song as SongData} selected={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /select all in Verse 1/i }));
    expect(onChange).toHaveBeenCalledWith(["v1-A", "v1-B", "v1-C", "v1-D"]);
  });
});
