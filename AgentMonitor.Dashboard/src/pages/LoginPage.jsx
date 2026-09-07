import {
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";

export default function LoginPage({
    apiBaseUrl,
    onLogin,
}) {
    const [
        username,
        setUsername,
    ] = useState("");

    const [
        password,
        setPassword,
    ] = useState("");

    const [
        showPassword,
        setShowPassword,
    ] = useState(false);

    const [
        isSubmitting,
        setIsSubmitting,
    ] = useState(false);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");

    async function handleSubmit(
        event,
    ) {
        event.preventDefault();

        if (
            !username.trim() ||
            !password
        ) {
            setErrorMessage(
                "Enter your username and password.",
            );

            return;
        }

        try {
            setIsSubmitting(
                true,
            );

            setErrorMessage(
                "",
            );

            const response =
                await fetch(
                    `${apiBaseUrl}/api/auth/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            username:
                                username.trim(),

                            password,
                        }),
                    },
                );

            if (
                response.status ===
                401
            ) {
                throw new Error(
                    "Invalid username or password.",
                );
            }

            if (
                !response.ok
            ) {
                throw new Error(
                    "Could not sign in.",
                );
            }

            const data =
                await response.json();

            onLogin(data);
        } catch (error) {
            console.error(
                error,
            );

            setErrorMessage(
                error.message ||
                    "Could not connect to AgentMonitorAPI.",
            );
        } finally {
            setIsSubmitting(
                false,
            );
        }
    }

    return (
        <Box
            sx={{
                minHeight:
                    "100vh",

                display:
                    "grid",

                placeItems:
                    "center",

                bgcolor:
                    "#f4f6f8",

                px: {
                    xs: 2,
                    sm: 3,
                },

                py: {
                    xs: 3,
                    sm: 5,
                },
            }}
        >
            <Box
                sx={{
                    width:
                        "100%",

                    maxWidth:
                        430,
                }}
            >
                {/* BRAND */}
                <Stack
                    alignItems="center"
                    spacing={1}
                    sx={{
                        mb: {
                            xs: 2.5,
                            sm: 3,
                        },
                    }}
                >
                    <Box
                        sx={{
                            width: 54,
                            height: 54,

                            borderRadius:
                                2.25,

                            display:
                                "grid",

                            placeItems:
                                "center",

                            bgcolor:
                                "#111827",

                            color:
                                "#ffffff",

                            boxShadow:
                                "0 8px 24px rgba(17, 24, 39, 0.16)",
                        }}
                    >
                        <MonitorHeartRoundedIcon
                            sx={{
                                fontSize:
                                    29,
                            }}
                        />
                    </Box>

                    <Typography
                        fontWeight={700}
                        sx={{
                            mt: 0.5,

                            fontSize: {
                                xs:
                                    "1.75rem",

                                sm:
                                    "2rem",
                            },

                            lineHeight:
                                1.2,

                            letterSpacing:
                                "-0.025em",
                        }}
                    >
                        Agent Monitor
                    </Typography>

                    <Typography
                        color="text.secondary"
                        textAlign="center"
                        sx={{
                            fontSize: {
                                xs:
                                    "0.85rem",

                                sm:
                                    "0.92rem",
                            },
                        }}
                    >
                        Monitoring Console
                    </Typography>
                </Stack>

                {/* LOGIN CARD */}
                <Paper
                    component="form"
                    onSubmit={
                        handleSubmit
                    }
                    elevation={0}
                    sx={{
                        p: {
                            xs: 2.5,
                            sm: 3.5,
                        },

                        borderRadius: {
                            xs: 2,
                            sm: 2.5,
                        },

                        border:
                            "1px solid",

                        borderColor:
                            "divider",

                        bgcolor:
                            "background.paper",
                    }}
                >
                    <Box
                        sx={{
                            mb: 2.5,
                        }}
                    >
                        <Typography
                            fontWeight={700}
                            sx={{
                                fontSize:
                                    "1.15rem",
                            }}
                        >
                            Sign in
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 0.35,

                                fontSize:
                                    "0.8rem",
                            }}
                        >
                            Enter your dashboard credentials to continue.
                        </Typography>
                    </Box>

                    {errorMessage && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 2,

                                "& .MuiAlert-message":
                                    {
                                        fontSize:
                                            "0.8rem",
                                    },
                            }}
                        >
                            {
                                errorMessage
                            }
                        </Alert>
                    )}

                    <Stack
                        spacing={2}
                    >
                        <TextField
                            label="Username"
                            value={
                                username
                            }
                            onChange={event => {
                                setUsername(
                                    event
                                        .target
                                        .value,
                                );

                                if (
                                    errorMessage
                                ) {
                                    setErrorMessage(
                                        "",
                                    );
                                }
                            }}
                            autoComplete="username"
                            autoFocus
                            fullWidth
                            disabled={
                                isSubmitting
                            }
                            slotProps={{
                                input: {
                                    startAdornment:
                                        (
                                            <InputAdornment position="start">
                                                <PersonRoundedIcon
                                                    sx={{
                                                        fontSize:
                                                            20,

                                                        color:
                                                            "text.secondary",
                                                    }}
                                                />
                                            </InputAdornment>
                                        ),
                                },
                            }}
                        />

                        <TextField
                            label="Password"
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            value={
                                password
                            }
                            onChange={event => {
                                setPassword(
                                    event
                                        .target
                                        .value,
                                );

                                if (
                                    errorMessage
                                ) {
                                    setErrorMessage(
                                        "",
                                    );
                                }
                            }}
                            autoComplete="current-password"
                            fullWidth
                            disabled={
                                isSubmitting
                            }
                            slotProps={{
                                input: {
                                    startAdornment:
                                        (
                                            <InputAdornment position="start">
                                                <LockRoundedIcon
                                                    sx={{
                                                        fontSize:
                                                            20,

                                                        color:
                                                            "text.secondary",
                                                    }}
                                                />
                                            </InputAdornment>
                                        ),

                                    endAdornment:
                                        (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    edge="end"
                                                    size="small"
                                                    disabled={
                                                        isSubmitting
                                                    }
                                                    onClick={() =>
                                                        setShowPassword(
                                                            previous =>
                                                                !previous,
                                                        )
                                                    }
                                                    aria-label={
                                                        showPassword
                                                            ? "Hide password"
                                                            : "Show password"
                                                    }
                                                >
                                                    {showPassword ? (
                                                        <VisibilityOffRoundedIcon
                                                            sx={{
                                                                fontSize:
                                                                    20,
                                                            }}
                                                        />
                                                    ) : (
                                                        <VisibilityRoundedIcon
                                                            sx={{
                                                                fontSize:
                                                                    20,
                                                            }}
                                                        />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                },
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={
                                isSubmitting
                            }
                            startIcon={
                                isSubmitting ? (
                                    <CircularProgress
                                        size={
                                            17
                                        }
                                        color="inherit"
                                    />
                                ) : (
                                    <LoginRoundedIcon />
                                )
                            }
                            sx={{
                                mt:
                                    "4px !important",

                                minHeight:
                                    46,

                                textTransform:
                                    "none",

                                fontWeight:
                                    600,
                            }}
                        >
                            {isSubmitting
                                ? "Signing in..."
                                : "Sign In"}
                        </Button>
                    </Stack>
                </Paper>

                {/* FOOTER */}
                <Typography
                    color="text.disabled"
                    textAlign="center"
                    sx={{
                        mt: 2,

                        fontSize:
                            "0.7rem",
                    }}
                >
                    Agent Monitor · System Monitoring Platform
                </Typography>
            </Box>
        </Box>
    );
}