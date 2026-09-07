import {
    Box,
    Chip,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import ComputerRoundedIcon from "@mui/icons-material/ComputerRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

import { SeverityChip } from "./StatusChips";
import { formatLastSeen } from "../utils/formatters";

function TicketStatusChip({ status }) {
    const normalizedStatus =
        String(status ?? "").toLowerCase();

    let color = "default";

    if (normalizedStatus === "open") {
        color = "error";
    } else if (
        normalizedStatus === "inprogress"
    ) {
        color = "warning";
    } else if (
        normalizedStatus === "resolved"
    ) {
        color = "success";
    }

    let label =
        status || "Unknown";

    if (
        normalizedStatus === "inprogress"
    ) {
        label = "In Progress";
    }

    return (
        <Chip
            label={label}
            color={color}
            size="small"
            variant="outlined"
        />
    );
}

export default function TicketTable({
    tickets,
    onTicketClick,
}) {
    const isClickable =
        typeof onTicketClick ===
        "function";

    function openTicket(
        ticketId,
    ) {
        if (!isClickable) {
            return;
        }

        onTicketClick(ticketId);
    }

    function handleKeyDown(
        event,
        ticketId,
    ) {
        if (!isClickable) {
            return;
        }

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {
            event.preventDefault();

            openTicket(ticketId);
        }
    }

    if (tickets.length === 0) {
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
                <CheckCircleRoundedIcon
                    color="success"
                    sx={{
                        fontSize: {
                            xs: 36,
                            sm: 42,
                        },

                        mb: 1,
                    }}
                />

                <Typography
                    fontWeight={600}
                >
                    No tickets found
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mt: 0.5,
                    }}
                >
                    There are no tickets
                    matching the selected
                    filters.
                </Typography>
            </Box>
        );
    }

    return (
        <>
            {/* =====================================================
                DESKTOP / TABLET
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
                        minWidth: 850,
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                Device
                            </TableCell>

                            <TableCell>
                                Issue
                            </TableCell>

                            <TableCell>
                                Severity
                            </TableCell>

                            <TableCell>
                                Status
                            </TableCell>

                            <TableCell
                                align="center"
                            >
                                Detections
                            </TableCell>

                            <TableCell>
                                Last Detected
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {tickets.map(
                            ticket => (
                                <TableRow
                                    key={
                                        ticket.id
                                    }
                                    hover={
                                        isClickable
                                    }
                                    tabIndex={
                                        isClickable
                                            ? 0
                                            : undefined
                                    }
                                    role={
                                        isClickable
                                            ? "button"
                                            : undefined
                                    }
                                    onClick={() =>
                                        openTicket(
                                            ticket.id,
                                        )
                                    }
                                    onKeyDown={event =>
                                        handleKeyDown(
                                            event,
                                            ticket.id,
                                        )
                                    }
                                    sx={{
                                        cursor:
                                            isClickable
                                                ? "pointer"
                                                : "default",

                                        "& td":
                                            {
                                                py: 1.5,
                                            },

                                        "&:focus-visible":
                                            isClickable
                                                ? {
                                                      outline:
                                                          "2px solid",
                                                      outlineColor:
                                                          "primary.main",
                                                      outlineOffset:
                                                          "-2px",
                                                  }
                                                : {},

                                        "&:last-child td":
                                            {
                                                borderBottom:
                                                    0,
                                            },
                                    }}
                                >
                                    {/* DEVICE */}
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

                                                    flexShrink:
                                                        0,

                                                    borderRadius:
                                                        1.5,

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
                                                variant="body2"
                                                fontWeight={
                                                    600
                                                }
                                                noWrap
                                            >
                                                {ticket.deviceHostname ||
                                                    "Unknown device"}
                                            </Typography>
                                        </Stack>
                                    </TableCell>

                                    {/* ISSUE */}
                                    <TableCell>
                                        <Box
                                            sx={{
                                                maxWidth:
                                                    420,
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                fontWeight={
                                                    600
                                                }
                                            >
                                                {ticket.title ||
                                                    "Unknown issue"}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display:
                                                        "block",

                                                    mt: 0.25,

                                                    overflow:
                                                        "hidden",

                                                    textOverflow:
                                                        "ellipsis",

                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                                title={
                                                    ticket.ruleCode ??
                                                    ""
                                                }
                                            >
                                                {ticket.ruleCode ||
                                                    "No rule code"}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    {/* SEVERITY */}
                                    <TableCell>
                                        <SeverityChip
                                            severity={
                                                ticket.severity
                                            }
                                        />
                                    </TableCell>

                                    {/* STATUS */}
                                    <TableCell>
                                        <TicketStatusChip
                                            status={
                                                ticket.status
                                            }
                                        />
                                    </TableCell>

                                    {/* DETECTIONS */}
                                    <TableCell
                                        align="center"
                                    >
                                        <Typography
                                            variant="body2"
                                            fontWeight={
                                                700
                                            }
                                        >
                                            {ticket.detectionCount ??
                                                0}
                                        </Typography>
                                    </TableCell>

                                    {/* LAST DETECTED */}
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            noWrap
                                        >
                                            {formatLastSeen(
                                                ticket.lastDetectedAtUtc,
                                            )}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ),
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* =====================================================
                MOBILE
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
                {tickets.map(
                    ticket => (
                        <Box
                            key={
                                ticket.id
                            }
                            tabIndex={
                                isClickable
                                    ? 0
                                    : undefined
                            }
                            role={
                                isClickable
                                    ? "button"
                                    : undefined
                            }
                            onClick={() =>
                                openTicket(
                                    ticket.id,
                                )
                            }
                            onKeyDown={event =>
                                handleKeyDown(
                                    event,
                                    ticket.id,
                                )
                            }
                            sx={{
                                px: 2,
                                py: 2,

                                cursor:
                                    isClickable
                                        ? "pointer"
                                        : "default",

                                borderBottom:
                                    "1px solid",

                                borderColor:
                                    "divider",

                                transition:
                                    "background-color 0.15s ease",

                                "&:hover":
                                    isClickable
                                        ? {
                                              bgcolor:
                                                  "action.hover",
                                          }
                                        : {},

                                "&:focus-visible":
                                    isClickable
                                        ? {
                                              outline:
                                                  "2px solid",
                                              outlineColor:
                                                  "primary.main",
                                              outlineOffset:
                                                  "-2px",
                                          }
                                        : {},

                                "&:last-child":
                                    {
                                        borderBottom:
                                            0,
                                    },
                            }}
                        >
                            {/* HEADER */}
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="flex-start"
                                spacing={1.5}
                            >
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="flex-start"
                                    sx={{
                                        minWidth:
                                            0,
                                        flex: 1,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 36,
                                            height: 36,

                                            flexShrink:
                                                0,

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
                                        <ConfirmationNumberRoundedIcon />
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

                                                lineHeight:
                                                    1.35,
                                            }}
                                        >
                                            {ticket.title ||
                                                "Unknown issue"}
                                        </Typography>

                                        <Typography
                                            color="text.secondary"
                                            sx={{
                                                mt: 0.25,

                                                fontSize:
                                                    "0.72rem",

                                                overflow:
                                                    "hidden",

                                                textOverflow:
                                                    "ellipsis",

                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            {ticket.ruleCode ||
                                                "No rule code"}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <SeverityChip
                                    severity={
                                        ticket.severity
                                    }
                                />
                            </Stack>

                            {/* DEVICE */}
                            <Stack
                                direction="row"
                                spacing={0.75}
                                alignItems="center"
                                sx={{
                                    mt: 1.5,
                                }}
                            >
                                <ComputerRoundedIcon
                                    sx={{
                                        fontSize:
                                            16,

                                        color:
                                            "text.secondary",
                                    }}
                                />

                                <Typography
                                    sx={{
                                        fontSize:
                                            "0.8rem",

                                        fontWeight:
                                            500,
                                    }}
                                >
                                    {ticket.deviceHostname ||
                                        "Unknown device"}
                                </Typography>
                            </Stack>

                            {/* DETAILS */}
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                spacing={2}
                                sx={{
                                    mt: 1.5,
                                }}
                            >
                                <Box>
                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            fontSize:
                                                "0.7rem",

                                            mb: 0.5,
                                        }}
                                    >
                                        Status
                                    </Typography>

                                    <TicketStatusChip
                                        status={
                                            ticket.status
                                        }
                                    />
                                </Box>

                                <Box
                                    sx={{
                                        textAlign:
                                            "right",
                                    }}
                                >
                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            fontSize:
                                                "0.7rem",
                                        }}
                                    >
                                        Detections
                                    </Typography>

                                    <Typography
                                        fontWeight={
                                            700
                                        }
                                        sx={{
                                            mt: 0.25,

                                            fontSize:
                                                "0.95rem",
                                        }}
                                    >
                                        {ticket.detectionCount ??
                                            0}
                                    </Typography>
                                </Box>
                            </Stack>

                            {/* FOOTER */}
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                spacing={2}
                                sx={{
                                    mt: 1.75,

                                    pt: 1.25,

                                    borderTop:
                                        "1px solid",

                                    borderColor:
                                        "divider",
                                }}
                            >
                                <Stack
                                    direction="row"
                                    spacing={0.5}
                                    alignItems="center"
                                >
                                    <AccessTimeRoundedIcon
                                        sx={{
                                            fontSize:
                                                14,

                                            color:
                                                "text.secondary",
                                        }}
                                    />

                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            fontSize:
                                                "0.72rem",
                                        }}
                                    >
                                        Last
                                        detected
                                    </Typography>
                                </Stack>

                                <Typography
                                    sx={{
                                        fontSize:
                                            "0.76rem",

                                        fontWeight:
                                            500,

                                        textAlign:
                                            "right",
                                    }}
                                >
                                    {formatLastSeen(
                                        ticket.lastDetectedAtUtc,
                                    )}
                                </Typography>
                            </Stack>
                        </Box>
                    ),
                )}
            </Stack>
        </>
    );
}