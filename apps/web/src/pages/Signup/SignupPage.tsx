import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import "./SignupPage.css"; // Ensure the path is correct
import Card from "./components/Card";
import { Link } from "react-router-dom";

interface FormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const SignUpPage: React.FC = () => {
    const apiUrl = import.meta.env.VITE_API_URL;


    const [formData, setFormData] = useState<FormData>({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState<string[] | null>(null); // Update to handle an array of error messages
    const [signupSuccess, setSignupSuccess] = useState<boolean>(false); // State to track signup success

    useEffect(() => {
        document.body.className = "signup-page";
        return () => {
            document.body.className = "";
        };
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name;
        const value = e.target.value;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError(["Passwords do not match."]);
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();

                // If the message is an array, display each message on a separate line
                if (Array.isArray(errorData.message)) {
                    setError(errorData.message);
                } else if (errorData.message) {
                    setError([errorData.message]);
                } else {
                    setError(["An unexpected error occurred."]);
                }
                return;
            }

            const data = await response.json();
            console.log("Signup successful:", data);

            // Set the success state to true
            setSignupSuccess(true);
            setError(null); // Clear any error messages
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? [err.message]
                    : ["An unexpected error occurred."]
            );
        }
    };

    return (
        <div className="app-container">
            <Card className="signup-card">
                <Link to="/">
                    <img src="/logo_red.png" className="logo" alt="logo" />
                </Link>

                {!signupSuccess ? (
                    <>
                        <h1>Sign Up</h1>
                        {error && (
                            <div className="error-message">
                                {error.map((errMsg, index) => (
                                    <p key={index}>{errMsg}</p> // Display each error message in a separate <p> tag
                                ))}
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="username"
                                className="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                            <br />
                            <input
                                type="email"
                                name="email"
                                className="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <br />
                            <input
                                type="password"
                                name="password"
                                className="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <br />
                            <input
                                type="password"
                                name="confirmPassword"
                                className="confirm-password"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <br />
                            <button type="submit" className="signup-button">
                                <b>Sign Up</b>
                            </button>
                            <p>
                                Already have an account?{" "}
                                <Link to="/login" className="login-link">
                                    <b>Log in</b>
                                </Link>
                            </p>
                        </form>
                    </>
                ) : (
                    // Display success message upon successful signup
                    <div className="success-message">
                        <h1>Signup Successful!</h1>
                        <p>
                            Your account has been created successfully.<br/>You can
                            now log in.
                        </p>
                        <Link to="/login" className="login-link">
                            <b>Go to Login</b>
                        </Link>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default SignUpPage;
