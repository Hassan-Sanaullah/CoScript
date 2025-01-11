import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import "./LoginPage.css";
import Card from "./components/Card";
import { Link, useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [error, setError] = useState<string | null>(null); // State to handle errors
    const navigate = useNavigate(); // For navigation after successful login

    useEffect(() => {
        // Add a class to the <body> when this page is loaded
        document.body.className = "login-page";

        // Cleanup: Remove the class when the component is unmounted
        return () => {
            document.body.className = "";
        };
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch(`${apiUrl}/auth/signin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Handle the error message returned from the server
                setError(errorData.message || "An error occurred. Please try again.");
                return;
            }

            const data = await response.json();
            console.log("Login successful:", data);

            // Store the access token in localStorage
            localStorage.setItem("access_token", data.access_token);

            // Redirect the user to the dashboard or another protected page
            navigate("/dashboard"); // Adjust this to your app's route for the dashboard
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred.");
        }
    };

    return (
        <div className="app-container">
            <Card className="login-card">
                <Link to="/">
                    <img src="/logo_red.png" className="logo" alt="logo" />
                </Link>
                <h1>Log in</h1>

                {error && <div className="error-message">{error}</div>} {/* Show error message if any */}

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
                        type="password"
                        name="password"
                        className="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <br />
                    <a href="" className="forgot-password-link">
                        Forgot Password
                    </a>
                    <br />
                    <button type="submit" className="login-button">
                        <b>Log in</b>
                    </button>
                    <p>
                        Don't have an account?{" "}
                        <Link to="/signup" className="create-account-link">
                            <b>Create an account</b>
                        </Link>
                    </p>
                </form>
            </Card>
        </div>
    );
};

export default LoginPage;
