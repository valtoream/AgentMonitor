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
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Tab,
    Tabs,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import ComputerRoundedIcon from "@mui/icons-material/ComputerRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";

import TicketTable from "../components/TicketTable";
import { SeverityChip } from "../components/StatusChips";

const TICKET_FILTERS = {
    OPEN: "Open",
    RESOLVED: "Resolved",
    ALL: "All",
};

const refreshIntervalMilliseconds =
    10000;

// =============================================================
// HELPERS
// =============================================================

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

function TicketStatusChip({
    status,
}) {
    const normalizedStatus =
        String(
            status ?? "",
        ).toLowerCase();

    let color =
        "default";

    let label =
        status || "Unknown";

    if (
        normalizedStatus ===
        "open"
    ) {
        color = "error";
    } else if (
        normalizedStatus ===
        "inprogress"
    ) {
        color = "warning";
        label = "In Progress";
    } else if (
        normalizedStatus ===
        "resolved"
    ) {
        color = "success";
    }

    return (
        <Chip
            label={label}
            color={color}
            size="small"
            variant="outlined"
            sx={{
                height: 24,
                fontWeight: 500,
            }}
        />
    );
}

function DetailItem({
    label,
    value,
    icon,
}) {
    return (
        <Box
            sx={{
                p: 1.5,

                border:
                    "1px solid",

                borderColor:
                    "divider",

                borderRadius:
                    1.75,

                height: "100%",

                bgcolor:
                    "background.paper",
            }}
        >
            <Stack
                direction="row"
                spacing={0.75}
                alignItems="center"
                sx={{
                    mb: 0.5,
                }}
            >
                {icon && (
                    <Box
                        sx={{
                            display:
                                "grid",

                            placeItems:
                                "center",

                            color:
                                "text.secondary",

                            "& svg":
                                {
                                    fontSize:
                                        15,
                                },
                        }}
                    >
                        {icon}
                    </Box>
                )}

                <Typography
                    color="text.secondary"
                    sx={{
                        fontSize:
                            "0.7rem",

                        lineHeight:
                            1.2,
                    }}
                >
                    {label}
                </Typography>
            </Stack>

            <Typography
                fontWeight={600}
                sx={{
                    fontSize:
                        "0.8rem",

                    lineHeight:
                        1.4,

                    overflowWrap:
                        "anywhere",
                }}
            >
                {value ?? "—"}
            </Typography>
        </Box>
    );
}

// =============================================================
// PAGE
// =============================================================

export default function TicketsPage({
    apiBaseUrl,
    authenticatedFetch,
}) {
    const theme =
        useTheme();

    const isMobile =
        useMediaQuery(
            theme.breakpoints.down(
                "sm",
            ),
        );

    const [
        selectedStatus,
        setSelectedStatus,
    ] = useState(
        TICKET_FILTERS.OPEN,
    );

    const [
        severityFilter,
        setSeverityFilter,
    ] = useState("All");

    const [
        tickets,
        setTickets,
    ] = useState([]);

    const [
        ticketCounts,
        setTicketCounts,
    ] = useState({
        open: 0,
        resolved: 0,
        all: 0,
    });

    const [
        isTicketsLoading,
        setIsTicketsLoading,
    ] = useState(true);

    const [
        ticketsError,
        setTicketsError,
    ] = useState("");

    const [
        selectedTicket,
        setSelectedTicket,
    ] = useState(null);

    const [
        isDetailsLoading,
        setIsDetailsLoading,
    ] = useState(false);

    const [
        isResolving,
        setIsResolving,
    ] = useState(false);

    const [
        actionError,
        setActionError,
    ] = useState("");

    const [
        isManualRefreshing,
        setIsManualRefreshing,
    ] = useState(false);

    // =========================================================
    // LOAD TICKETS
    // =========================================================

    const loadTickets =
        useCallback(
            async (
                showLoading = true,
            ) => {
                try {
                    if (
                        showLoading
                    ) {
                        setIsTicketsLoading(
                            true,
                        );
                    }

                    setTicketsError(
                        "",
                    );

                    let endpoint =
                        `${apiBaseUrl}/api/tickets`;

                    if (
                        selectedStatus !==
                        TICKET_FILTERS.ALL
                    ) {
                        endpoint +=
                            `?status=${encodeURIComponent(
                                selectedStatus,
                            )}`;
                    }

                    const response =
                        await authenticatedFetch(
                            endpoint,
                        );

                    if (
                        response.status ===
                        401
                    ) {
                        return;
                    }

                    if (
                        !response.ok
                    ) {
                        throw new Error(
                            "Could not load tickets.",
                        );
                    }

                    const data =
                        await response.json();

                    setTickets(
                        Array.isArray(
                            data,
                        )
                            ? data
                            : [],
                    );
                } catch (error) {
                    console.error(
                        error,
                    );

                    setTicketsError(
                        error.message ||
                            "Could not load tickets.",
                    );
                } finally {
                    if (
                        showLoading
                    ) {
                        setIsTicketsLoading(
                            false,
                        );
                    }
                }
            },
            [
                apiBaseUrl,
                authenticatedFetch,
                selectedStatus,
            ],
        );

    // =========================================================
    // LOAD COUNTS
    // =========================================================

    const loadTicketCounts =
        useCallback(
            async () => {
                try {
                    const response =
                        await authenticatedFetch(
                            `${apiBaseUrl}/api/tickets/counts`,
                        );

                    if (
                        response.status ===
                        401
                    ) {
                        return;
                    }

                    if (
                        !response.ok
                    ) {
                        throw new Error(
                            "Could not load ticket counts.",
                        );
                    }

                    const data =
                        await response.json();

                    setTicketCounts({
                        open:
                            data.open ??
                            0,

                        resolved:
                            data.resolved ??
                            0,

                        all:
                            data.all ??
                            0,
                    });
                } catch (error) {
                    console.error(
                        error,
                    );
                }
            },
            [
                apiBaseUrl,
                authenticatedFetch,
            ],
        );

    // =========================================================
    // REFRESH
    // =========================================================

    const refreshTicketData =
        useCallback(
            async (
                showLoading = false,
            ) => {
                await Promise.all([
                    loadTickets(
                        showLoading,
                    ),
                    loadTicketCounts(),
                ]);
            },
            [
                loadTickets,
                loadTicketCounts,
            ],
        );

    // =========================================================
    // INITIAL LOAD + AUTO REFRESH
    // =========================================================

    useEffect(() => {
        refreshTicketData(
            true,
        );

        const intervalId =
            setInterval(
                () => {
                    refreshTicketData(
                        false,
                    );
                },
                refreshIntervalMilliseconds,
            );

        return () => {
            clearInterval(
                intervalId,
            );
        };
    }, [
        refreshTicketData,
    ]);

    // =========================================================
    // MANUAL REFRESH
    // =========================================================

    async function handleManualRefresh() {
        try {
            setIsManualRefreshing(
                true,
            );

            await refreshTicketData(
                false,
            );
        } finally {
            setIsManualRefreshing(
                false,
            );
        }
    }

    // =========================================================
    // SEVERITY FILTER
    // =========================================================

    const filteredTickets =
        useMemo(() => {
            if (
                severityFilter ===
                "All"
            ) {
                return tickets;
            }

            return tickets.filter(
                ticket =>
                    ticket.severity ===
                    severityFilter,
            );
        }, [
            tickets,
            severityFilter,
        ]);

    const hasSeverityFilter =
        severityFilter !== "All";

    function handleStatusChange(
        event,
        newStatus,
    ) {
        if (!newStatus) {
            return;
        }

        setSelectedStatus(
            newStatus,
        );
    }

    // =========================================================
    // LOAD DETAILS
    // =========================================================

    async function handleTicketClick(
        ticketId,
    ) {
        try {
            setIsDetailsLoading(
                true,
            );

            setActionError("");

            setSelectedTicket(
                null,
            );

            const response =
                await authenticatedFetch(
                    `${apiBaseUrl}/api/ticket-management/${ticketId}`,
                );

            if (
                response.status ===
                401
            ) {
                return;
            }

            if (
                !response.ok
            ) {
                throw new Error(
                    "Could not load ticket details.",
                );
            }

            const ticket =
                await response.json();

            setSelectedTicket(
                ticket,
            );
        } catch (error) {
            console.error(
                error,
            );

            setActionError(
                error.message ||
                    "Could not load ticket details.",
            );
        } finally {
            setIsDetailsLoading(
                false,
            );
        }
    }

    function handleCloseDialog() {
        if (
            isResolving
        ) {
            return;
        }

        setSelectedTicket(
            null,
        );

        setActionError("");
    }

    // =========================================================
    // RESOLVE
    // =========================================================

    async function handleResolveTicket() {
        if (
            !selectedTicket
        ) {
            return;
        }

        try {
            setIsResolving(
                true,
            );

            setActionError(
                "",
            );

            const response =
                await authenticatedFetch(
                    `${apiBaseUrl}/api/ticket-management/${selectedTicket.id}/resolve`,
                    {
                        method:
                            "POST",
                    },
                );

            if (
                response.status ===
                401
            ) {
                return;
            }

            if (
                !response.ok
            ) {
                throw new Error(
                    "Could not resolve the ticket.",
                );
            }

            const updatedTicket =
                await response.json();

            setSelectedTicket(
                updatedTicket,
            );

            await refreshTicketData(
                false,
            );
        } catch (error) {
            console.error(
                error,
            );

            setActionError(
                error.message ||
                    "Could not resolve the ticket.",
            );
        } finally {
            setIsResolving(
                false,
            );
        }
    }

    const canResolve =
        selectedTicket &&
        String(
            selectedTicket.status,
        ).toLowerCase() !==
            "resolved" &&
        String(
            selectedTicket.status,
        ).toLowerCase() !==
            "closed";

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
                    mb: {
                        xs: 2.5,
                        sm: 3,
                    },
                }}
            >
                <Box>
                    <Typography
                        fontWeight={700}
                        sx={{
                            fontSize: {
                                xs:
                                    "1.75rem",
                                sm:
                                    "2rem",
                                md:
                                    "2.125rem",
                            },

                            lineHeight:
                                1.2,

                            letterSpacing:
                                "-0.025em",
                        }}
                    >
                        Tickets
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 0.5,

                            fontSize: {
                                xs:
                                    "0.875rem",
                                sm: "1rem",
                            },
                        }}
                    >
                        Review and manage
                        issues detected by
                        the monitoring
                        system.
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    size="small"
                    startIcon={
                        isManualRefreshing ? (
                            <CircularProgress
                                size={16}
                                color="inherit"
                            />
                        ) : (
                            <RefreshRoundedIcon />
                        )
                    }
                    disabled={
                        isManualRefreshing
                    }
                    onClick={
                        handleManualRefresh
                    }
                    sx={{
                        alignSelf: {
                            xs:
                                "flex-start",
                            sm: "center",
                        },

                        textTransform:
                            "none",
                    }}
                >
                    Refresh
                </Button>
            </Stack>

            {/* TICKET QUEUE */}
            <Paper
                elevation={0}
                sx={{
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
                {/* SECTION HEADER */}
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
                                xs:
                                    "1.05rem",
                                sm:
                                    "1.15rem",
                            },
                        }}
                    >
                        Ticket Queue
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 0.25,

                            fontSize: {
                                xs:
                                    "0.8rem",
                                sm:
                                    "0.875rem",
                            },
                        }}
                    >
                        {ticketCounts.open}{" "}
                        open{" "}
                        {ticketCounts.open ===
                        1
                            ? "ticket"
                            : "tickets"}

                        {" · "}

                        {ticketCounts.resolved}{" "}
                        resolved
                    </Typography>
                </Box>

                {/* STATUS TABS */}
                <Box
                    sx={{
                        borderBottom:
                            "1px solid",

                        borderColor:
                            "divider",

                        bgcolor:
                            "rgba(0,0,0,0.012)",
                    }}
                >
                    <Tabs
                        value={
                            selectedStatus
                        }
                        onChange={
                            handleStatusChange
                        }
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        aria-label="Ticket status filter"
                        sx={{
                            px: {
                                xs: 1,
                                sm: 2,
                            },

                            minHeight: 48,

                            "& .MuiTab-root":
                                {
                                    minHeight:
                                        48,

                                    minWidth:
                                        "auto",

                                    px: {
                                        xs:
                                            1.5,
                                        sm: 2,
                                    },

                                    textTransform:
                                        "none",

                                    fontWeight:
                                        600,

                                    fontSize:
                                        "0.82rem",
                                },
                        }}
                    >
                        <Tab
                            value={
                                TICKET_FILTERS.OPEN
                            }
                            label={`Open (${ticketCounts.open})`}
                        />

                        <Tab
                            value={
                                TICKET_FILTERS.RESOLVED
                            }
                            label={`Resolved (${ticketCounts.resolved})`}
                        />

                        <Tab
                            value={
                                TICKET_FILTERS.ALL
                            }
                            label={`All (${ticketCounts.all})`}
                        />
                    </Tabs>
                </Box>

                {/* FILTER BAR */}
                <Stack
                    direction={{
                        xs: "column",
                        sm: "row",
                    }}
                    alignItems={{
                        xs: "stretch",
                        sm: "center",
                    }}
                    spacing={1.5}
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
                    <FormControl
                        size="small"
                        sx={{
                            width: {
                                xs: "100%",
                                sm: 190,
                            },
                        }}
                    >
                        <InputLabel>
                            Severity
                        </InputLabel>

                        <Select
                            value={
                                severityFilter
                            }
                            label="Severity"
                            onChange={event =>
                                setSeverityFilter(
                                    event
                                        .target
                                        .value,
                                )
                            }
                        >
                            <MenuItem value="All">
                                All severities
                            </MenuItem>

                            <MenuItem value="Low">
                                Low
                            </MenuItem>

                            <MenuItem value="Medium">
                                Medium
                            </MenuItem>

                            <MenuItem value="High">
                                High
                            </MenuItem>

                            <MenuItem value="Critical">
                                Critical
                            </MenuItem>
                        </Select>
                    </FormControl>

                    {hasSeverityFilter && (
                        <Button
                            size="small"
                            color="inherit"
                            onClick={() =>
                                setSeverityFilter(
                                    "All",
                                )
                            }
                            sx={{
                                alignSelf: {
                                    xs:
                                        "flex-start",
                                    sm:
                                        "center",
                                },

                                textTransform:
                                    "none",

                                color:
                                    "text.secondary",
                            }}
                        >
                            Clear filter
                        </Button>
                    )}

                    <Box
                        sx={{
                            flexGrow: 1,
                        }}
                    />

                    <Typography
                        color="text.secondary"
                        sx={{
                            fontSize:
                                "0.78rem",
                        }}
                    >
                        {filteredTickets.length}{" "}
                        {filteredTickets.length ===
                        1
                            ? "ticket"
                            : "tickets"}{" "}
                        shown
                    </Typography>
                </Stack>

                {/* ERROR */}
                {ticketsError && (
                    <Alert
                        severity="error"
                        sx={{
                            borderRadius: 0,
                        }}
                    >
                        {
                            ticketsError
                        }
                    </Alert>
                )}

                {/* RESULTS */}
                {isTicketsLoading ? (
                    <Box
                        sx={{
                            minHeight: 280,

                            display:
                                "grid",

                            placeItems:
                                "center",
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : (
                    <TicketTable
                        tickets={
                            filteredTickets
                        }
                        onTicketClick={
                            handleTicketClick
                        }
                    />
                )}
            </Paper>

            {/* =====================================================
                DETAILS DIALOG
            ===================================================== */}
            <Dialog
                open={
                    isDetailsLoading ||
                    Boolean(
                        selectedTicket,
                    )
                }
                onClose={
                    handleCloseDialog
                }
                fullWidth
                fullScreen={
                    isMobile
                }
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius: {
                            xs: 0,
                            sm: 2.5,
                        },
                    },
                }}
            >
                {/* HEADER */}
                <DialogTitle
                    sx={{
                        px: {
                            xs: 2,
                            sm: 2.5,
                        },

                        py: 1.75,
                    }}
                >
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                    >
                        <Box>
                            <Typography
                                fontWeight={
                                    700
                                }
                                sx={{
                                    fontSize:
                                        "1.05rem",
                                }}
                            >
                                Ticket Details
                            </Typography>

                            {selectedTicket && (
                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        mt: 0.15,
                                        fontSize:
                                            "0.7rem",
                                    }}
                                >
                                    Ticket{" "}
                                    {
                                        selectedTicket.id
                                    }
                                </Typography>
                            )}
                        </Box>

                        <Tooltip title="Close">
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={
                                        handleCloseDialog
                                    }
                                    disabled={
                                        isResolving
                                    }
                                >
                                    <CloseRoundedIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Stack>
                </DialogTitle>

                <Divider />

                <DialogContent
                    sx={{
                        px: {
                            xs: 2,
                            sm: 2.5,
                        },

                        py: 2.5,
                    }}
                >
                    {isDetailsLoading ? (
                        <Box
                            sx={{
                                minHeight:
                                    300,

                                display:
                                    "grid",

                                placeItems:
                                    "center",
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : selectedTicket ? (
                        <Stack
                            spacing={2.5}
                        >
                            {actionError && (
                                <Alert severity="error">
                                    {
                                        actionError
                                    }
                                </Alert>
                            )}

                            {/* MAIN ISSUE */}
                            <Box>
                                <Stack
                                    direction={{
                                        xs:
                                            "column",
                                        sm: "row",
                                    }}
                                    spacing={1}
                                    alignItems={{
                                        xs:
                                            "flex-start",
                                        sm:
                                            "center",
                                    }}
                                    sx={{
                                        mb: 1,
                                    }}
                                >
                                    <Typography
                                        fontWeight={
                                            700
                                        }
                                        sx={{
                                            fontSize: {
                                                xs:
                                                    "1.25rem",
                                                sm:
                                                    "1.4rem",
                                            },

                                            lineHeight:
                                                1.3,
                                        }}
                                    >
                                        {
                                            selectedTicket.title
                                        }
                                    </Typography>

                                    <Stack
                                        direction="row"
                                        spacing={0.75}
                                    >
                                        <SeverityChip
                                            severity={
                                                selectedTicket.severity
                                            }
                                        />

                                        <TicketStatusChip
                                            status={
                                                selectedTicket.status
                                            }
                                        />
                                    </Stack>
                                </Stack>

                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        fontSize:
                                            "0.85rem",

                                        lineHeight:
                                            1.6,
                                    }}
                                >
                                    {selectedTicket.description ||
                                        "No additional description is available."}
                                </Typography>
                            </Box>

                            <Divider />

                            {/* DETAILS GRID */}
                            <Grid
                                container
                                spacing={1.5}
                            >
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                    }}
                                >
                                    <DetailItem
                                        label="Device"
                                        value={
                                            selectedTicket.deviceHostname
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
                                    }}
                                >
                                    <DetailItem
                                        label="Rule Code"
                                        value={
                                            selectedTicket.ruleCode
                                        }
                                        icon={
                                            <ConfirmationNumberRoundedIcon />
                                        }
                                    />
                                </Grid>

                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                    }}
                                >
                                    <DetailItem
                                        label="Created"
                                        value={formatDate(
                                            selectedTicket.createdAtUtc,
                                        )}
                                        icon={
                                            <HistoryRoundedIcon />
                                        }
                                    />
                                </Grid>

                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                    }}
                                >
                                    <DetailItem
                                        label="Last Detected"
                                        value={formatDate(
                                            selectedTicket.lastDetectedAtUtc,
                                        )}
                                        icon={
                                            <HistoryRoundedIcon />
                                        }
                                    />
                                </Grid>

                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                    }}
                                >
                                    <DetailItem
                                        label="Updated"
                                        value={formatDate(
                                            selectedTicket.updatedAtUtc,
                                        )}
                                    />
                                </Grid>

                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                    }}
                                >
                                    <DetailItem
                                        label="Resolved"
                                        value={formatDate(
                                            selectedTicket.resolvedAtUtc,
                                        )}
                                    />
                                </Grid>

                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                    }}
                                >
                                    <DetailItem
                                        label="Detection Count"
                                        value={
                                            selectedTicket.detectionCount ??
                                            0
                                        }
                                    />
                                </Grid>

                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                    }}
                                >
                                    <DetailItem
                                        label="Health Check ID"
                                        value={
                                            selectedTicket.healthCheckId
                                        }
                                    />
                                </Grid>
                            </Grid>
                        </Stack>
                    ) : (
                        <Alert severity="error">
                            {actionError ||
                                "Ticket details could not be loaded."}
                        </Alert>
                    )}
                </DialogContent>

                {selectedTicket && (
                    <>
                        <Divider />

                        <DialogActions
                            sx={{
                                px: {
                                    xs: 2,
                                    sm: 2.5,
                                },

                                py: 1.75,

                                flexDirection: {
                                    xs:
                                        "column-reverse",
                                    sm: "row",
                                },

                                gap: {
                                    xs: 1,
                                    sm: 0,
                                },

                                "& > :not(style) ~ :not(style)":
                                    {
                                        ml: {
                                            xs: 0,
                                            sm: 1,
                                        },
                                    },
                            }}
                        >
                            <Button
                                onClick={
                                    handleCloseDialog
                                }
                                disabled={
                                    isResolving
                                }
                                color="inherit"
                                sx={{
                                    width: {
                                        xs: "100%",
                                        sm: "auto",
                                    },

                                    textTransform:
                                        "none",
                                }}
                            >
                                Close
                            </Button>

                            {canResolve && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={
                                        isResolving ? (
                                            <CircularProgress
                                                size={
                                                    17
                                                }
                                                color="inherit"
                                            />
                                        ) : (
                                            <CheckCircleRoundedIcon />
                                        )
                                    }
                                    disabled={
                                        isResolving
                                    }
                                    onClick={
                                        handleResolveTicket
                                    }
                                    sx={{
                                        width: {
                                            xs:
                                                "100%",
                                            sm:
                                                "auto",
                                        },

                                        textTransform:
                                            "none",
                                    }}
                                >
                                    {isResolving
                                        ? "Resolving..."
                                        : "Resolve Ticket"}
                                </Button>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}