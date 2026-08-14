import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import LoginForm from "../LoginForm";

import axios from "axios";
import { useNavigate } from "react-router-dom";

jest.mock("axios");

jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
}));

describe("LoginForm", () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        useNavigate.mockReturnValue(mockNavigate);

        process.env.REACT_APP_API_URL = "http://localhost:8000";

        localStorage.clear();
    });

    test("submits email and password to the login API", async () => {
        axios.post.mockResolvedValue({
            data: {
                message: "Login successful",
            },
        });

        const user = userEvent.setup();

        render(<LoginForm />);

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const loginButton = screen.getByRole("button", {
            name: /login/i,
        });

        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "Password123");

        await user.click(loginButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                "http://localhost:8000/auth/login",
                {
                    email: "test@example.com",
                    password: "Password123",
                }
            );
        });
    });

    test("stores email and redirects to two-factor authentication after successful login", async () => {
        axios.post.mockResolvedValue({
            data: {
                message: "Login successful",
            },
        });

        const user = userEvent.setup();

        render(<LoginForm />);

        await user.type(
            screen.getByLabelText(/email address/i),
            "test@example.com"
        );

        await user.type(
            screen.getByLabelText(/password/i),
            "Password123"
        );

        await user.click(
            screen.getByRole("button", {
                name: /login/i,
            })
        );

        await waitFor(() => {
            expect(localStorage.getItem("email")).toBe(
                "test@example.com"
            );

            expect(mockNavigate).toHaveBeenCalledWith(
                "/two-factor",
                {
                    state: {
                        email: "test@example.com",
                    },
                }
            );
        });
    });
});