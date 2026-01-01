import { render, screen, waitFor } from "@testing-library/react";
import UserProfile from "./UserProfile";

// Mock fetch globally
global.fetch = jest.fn();

describe("UserProfile component", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  test("shows loading state initially", () => {
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise(() => {
          // Never resolves to keep loading state
        })
    );

    render(<UserProfile userId={1} />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading...");
  });

  test("displays user data when fetch succeeds", async () => {
    const mockUser = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    render(<UserProfile userId={1} />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("displays error message when fetch fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<UserProfile userId={1} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /error: failed to fetch user/i
      );
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("displays error message when fetch throws", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    render(<UserProfile userId={1} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/network error/i);
    });
  });

  test("calls fetch with correct URL", async () => {
    const mockUser = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    render(<UserProfile userId={123} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/users/123");
    });
  });
});

