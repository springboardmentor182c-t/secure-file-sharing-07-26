import React, { useState } from "react";

import {
    Paper,
    Typography,
    TextField,
    Button,
    InputAdornment,
    Alert
} from "@mui/material";

import {
    Person,
    Email,
    Lock,
    Security
} from "@mui/icons-material";

import axios from "axios";

import { useNavigate } from "react-router-dom";

const SignupForm = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({

        name: "",

        email: "",

        password: "",

        confirmPassword: ""

    });

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if (formData.password !== formData.confirmPassword) {

            setError("Passwords do not match.");

            return;

        }

        try {

            setLoading(true);

            await axios.post(
                "http://localhost:8000/auth/signup",
                {

                    username: formData.name,

                    email: formData.email,

                    password: formData.password

                }
            );

            navigate("/email-verification");

        }

        catch (err) {

            if (err.response) {

                setError(err.response.data.detail);

            }

            else {

                setError("Unable to connect to server.");

            }

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <Paper sx={styles.card} elevation={5}>

            <Security sx={styles.icon} />

            <Typography variant="h4" sx={styles.title}>
                Create Account
            </Typography>

            <Typography sx={styles.subtitle}>
                Join VaultShare Secure Workspace
            </Typography>

            {error && (

                <Alert severity="error" sx={{ mt: 2 }}>

                    {error}

                </Alert>

            )}

            <form onSubmit={handleSubmit}>

                <TextField
                    fullWidth
                    label="Username"
                    name="name"
                    margin="normal"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    InputProps={{
                        startAdornment:
                            <InputAdornment position="start">
                                <Person />
                            </InputAdornment>
                    }}
                />

                <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    margin="normal"
                    required
                    value={formData.email}
                    onChange={handleChange}
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
                    type="password"
                    margin="normal"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                        startAdornment:
                            <InputAdornment position="start">
                                <Lock />
                            </InputAdornment>
                    }}
                />

                <TextField
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    margin="normal"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    InputProps={{
                        startAdornment:
                            <InputAdornment position="start">
                                <Lock />
                            </InputAdornment>
                    }}
                />

                <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={styles.button}
                >

                    {loading ? "Creating Account..." : "Create Account"}

                </Button>

            </form>

        </Paper>

    );

};

const styles = {

    card: {

        width: 420,

        padding: 4,

        borderRadius: "20px",

        textAlign: "center"

    },

    icon: {

        fontSize: 55,

        color: "#795548"

    },

    title: {

        color: "#5D4037",

        fontWeight: 700

    },

    subtitle: {

        color: "#8D6E63"

    },

    button: {

        marginTop: 3,

        padding: 1.3,

        background: "#795548",

        "&:hover": {

            background: "#5D4037"

        }

    }

};

export default SignupForm;