import { render, screen } from "@testing-library/react";
import Async from "./Async";

describe("AsyncComponent", () => {
  test("renders posts if request succeeds", async () => {
    // Arrange
    window.fetch = jest.fn();
    (window.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [{ id: "p1", title: "First Post" }],
    });
    render(<Async />);

    // Act
    // ... nothing (render triggers useEffect which fetches data)

    // Assert
    const listItems = await screen.findAllByRole("listitem");
    expect(listItems).not.toHaveLength(0);
  });
});
