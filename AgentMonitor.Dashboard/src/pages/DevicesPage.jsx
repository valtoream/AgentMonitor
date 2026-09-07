import {
    useMemo,
    useState,
} from "react";

import {
    Box,
    Button,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterAltOffRoundedIcon from "@mui/icons-material/FilterAltOffRounded";

import DeviceTable from "../components/DeviceTable";
import { normalizeDeviceStatus } from "../utils/formatters";

const STATUS_FILTERS = {
    ALL: "All",
    GOOD: "Good",
    WARNING: "Warning",
    CRITICAL: "Critical",
    UNKNOWN: "Unknown",
};

const SORT_OPTIONS = {
    HOSTNAME_ASC: "hostnameAsc",
    HEALTH_SCORE_DESC: "healthScoreDesc",
    HEALTH_SCORE_ASC: "healthScoreAsc",
    LAST_SEEN_DESC: "lastSeenDesc",
    LAST_SEEN_ASC: "lastSeenAsc",
};

export default function DevicesPage({
    devices,
}) {
    const [
        searchValue,
        setSearchValue,
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState(
        STATUS_FILTERS.ALL,
    );

    const [
        sortOption,
        setSortOption,
    ] = useState(
        SORT_OPTIONS.HOSTNAME_ASC,
    );

    const filteredDevices =
        useMemo(() => {
            const normalizedSearchValue =
                searchValue
                    .trim()
                    .toLowerCase();

            const result =
                devices.filter(
                    device => {
                        const matchesSearch =
                            normalizedSearchValue.length ===
                                0 ||
                            [
                                device.hostname,
                                device.loggedOnUser,
                                device.manufacturer,
                                device.model,
                                device.operatingSystem,
                            ].some(value =>
                                String(
                                    value ?? "",
                                )
                                    .toLowerCase()
                                    .includes(
                                        normalizedSearchValue,
                                    ),
                            );

                        const normalizedStatus =
                            normalizeDeviceStatus(
                                device.status,
                            );

                        const matchesStatus =
                            statusFilter ===
                                STATUS_FILTERS.ALL ||
                            normalizedStatus ===
                                statusFilter;

                        return (
                            matchesSearch &&
                            matchesStatus
                        );
                    },
                );

            return [...result].sort(
                (
                    firstDevice,
                    secondDevice,
                ) => {
                    switch (
                        sortOption
                    ) {
                        case SORT_OPTIONS.HEALTH_SCORE_DESC:
                            return (
                                Number(
                                    secondDevice.healthScore ??
                                        0,
                                ) -
                                Number(
                                    firstDevice.healthScore ??
                                        0,
                                )
                            );

                        case SORT_OPTIONS.HEALTH_SCORE_ASC:
                            return (
                                Number(
                                    firstDevice.healthScore ??
                                        0,
                                ) -
                                Number(
                                    secondDevice.healthScore ??
                                        0,
                                )
                            );

                        case SORT_OPTIONS.LAST_SEEN_DESC:
                            return (
                                getDateTimestamp(
                                    secondDevice.lastSeenAtUtc,
                                ) -
                                getDateTimestamp(
                                    firstDevice.lastSeenAtUtc,
                                )
                            );

                        case SORT_OPTIONS.LAST_SEEN_ASC:
                            return (
                                getDateTimestamp(
                                    firstDevice.lastSeenAtUtc,
                                ) -
                                getDateTimestamp(
                                    secondDevice.lastSeenAtUtc,
                                )
                            );

                        case SORT_OPTIONS.HOSTNAME_ASC:
                        default:
                            return String(
                                firstDevice.hostname ??
                                    "",
                            ).localeCompare(
                                String(
                                    secondDevice.hostname ??
                                        "",
                                ),
                                undefined,
                                {
                                    sensitivity:
                                        "base",
                                },
                            );
                    }
                },
            );
        }, [
            devices,
            searchValue,
            statusFilter,
            sortOption,
        ]);

    const hasActiveFilters =
        searchValue.trim().length >
            0 ||
        statusFilter !==
            STATUS_FILTERS.ALL ||
        sortOption !==
            SORT_OPTIONS.HOSTNAME_ASC;

    const isFilteringResults =
        searchValue.trim().length >
            0 ||
        statusFilter !==
            STATUS_FILTERS.ALL;

    function clearFilters() {
        setSearchValue("");

        setStatusFilter(
            STATUS_FILTERS.ALL,
        );

        setSortOption(
            SORT_OPTIONS.HOSTNAME_ASC,
        );
    }

    return (
        <Box
            sx={{
                width: "100%",
                minWidth: 0,
            }}
        >
            {/* PAGE HEADER */}
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
                    Devices
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
                    View and manage all
                    registered monitoring
                    endpoints.
                </Typography>
            </Box>

            {/* DEVICE INVENTORY */}
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

                    backgroundColor:
                        "background.paper",
                }}
            >
                {/* HEADER */}
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
                        Device Inventory
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
                        {devices.length}{" "}
                        registered{" "}
                        {devices.length ===
                        1
                            ? "device"
                            : "devices"}

                        {isFilteringResults &&
                            ` · ${filteredDevices.length} shown`}
                    </Typography>
                </Box>

                {/* FILTER BAR */}
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

                        bgcolor:
                            "rgba(0, 0, 0, 0.012)",

                        borderBottom:
                            "1px solid",

                        borderColor:
                            "divider",
                    }}
                >
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
                    >
                        {/* SEARCH */}
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
                            placeholder="Search by hostname, user, manufacturer, model or operating system"
                            aria-label="Search devices"
                            sx={{
                                width: {
                                    xs: "100%",
                                    lg: 520,
                                    xl: 600,
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

                        {/* FILTERS */}
                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row",
                            }}
                            spacing={1.5}
                            sx={{
                                flex: 1,
                            }}
                        >
                            <FormControl
                                size="small"
                                sx={{
                                    width: {
                                        xs: "100%",
                                        sm: 180,
                                    },
                                }}
                            >
                                <InputLabel>
                                    Status
                                </InputLabel>

                                <Select
                                    value={
                                        statusFilter
                                    }
                                    label="Status"
                                    onChange={event =>
                                        setStatusFilter(
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
                                            STATUS_FILTERS.ALL
                                        }
                                    >
                                        All statuses
                                    </MenuItem>

                                    <MenuItem
                                        value={
                                            STATUS_FILTERS.GOOD
                                        }
                                    >
                                        Good
                                    </MenuItem>

                                    <MenuItem
                                        value={
                                            STATUS_FILTERS.WARNING
                                        }
                                    >
                                        Warning
                                    </MenuItem>

                                    <MenuItem
                                        value={
                                            STATUS_FILTERS.CRITICAL
                                        }
                                    >
                                        Critical
                                    </MenuItem>

                                    <MenuItem
                                        value={
                                            STATUS_FILTERS.UNKNOWN
                                        }
                                    >
                                        Unknown
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl
                                size="small"
                                sx={{
                                    width: {
                                        xs: "100%",
                                        sm: 230,
                                    },
                                }}
                            >
                                <InputLabel>
                                    Sort by
                                </InputLabel>

                                <Select
                                    value={
                                        sortOption
                                    }
                                    label="Sort by"
                                    onChange={event =>
                                        setSortOption(
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
                                            SORT_OPTIONS.HOSTNAME_ASC
                                        }
                                    >
                                        Hostname
                                    </MenuItem>

                                    <MenuItem
                                        value={
                                            SORT_OPTIONS.HEALTH_SCORE_DESC
                                        }
                                    >
                                        Health score —
                                        highest
                                    </MenuItem>

                                    <MenuItem
                                        value={
                                            SORT_OPTIONS.HEALTH_SCORE_ASC
                                        }
                                    >
                                        Health score —
                                        lowest
                                    </MenuItem>

                                    <MenuItem
                                        value={
                                            SORT_OPTIONS.LAST_SEEN_DESC
                                        }
                                    >
                                        Last seen —
                                        newest
                                    </MenuItem>

                                    <MenuItem
                                        value={
                                            SORT_OPTIONS.LAST_SEEN_ASC
                                        }
                                    >
                                        Last seen —
                                        oldest
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            {hasActiveFilters && (
                                <Button
                                    color="inherit"
                                    size="small"
                                    startIcon={
                                        <FilterAltOffRoundedIcon />
                                    }
                                    onClick={
                                        clearFilters
                                    }
                                    sx={{
                                        alignSelf: {
                                            xs: "stretch",
                                            sm: "center",
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
                </Box>

                <DeviceTable
                    devices={
                        filteredDevices
                    }
                />
            </Paper>
        </Box>
    );
}

function getDateTimestamp(
    dateValue,
) {
    if (!dateValue) {
        return 0;
    }

    const date =
        new Date(dateValue);

    return Number.isNaN(
        date.getTime(),
    )
        ? 0
        : date.getTime();
}