import {
    Box,
    LinearProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ComputerRoundedIcon from "@mui/icons-material/ComputerRounded";

import { useNavigate } from "react-router-dom";

import { StatusChip } from "./StatusChips";
import { formatLastSeen } from "../utils/formatters";

export default function DeviceTable({
    devices,
}) {
    const navigate = useNavigate();

    function openDeviceDetails(
        deviceId,
    ) {
        navigate(
            `/devices/${deviceId}`,
        );
    }

    function handleKeyDown(
        event,
        deviceId,
    ) {
        if (
            event.key === "Enter" ||
            event.key === " "
        ) {
            event.preventDefault();

            openDeviceDetails(
                deviceId,
            );
        }
    }

    function getLoggedOnUser(
        loggedOnUser,
    ) {
        if (!loggedOnUser) {
            return null;
        }

        const parts =
            loggedOnUser.split("\\");

        return (
            parts.at(-1) ||
            loggedOnUser
        );
    }

    function getHealthScore(
        healthScore,
    ) {
        const value =
            Number(healthScore);

        if (
            Number.isNaN(value)
        ) {
            return 0;
        }

        return Math.min(
            100,
            Math.max(0, value),
        );
    }

    if (devices.length === 0) {
        return (
            <Box
                sx={{
                    px: 2,
                    py: {
                        xs: 4,
                        sm: 5,
                    },
                    textAlign:
                        "center",
                }}
            >
                <Typography
                    fontWeight={600}
                >
                    No devices found
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mt: 0.5,
                    }}
                >
                    There are no
                    devices matching the
                    selected search and
                    filters.
                </Typography>
            </Box>
        );
    }

    return (
        <>
            {/* =====================================================
                DESKTOP / TABLET TABLE
            ===================================================== */}
            <TableContainer
                sx={{
                    display: {
                        xs: "none",
                        md: "block",
                    },
                }}
            >
                <Table
                    size="small"
                    sx={{
                        minWidth: 900,
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                Hostname
                            </TableCell>

                            <TableCell>
                                Current User
                            </TableCell>

                            <TableCell>
                                Device
                            </TableCell>

                            <TableCell>
                                Operating System
                            </TableCell>

                            <TableCell>
                                Status
                            </TableCell>

                            <TableCell>
                                Health
                            </TableCell>

                            <TableCell>
                                Last Seen
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {devices.map(
                            device => {
                                const userName =
                                    getLoggedOnUser(
                                        device.loggedOnUser,
                                    );

                                const healthScore =
                                    getHealthScore(
                                        device.healthScore,
                                    );

                                const deviceName =
                                    [
                                        device.manufacturer,
                                        device.model,
                                    ]
                                        .filter(
                                            Boolean,
                                        )
                                        .join(
                                            " ",
                                        );

                                return (
                                    <TableRow
                                        key={
                                            device.id
                                        }
                                        hover
                                        tabIndex={
                                            0
                                        }
                                        role="link"
                                        onClick={() =>
                                            openDeviceDetails(
                                                device.id,
                                            )
                                        }
                                        onKeyDown={event =>
                                            handleKeyDown(
                                                event,
                                                device.id,
                                            )
                                        }
                                        sx={{
                                            cursor:
                                                "pointer",

                                            "& td":
                                                {
                                                    py: 1.5,
                                                },

                                            "&:focus-visible":
                                                {
                                                    outline:
                                                        "2px solid",
                                                    outlineColor:
                                                        "primary.main",
                                                    outlineOffset:
                                                        "-2px",
                                                },

                                            "&:last-child td":
                                                {
                                                    borderBottom:
                                                        0,
                                                },
                                        }}
                                    >
                                        <TableCell>
                                            <Stack
                                                direction="row"
                                                spacing={
                                                    1
                                                }
                                                alignItems="center"
                                            >
                                                <Box
                                                    sx={{
                                                        width: 30,
                                                        height: 30,
                                                        borderRadius: 1.5,
                                                        display:
                                                            "grid",
                                                        placeItems:
                                                            "center",
                                                        bgcolor:
                                                            "action.hover",
                                                        color:
                                                            "text.secondary",

                                                        "& svg":
                                                            {
                                                                fontSize:
                                                                    17,
                                                            },
                                                    }}
                                                >
                                                    <ComputerRoundedIcon />
                                                </Box>

                                                <Typography
                                                    fontWeight={
                                                        600
                                                    }
                                                    noWrap
                                                >
                                                    {device.hostname ||
                                                        "Unknown"}
                                                </Typography>
                                            </Stack>
                                        </TableCell>

                                        <TableCell>
                                            {userName ? (
                                                <Stack
                                                    direction="row"
                                                    spacing={
                                                        0.75
                                                    }
                                                    alignItems="center"
                                                >
                                                    <PersonRoundedIcon
                                                        sx={{
                                                            fontSize:
                                                                17,
                                                            color:
                                                                "text.secondary",
                                                        }}
                                                    />

                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={
                                                            500
                                                        }
                                                        noWrap
                                                    >
                                                        {
                                                            userName
                                                        }
                                                    </Typography>
                                                </Stack>
                                            ) : (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    No active
                                                    user
                                                </Typography>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                fontWeight={
                                                    500
                                                }
                                            >
                                                {deviceName ||
                                                    "Unknown device"}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    maxWidth:
                                                        260,
                                                }}
                                                noWrap
                                                title={
                                                    device.operatingSystem ??
                                                    ""
                                                }
                                            >
                                                {device.operatingSystem ||
                                                    "Unknown"}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <StatusChip
                                                status={
                                                    device.status
                                                }
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <Box
                                                sx={{
                                                    minWidth:
                                                        90,
                                                }}
                                            >
                                                <Stack
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                    spacing={
                                                        1
                                                    }
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={
                                                            700
                                                        }
                                                    >
                                                        {
                                                            healthScore
                                                        }
                                                        /100
                                                    </Typography>
                                                </Stack>

                                                <LinearProgress
                                                    variant="determinate"
                                                    value={
                                                        healthScore
                                                    }
                                                    sx={{
                                                        mt: 0.6,
                                                        height: 4,
                                                        borderRadius:
                                                            10,
                                                        bgcolor:
                                                            "action.hover",

                                                        "& .MuiLinearProgress-bar":
                                                            {
                                                                borderRadius:
                                                                    10,
                                                            },
                                                    }}
                                                />
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                noWrap
                                            >
                                                {formatLastSeen(
                                                    device.lastSeenAtUtc,
                                                )}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                );
                            },
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* =====================================================
                MOBILE CARDS
            ===================================================== */}
            <Stack
                spacing={0}
                sx={{
                    display: {
                        xs: "flex",
                        md: "none",
                    },
                }}
            >
                {devices.map(
                    device => {
                        const userName =
                            getLoggedOnUser(
                                device.loggedOnUser,
                            );

                        const healthScore =
                            getHealthScore(
                                device.healthScore,
                            );

                        const deviceName =
                            [
                                device.manufacturer,
                                device.model,
                            ]
                                .filter(
                                    Boolean,
                                )
                                .join(" ");

                        return (
                            <Box
                                key={
                                    device.id
                                }
                                tabIndex={
                                    0
                                }
                                role="link"
                                onClick={() =>
                                    openDeviceDetails(
                                        device.id,
                                    )
                                }
                                onKeyDown={event =>
                                    handleKeyDown(
                                        event,
                                        device.id,
                                    )
                                }
                                sx={{
                                    px: 2,
                                    py: 2,

                                    cursor:
                                        "pointer",

                                    borderBottom:
                                        "1px solid",

                                    borderColor:
                                        "divider",

                                    transition:
                                        "background-color 0.15s ease",

                                    "&:hover":
                                        {
                                            bgcolor:
                                                "action.hover",
                                        },

                                    "&:focus-visible":
                                        {
                                            outline:
                                                "2px solid",
                                            outlineColor:
                                                "primary.main",
                                            outlineOffset:
                                                "-2px",
                                        },

                                    "&:last-child":
                                        {
                                            borderBottom:
                                                0,
                                        },
                                }}
                            >
                                {/* Top row */}
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="flex-start"
                                    spacing={2}
                                >
                                    <Stack
                                        direction="row"
                                        spacing={
                                            1
                                        }
                                        alignItems="center"
                                        sx={{
                                            minWidth:
                                                0,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                flexShrink:
                                                    0,

                                                width: 36,
                                                height: 36,

                                                borderRadius:
                                                    1.75,

                                                display:
                                                    "grid",

                                                placeItems:
                                                    "center",

                                                bgcolor:
                                                    "action.hover",

                                                color:
                                                    "text.secondary",

                                                "& svg":
                                                    {
                                                        fontSize:
                                                            19,
                                                    },
                                            }}
                                        >
                                            <ComputerRoundedIcon />
                                        </Box>

                                        <Box
                                            sx={{
                                                minWidth:
                                                    0,
                                            }}
                                        >
                                            <Typography
                                                fontWeight={
                                                    700
                                                }
                                                sx={{
                                                    fontSize:
                                                        "0.95rem",
                                                }}
                                                noWrap
                                            >
                                                {device.hostname ||
                                                    "Unknown"}
                                            </Typography>

                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    fontSize:
                                                        "0.78rem",
                                                }}
                                                noWrap
                                            >
                                                {deviceName ||
                                                    "Unknown device"}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Box
                                        sx={{
                                            flexShrink:
                                                0,
                                        }}
                                    >
                                        <StatusChip
                                            status={
                                                device.status
                                            }
                                        />
                                    </Box>
                                </Stack>

                                {/* Operating system */}
                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        mt: 1.5,
                                        fontSize:
                                            "0.8rem",
                                    }}
                                >
                                    {device.operatingSystem ||
                                        "Unknown operating system"}
                                </Typography>

                                {/* Current user */}
                                <Stack
                                    direction="row"
                                    spacing={0.75}
                                    alignItems="center"
                                    sx={{
                                        mt: 1,
                                    }}
                                >
                                    <PersonRoundedIcon
                                        sx={{
                                            fontSize:
                                                16,

                                            color:
                                                "text.secondary",
                                        }}
                                    />

                                    <Typography
                                        color={
                                            userName
                                                ? "text.primary"
                                                : "text.secondary"
                                        }
                                        sx={{
                                            fontSize:
                                                "0.8rem",
                                        }}
                                    >
                                        {userName ||
                                            "No active user"}
                                    </Typography>
                                </Stack>

                                {/* Health */}
                                <Box
                                    sx={{
                                        mt: 1.75,
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                    >
                                        <Typography
                                            color="text.secondary"
                                            sx={{
                                                fontSize:
                                                    "0.76rem",
                                            }}
                                        >
                                            Health
                                            Score
                                        </Typography>

                                        <Typography
                                            fontWeight={
                                                700
                                            }
                                            sx={{
                                                fontSize:
                                                    "0.82rem",
                                            }}
                                        >
                                            {
                                                healthScore
                                            }
                                            /100
                                        </Typography>
                                    </Stack>

                                    <LinearProgress
                                        variant="determinate"
                                        value={
                                            healthScore
                                        }
                                        sx={{
                                            mt: 0.75,
                                            height: 5,
                                            borderRadius:
                                                10,

                                            bgcolor:
                                                "action.hover",

                                            "& .MuiLinearProgress-bar":
                                                {
                                                    borderRadius:
                                                        10,
                                                },
                                        }}
                                    />
                                </Box>

                                {/* Footer */}
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    sx={{
                                        mt: 1.5,
                                    }}
                                >
                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            fontSize:
                                                "0.72rem",
                                        }}
                                    >
                                        Last seen
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize:
                                                "0.76rem",
                                            fontWeight:
                                                500,
                                        }}
                                    >
                                        {formatLastSeen(
                                            device.lastSeenAtUtc,
                                        )}
                                    </Typography>
                                </Stack>
                            </Box>
                        );
                    },
                )}
            </Stack>
        </>
    );
}