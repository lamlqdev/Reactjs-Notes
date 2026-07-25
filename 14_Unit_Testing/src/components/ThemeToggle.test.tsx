import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

// Helper function to render with providers
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe("ThemeToggle component", () => {
  test("displays current theme", () => {
    // Arrange
    renderWithTheme(<ThemeToggle />);

    // Act
    // ... nothing

    // Assert
    expect(screen.getByText(/current theme: light/i)).toBeInTheDocument();
  });

  test("toggles theme when button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithTheme(<ThemeToggle />);
    const toggleButton = screen.getByRole("button", { name: /toggle theme/i });

    // Act
    await user.click(toggleButton);

    // Assert
    expect(screen.getByText(/current theme: dark/i)).toBeInTheDocument();
  });

  test("toggles theme multiple times", async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithTheme(<ThemeToggle />);
    const toggleButton = screen.getByRole("button", { name: /toggle theme/i });

    // Act
    await user.click(toggleButton);

    // Assert
    expect(screen.getByText(/current theme: dark/i)).toBeInTheDocument();

    // Act
    await user.click(toggleButton);

    // Assert
    expect(screen.getByText(/current theme: light/i)).toBeInTheDocument();
  });
});

