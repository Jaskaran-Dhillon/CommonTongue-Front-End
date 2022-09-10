import React from "react";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { faker } from "@faker-js/faker";
import SignupPage from "./SignupPage";
import { authService } from "services/auth.service";

const mockUseNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  return {
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockUseNavigate,
  };
});

jest.mock("services/auth.service", () => {
  return {
    authService: {
      createUser: jest.fn(() => "ok")
    },
  };
});

afterEach(() => {
  cleanup();
});

describe("SignupPage", () => {
  const getComponent = () => {
    return <SignupPage />;
  };

  it("renders correct fields and title.", async () => {
    await render(getComponent());
    expect(screen.getByRole("heading", { name: "Create an account" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Email Address" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "First Name" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Last Name" })).toBeInTheDocument();
    expect(screen.getByLabelText( "Password" )).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Jaskaran Dhillon" })).toBeInTheDocument();
  });

  it("shows error messages for invalid input.", async () => {
    await render(getComponent());
    const invalidFirstName = faker.random.words(25)
    const invalidLastName = faker.random.words(25)
    userEvent.type(screen.getByRole("textbox", { name: "Email Address" }), "invalid email");
    userEvent.type(screen.getByLabelText("Password"), "invalid password");

    userEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    expect(authService.createUser).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getAllByText("Required field")).toHaveLength(2);
    });
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
    expect(screen.getByText("Must contain atleast 8 characters, 1 letter, 1 number, and a special character")).toBeInTheDocument();

    userEvent.type(screen.getByRole("textbox", { name: "First Name" }), invalidFirstName);
    userEvent.type(screen.getByRole("textbox", { name: "Last Name" }), invalidLastName);
    userEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    expect(authService.createUser).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getAllByText("Maximum length of 50 characters")).toHaveLength(2);
    });
  });

  it("calls service endpoint with correct parameters.", async () => {
    await render(getComponent());

    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email();
    const password = "Thisisavalidpassword8!";

    userEvent.type(screen.getByRole("textbox", { name: "Email Address" }), email);
    userEvent.type(screen.getByRole("textbox", { name: "First Name" }), firstName);
    userEvent.type(screen.getByRole("textbox", { name: "Last Name" }), lastName);
    userEvent.type(screen.getByLabelText("Password"), password);

    userEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(authService.createUser).toHaveBeenCalledTimes(1);
    });
    expect(authService.createUser).toHaveBeenLastCalledWith({
      firstName,
      lastName,
      email,
      password,
    });

    expect(mockUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockUseNavigate).toHaveBeenCalledWith("/login");
  });

  it("login button routes correctly.", async () => {
    await render(getComponent());

    userEvent.click(screen.getByText("Already have an account? Sign in"));
    expect(mockUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockUseNavigate).toHaveBeenCalledWith("/login");
  });
});
