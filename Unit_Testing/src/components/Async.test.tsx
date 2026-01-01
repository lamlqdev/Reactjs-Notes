import { render, screen } from "@testing-library/react";
import Async from "./Async";

describe("AsyncComponent", () => {
  test("renders posts if request succeeds", async () => {
    // overwrite the fetch function to return a successful promise
    window.fetch = jest.fn();
    (window.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [{ id: "p1", title: "First Post" }],
    });

    render(<Async />);

    const listItems = await screen.findAllByRole("listitem");
    expect(listItems).not.toHaveLength(0);
  });
});

