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
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterAltOffRoundedIcon from "@mui/icons-material/FilterAltOffRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

const TIME_FILTERS = {
    ALL: "All",
    LAST_24_HOURS: "24h",
    LAST_7_DAYS: "7d",
    LAST_30_DAYS: "30d",
};

function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

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

function formatAction(action) {
    if (!action) {
        return "Unknown";
    }

    return action
        .replace(
            /([a-z0-9])([A-Z])/g,
            "$1 $2",
        )
        .replace(
            /([A-Z])([A-Z][a-z])/g,
            "$1 $2",
        );
}

function getActionColor(action) {
    switch (action) {
        case "Login":
            return "info";

        case "UserCreated":
        case "UserEnabled":
        case "TicketResolved":
        case "TicketAutoResolved":
        case "RuleActivated":
            return "success";

        case "UserDisabled":
        case "RuleDisabled":
        case "ShadowStarted":
            return "warning";

        case "RuleDeleted":
            return "error";

        case "RuleCreated":
        case "RuleRecommendationApplied":
            return "info";

        default:
            return "default";
    }
}

function isWithinTimeRange(
    value,
    timeFilter,
) {
    if (
        timeFilter ===
        TIME_FILTERS.ALL
    ) {
        return true;
    }

    if (!value) {
        return false;
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return false;
    }

    const now =
        Date.now();

    let milliseconds =
        0;

    switch (timeFilter) {
        case TIME_FILTERS.LAST_24_HOURS:
            milliseconds =
                24 *
                60 *
                60 *
                1000;
            break;

        case TIME_FILTERS.LAST_7_DAYS:
            milliseconds =
                7 *
                24 *
                60 *
                60 *
                1000;
            break;

        case TIME_FILTERS.LAST_30_DAYS:
            milliseconds =
                30 *
                24 *
                60 *
                60 *
                1000;
            break;

        default:
            return true;
    }

    return (
        now -
            date.getTime() <=
        milliseconds
    );
}

function AuditLogMobileCard({
    log,
}) {
    return (
        <Box
            sx={{
                px: 2,
                py: 1.75,

                borderBottom:
                    "1px solid",

                borderColor:
                    "divider",

                "&:last-child": {
                    borderBottom: 0,
                },
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
                    <Stack
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                    >
                        <PersonRoundedIcon
                            sx={{
                                fontSize: 17,
                                color:
                                    "text.secondary",
                            }}
                        />

                        <Typography
                            fontWeight={700}
                            sx={{
                                fontSize:
                                    "0.86rem",
                            }}
                        >
                            {log.username ||
                                "System"}
                        </Typography>
                    </Stack>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 0.35,

                            fontSize:
                                "0.7rem",
                        }}
                    >
                        {formatDate(
                            log.createdAtUtc,
                        )}
                    </Typography>
                </Box>

                <Chip
                    label={formatAction(
                        log.action,
                    )}
                    size="small"
                    color={getActionColor(
                        log.action,
                    )}
                    variant="outlined"
                    sx={{
                        height: 24,

                        maxWidth: 180,

                        "& .MuiChip-label":
                            {
                                overflow:
                                    "hidden",

                                textOverflow:
                                    "ellipsis",
                            },
                    }}
                />
            </Stack>

            <Box
                sx={{
                    mt: 1.5,

                    p: 1.4,

                    borderRadius:
                        1.75,

                    bgcolor:
                        "rgba(0,0,0,0.025)",
                }}
            >
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    spacing={2}
                >
                    <Box>
                        <Typography
                            color="text.secondary"
                            sx={{
                                fontSize:
                                    "0.65rem",
                            }}
                        >
                            Entity
                        </Typography>

                        <Typography
                            fontWeight={600}
                            sx={{
                                mt: 0.2,

                                fontSize:
                                    "0.77rem",
                            }}
                        >
                            {log.entityType ||
                                "—"}
                        </Typography>
                    </Box>
                </Stack>

                <Typography
                    color="text.secondary"
                    sx={{
                        mt: 1.25,

                        fontSize:
                            "0.65rem",
                    }}
                >
                    Details
                </Typography>

                <Typography
                    sx={{
                        mt: 0.2,

                        fontSize:
                            "0.77rem",

                        lineHeight: 1.5,

                        overflowWrap:
                            "anywhere",
                    }}
                >
                    {log.details ||
                        "—"}
                </Typography>
            </Box>
        </Box>
    );
}

export default function AuditLogsPage({
    apiBaseUrl,
    authenticatedFetch,
}) {
    const [
        logs,
        setLogs,
    ] = useState([]);

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
        searchValue,
        setSearchValue,
    ] = useState("");

    const [
        actionFilter,
        setActionFilter,
    ] = useState("All");

    const [
        timeFilter,
        setTimeFilter,
    ] = useState(
        TIME_FILTERS.ALL,
    );

    // =========================================================
    // LOAD LOGS
    // =========================================================

    const loadLogs =
        useCallback(
            async (
                showFullLoader =
                    true,
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

                    const response =
                        await authenticatedFetch(
                            `${apiBaseUrl}/api/audit-logs`,
                        );

                    if (
                        response.status ===
                        401
                    ) {
                        return;
                    }

                    if (
                        response.status ===
                        403
                    ) {
                        throw new Error(
                            "You do not have permission to view the audit log.",
                        );
                    }

                    if (
                        !response.ok
                    ) {
                        throw new Error(
                            "Could not load audit log.",
                        );
                    }

                    const data =
                        await response.json();

                    setLogs(
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

                    setErrorMessage(
                        error.message ||
                            "Could not load audit log.",
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
                apiBaseUrl,
                authenticatedFetch,
            ],
        );

    useEffect(() => {
        loadLogs(true);
    }, [loadLogs]);

    // =========================================================
    // AVAILABLE ACTIONS
    // =========================================================

    const availableActions =
        useMemo(() => {
            return [
                ...new Set(
                    logs
                        .map(
                            log =>
                                log.action,
                        )
                        .filter(Boolean),
                ),
            ].sort();
        }, [logs]);

    // =========================================================
    // FILTER
    // =========================================================

    const filteredLogs =
        useMemo(() => {
            const search =
                searchValue
                    .trim()
                    .toLowerCase();

            return logs.filter(
                log => {
                    const matchesSearch =
                        search.length ===
                            0 ||
                        [
                            log.username,
                            log.action,
                            formatAction(
                                log.action,
                            ),
                            log.entityType,
                            log.details,
                        ].some(value =>
                            String(
                                value ?? "",
                            )
                                .toLowerCase()
                                .includes(
                                    search,
                                ),
                        );

                    const matchesAction =
                        actionFilter ===
                            "All" ||
                        log.action ===
                            actionFilter;

                    const matchesTime =
                        isWithinTimeRange(
                            log.createdAtUtc,
                            timeFilter,
                        );

                    return (
                        matchesSearch &&
                        matchesAction &&
                        matchesTime
                    );
                },
            );
        }, [
            logs,
            searchValue,
            actionFilter,
            timeFilter,
        ]);

    const hasActiveFilters =
        searchValue.trim().length >
            0 ||
        actionFilter !==
            "All" ||
        timeFilter !==
            TIME_FILTERS.ALL;

    function clearFilters() {
        setSearchValue("");
        setActionFilter("All");

        setTimeFilter(
            TIME_FILTERS.ALL,
        );
    }

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

                            lineHeight: 1.2,

                            letterSpacing:
                                "-0.025em",
                        }}
                    >
                        Audit Log
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
                        Review important
                        administrative and
                        operational actions
                        performed in the system.
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
                        loadLogs(false)
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

            {errorMessage && (
                <Alert
                    severity="error"
                    onClose={() =>
                        setErrorMessage("")
                    }
                    sx={{
                        mb: 2,
                    }}
                >
                    {errorMessage}
                </Alert>
            )}

            {/* AUDIT EVENTS */}
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
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
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
                    <Box>
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
                            Audit Events
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 0.25,

                                fontSize:
                                    "0.8rem",
                            }}
                        >
                            {logs.length} recorded{" "}
                            {logs.length === 1
                                ? "event"
                                : "events"}

                            {hasActiveFilters &&
                                ` · ${filteredLogs.length} shown`}
                        </Typography>
                    </Box>

                    <HistoryRoundedIcon
                        sx={{
                            color:
                                "text.disabled",

                            display: {
                                xs: "none",
                                sm: "block",
                            },
                        }}
                    />
                </Stack>

                {/* FILTER BAR */}
                <Stack
                    direction={{
                        xs: "column",
                        lg: "row",
                    }}
                    spacing={1.5}
                    alignItems={{
                        xs: "stretch",
                        lg: "center",
                    }}
                    sx={{
                        px: {
                            xs: 2,
                            sm: 2.5,
                        },

                        py: {
                            xs: 1.5,
                            sm: 1.75,
                        },

                        bgcolor:
                            "rgba(0,0,0,0.012)",

                        borderBottom:
                            "1px solid",

                        borderColor:
                            "divider",
                    }}
                >
                    <TextField
                        size="small"
                        value={
                            searchValue
                        }
                        onChange={event =>
                            setSearchValue(
                                event.target
                                    .value,
                            )
                        }
                        placeholder="Search user, action, entity or details"
                        sx={{
                            width: {
                                xs: "100%",
                                lg: 420,
                            },

                            "& .MuiOutlinedInput-root":
                                {
                                    bgcolor:
                                        "background.paper",
                                },
                        }}
                        slotProps={{
                            input: {
                                startAdornment:
                                    (
                                        <InputAdornment position="start">
                                            <SearchRoundedIcon
                                                sx={{
                                                    fontSize:
                                                        19,

                                                    color:
                                                        "text.secondary",
                                                }}
                                            />
                                        </InputAdornment>
                                    ),
                            },
                        }}
                    />

                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        spacing={1.5}
                    >
                        <FormControl
                            size="small"
                            sx={{
                                width: {
                                    xs:
                                        "100%",
                                    sm: 220,
                                },
                            }}
                        >
                            <InputLabel>
                                Action
                            </InputLabel>

                            <Select
                                value={
                                    actionFilter
                                }
                                label="Action"
                                onChange={event =>
                                    setActionFilter(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                sx={{
                                    bgcolor:
                                        "background.paper",
                                }}
                            >
                                <MenuItem value="All">
                                    All actions
                                </MenuItem>

                                {availableActions.map(
                                    action => (
                                        <MenuItem
                                            key={
                                                action
                                            }
                                            value={
                                                action
                                            }
                                        >
                                            {formatAction(
                                                action,
                                            )}
                                        </MenuItem>
                                    ),
                                )}
                            </Select>
                        </FormControl>

                        <FormControl
                            size="small"
                            sx={{
                                width: {
                                    xs:
                                        "100%",
                                    sm: 180,
                                },
                            }}
                        >
                            <InputLabel>
                                Period
                            </InputLabel>

                            <Select
                                value={
                                    timeFilter
                                }
                                label="Period"
                                onChange={event =>
                                    setTimeFilter(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                sx={{
                                    bgcolor:
                                        "background.paper",
                                }}
                            >
                                <MenuItem
                                    value={
                                        TIME_FILTERS.ALL
                                    }
                                >
                                    All time
                                </MenuItem>

                                <MenuItem
                                    value={
                                        TIME_FILTERS.LAST_24_HOURS
                                    }
                                >
                                    Last 24 hours
                                </MenuItem>

                                <MenuItem
                                    value={
                                        TIME_FILTERS.LAST_7_DAYS
                                    }
                                >
                                    Last 7 days
                                </MenuItem>

                                <MenuItem
                                    value={
                                        TIME_FILTERS.LAST_30_DAYS
                                    }
                                >
                                    Last 30 days
                                </MenuItem>
                            </Select>
                        </FormControl>

                        {hasActiveFilters && (
                            <Button
                                size="small"
                                color="inherit"
                                startIcon={
                                    <FilterAltOffRoundedIcon />
                                }
                                onClick={
                                    clearFilters
                                }
                                sx={{
                                    alignSelf: {
                                        xs:
                                            "stretch",
                                        sm:
                                            "center",
                                    },

                                    whiteSpace:
                                        "nowrap",

                                    textTransform:
                                        "none",

                                    color:
                                        "text.secondary",
                                }}
                            >
                                Clear filters
                            </Button>
                        )}
                    </Stack>
                </Stack>

                {/* CONTENT */}
                {isLoading ? (
                    <Box
                        sx={{
                            minHeight: 300,

                            display:
                                "grid",

                            placeItems:
                                "center",
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : logs.length ===
                  0 ? (
                    <Box
                        sx={{
                            py: 7,
                            px: 2,

                            textAlign:
                                "center",
                        }}
                    >
                        <HistoryRoundedIcon
                            sx={{
                                fontSize: 42,

                                color:
                                    "text.disabled",

                                mb: 1,
                            }}
                        />

                        <Typography
                            fontWeight={600}
                        >
                            No audit events
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 0.4,

                                fontSize:
                                    "0.8rem",
                            }}
                        >
                            Important system
                            actions will appear
                            here.
                        </Typography>
                    </Box>
                ) : filteredLogs.length ===
                  0 ? (
                    <Box
                        sx={{
                            py: 6,
                            px: 2,

                            textAlign:
                                "center",
                        }}
                    >
                        <Typography
                            fontWeight={600}
                        >
                            No matching events
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 0.4,

                                fontSize:
                                    "0.8rem",
                            }}
                        >
                            Try changing the
                            current filters.
                        </Typography>

                        <Button
                            size="small"
                            onClick={
                                clearFilters
                            }
                            sx={{
                                mt: 1,

                                textTransform:
                                    "none",
                            }}
                        >
                            Clear filters
                        </Button>
                    </Box>
                ) : (
                    <>
                        {/* DESKTOP */}
                        <TableContainer
                            sx={{
                                display: {
                                    xs: "none",
                                    md: "block",
                                },
                            }}
                        >
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            Time
                                        </TableCell>

                                        <TableCell>
                                            User
                                        </TableCell>

                                        <TableCell>
                                            Action
                                        </TableCell>

                                        <TableCell>
                                            Entity
                                        </TableCell>

                                        <TableCell>
                                            Details
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {filteredLogs.map(
                                        log => (
                                            <TableRow
                                                key={
                                                    log.id
                                                }
                                                hover
                                                sx={{
                                                    "& td":
                                                        {
                                                            py: 1.35,
                                                        },
                                                }}
                                            >
                                                <TableCell
                                                    sx={{
                                                        whiteSpace:
                                                            "nowrap",

                                                        fontSize:
                                                            "0.78rem",
                                                    }}
                                                >
                                                    {formatDate(
                                                        log.createdAtUtc,
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    <Stack
                                                        direction="row"
                                                        spacing={0.75}
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
                                                            fontWeight={
                                                                600
                                                            }
                                                            sx={{
                                                                fontSize:
                                                                    "0.8rem",
                                                            }}
                                                        >
                                                            {log.username ||
                                                                "System"}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>

                                                <TableCell>
                                                    <Chip
                                                        label={formatAction(
                                                            log.action,
                                                        )}
                                                        size="small"
                                                        color={getActionColor(
                                                            log.action,
                                                        )}
                                                        variant="outlined"
                                                        sx={{
                                                            height:
                                                                24,

                                                            fontWeight:
                                                                500,
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        fontSize:
                                                            "0.8rem",
                                                    }}
                                                >
                                                    {log.entityType ||
                                                        "—"}
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        minWidth:
                                                            260,

                                                        maxWidth:
                                                            520,

                                                        fontSize:
                                                            "0.78rem",

                                                        color:
                                                            "text.secondary",

                                                        overflowWrap:
                                                            "anywhere",
                                                    }}
                                                >
                                                    {log.details ||
                                                        "—"}
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* MOBILE */}
                        <Stack
                            sx={{
                                display: {
                                    xs: "flex",
                                    md: "none",
                                },
                            }}
                        >
                            {filteredLogs.map(
                                log => (
                                    <AuditLogMobileCard
                                        key={
                                            log.id
                                        }
                                        log={
                                            log
                                        }
                                    />
                                ),
                            )}
                        </Stack>
                    </>
                )}
            </Paper>
        </Box>
    );
}