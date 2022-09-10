import React from "react";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { faker } from "@faker-js/faker";
import LoginPage from "./LoginPage";
import { authService } from "services/auth.service";
import { MockStore } from "mocks/MockStore";

const mockUseNavigate = jest.fn();

jest.mock("services/auth.service");
jest.mock("react-router-dom", () => {
  return {
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockUseNavigate,
  };
});

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  authService.login.mockResolvedValue({ data: {} });
});

describe("LoginPage", () => {
  const getComponent = () => {
    return (
      <MockStore>
        <LoginPage />
      </MockStore>
    );
  };

  it("renders correct fields and title.", async () => {
    await render(getComponent());
    expect(screen.getByText("CommonTongue")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Email Address" })).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Jaskaran Dhillon" })).toBeInTheDocument();
  });

  it("calls service endpoint with correct parameters.", async () => {
    await render(getComponent());

    const email = faker.internet.email();
    const password = "Thisisavalidpassword8!";

    userEvent.type(screen.getByRole("textbox", { name: "Email Address" }), email);
    userEvent.type(screen.getByLabelText("Password"), password);

    userEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledTimes(1);
    });
    expect(authService.login).toHaveBeenLastCalledWith({
      email,
      password,
    });

    await waitFor(() => {
      expect(mockUseNavigate).toHaveBeenCalledTimes(1);
    });
    expect(mockUseNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("signup button routes correctly.", async () => {
    await render(getComponent());

    userEvent.click(screen.getByText("Don't have an account? Sign Up"));
    expect(mockUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockUseNavigate).toHaveBeenCalledWith("/signup");
  });
});
