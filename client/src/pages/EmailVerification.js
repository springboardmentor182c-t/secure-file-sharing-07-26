import React, { useEffect, useState } from "react";

import axios from "axios";

import {
    Paper,
    Typography,
    Button,
    CircularProgress,
    Alert
} from "@mui/material";

import {
    MarkEmailRead
} from "@mui/icons-material";

import {
    useNavigate,
    useSearchParams
} from "react-router-dom";

const EmailVerification = () => {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const [loading, setLoading] = useState(true);

    const [success, setSuccess] = useState(false);

    const [message, setMessage] = useState("");

    useEffect(() => {

        const verifyEmail = async () => {

            if (!token) {

                setLoading(false);

                setSuccess(false);

                setMessage("Check your email for the verification link");

                return;

            }

            try {

                const response = await axios.get(
                    "http://localhost:8000/auth/verify-email",
                    {
                        params: {
                            token: token
                        }
                    }
                );

                setSuccess(true);

                setMessage(response.data.message);

            }

            catch (error) {

                setSuccess(false);

                setMessage(

                    error.response?.data?.detail ||

                    "Email verification failed."

                );

            }

            finally {

                setLoading(false);

            }

        };

        verifyEmail();

    }, [token]);

    return (

        <div style={styles.container}>

            <Paper sx={styles.card} elevation={5}>

                <MarkEmailRead sx={styles.icon} />

                <Typography variant="h4" sx={styles.title}>

                    Email Verification

                </Typography>

                {loading ? (

                    <>

                        <CircularProgress sx={{ mt: 3 }} />

                        <Typography sx={{ mt: 2 }}>

                            Verifying your email...

                        </Typography>

                    </>

                ) : (

                    <>

                        <Alert
                            severity={success ? "success" : "error"}
                            sx={{ mt: 3 }}
                        >

                            {message}

                        </Alert>

                        <Button

                            variant="contained"

                            sx={styles.button}

                            onClick={() => navigate("/login")}

                        >

                            Continue to Login

                        </Button>

                    </>

                )}

            </Paper>

        </div>

    );

};

const styles = {

    container: {

        minHeight: "100vh",

        background: "#F5EBDD",

        display: "flex",

        justifyContent: "center",

        alignItems: "center"

    },

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

        fontWeight: 700,

        color: "#5D4037"

    },

    button: {

        marginTop: 3,

        background: "#795548",

        padding: "10px 30px",

        "&:hover": {

            background: "#5D4037"

        }

    }

};

export default EmailVerification;