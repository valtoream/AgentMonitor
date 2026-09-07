import {
    Box,
    Grid,
    Paper,
    Typography,
} from "@mui/material";

import ComputerRoundedIcon from "@mui/icons-material/ComputerRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";

import SummaryCard from "../components/SummaryCard";
import DeviceTable from "../components/DeviceTable";
import TicketTable from "../components/TicketTable";
import { normalizeDeviceStatus } from "../utils/formatters";

export default function DashboardPage({
    devices,
    tickets,
}) {
    const openTickets =
        tickets.filter(
            ticket =>
                String(
                    ticket.status,
                ).toLowerCase() === "open",
        );

    const healthyDevicesCount =
        devices.filter(
            device =>
                normalizeDeviceStatus(
                    device.status,
                ) === "Good",
        ).length;

    const criticalIssuesCount =
        openTickets.filter(
            ticket =>
                String(
                    ticket.severity,
                ).toLowerCase() ===
                "critical",
        ).length;

    const unhealthyDevicesCount =
        Math.max(
            devices.length -
                healthyDevicesCount,
            0,
        );

    return (
        <Box
            sx={{
                width: "100%",
                minWidth: 0,
            }}
        >
            {/* =====================================================
                PAGE HEADER
            ===================================================== */}
            <Box
                sx={{
                    mb: {
                        xs: 2.5,
                        sm: 3,
                    },
                }}
            >
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
                    }}
                >
                    Dashboard
                </Typography>

                <Typography
                    color="text.secondary"
                    sx={{
                        mt: 0.5,
                        fontSize: {
                            xs: "0.875rem",
                            sm: "1rem",
                        },
                    }}
                >
                    Overview of monitored devices
                    and active issues.
                </Typography>
            </Box>

            {/* =====================================================
                SUMMARY CARDS
            ===================================================== */}
            <Grid
                container
                spacing={{
                    xs: 1.5,
                    sm: 2,
                }}
            >
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        lg: 3,
                    }}
                >
                    <SummaryCard
                        title="Total Devices"
                        value={devices.length}
                        subtitle={
                            devices.length === 1
                                ? "1 registered device"
                                : `${devices.length} registered devices`
                        }
                        icon={
                            <ComputerRoundedIcon />
                        }
                    />
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        lg: 3,
                    }}
                >
                    <SummaryCard
                        title="Healthy"
                        value={
                            healthyDevicesCount
                        }
                        subtitle={
                            devices.length === 0
                                ? "No devices registered"
                                : `${healthyDevicesCount} of ${devices.length} healthy`
                        }
                        icon={
                            <CheckCircleRoundedIcon />
                        }
                    />
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        lg: 3,
                    }}
                >
                    <SummaryCard
                        title="Open Tickets"
                        value={
                            openTickets.length
                        }
                        subtitle={
                            openTickets.length === 0
                                ? "No active tickets"
                                : "Require attention"
                        }
                        icon={
                            <WarningAmberRoundedIcon />
                        }
                    />
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        lg: 3,
                    }}
                >
                    <SummaryCard
                        title="Critical Issues"
                        value={
                            criticalIssuesCount
                        }
                        subtitle={
                            criticalIssuesCount === 0
                                ? "No critical issues"
                                : "Immediate action required"
                        }
                        icon={
                            <ErrorRoundedIcon />
                        }
                    />
                </Grid>
            </Grid>

            {/* =====================================================
                DEVICES
            ===================================================== */}
            <Paper
                elevation={0}
                sx={{
                    mt: {
                        xs: 2,
                        sm: 3,
                    },
                    borderRadius: {
                        xs: 2,
                        sm: 2.5,
                    },
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    backgroundColor:
                        "background.paper",
                }}
            >
                <Box
                    sx={{
                        px: {
                            xs: 2,
                            sm: 2.5,
                        },
                        py: {
                            xs: 1.75,
                            sm: 2,
                        },
                        borderBottom:
                            "1px solid",
                        borderColor:
                            "divider",
                    }}
                >
                    <Typography
                        fontWeight={700}
                        sx={{
                            fontSize: {
                                xs: "1.05rem",
                                sm: "1.15rem",
                            },
                        }}
                    >
                        Devices
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 0.25,
                            fontSize: {
                                xs: "0.8rem",
                                sm: "0.875rem",
                            },
                        }}
                    >
                        {devices.length} registered{" "}
                        {devices.length === 1
                            ? "device"
                            : "devices"}

                        {unhealthyDevicesCount >
                            0 &&
                            ` · ${unhealthyDevicesCount} requiring attention`}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        width: "100%",
                        overflowX: "auto",
                        WebkitOverflowScrolling:
                            "touch",
                    }}
                >
                    <DeviceTable
                        devices={devices}
                    />
                </Box>
            </Paper>

            {/* =====================================================
                OPEN TICKETS
            ===================================================== */}
            <Paper
                elevation={0}
                sx={{
                    mt: {
                        xs: 2,
                        sm: 3,
                    },
                    borderRadius: {
                        xs: 2,
                        sm: 2.5,
                    },
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    backgroundColor:
                        "background.paper",
                }}
            >
                <Box
                    sx={{
                        px: {
                            xs: 2,
                            sm: 2.5,
                        },
                        py: {
                            xs: 1.75,
                            sm: 2,
                        },
                        borderBottom:
                            "1px solid",
                        borderColor:
                            "divider",
                    }}
                >
                    <Typography
                        fontWeight={700}
                        sx={{
                            fontSize: {
                                xs: "1.05rem",
                                sm: "1.15rem",
                            },
                        }}
                    >
                        Open Tickets
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 0.25,
                            fontSize: {
                                xs: "0.8rem",
                                sm: "0.875rem",
                            },
                        }}
                    >
                        {openTickets.length ===
                        0
                            ? "No active issues"
                            : `${openTickets.length} open ${
                                  openTickets.length ===
                                  1
                                      ? "ticket"
                                      : "tickets"
                              } requiring attention`}

                        {criticalIssuesCount >
                            0 &&
                            ` · ${criticalIssuesCount} critical`}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        width: "100%",
                        overflowX: "auto",
                        WebkitOverflowScrolling:
                            "touch",
                    }}
                >
                    <TicketTable
                        tickets={
                            openTickets
                        }
                    />
                </Box>
            </Paper>
        </Box>
    );
}