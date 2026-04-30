import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/login.css"; // Assuming we reuse the login styles

const RegisterDetails: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Retrieve state passed from RegisterEmail
    const { email, faculty } = location.state || { email: "", faculty: "" };

    const [name, setName] = useState("");
    const [batch, setBatch] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // If accessed directly without an email, redirect back
    if (!email) {
        navigate('/register');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (name.length < 2) {
            setError("Name must be at least 2 characters long");
            return;
        }

        if (!batch) {
            setError("Please enter your batch (e.g., E23)");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5001/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    faculty,
                    batch,
                    password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Success! Navigate to login
            navigate('/login', { state: { message: "Registration successful! Please log in." } });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <button className="back-btn" onClick={() => navigate("/register")}>
                &larr; Back
            </button>

            <div className="login-card">
                <div className="login-header">
                    <h2>Complete Profile</h2>
                    <p>Tell us a bit more about yourself.</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="batch">Batch</label>
                        <input
                            type="text"
                            id="batch"
                            placeholder="e.g. E23"
                            value={batch}
                            onChange={(e) => setBatch(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="error-message fade-in" style={{ color: '#ff6b6b', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}

                    <button type="submit" className="login-submit-btn" disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterDetails;
