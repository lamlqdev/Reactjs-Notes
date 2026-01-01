import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Greeting from "./Greeting";

describe("Greeting component", () => {
  test("renders Hello World as a text", () => {
    // Arrange
    render(<Greeting />);

    //Act
    // ... nothing

    // Asserty
    const helloWorldElement = screen.getByText("Hello World!");
    expect(helloWorldElement).toBeInTheDocument();
  });

  test('renders "Good to see you" if the button was not clicked', () => {
    render(<Greeting />);
    const outputElement = screen.getByText("Good to see you!", {
      exact: false,
    });
    expect(outputElement).toBeInTheDocument();
  });

  test('renders "Changed!" if the button was clicked', async () => {
    const user = userEvent.setup();
    render(<Greeting />);

    const buttonElement = screen.getByRole("button");
    await user.click(buttonElement);

    const outputElement = screen.getByText("Changed!", { exact: true });
    expect(outputElement).toBeInTheDocument();
  });

  test('does not render "Good to see you!" if the button was clicked', async () => {
    const user = userEvent.setup();
    render(<Greeting />);

    const buttonElement = screen.getByRole("button");
    await user.click(buttonElement);

    const outputElement = screen.queryByText("Good to see you!");
    expect(outputElement).toBeNull();
  });
});
