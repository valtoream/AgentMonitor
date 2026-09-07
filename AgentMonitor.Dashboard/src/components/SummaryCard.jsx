import {
    Box,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

export default function SummaryCard({
    title,
    value,
    subtitle,
    icon,
}) {
    return (
        <Paper
            elevation={0}
            sx={{
                height: "100%",

                px: {
                    xs: 2,
                    sm: 2.25,
                    md: 2.5,
                },

                py: {
                    xs: 1.75,
                    sm: 2,
                    md: 2.25,
                },

                borderRadius: {
                    xs: 2,
                    sm: 2.5,
                },

                border: "1px solid",
                borderColor: "divider",

                backgroundColor:
                    "background.paper",

                transition:
                    "border-color 0.2s ease, transform 0.2s ease",

                "&:hover": {
                    borderColor:
                        "text.disabled",

                    transform: {
                        xs: "none",
                        md: "translateY(-1px)",
                    },
                },
            }}
        >
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={2}
                sx={{
                    height: "100%",
                }}
            >
                <Stack
                    spacing={0}
                    sx={{
                        minWidth: 0,
                        flex: 1,
                    }}
                >
                    <Typography
                        color="text.secondary"
                        sx={{
                            fontSize: {
                                xs: "0.78rem",
                                sm: "0.82rem",
                            },

                            fontWeight: 500,

                            lineHeight: 1.3,
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.5,

                            fontSize: {
                                xs: "1.75rem",
                                sm: "1.9rem",
                                md: "2rem",
                            },

                            lineHeight: 1.15,

                            fontWeight: 700,

                            letterSpacing:
                                "-0.025em",
                        }}
                    >
                        {value}
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: {
                                xs: 0.6,
                                sm: 0.75,
                            },

                            fontSize: {
                                xs: "0.72rem",
                                sm: "0.76rem",
                            },

                            lineHeight: 1.4,
                        }}
                    >
                        {subtitle}
                    </Typography>
                </Stack>

                <Box
                    sx={{
                        flexShrink: 0,

                        width: {
                            xs: 40,
                            sm: 44,
                        },

                        height: {
                            xs: 40,
                            sm: 44,
                        },

                        borderRadius: 2,

                        display: "grid",

                        placeItems: "center",

                        backgroundColor:
                            "action.hover",

                        color:
                            "text.secondary",

                        "& svg": {
                            fontSize: {
                                xs: 20,
                                sm: 22,
                            },
                        },
                    }}
                >
                    {icon}
                </Box>
            </Stack>
        </Paper>
    );
}