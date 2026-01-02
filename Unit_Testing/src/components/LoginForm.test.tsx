import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";

describe("LoginForm component", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  test("renders form fields", () => {
    // Arrange
    render(<LoginForm onSubmit={mockOnSubmit} />);

    // Act
    // ... nothing

    // Assert
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  test("shows validation errors when fields are empty", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    // Act
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test("shows error for invalid email", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    // Act
    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/email must be valid/i)).toBeInTheDocument();
    });
  });

  test("shows error for short password", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    // Act
    await user.type(passwordInput, "123");
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 6 characters/i)
      ).toBeInTheDocument();
    });
  });

  test("calls onSubmit with correct values when form is valid", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // Act
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    // Assert
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
    });
  });

  test("has proper accessibility attributes", () => {
    // Arrange
    render(<LoginForm onSubmit={mockOnSubmit} />);

    // Act
    // ... nothing

    // Assert
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("id", "email");
  });
});

