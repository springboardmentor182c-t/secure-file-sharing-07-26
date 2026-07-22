import React, { useState } from "react";

import {
    TextField,
    Button,
    Typography,
    Paper,
    InputAdornment,
    IconButton,
    Link,
    Alert
} from "@mui/material";

import {
    Email,
    Lock,
    Visibility,
    VisibilityOff,
    Security,
} from "@mui/icons-material";

import axios from "axios";

import { useNavigate } from "react-router-dom";

const LoginForm = () => {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [formData, setFormData] = useState({

        email: "",

        password: "",

    });

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value,

        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        try {

            setLoading(true);

            const response = await axios.post(

                "http://localhost:8000/auth/login",

                {

                    email: formData.email,

                    password: formData.password

                }

            );

            alert(response.data.message);
            localStorage.setItem(
                "email",
                formData.email
            );
            navigate("/two-factor", {

                state: {

                    email: formData.email

                }

            });

        }

        catch (err) {

            if (err.response) {

                setError(err.response.data.detail);

            }

            else {

                setError("Cannot connect to server.");

            }

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <Paper elevation={5} sx={styles.card}>

            <Security sx={styles.icon} />

            <Typography variant="h4" sx={styles.title}>
                TrustShare
            </Typography>

            <Typography sx={styles.subtitle}>
                Secure File Sharing Platform
            </Typography>

            {error && (

                <Alert severity="error" sx={{ mt: 2 }}>

                    {error}

                </Alert>

            )}

            <form onSubmit={handleSubmit}>

                <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    margin="normal"
                    required
                    InputProps={{
                        startAdornment:
                            <InputAdornment position="start">
                                <Email />
                            </InputAdornment>
                    }}
                />

                <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    margin="normal"
                    required
                    InputProps={{
                        startAdornment:
                            <InputAdornment position="start">
                                <Lock />
                            </InputAdornment>,

                        endAdornment:
                            <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {
                                    showPassword
                                        ? <VisibilityOff />
                                        : <Visibility />
                                }
                            </IconButton>
                    }}
                />

                <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={styles.button}
                >

                    {loading ? "Logging In..." : "Login"}

                </Button>

            </form>

            <Link
                component="button"
                onClick={() => navigate("/forgot-password")}
                sx={styles.link}
            >
                Forgot Password?
            </Link>

            <Typography sx={styles.signup}>

                Don't have an account?

                <Link
                    component="button"
                    onClick={() => navigate("/signup")}
                    sx={{ ml: 1 }}
                >
                    Sign Up
                </Link>

            </Typography>

        </Paper>

    );

};

const styles = {

    card: {
        width: 420,
        padding: 4,
        borderRadius: "20px",
        textAlign: "center",
        background: "#ffffff"
    },

    icon: {
        fontSize: 55,
        color: "#795548"
    },

    title: {
        fontWeight: "700",
        color: "#5D4037"
    },

    subtitle: {
        color: "#8D6E63",
        marginBottom: 2
    },

    button: {
        marginTop: 3,
        padding: 1.3,
        background: "#795548",
        "&:hover": {
            background: "#5D4037"
        }
    },

    link: {
        marginTop: 2,
        color: "#795548"
    },

    signup: {
        marginTop: 2
    }

};

export default LoginForm;