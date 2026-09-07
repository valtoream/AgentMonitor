import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    LinearProgress,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ComputerRoundedIcon from "@mui/icons-material/ComputerRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";
import LanRoundedIcon from "@mui/icons-material/LanRounded";
import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from "recharts";

import {
    StatusChip,
} from "../components/StatusChips";

import {
    formatBytes,
    formatLastSeen,
    formatPercent,
} from "../utils/formatters";

const apiBaseUrl =
    "";

// =============================================================
// HELPERS
// =============================================================

function parseJson(value) {
    if (!value) {
        return null;
    }

    if (
        typeof value !== "string"
    ) {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

function getProperty(
    item,
    ...propertyNames
) {
    if (
        !item ||
        typeof item !== "object"
    ) {
        return null;
    }

    for (
        const propertyName
        of propertyNames
    ) {
        if (
            item[propertyName] !==
            undefined
        ) {
            return item[
                propertyName
            ];
        }
    }

    return null;
}

function formatDate(dateValue) {
    if (!dateValue) {
        return "—";
    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        "bg-BG",
        {
            timeZone:
                "Europe/Sofia",

            year: "numeric",
            month: "2-digit",
            day: "2-digit",

            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",

            hour12: false,
        },
    ).format(date);
}

function formatTime(dateValue) {
    if (!dateValue) {
        return "—";
    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        "bg-BG",
        {
            timeZone:
                "Europe/Sofia",

            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",

            hour12: false,
        },
    ).format(date);
}

function formatLoggedOnUser(
    loggedOnUser,
) {
    if (!loggedOnUser) {
        return "No active user";
    }

    const parts =
        loggedOnUser.split("\\");

    return (
        parts.at(-1) ||
        loggedOnUser
    );
}

function normalizePercentage(
    value,
) {
    const numericValue =
        Number(value);

    if (
        Number.isNaN(
            numericValue,
        )
    ) {
        return 0;
    }

    return Math.min(
        Math.max(
            numericValue,
            0,
        ),
        100,
    );
}

// =============================================================
// BOOLEAN STATUS
// =============================================================

function BooleanStatus({
    value,
}) {
    if (value === true) {
        return (
            <Chip
                size="small"
                variant="outlined"
                icon={
                    <CheckCircleRoundedIcon />
                }
                label="Yes"
                color="success"
                sx={{
                    height: 24,
                }}
            />
        );
    }

    if (value === false) {
        return (
            <Chip
                size="small"
                variant="outlined"
                icon={
                    <CancelRoundedIcon />
                }
                label="No"
                color="error"
                sx={{
                    height: 24,
                }}
            />
        );
    }

    return (
        <Chip
            size="small"
            variant="outlined"
            icon={
                <HelpRoundedIcon />
            }
            label="Unknown"
            sx={{
                height: 24,
            }}
        />
    );
}

// =============================================================
// DETAIL CARD
// =============================================================

function DetailCard({
    title,
    subtitle,
    icon,
    children,
}) {
    return (
        <Paper
            elevation={0}
            sx={{
                height: "100%",

                borderRadius: {
                    xs: 2,
                    sm: 2.5,
                },

                border:
                    "1px solid",

                borderColor:
                    "divider",

                overflow:
                    "hidden",

                bgcolor:
                    "background.paper",
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                spacing={1.1}
                sx={{
                    px: {
                        xs: 2,
                        sm: 2.5,
                    },

                    py: {
                        xs: 1.5,
                        sm: 1.75,
                    },

                    borderBottom:
                        "1px solid",

                    borderColor:
                        "divider",
                }}
            >
                <Box
                    sx={{
                        width: 34,
                        height: 34,

                        flexShrink: 0,

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

                        "& svg": {
                            fontSize: 19,
                        },
                    }}
                >
                    {icon}
                </Box>

                <Box
                    sx={{
                        minWidth: 0,
                    }}
                >
                    <Typography
                        fontWeight={700}
                        sx={{
                            fontSize: {
                                xs: "1rem",
                                sm: "1.08rem",
                            },
                        }}
                    >
                        {title}
                    </Typography>

                    {subtitle && (
                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 0.1,
                                fontSize:
                                    "0.74rem",
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            </Stack>

            <Box
                sx={{
                    px: {
                        xs: 2,
                        sm: 2.5,
                    },

                    py: {
                        xs: 1.5,
                        sm: 1.8,
                    },
                }}
            >
                {children}
            </Box>
        </Paper>
    );
}

// =============================================================
// DETAIL ROW
// =============================================================

function DetailRow({
    label,
    value,
}) {
    return (
        <Stack
            direction={{
                xs: "column",
                sm: "row",
            }}
            justifyContent="space-between"
            alignItems={{
                xs: "flex-start",
                sm: "center",
            }}
            spacing={{
                xs: 0.25,
                sm: 2,
            }}
            sx={{
                py: 0.8,

                "& + &": {
                    borderTop:
                        "1px solid",

                    borderColor:
                        "rgba(0, 0, 0, 0.045)",
                },
            }}
        >
            <Typography
                color="text.secondary"
                sx={{
                    fontSize:
                        "0.8rem",
                }}
            >
                {label}
            </Typography>

            <Typography
                component="div"
                fontWeight={600}
                sx={{
                    maxWidth: {
                        xs: "100%",
                        sm: "65%",
                    },

                    textAlign: {
                        xs: "left",
                        sm: "right",
                    },

                    fontSize:
                        "0.82rem",

                    wordBreak:
                        "break-word",
                }}
            >
                {value ?? "—"}
            </Typography>
        </Stack>
    );
}

// =============================================================
// QUICK METRIC CARD
// =============================================================

function MetricCard({
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
                    xs: 1.75,
                    sm: 2,
                },

                py: {
                    xs: 1.5,
                    sm: 1.75,
                },

                borderRadius: 2,

                border:
                    "1px solid",

                borderColor:
                    "divider",

                bgcolor:
                    "background.paper",
            }}
        >
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={1.5}
            >
                <Box
                    sx={{
                        minWidth: 0,
                    }}
                >
                    <Typography
                        color="text.secondary"
                        sx={{
                            fontSize:
                                "0.74rem",

                            fontWeight:
                                500,
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        fontWeight={700}
                        sx={{
                            mt: 0.4,

                            fontSize: {
                                xs: "1.15rem",
                                sm: "1.25rem",
                            },

                            lineHeight: 1.2,

                            wordBreak:
                                "break-word",
                        }}
                    >
                        {value}
                    </Typography>

                    {subtitle && (
                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 0.4,

                                fontSize:
                                    "0.7rem",
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>

                <Box
                    sx={{
                        width: 36,
                        height: 36,

                        flexShrink: 0,

                        display: "grid",

                        placeItems:
                            "center",

                        borderRadius:
                            1.75,

                        bgcolor:
                            "action.hover",

                        color:
                            "text.secondary",

                        "& svg": {
                            fontSize: 19,
                        },
                    }}
                >
                    {icon}
                </Box>
            </Stack>
        </Paper>
    );
}

// =============================================================
// USAGE BAR
// =============================================================

function UsageBar({
    label,
    value,
}) {
    const safeValue =
        normalizePercentage(
            value,
        );

    return (
        <Box
            sx={{
                mt: 1.5,
            }}
        >
            <Stack
                direction="row"
                justifyContent="space-between"
                sx={{
                    mb: 0.75,
                }}
            >
                <Typography
                    color="text.secondary"
                    sx={{
                        fontSize:
                            "0.78rem",
                    }}
                >
                    {label}
                </Typography>

                <Typography
                    fontWeight={700}
                    sx={{
                        fontSize:
                            "0.78rem",
                    }}
                >
                    {formatPercent(
                        safeValue,
                    )}
                </Typography>
            </Stack>

            <LinearProgress
                variant="determinate"
                value={safeValue}
                sx={{
                    height: 5,

                    borderRadius: 10,

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
    );
}

// =============================================================
// INSTALLED SOFTWARE
// =============================================================

function InstalledSoftwareTable({
    value,
}) {
    const software =
        useMemo(
            () =>
                parseJson(
                    value,
                ),
            [value],
        );

    if (
        !Array.isArray(
            software,
        ) ||
        software.length === 0
    ) {
        return (
            <Typography
                color="text.secondary"
                sx={{
                    fontSize:
                        "0.82rem",
                }}
            >
                No installed software
                information.
            </Typography>
        );
    }

    return (
        <>
            <Typography
                color="text.secondary"
                sx={{
                    mb: 1.5,

                    fontSize:
                        "0.8rem",
                }}
            >
                {software.length}{" "}
                installed{" "}
                {software.length === 1
                    ? "application"
                    : "applications"}
            </Typography>

            <TableContainer
                sx={{
                    maxHeight: 480,
                    overflowX: "auto",
                }}
            >
                <Table
                    stickyHeader
                    size="small"
                    sx={{
                        minWidth: 650,
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    width: 60,
                                }}
                            >
                                #
                            </TableCell>

                            <TableCell>
                                Application
                            </TableCell>

                            <TableCell>
                                Version
                            </TableCell>

                            <TableCell>
                                Publisher
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {software.map(
                            (
                                item,
                                index,
                            ) => {
                                const name =
                                    getProperty(
                                        item,
                                        "name",
                                        "Name",
                                        "displayName",
                                        "DisplayName",
                                    );

                                const version =
                                    getProperty(
                                        item,
                                        "version",
                                        "Version",
                                        "displayVersion",
                                        "DisplayVersion",
                                    );

                                const publisher =
                                    getProperty(
                                        item,
                                        "publisher",
                                        "Publisher",
                                    );

                                return (
                                    <TableRow
                                        key={`${name ?? "software"}-${index}`}
                                        hover
                                    >
                                        <TableCell>
                                            {
                                                index +
                                                1
                                            }
                                        </TableCell>

                                        <TableCell>
                                            <Typography
                                                fontWeight={
                                                    600
                                                }
                                                sx={{
                                                    fontSize:
                                                        "0.8rem",
                                                }}
                                            >
                                                {name ??
                                                    "Unknown application"}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            {version ??
                                                "—"}
                                        </TableCell>

                                        <TableCell>
                                            {publisher ??
                                                "—"}
                                        </TableCell>
                                    </TableRow>
                                );
                            },
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

// =============================================================
// NETWORK
// =============================================================

function NetworkTable({
    value,
}) {
    const adapters =
        useMemo(
            () =>
                parseJson(
                    value,
                ),
            [value],
        );

    if (
        !Array.isArray(
            adapters,
        ) ||
        adapters.length === 0
    ) {
        return (
            <Typography
                color="text.secondary"
                sx={{
                    fontSize:
                        "0.82rem",
                }}
            >
                No network configuration
                information.
            </Typography>
        );
    }

    return (
        <>
            <Typography
                color="text.secondary"
                sx={{
                    mb: 1.5,

                    fontSize:
                        "0.8rem",
                }}
            >
                {adapters.length}{" "}
                detected network{" "}
                {adapters.length === 1
                    ? "adapter"
                    : "adapters"}
            </Typography>

            <TableContainer
                sx={{
                    maxHeight: 520,
                    overflowX: "auto",
                }}
            >
                <Table
                    stickyHeader
                    size="small"
                    sx={{
                        minWidth: 1250,
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                Adapter
                            </TableCell>

                            <TableCell>
                                Description
                            </TableCell>

                            <TableCell>
                                Type
                            </TableCell>

                            <TableCell>
                                Status
                            </TableCell>

                            <TableCell>
                                IPv4
                            </TableCell>

                            <TableCell>
                                IPv6
                            </TableCell>

                            <TableCell>
                                Gateway
                            </TableCell>

                            <TableCell>
                                DNS
                            </TableCell>

                            <TableCell>
                                DHCP
                            </TableCell>

                            <TableCell>
                                MAC Address
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {adapters.map(
                            (
                                item,
                                index,
                            ) => {
                                const name =
                                    item.Name ??
                                    item.name ??
                                    `Adapter ${index + 1}`;

                                const description =
                                    item.Description ??
                                    item.description ??
                                    "—";

                                const type =
                                    item.IsWireless ===
                                    true
                                        ? "Wireless"
                                        : "Ethernet";

                                const status =
                                    item.IsUp ===
                                    true
                                        ? "Up"
                                        : "Down";

                                const ipv4 =
                                    Array.isArray(
                                        item.IPv4Addresses,
                                    ) &&
                                    item
                                        .IPv4Addresses
                                        .length >
                                        0
                                        ? item.IPv4Addresses.join(
                                              ", ",
                                          )
                                        : "—";

                                const ipv6 =
                                    Array.isArray(
                                        item.IPv6Addresses,
                                    ) &&
                                    item
                                        .IPv6Addresses
                                        .length >
                                        0
                                        ? item.IPv6Addresses.join(
                                              ", ",
                                          )
                                        : "—";

                                const gateways =
                                    Array.isArray(
                                        item.DefaultGateways,
                                    ) &&
                                    item
                                        .DefaultGateways
                                        .length >
                                        0
                                        ? item.DefaultGateways.join(
                                              ", ",
                                          )
                                        : "—";

                                const dnsServers =
                                    Array.isArray(
                                        item.DnsServers,
                                    ) &&
                                    item
                                        .DnsServers
                                        .length >
                                        0
                                        ? item.DnsServers.join(
                                              ", ",
                                          )
                                        : "—";

                                const dhcp =
                                    item.IsDhcpEnabled ===
                                    true
                                        ? "Enabled"
                                        : "Disabled";

                                const macAddress =
                                    item.MacAddress ||
                                    "—";

                                return (
                                    <TableRow
                                        key={`${name}-${index}`}
                                        hover
                                    >
                                        <TableCell>
                                            <Typography
                                                fontWeight={
                                                    600
                                                }
                                                sx={{
                                                    fontSize:
                                                        "0.8rem",
                                                }}
                                            >
                                                {
                                                    name
                                                }
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            {
                                                description
                                            }
                                        </TableCell>

                                        <TableCell>
                                            {
                                                type
                                            }
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                size="small"
                                                variant="outlined"
                                                color={
                                                    item.IsUp
                                                        ? "success"
                                                        : "default"
                                                }
                                                label={
                                                    status
                                                }
                                            />
                                        </TableCell>

                                        <TableCell>
                                            {
                                                ipv4
                                            }
                                        </TableCell>

                                        <TableCell>
                                            {
                                                ipv6
                                            }
                                        </TableCell>

                                        <TableCell>
                                            {
                                                gateways
                                            }
                                        </TableCell>

                                        <TableCell>
                                            {
                                                dnsServers
                                            }
                                        </TableCell>

                                        <TableCell>
                                            {
                                                dhcp
                                            }
                                        </TableCell>

                                        <TableCell>
                                            {
                                                macAddress
                                            }
                                        </TableCell>
                                    </TableRow>
                                );
                            },
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

// =============================================================
// ISSUES
// =============================================================

function IssuesSection({
    value,
}) {
    const issues =
        useMemo(
            () =>
                parseJson(
                    value,
                ),
            [value],
        );

    if (
        !Array.isArray(
            issues,
        ) ||
        issues.length === 0
    ) {
        return (
            <Alert severity="success">
                No issues were detected
                during this health check.
            </Alert>
        );
    }

    return (
        <Stack spacing={1.25}>
            {issues.map(
                (
                    issue,
                    index,
                ) => {
                    const message =
                        getProperty(
                            issue,
                            "message",
                            "Message",
                            "description",
                            "Description",
                            "title",
                            "Title",
                        ) ??
                        JSON.stringify(
                            issue,
                        );

                    const severity =
                        getProperty(
                            issue,
                            "severity",
                            "Severity",
                        ) ??
                        "Warning";

                    return (
                        <Alert
                            key={
                                index
                            }
                            severity={
                                String(
                                    severity,
                                ).toLowerCase() ===
                                "critical"
                                    ? "error"
                                    : "warning"
                            }
                            icon={
                                <WarningAmberRoundedIcon />
                            }
                        >
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
                                    severity
                                }
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.2,

                                    fontSize:
                                        "0.8rem",
                                }}
                            >
                                {
                                    message
                                }
                            </Typography>
                        </Alert>
                    );
                },
            )}
        </Stack>
    );
}

// =============================================================
// HEALTH SCORE CHART
// =============================================================

function HealthScoreHistoryChart({
    history,
}) {
    const chartData =
        useMemo(() => {
            if (
                !Array.isArray(
                    history,
                )
            ) {
                return [];
            }

            return [
                ...history,
            ]
                .slice(0, 30)
                .reverse()
                .map(item => ({
                    id:
                        item.id,

                    healthScore:
                        Number(
                            item.healthScore ??
                                0,
                        ),

                    collectedAtUtc:
                        item.collectedAtUtc,

                    time:
                        formatTime(
                            item.collectedAtUtc,
                        ),
                }));
        }, [history]);

    if (
        chartData.length === 0
    ) {
        return (
            <Typography
                color="text.secondary"
                sx={{
                    fontSize:
                        "0.82rem",
                }}
            >
                No health score history
                is available.
            </Typography>
        );
    }

    return (
        <Box
            sx={{
                width: "100%",

                height: {
                    xs: 220,
                    sm: 280,
                },

                mb: 2,
            }}
        >
            <ResponsiveContainer
                width="100%"
                height="100%"
            >
                <LineChart
                    data={
                        chartData
                    }
                    margin={{
                        top: 10,
                        right: 15,
                        left: -20,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={
                            false
                        }
                    />

                    <XAxis
                        dataKey="time"
                        minTickGap={
                            40
                        }
                        tick={{
                            fontSize:
                                11,
                        }}
                    />

                    <YAxis
                        domain={[
                            0,
                            100,
                        ]}
                        allowDecimals={
                            false
                        }
                        tick={{
                            fontSize:
                                11,
                        }}
                    />

                    <RechartsTooltip
                        labelFormatter={(
                            _,
                            payload,
                        ) => {
                            const item =
                                payload?.[0]
                                    ?.payload;

                            return item
                                ? formatDate(
                                      item.collectedAtUtc,
                                  )
                                : "";
                        }}
                        formatter={value => [
                            `${value}/100`,
                            "Health Score",
                        ]}
                    />

                    <Line
                        type="monotone"
                        dataKey="healthScore"
                        stroke="#1976d2"
                        strokeWidth={
                            2
                        }
                        dot={{
                            r: 2,
                        }}
                        activeDot={{
                            r: 4,
                        }}
                        isAnimationActive={
                            false
                        }
                    />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
}

// =============================================================
// HEALTH CHECK HISTORY
// =============================================================

function HealthCheckHistoryTable({
    history,
    selectedHealthCheckId,
    loadingHealthCheckId,
    onSelect,
    onShowLatest,
    page,
    totalPages,
    totalCount,
    onPreviousPage,
    onNextPage,
}) {
    if (
        !Array.isArray(
            history,
        ) ||
        history.length === 0
    ) {
        return (
            <Typography
                color="text.secondary"
                sx={{
                    fontSize:
                        "0.82rem",
                }}
            >
                No health check history
                is available.
            </Typography>
        );
    }

    return (
        <>
            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                justifyContent="space-between"
                alignItems={{
                    xs: "stretch",
                    sm: "center",
                }}
                spacing={1}
                sx={{
                    mb: 1.5,
                }}
            >
                <Typography
                    color="text.secondary"
                    sx={{
                        fontSize:
                            "0.78rem",
                    }}
                >
                    Showing{" "}
                    {history.length} of{" "}
                    {totalCount} recorded
                    health checks.
                </Typography>

                <Button
                    size="small"
                    variant={
                        selectedHealthCheckId
                            ? "outlined"
                            : "contained"
                    }
                    onClick={
                        onShowLatest
                    }
                    sx={{
                        textTransform:
                            "none",
                    }}
                >
                    Show latest
                </Button>
            </Stack>

            {/* DESKTOP */}
            <TableContainer
                sx={{
                    display: {
                        xs: "none",
                        md: "block",
                    },

                    maxHeight: 520,
                }}
            >
                <Table
                    stickyHeader
                    size="small"
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                Collected
                            </TableCell>

                            <TableCell>
                                Health
                            </TableCell>

                            <TableCell>
                                Status
                            </TableCell>

                            <TableCell>
                                Disk Usage
                            </TableCell>

                            <TableCell>
                                Available Memory
                            </TableCell>

                            <TableCell>
                                Antivirus
                            </TableCell>

                            <TableCell>
                                Pending Updates
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {history.map(
                            item => {
                                const isSelected =
                                    item.id ===
                                    selectedHealthCheckId;

                                return (
                                    <TableRow
                                        key={
                                            item.id
                                        }
                                        hover
                                        selected={
                                            isSelected
                                        }
                                        onClick={() =>
                                            onSelect(
                                                item.id,
                                            )
                                        }
                                        sx={{
                                            cursor:
                                                "pointer",

                                            "& td":
                                                {
                                                    py: 1.25,
                                                },
                                        }}
                                    >
                                        <TableCell>
                                            {formatDate(
                                                item.collectedAtUtc,
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Typography
                                                fontWeight={
                                                    700
                                                }
                                            >
                                                {
                                                    item.healthScore
                                                }
                                                /100
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <StatusChip
                                                status={
                                                    item.status
                                                }
                                            />
                                        </TableCell>

                                        <TableCell>
                                            {formatPercent(
                                                item.diskUsagePercent,
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {formatBytes(
                                                item.availableMemoryBytes,
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <BooleanStatus
                                                value={
                                                    item.isAntivirusEnabled
                                                }
                                            />
                                        </TableCell>

                                        <TableCell>
                                            {loadingHealthCheckId ===
                                            item.id ? (
                                                <CircularProgress
                                                    size={
                                                        18
                                                    }
                                                />
                                            ) : (
                                                item.pendingUpdatesCount
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            },
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* MOBILE */}
            <Stack
                spacing={1}
                sx={{
                    display: {
                        xs: "flex",
                        md: "none",
                    },
                }}
            >
                {history.map(
                    item => {
                        const isSelected =
                            item.id ===
                            selectedHealthCheckId;

                        return (
                            <Box
                                key={
                                    item.id
                                }
                                onClick={() =>
                                    onSelect(
                                        item.id,
                                    )
                                }
                                sx={{
                                    p: 1.5,

                                    border:
                                        "1px solid",

                                    borderColor:
                                        isSelected
                                            ? "primary.main"
                                            : "divider",

                                    bgcolor:
                                        isSelected
                                            ? "action.selected"
                                            : "background.paper",

                                    borderRadius:
                                        1.75,

                                    cursor:
                                        "pointer",
                                }}
                            >
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    spacing={1}
                                >
                                    <Typography
                                        fontWeight={
                                            600
                                        }
                                        sx={{
                                            fontSize:
                                                "0.78rem",
                                        }}
                                    >
                                        {formatDate(
                                            item.collectedAtUtc,
                                        )}
                                    </Typography>

                                    <StatusChip
                                        status={
                                            item.status
                                        }
                                    />
                                </Stack>

                                <Grid
                                    container
                                    spacing={1.25}
                                    sx={{
                                        mt: 0.75,
                                    }}
                                >
                                    <Grid
                                        size={{
                                            xs: 6,
                                        }}
                                    >
                                        <Typography
                                            color="text.secondary"
                                            sx={{
                                                fontSize:
                                                    "0.68rem",
                                            }}
                                        >
                                            Health
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
                                                item.healthScore
                                            }
                                            /100
                                        </Typography>
                                    </Grid>

                                    <Grid
                                        size={{
                                            xs: 6,
                                        }}
                                    >
                                        <Typography
                                            color="text.secondary"
                                            sx={{
                                                fontSize:
                                                    "0.68rem",
                                            }}
                                        >
                                            Disk Usage
                                        </Typography>

                                        <Typography
                                            fontWeight={
                                                600
                                            }
                                            sx={{
                                                fontSize:
                                                    "0.82rem",
                                            }}
                                        >
                                            {formatPercent(
                                                item.diskUsagePercent,
                                            )}
                                        </Typography>
                                    </Grid>

                                    <Grid
                                        size={{
                                            xs: 6,
                                        }}
                                    >
                                        <Typography
                                            color="text.secondary"
                                            sx={{
                                                fontSize:
                                                    "0.68rem",
                                            }}
                                        >
                                            Available Memory
                                        </Typography>

                                        <Typography
                                            fontWeight={
                                                600
                                            }
                                            sx={{
                                                fontSize:
                                                    "0.82rem",
                                            }}
                                        >
                                            {formatBytes(
                                                item.availableMemoryBytes,
                                            )}
                                        </Typography>
                                    </Grid>

                                    <Grid
                                        size={{
                                            xs: 6,
                                        }}
                                    >
                                        <Typography
                                            color="text.secondary"
                                            sx={{
                                                fontSize:
                                                    "0.68rem",
                                            }}
                                        >
                                            Pending Updates
                                        </Typography>

                                        <Typography
                                            fontWeight={
                                                600
                                            }
                                            sx={{
                                                fontSize:
                                                    "0.82rem",
                                            }}
                                        >
                                            {
                                                item.pendingUpdatesCount
                                            }
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        );
                    },
                )}
            </Stack>

            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                justifyContent="space-between"
                alignItems={{
                    xs: "stretch",
                    sm: "center",
                }}
                spacing={1.5}
                sx={{
                    mt: 2,
                }}
            >
                <Typography
                    color="text.secondary"
                    sx={{
                        fontSize:
                            "0.75rem",
                    }}
                >
                    {totalCount} total
                    health checks
                </Typography>

                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent={{
                        xs: "space-between",
                        sm: "flex-end",
                    }}
                >
                    <Button
                        size="small"
                        variant="outlined"
                        disabled={
                            page <= 1
                        }
                        onClick={
                            onPreviousPage
                        }
                        sx={{
                            textTransform:
                                "none",
                        }}
                    >
                        Previous
                    </Button>

                    <Typography
                        fontWeight={600}
                        sx={{
                            fontSize:
                                "0.75rem",
                            whiteSpace:
                                "nowrap",
                        }}
                    >
                        Page {page} of{" "}
                        {totalPages ||
                            1}
                    </Typography>

                    <Button
                        size="small"
                        variant="outlined"
                        disabled={
                            totalPages ===
                                0 ||
                            page >=
                                totalPages
                        }
                        onClick={
                            onNextPage
                        }
                        sx={{
                            textTransform:
                                "none",
                        }}
                    >
                        Next
                    </Button>
                </Stack>
            </Stack>
        </>
    );
}

// =============================================================
// PAGE
// =============================================================

export default function DeviceDetailsPage({
    authenticatedFetch,
}) {
    const { deviceId } =
        useParams();

    const navigate =
        useNavigate();

    const [
        device,
        setDevice,
    ] = useState(null);

    const [
        healthHistory,
        setHealthHistory,
    ] = useState([]);

    const [
        selectedHealthCheck,
        setSelectedHealthCheck,
    ] = useState(null);

    const [
        loadingHealthCheckId,
        setLoadingHealthCheckId,
    ] = useState(null);

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        isRefreshing,
        setIsRefreshing,
    ] = useState(false);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");

    const [
        historyPage,
        setHistoryPage,
    ] = useState(1);

    const [
        historyPageSize,
    ] = useState(50);

    const [
        historyTotalCount,
        setHistoryTotalCount,
    ] = useState(0);

    const [
        historyTotalPages,
        setHistoryTotalPages,
    ] = useState(0);

    // =========================================================
    // LOAD DEVICE
    // =========================================================

    const loadDeviceDetails =
        useCallback(
            async (
                showFullLoader =
                    false,
            ) => {
                try {
                    if (
                        showFullLoader
                    ) {
                        setIsLoading(
                            true,
                        );
                    } else {
                        setIsRefreshing(
                            true,
                        );
                    }

                    setErrorMessage(
                        "",
                    );

                    const [
                        detailsResponse,
                        historyResponse,
                    ] =
                        await Promise.all(
                            [
                                authenticatedFetch(
                                    `${apiBaseUrl}/api/devices/${deviceId}/details`,
                                ),

                                authenticatedFetch(
                                    `${apiBaseUrl}/api/devices/${deviceId}/health-checks?page=${historyPage}&pageSize=${historyPageSize}`,
                                ),
                            ],
                        );

                    if (
                        detailsResponse.status ===
                            401 ||
                        historyResponse.status ===
                            401
                    ) {
                        return;
                    }

                    if (
                        detailsResponse.status ===
                            404 ||
                        historyResponse.status ===
                            404
                    ) {
                        throw new Error(
                            "Device was not found.",
                        );
                    }

                    if (
                        !detailsResponse.ok
                    ) {
                        throw new Error(
                            `Could not load device details. Status: ${detailsResponse.status}`,
                        );
                    }

                    if (
                        !historyResponse.ok
                    ) {
                        throw new Error(
                            `Could not load health check history. Status: ${historyResponse.status}`,
                        );
                    }

                    const [
                        deviceData,
                        historyData,
                    ] =
                        await Promise.all(
                            [
                                detailsResponse.json(),
                                historyResponse.json(),
                            ],
                        );

                    const historyItems =
                        Array.isArray(
                            historyData.items,
                        )
                            ? historyData.items
                            : [];

                    setDevice(
                        deviceData,
                    );

                    setHealthHistory(
                        historyItems,
                    );

                    setHistoryTotalCount(
                        historyData.totalCount ??
                            0,
                    );

                    setHistoryTotalPages(
                        historyData.totalPages ??
                            0,
                    );

                    if (
                        historyData.page &&
                        historyData.page !==
                            historyPage
                    ) {
                        setHistoryPage(
                            historyData.page,
                        );
                    }

                    setSelectedHealthCheck(
                        currentSelection => {
                            if (
                                !currentSelection
                            ) {
                                return null;
                            }

                            const stillExists =
                                historyItems.some(
                                    item =>
                                        item.id ===
                                        currentSelection.id,
                                );

                            return stillExists
                                ? currentSelection
                                : null;
                        },
                    );
                } catch (error) {
                    console.error(
                        error,
                    );

                    setErrorMessage(
                        error instanceof
                            Error
                            ? error.message
                            : "Could not connect to AgentMonitorAPI.",
                    );
                } finally {
                    setIsLoading(
                        false,
                    );

                    setIsRefreshing(
                        false,
                    );
                }
            },
            [
                deviceId,
                historyPage,
                historyPageSize,
                authenticatedFetch,
            ],
        );

    useEffect(() => {
        loadDeviceDetails(
            true,
        );
    }, [loadDeviceDetails]);

    // =========================================================
    // HISTORICAL HEALTH CHECK
    // =========================================================

    const loadHistoricalHealthCheck =
        useCallback(
            async healthCheckId => {
                try {
                    setLoadingHealthCheckId(
                        healthCheckId,
                    );

                    setErrorMessage(
                        "",
                    );

                    const response =
                        await authenticatedFetch(
                            `${apiBaseUrl}/api/health-checks/${healthCheckId}`,
                        );

                    if (
                        response.status ===
                        401
                    ) {
                        return;
                    }

                    if (
                        response.status ===
                        404
                    ) {
                        throw new Error(
                            "Health check was not found.",
                        );
                    }

                    if (
                        !response.ok
                    ) {
                        throw new Error(
                            `Could not load the selected health check. Status: ${response.status}`,
                        );
                    }

                    const data =
                        await response.json();

                    setSelectedHealthCheck(
                        data,
                    );
                } catch (error) {
                    console.error(
                        error,
                    );

                    setErrorMessage(
                        error instanceof
                            Error
                            ? error.message
                            : "Could not load the selected health check.",
                    );
                } finally {
                    setLoadingHealthCheckId(
                        null,
                    );
                }
            },
            [
                authenticatedFetch,
            ],
        );

    // =========================================================
    // LOADING
    // =========================================================

    if (isLoading) {
        return (
            <Box
                sx={{
                    minHeight: 450,

                    display: "grid",

                    placeItems:
                        "center",
                }}
            >
                <Stack
                    alignItems="center"
                    spacing={1.5}
                >
                    <CircularProgress />

                    <Typography
                        color="text.secondary"
                    >
                        Loading device
                        information...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (
        errorMessage &&
        !device
    ) {
        return (
            <Box>
                <Button
                    startIcon={
                        <ArrowBackRoundedIcon />
                    }
                    onClick={() =>
                        navigate(
                            "/devices",
                        )
                    }
                    sx={{
                        mb: 2,

                        textTransform:
                            "none",
                    }}
                >
                    Back to devices
                </Button>

                <Alert
                    severity="error"
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() =>
                                loadDeviceDetails(
                                    true,
                                )
                            }
                        >
                            Retry
                        </Button>
                    }
                >
                    {
                        errorMessage
                    }
                </Alert>
            </Box>
        );
    }

    if (!device) {
        return null;
    }

    // =========================================================
    // CURRENT / SELECTED SNAPSHOT
    // =========================================================

    const latestHealthCheck =
        device.latestHealthCheck;

    const healthCheck =
        selectedHealthCheck ??
        latestHealthCheck;

    const usedMemoryBytes =
        healthCheck
            ? Math.max(
                  healthCheck.totalMemoryBytes -
                      healthCheck.availableMemoryBytes,
                  0,
              )
            : 0;

    const memoryUsagePercent =
        healthCheck?.totalMemoryBytes >
        0
            ? (usedMemoryBytes /
                  healthCheck.totalMemoryBytes) *
              100
            : 0;

    const totalDriveBytes =
        healthCheck?.systemDriveTotalBytes ??
        0;

    const freeDriveBytes =
        healthCheck?.systemDriveFreeBytes ??
        0;

    const usedDriveBytes =
        Math.max(
            totalDriveBytes -
                freeDriveBytes,
            0,
        );

    const currentHealthScore =
        healthCheck?.healthScore ??
        device.healthScore ??
        0;

    const currentUser =
        formatLoggedOnUser(
            healthCheck?.loggedOnUser,
        );

    // =========================================================
    // UI
    // =========================================================

    return (
        <Box
            sx={{
                width: "100%",
                minWidth: 0,
            }}
        >
            {/* PAGE HEADER */}
            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                justifyContent="space-between"
                alignItems={{
                    xs: "stretch",
                    sm: "flex-start",
                }}
                spacing={2}
                sx={{
                    mb: 2.5,
                }}
            >
                <Box>
                    <Button
                        size="small"
                        startIcon={
                            <ArrowBackRoundedIcon />
                        }
                        onClick={() =>
                            navigate(
                                "/devices",
                            )
                        }
                        sx={{
                            mb: 0.75,
                            px: 0,
                            minWidth: 0,

                            textTransform:
                                "none",

                            color:
                                "text.secondary",

                            "&:hover": {
                                bgcolor:
                                    "transparent",

                                color:
                                    "text.primary",
                            },
                        }}
                    >
                        Devices
                    </Button>

                    <Typography
                        fontWeight={700}
                        sx={{
                            fontSize: {
                                xs: "1.75rem",
                                sm: "2rem",
                                md: "2.125rem",
                            },

                            lineHeight: 1.2,

                            letterSpacing:
                                "-0.025em",

                            wordBreak:
                                "break-word",
                        }}
                    >
                        {
                            device.hostname
                        }
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 0.4,

                            fontSize: {
                                xs: "0.85rem",
                                sm: "0.95rem",
                            },
                        }}
                    >
                        {[
                            device.manufacturer,
                            device.model,
                        ]
                            .filter(
                                Boolean,
                            )
                            .join(" ") ||
                            "Monitored device"}
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    size="small"
                    startIcon={
                        isRefreshing ? (
                            <CircularProgress
                                size={16}
                                color="inherit"
                            />
                        ) : (
                            <RefreshRoundedIcon />
                        )
                    }
                    disabled={
                        isRefreshing
                    }
                    onClick={() =>
                        loadDeviceDetails(
                            false,
                        )
                    }
                    sx={{
                        alignSelf: {
                            xs: "flex-start",
                            sm: "center",
                        },

                        textTransform:
                            "none",
                    }}
                >
                    Refresh
                </Button>
            </Stack>

            {errorMessage && (
                <Alert
                    severity="warning"
                    sx={{
                        mb: 2,
                    }}
                >
                    {
                        errorMessage
                    }
                </Alert>
            )}

            {/* DEVICE SUMMARY */}
            <Paper
                elevation={0}
                sx={{
                    mb: 2,

                    p: {
                        xs: 2,
                        sm: 2.5,
                    },

                    borderRadius: {
                        xs: 2,
                        sm: 2.5,
                    },

                    border:
                        "1px solid",

                    borderColor:
                        "divider",
                }}
            >
                <Stack
                    direction={{
                        xs: "column",
                        md: "row",
                    }}
                    justifyContent="space-between"
                    alignItems={{
                        xs: "stretch",
                        md: "center",
                    }}
                    spacing={2}
                >
                    <Stack
                        direction="row"
                        spacing={1.25}
                        alignItems="center"
                    >
                        <Box
                            sx={{
                                width: 46,
                                height: 46,

                                flexShrink: 0,

                                borderRadius:
                                    2,

                                display:
                                    "grid",

                                placeItems:
                                    "center",

                                bgcolor:
                                    "action.hover",

                                color:
                                    "text.secondary",

                                "& svg": {
                                    fontSize:
                                        23,
                                },
                            }}
                        >
                            <ComputerRoundedIcon />
                        </Box>

                        <Box>
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
                                fontWeight={
                                    600
                                }
                                sx={{
                                    mt: 0.15,

                                    fontSize:
                                        "0.86rem",
                                }}
                            >
                                {formatLastSeen(
                                    device.lastSeenAtUtc,
                                )}
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack
                        direction="row"
                        justifyContent={{
                            xs: "space-between",
                            md: "flex-end",
                        }}
                        alignItems="center"
                        spacing={3}
                    >
                        <Box>
                            <Typography
                                color="text.secondary"
                                sx={{
                                    mb: 0.5,

                                    fontSize:
                                        "0.72rem",
                                }}
                            >
                                Status
                            </Typography>

                            <StatusChip
                                status={
                                    healthCheck?.status ??
                                    device.status
                                }
                            />
                        </Box>

                        <Box
                            sx={{
                                minWidth: 115,
                            }}
                        >
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="baseline"
                                spacing={1}
                            >
                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        fontSize:
                                            "0.72rem",
                                    }}
                                >
                                    Health
                                </Typography>

                                <Typography
                                    fontWeight={
                                        700
                                    }
                                    sx={{
                                        fontSize:
                                            "0.88rem",
                                    }}
                                >
                                    {
                                        currentHealthScore
                                    }
                                    /100
                                </Typography>
                            </Stack>

                            <LinearProgress
                                variant="determinate"
                                value={normalizePercentage(
                                    currentHealthScore,
                                )}
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
                    </Stack>
                </Stack>
            </Paper>

            {!healthCheck && (
                <Alert
                    severity="warning"
                    sx={{
                        mb: 2,
                    }}
                >
                    This device has not
                    submitted a health
                    check yet.
                </Alert>
            )}

            {selectedHealthCheck && (
                <Alert
                    severity="info"
                    sx={{
                        mb: 2,
                    }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() =>
                                setSelectedHealthCheck(
                                    null,
                                )
                            }
                        >
                            Latest
                        </Button>
                    }
                >
                    Viewing historical
                    snapshot from{" "}
                    <strong>
                        {formatDate(
                            selectedHealthCheck.collectedAtUtc,
                        )}
                    </strong>
                    .
                </Alert>
            )}

            {/* QUICK METRICS */}
            <Grid
                container
                spacing={1.5}
                sx={{
                    mb: 2,
                }}
            >
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        xl: 3,
                    }}
                >
                    <MetricCard
                        title="Current User"
                        value={
                            currentUser
                        }
                        subtitle={
                            selectedHealthCheck
                                ? "Selected snapshot"
                                : "Latest session"
                        }
                        icon={
                            <PersonRoundedIcon />
                        }
                    />
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        xl: 3,
                    }}
                >
                    <MetricCard
                        title="Memory Usage"
                        value={formatPercent(
                            memoryUsagePercent,
                        )}
                        subtitle={`${formatBytes(
                            usedMemoryBytes,
                        )} used`}
                        icon={
                            <MemoryRoundedIcon />
                        }
                    />
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        xl: 3,
                    }}
                >
                    <MetricCard
                        title="Disk Usage"
                        value={formatPercent(
                            healthCheck?.diskUsagePercent,
                        )}
                        subtitle={`${formatBytes(
                            freeDriveBytes,
                        )} free`}
                        icon={
                            <StorageRoundedIcon />
                        }
                    />
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        xl: 3,
                    }}
                >
                    <MetricCard
                        title="Pending Updates"
                        value={
                            healthCheck?.pendingUpdatesCount ??
                            "—"
                        }
                        subtitle="Windows Update"
                        icon={
                            <UpdateRoundedIcon />
                        }
                    />
                </Grid>
            </Grid>

            {/* HISTORY */}
            <Box
                sx={{
                    mb: 2,
                }}
            >
                <DetailCard
                    title="Health Check History"
                    subtitle={`${historyTotalCount} recorded health checks`}
                    icon={
                        <HistoryRoundedIcon />
                    }
                >
                    <HealthScoreHistoryChart
                        history={
                            healthHistory
                        }
                    />

                    <Divider
                        sx={{
                            mb: 2,
                        }}
                    />

                    <HealthCheckHistoryTable
                        history={
                            healthHistory
                        }
                        selectedHealthCheckId={
                            selectedHealthCheck?.id ??
                            null
                        }
                        loadingHealthCheckId={
                            loadingHealthCheckId
                        }
                        onSelect={
                            loadHistoricalHealthCheck
                        }
                        onShowLatest={() =>
                            setSelectedHealthCheck(
                                null,
                            )
                        }
                        page={
                            historyPage
                        }
                        totalPages={
                            historyTotalPages
                        }
                        totalCount={
                            historyTotalCount
                        }
                        onPreviousPage={() =>
                            setHistoryPage(
                                currentPage =>
                                    Math.max(
                                        currentPage -
                                            1,
                                        1,
                                    ),
                            )
                        }
                        onNextPage={() =>
                            setHistoryPage(
                                currentPage =>
                                    Math.min(
                                        currentPage +
                                            1,
                                        historyTotalPages,
                                    ),
                            )
                        }
                    />
                </DetailCard>
            </Box>

            {/* SYSTEM INFORMATION */}
            <Grid
                container
                spacing={2}
            >
                <Grid
                    size={{
                        xs: 12,
                        lg: 6,
                    }}
                >
                    <DetailCard
                        title="System Information"
                        icon={
                            <ComputerRoundedIcon />
                        }
                    >
                        <DetailRow
                            label="Device Identifier"
                            value={
                                device.deviceIdentifier
                            }
                        />

                        <DetailRow
                            label="Current User"
                            value={
                                currentUser
                            }
                        />

                        <DetailRow
                            label="Manufacturer"
                            value={
                                device.manufacturer
                            }
                        />

                        <DetailRow
                            label="Model"
                            value={
                                device.model
                            }
                        />

                        <DetailRow
                            label="Operating System"
                            value={
                                device.operatingSystem
                            }
                        />

                        <DetailRow
                            label="OS Version"
                            value={
                                device.operatingSystemVersion
                            }
                        />

                        <DetailRow
                            label="Processor"
                            value={
                                device.processorName
                            }
                        />

                        <DetailRow
                            label="Installed Memory"
                            value={formatBytes(
                                device.totalMemoryBytes,
                            )}
                        />

                        <DetailRow
                            label="Registered"
                            value={formatDate(
                                device.registeredAtUtc,
                            )}
                        />

                        <DetailRow
                            label={
                                selectedHealthCheck
                                    ? "Snapshot Collected"
                                    : "Last Seen"
                            }
                            value={
                                selectedHealthCheck
                                    ? formatDate(
                                          selectedHealthCheck.collectedAtUtc,
                                      )
                                    : formatLastSeen(
                                          device.lastSeenAtUtc,
                                      )
                            }
                        />
                    </DetailCard>
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        lg: 6,
                    }}
                >
                    <Stack
                        spacing={2}
                        sx={{
                            height: "100%",
                        }}
                    >
                        <DetailCard
                            title="Memory"
                            icon={
                                <MemoryRoundedIcon />
                            }
                        >
                            <DetailRow
                                label="Total"
                                value={formatBytes(
                                    healthCheck?.totalMemoryBytes,
                                )}
                            />

                            <DetailRow
                                label="Used"
                                value={formatBytes(
                                    usedMemoryBytes,
                                )}
                            />

                            <DetailRow
                                label="Available"
                                value={formatBytes(
                                    healthCheck?.availableMemoryBytes,
                                )}
                            />

                            <UsageBar
                                label="Memory usage"
                                value={
                                    memoryUsagePercent
                                }
                            />
                        </DetailCard>

                        <DetailCard
                            title="System Drive"
                            icon={
                                <StorageRoundedIcon />
                            }
                        >
                            <DetailRow
                                label="Total Space"
                                value={formatBytes(
                                    totalDriveBytes,
                                )}
                            />

                            <DetailRow
                                label="Used Space"
                                value={formatBytes(
                                    usedDriveBytes,
                                )}
                            />

                            <DetailRow
                                label="Free Space"
                                value={formatBytes(
                                    freeDriveBytes,
                                )}
                            />

                            <UsageBar
                                label="Disk usage"
                                value={
                                    healthCheck?.diskUsagePercent
                                }
                            />
                        </DetailCard>
                    </Stack>
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        lg: 6,
                    }}
                >
                    <DetailCard
                        title="Security"
                        icon={
                            <SecurityRoundedIcon />
                        }
                    >
                        <DetailRow
                            label="Antivirus Installed"
                            value={
                                <BooleanStatus
                                    value={
                                        healthCheck?.isAntivirusInstalled
                                    }
                                />
                            }
                        />

                        <DetailRow
                            label="Antivirus Enabled"
                            value={
                                <BooleanStatus
                                    value={
                                        healthCheck?.isAntivirusEnabled
                                    }
                                />
                            }
                        />

                        <DetailRow
                            label="Antivirus Up To Date"
                            value={
                                <BooleanStatus
                                    value={
                                        healthCheck?.isAntivirusUpToDate
                                    }
                                />
                            }
                        />

                        <DetailRow
                            label="Windows Activated"
                            value={
                                <BooleanStatus
                                    value={
                                        healthCheck?.isWindowsActivated
                                    }
                                />
                            }
                        />
                    </DetailCard>
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        lg: 6,
                    }}
                >
                    <DetailCard
                        title="Windows Updates"
                        icon={
                            <UpdateRoundedIcon />
                        }
                    >
                        <DetailRow
                            label="Pending Updates"
                            value={
                                healthCheck?.pendingUpdatesCount ??
                                "—"
                            }
                        />

                        <DetailRow
                            label="Last Installed Update"
                            value={formatDate(
                                healthCheck?.lastWindowsUpdateAtUtc,
                            )}
                        />

                        <DetailRow
                            label="Information Collected"
                            value={formatDate(
                                healthCheck?.collectedAtUtc,
                            )}
                        />

                        <DetailRow
                            label="Received By Server"
                            value={formatDate(
                                healthCheck?.receivedAtUtc,
                            )}
                        />
                    </DetailCard>
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        lg: 6,
                    }}
                >
                    <DetailCard
                        title="Health Check"
                        icon={
                            <KeyRoundedIcon />
                        }
                    >
                        <DetailRow
                            label="Health Score"
                            value={
                                healthCheck
                                    ? `${healthCheck.healthScore}/100`
                                    : "—"
                            }
                        />

                        <DetailRow
                            label="Status"
                            value={
                                healthCheck ? (
                                    <StatusChip
                                        status={
                                            healthCheck.status
                                        }
                                    />
                                ) : (
                                    "—"
                                )
                            }
                        />

                        <DetailRow
                            label="Collected"
                            value={formatDate(
                                healthCheck?.collectedAtUtc,
                            )}
                        />

                        <DetailRow
                            label="Received"
                            value={formatDate(
                                healthCheck?.receivedAtUtc,
                            )}
                        />
                    </DetailCard>
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        lg: 6,
                    }}
                >
                    <DetailCard
                        title="Detected Issues"
                        icon={
                            <WarningAmberRoundedIcon />
                        }
                    >
                        <IssuesSection
                            value={
                                healthCheck?.issuesJson
                            }
                        />
                    </DetailCard>
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                    }}
                >
                    <DetailCard
                        title="Installed Software"
                        subtitle="Applications detected on this endpoint"
                        icon={
                            <AppsRoundedIcon />
                        }
                    >
                        <InstalledSoftwareTable
                            value={
                                healthCheck?.installedSoftwareJson
                            }
                        />
                    </DetailCard>
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                    }}
                >
                    <DetailCard
                        title="Network Configuration"
                        subtitle="Detected network adapters and addressing"
                        icon={
                            <LanRoundedIcon />
                        }
                    >
                        <NetworkTable
                            value={
                                healthCheck?.networkConfigurationJson
                            }
                        />
                    </DetailCard>
                </Grid>
            </Grid>
        </Box>
    );
}