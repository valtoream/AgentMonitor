import {
    useCallback,
    useEffect,
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
    ListItemIcon,
    Menu,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";

const metrics = [
    "DiskUsagePercent",
    "MemoryUsagePercent",
    "PendingUpdatesCount",
];

const operators = [
    "GreaterThan",
    "GreaterThanOrEqual",
    "LessThan",
    "LessThanOrEqual",
    "Equal",
];

const severities = [
    "Low",
    "Medium",
    "High",
    "Critical",
];

const initialForm = {
    name: "",
    description: "",
    metric: "DiskUsagePercent",
    operator: "GreaterThan",
    threshold: 50,
    consecutiveChecks: 3,
    severity: "High",
};

export default function MonitoringRulesPage({
    apiBaseUrl,
    authenticatedFetch,
    currentUser,
}) {
    const theme = useTheme();

    const isMobile =
        useMediaQuery(
            theme.breakpoints.down("md"),
        );

    const [rules, setRules] =
        useState([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    // =========================================================
    // CREATE RULE
    // =========================================================

    const [createOpen, setCreateOpen] =
        useState(false);

    const [form, setForm] =
        useState(initialForm);

    const [simulation, setSimulation] =
        useState(null);

    const [
        isSimulating,
        setIsSimulating,
    ] = useState(false);

    // =========================================================
    // SHADOW
    // =========================================================

    const [
        selectedShadowSummary,
        setSelectedShadowSummary,
    ] = useState(null);

    const [
        shadowSummaryOpen,
        setShadowSummaryOpen,
    ] = useState(false);

    // =========================================================
    // EXISTING RULE SIMULATION
    // =========================================================

    const [
        existingSimulation,
        setExistingSimulation,
    ] = useState(null);

    const [
        existingSimulationOpen,
        setExistingSimulationOpen,
    ] = useState(false);

    const [
        existingSimulationRuleName,
        setExistingSimulationRuleName,
    ] = useState("");

    const [
        existingSimulationRuleId,
        setExistingSimulationRuleId,
    ] = useState(null);

    const [
        existingSimulationRuleMode,
        setExistingSimulationRuleMode,
    ] = useState(null);

    const [
        simulatingRuleId,
        setSimulatingRuleId,
    ] = useState(null);

    const [
        isApplyingRecommendation,
        setIsApplyingRecommendation,
    ] = useState(false);

    // =========================================================
    // SIMULATION HISTORY
    // =========================================================

    const [
        simulationHistory,
        setSimulationHistory,
    ] = useState([]);

    const [
        simulationHistoryOpen,
        setSimulationHistoryOpen,
    ] = useState(false);

    const [
        historyRuleName,
        setHistoryRuleName,
    ] = useState("");

    const [
        isLoadingHistory,
        setIsLoadingHistory,
    ] = useState(false);

    // =========================================================
    // MANAGE MENU
    // =========================================================

    const [
        menuAnchor,
        setMenuAnchor,
    ] = useState(null);

    const [
        menuRule,
        setMenuRule,
    ] = useState(null);

    // =========================================================
    // LOAD RULES
    // =========================================================

    const loadRules =
        useCallback(async () => {
            try {
                setIsLoading(true);
                setErrorMessage("");

                const response =
                    await authenticatedFetch(
                        `${apiBaseUrl}/api/monitoring-rules`,
                    );

                if (response.status === 401) {
                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        "Could not load monitoring rules.",
                    );
                }

                const data =
                    await response.json();

                setRules(
                    Array.isArray(data)
                        ? data
                        : [],
                );
            } catch (error) {
                console.error(error);

                setErrorMessage(
                    error.message ||
                        "Could not load monitoring rules.",
                );
            } finally {
                setIsLoading(false);
            }
        }, [
            apiBaseUrl,
            authenticatedFetch,
        ]);

    useEffect(() => {
        loadRules();
    }, [loadRules]);

    // =========================================================
    // HELPERS
    // =========================================================

    function updateForm(
        field,
        value,
    ) {
        setForm(previous => ({
            ...previous,
            [field]: value,
        }));
    }

    function getMetricLabel(metric) {
        switch (metric) {
            case "DiskUsagePercent":
                return "Disk usage (%)";

            case "MemoryUsagePercent":
                return "Memory usage (%)";

            case "PendingUpdatesCount":
                return "Pending updates";

            default:
                return metric;
        }
    }

    function getOperatorLabel(
        operator,
    ) {
        switch (operator) {
            case "GreaterThan":
                return "Greater than (>)";

            case "GreaterThanOrEqual":
                return "Greater than or equal (≥)";

            case "LessThan":
                return "Less than (<)";

            case "LessThanOrEqual":
                return "Less than or equal (≤)";

            case "Equal":
                return "Equal (=)";

            default:
                return operator;
        }
    }

    function getModeColor(mode) {
        switch (mode) {
            case "Active":
                return "success";

            case "Shadow":
                return "warning";

            case "Draft":
                return "info";

            default:
                return "default";
        }
    }

    function getSeverityColor(
        severity,
    ) {
        switch (severity) {
            case "Critical":
                return "error";

            case "High":
                return "warning";

            case "Medium":
                return "info";

            default:
                return "default";
        }
    }

    function getQualityColor(
        value,
    ) {
        switch (value) {
            case "Good":
                return "success";

            case "Poor":
                return "error";

            case "NeedsAdjustment":
                return "warning";

            default:
                return "default";
        }
    }

    function getNoiseColor(value) {
        switch (value) {
            case "High":
                return "error";

            case "Medium":
                return "warning";

            case "Low":
                return "success";

            default:
                return "default";
        }
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

                hour12: false,
            },
        ).format(date);
    }

    async function getErrorMessage(
        response,
        fallback,
    ) {
        try {
            const data =
                await response.json();

            return (
                data?.message ||
                fallback
            );
        } catch {
            return fallback;
        }
    }

    function openManageMenu(
        event,
        rule,
    ) {
        setMenuAnchor(
            event.currentTarget,
        );

        setMenuRule(rule);
    }

    function closeManageMenu() {
        setMenuAnchor(null);
        setMenuRule(null);
    }

    // =========================================================
    // NEW RULE SIMULATION
    // =========================================================

    async function runSimulation() {
        try {
            setIsSimulating(true);
            setSimulation(null);
            setErrorMessage("");

            const response =
                await authenticatedFetch(
                    `${apiBaseUrl}/api/rule-simulation/simulate`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            monitoringRuleId:
                                null,

                            deviceId:
                                null,

                            metric:
                                form.metric,

                            operator:
                                form.operator,

                            threshold:
                                Number(
                                    form.threshold,
                                ),

                            consecutiveChecks:
                                Number(
                                    form.consecutiveChecks,
                                ),

                            fromUtc:
                                null,

                            toUtc:
                                null,
                        }),
                    },
                );

            if (!response.ok) {
                throw new Error(
                    await getErrorMessage(
                        response,
                        "Rule simulation failed.",
                    ),
                );
            }

            const data =
                await response.json();

            setSimulation(data);
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.message ||
                    "Rule simulation failed.",
            );
        } finally {
            setIsSimulating(false);
        }
    }

    function applyRecommendation() {
        if (!simulation) {
            return;
        }

        setForm(previous => ({
            ...previous,

            threshold:
                simulation.recommendedThreshold ??
                previous.threshold,

            consecutiveChecks:
                simulation.recommendedConsecutiveChecks ??
                previous.consecutiveChecks,
        }));

        setSuccessMessage(
            "Recommendation applied to the new rule configuration.",
        );
    }

    // =========================================================
    // CREATE
    // =========================================================

    async function createRule() {
        try {
            setErrorMessage("");

            const response =
                await authenticatedFetch(
                    `${apiBaseUrl}/api/monitoring-rules`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            name:
                                form.name.trim(),

                            description:
                                form.description.trim(),

                            metric:
                                form.metric,

                            operator:
                                form.operator,

                            threshold:
                                Number(
                                    form.threshold,
                                ),

                            consecutiveChecks:
                                Number(
                                    form.consecutiveChecks,
                                ),

                            severity:
                                form.severity,
                        }),
                    },
                );

            if (!response.ok) {
                throw new Error(
                    await getErrorMessage(
                        response,
                        "Could not create monitoring rule.",
                    ),
                );
            }

            setCreateOpen(false);
            setSimulation(null);
            setForm(initialForm);

            setSuccessMessage(
                "Monitoring rule created as Draft.",
            );

            await loadRules();
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.message ||
                    "Could not create monitoring rule.",
            );
        }
    }

    // =========================================================
    // CHANGE MODE
    // =========================================================

    async function changeMode(
        rule,
        mode,
    ) {
        closeManageMenu();

        try {
            setErrorMessage("");

            const response =
                await authenticatedFetch(
                    `${apiBaseUrl}/api/monitoring-rules/${rule.id}/mode`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            mode,
                        }),
                    },
                );

            if (!response.ok) {
                throw new Error(
                    await getErrorMessage(
                        response,
                        "Could not change rule mode.",
                    ),
                );
            }

            setSuccessMessage(
                `Rule mode changed to ${mode}.`,
            );

            await loadRules();
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.message ||
                    "Could not change rule mode.",
            );
        }
    }

    // =========================================================
    // DELETE
    // =========================================================

    async function deleteRule(
        rule,
    ) {
        closeManageMenu();

        const confirmed =
            window.confirm(
                `Delete monitoring rule "${rule.name}"?`,
            );

        if (!confirmed) {
            return;
        }

        try {
            setErrorMessage("");

            const response =
                await authenticatedFetch(
                    `${apiBaseUrl}/api/monitoring-rules/${rule.id}`,
                    {
                        method: "DELETE",
                    },
                );

            if (!response.ok) {
                throw new Error(
                    await getErrorMessage(
                        response,
                        "Could not delete monitoring rule.",
                    ),
                );
            }

            setSuccessMessage(
                "Monitoring rule deleted.",
            );

            await loadRules();
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.message ||
                    "Could not delete monitoring rule.",
            );
        }
    }

    // =========================================================
    // SHADOW SUMMARY
    // =========================================================

    async function showShadowSummary(
        rule,
    ) {
        closeManageMenu();

        try {
            setErrorMessage("");

            const response =
                await authenticatedFetch(
                    `${apiBaseUrl}/api/monitoring-rules/${rule.id}/shadow-summary`,
                );

            if (!response.ok) {
                throw new Error(
                    "Could not load Shadow Mode results.",
                );
            }

            const data =
                await response.json();

            setSelectedShadowSummary(
                data,
            );

            setShadowSummaryOpen(
                true,
            );
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.message ||
                    "Could not load Shadow Mode results.",
            );
        }
    }

    // =========================================================
    // EXISTING RULE SIMULATION
    // =========================================================

    async function simulateExistingRule(
        rule,
    ) {
        closeManageMenu();

        try {
            setSimulatingRuleId(
                rule.id,
            );

            setExistingSimulation(
                null,
            );

            setExistingSimulationRuleName(
                rule.name,
            );

            setExistingSimulationRuleId(
                rule.id,
            );

            setExistingSimulationRuleMode(
                rule.mode,
            );

            setErrorMessage("");

            const response =
                await authenticatedFetch(
                    `${apiBaseUrl}/api/rule-simulation/simulate`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            monitoringRuleId:
                                rule.id,

                            deviceId:
                                null,

                            metric:
                                rule.metric,

                            operator:
                                rule.operator,

                            threshold:
                                Number(
                                    rule.threshold,
                                ),

                            consecutiveChecks:
                                Number(
                                    rule.consecutiveChecks,
                                ),

                            fromUtc:
                                null,

                            toUtc:
                                null,
                        }),
                    },
                );

            if (!response.ok) {
                throw new Error(
                    await getErrorMessage(
                        response,
                        "Rule simulation failed.",
                    ),
                );
            }

            const data =
                await response.json();

            setExistingSimulation(
                data,
            );

            setExistingSimulationOpen(
                true,
            );
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.message ||
                    "Rule simulation failed.",
            );
        } finally {
            setSimulatingRuleId(
                null,
            );
        }
    }

    // =========================================================
    // APPLY EXISTING RECOMMENDATION
    // =========================================================

    async function applyExistingRecommendation(
        ruleId,
    ) {
        if (!ruleId) {
            return;
        }

        try {
            setIsApplyingRecommendation(
                true,
            );

            setErrorMessage("");

            const response =
                await authenticatedFetch(
                    `${apiBaseUrl}/api/monitoring-rules/${ruleId}/apply-latest-recommendation`,
                    {
                        method: "PUT",
                    },
                );

            if (!response.ok) {
                throw new Error(
                    await getErrorMessage(
                        response,
                        "Could not apply recommendation.",
                    ),
                );
            }

            const updatedRule =
                await response.json();

            setExistingSimulationOpen(
                false,
            );

            let message =
                `Recommendation applied. Threshold: ${updatedRule.threshold}, ` +
                `checks: ${updatedRule.consecutiveChecks}.`;

            if (
                existingSimulationRuleMode ===
                "Shadow"
            ) {
                message +=
                    " Shadow validation was reset.";
            }

            setSuccessMessage(message);

            await loadRules();
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.message ||
                    "Could not apply recommendation.",
            );
        } finally {
            setIsApplyingRecommendation(
                false,
            );
        }
    }

    // =========================================================
    // HISTORY
    // =========================================================

    async function showSimulationHistory(
        rule,
    ) {
        closeManageMenu();

        try {
            setIsLoadingHistory(
                true,
            );

            setSimulationHistory(
                [],
            );

            setHistoryRuleName(
                rule.name,
            );

            setSimulationHistoryOpen(
                true,
            );

            setErrorMessage("");

            const response =
                await authenticatedFetch(
                    `${apiBaseUrl}/api/monitoring-rules/${rule.id}/simulation-history`,
                );

            if (!response.ok) {
                throw new Error(
                    await getErrorMessage(
                        response,
                        "Could not load simulation history.",
                    ),
                );
            }

            const data =
                await response.json();

            setSimulationHistory(
                Array.isArray(data)
                    ? data
                    : [],
            );
        } catch (error) {
            console.error(error);

            setSimulationHistoryOpen(
                false,
            );

            setErrorMessage(
                error.message ||
                    "Could not load simulation history.",
            );
        } finally {
            setIsLoadingHistory(
                false,
            );
        }
    }

    // =========================================================
    // ACCESS
    // =========================================================

    if (
        currentUser?.role !==
        "Administrator"
    ) {
        return (
            <Alert severity="error">
                Administrator access is required.
            </Alert>
        );
    }

    return (
        <Box
            sx={{
                width: "100%",
                minWidth: 0,
            }}
        >
            {/* =====================================================
                HEADER
            ===================================================== */}
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
                                xs: "1.75rem",
                                sm: "2rem",
                                md: "2.125rem",
                            },

                            lineHeight: 1.2,

                            letterSpacing:
                                "-0.025em",
                        }}
                    >
                        Monitoring Rules
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
                        Test, optimize and deploy
                        dynamic monitoring rules.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={
                        <AddRoundedIcon />
                    }
                    onClick={() => {
                        setForm(
                            initialForm,
                        );

                        setSimulation(
                            null,
                        );

                        setCreateOpen(
                            true,
                        );
                    }}
                    sx={{
                        alignSelf: {
                            xs: "stretch",
                            sm: "center",
                        },

                        textTransform:
                            "none",
                    }}
                >
                    New Rule
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

            {/* =====================================================
                RULE LIST
            ===================================================== */}
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
                        Rule Configuration
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 0.25,
                            fontSize:
                                "0.8rem",
                        }}
                    >
                        {rules.length} configured{" "}
                        {rules.length === 1
                            ? "rule"
                            : "rules"}
                    </Typography>
                </Box>

                {isLoading ? (
                    <Box
                        sx={{
                            minHeight: 260,
                            display: "grid",
                            placeItems:
                                "center",
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : rules.length === 0 ? (
                    <Box
                        sx={{
                            px: 2,
                            py: 6,
                            textAlign:
                                "center",
                        }}
                    >
                        <RuleRoundedIcon
                            sx={{
                                fontSize: 38,
                                color:
                                    "text.disabled",
                                mb: 1,
                            }}
                        />

                        <Typography
                            fontWeight={600}
                        >
                            No monitoring rules
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 0.4,
                                fontSize:
                                    "0.82rem",
                            }}
                        >
                            Create a rule to start
                            historical validation.
                        </Typography>
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
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            Rule
                                        </TableCell>

                                        <TableCell>
                                            Condition
                                        </TableCell>

                                        <TableCell>
                                            Checks
                                        </TableCell>

                                        <TableCell>
                                            Severity
                                        </TableCell>

                                        <TableCell>
                                            Mode
                                        </TableCell>

                                        <TableCell align="right">
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {rules.map(
                                        rule => (
                                            <TableRow
                                                key={
                                                    rule.id
                                                }
                                                hover
                                                sx={{
                                                    "& td":
                                                        {
                                                            py: 1.5,
                                                        },
                                                }}
                                            >
                                                <TableCell>
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
                                                            rule.name
                                                        }
                                                    </Typography>

                                                    <Typography
                                                        color="text.secondary"
                                                        sx={{
                                                            mt: 0.2,
                                                            fontSize:
                                                                "0.7rem",
                                                            maxWidth:
                                                                300,
                                                        }}
                                                    >
                                                        {rule.description ||
                                                            getMetricLabel(
                                                                rule.metric,
                                                            )}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography
                                                        fontWeight={
                                                            500
                                                        }
                                                        sx={{
                                                            fontSize:
                                                                "0.8rem",
                                                        }}
                                                    >
                                                        {getMetricLabel(
                                                            rule.metric,
                                                        )}
                                                    </Typography>

                                                    <Typography
                                                        color="text.secondary"
                                                        sx={{
                                                            mt: 0.15,
                                                            fontSize:
                                                                "0.7rem",
                                                        }}
                                                    >
                                                        {getOperatorLabel(
                                                            rule.operator,
                                                        )}{" "}
                                                        {
                                                            rule.threshold
                                                        }
                                                    </Typography>
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
                                                        {
                                                            rule.consecutiveChecks
                                                        }
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={
                                                            rule.severity
                                                        }
                                                        color={getSeverityColor(
                                                            rule.severity,
                                                        )}
                                                        variant="outlined"
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={
                                                            rule.mode
                                                        }
                                                        color={getModeColor(
                                                            rule.mode,
                                                        )}
                                                    />
                                                </TableCell>

                                                <TableCell align="right">
                                                    <Stack
                                                        direction="row"
                                                        spacing={0.5}
                                                        justifyContent="flex-end"
                                                        alignItems="center"
                                                    >
                                                        <Button
                                                            size="small"
                                                            startIcon={
                                                                simulatingRuleId ===
                                                                rule.id ? (
                                                                    <CircularProgress
                                                                        size={
                                                                            13
                                                                        }
                                                                        color="inherit"
                                                                    />
                                                                ) : (
                                                                    <ScienceRoundedIcon />
                                                                )
                                                            }
                                                            disabled={
                                                                simulatingRuleId !==
                                                                null
                                                            }
                                                            onClick={() =>
                                                                simulateExistingRule(
                                                                    rule,
                                                                )
                                                            }
                                                            sx={{
                                                                textTransform:
                                                                    "none",
                                                            }}
                                                        >
                                                            Simulate
                                                        </Button>

                                                        <Button
                                                            size="small"
                                                            startIcon={
                                                                <HistoryRoundedIcon />
                                                            }
                                                            onClick={() =>
                                                                showSimulationHistory(
                                                                    rule,
                                                                )
                                                            }
                                                            sx={{
                                                                textTransform:
                                                                    "none",
                                                            }}
                                                        >
                                                            History
                                                        </Button>

                                                        <Tooltip title="Manage">
                                                            <IconButton
                                                                size="small"
                                                                onClick={event =>
                                                                    openManageMenu(
                                                                        event,
                                                                        rule,
                                                                    )
                                                                }
                                                            >
                                                                <MoreVertRoundedIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
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
                            {rules.map(
                                rule => (
                                    <Box
                                        key={
                                            rule.id
                                        }
                                        sx={{
                                            px: 2,
                                            py: 2,

                                            borderBottom:
                                                "1px solid",

                                            borderColor:
                                                "divider",

                                            "&:last-child":
                                                {
                                                    borderBottom:
                                                        0,
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
                                                >
                                                    {
                                                        rule.name
                                                    }
                                                </Typography>

                                                {rule.description && (
                                                    <Typography
                                                        color="text.secondary"
                                                        sx={{
                                                            mt: 0.25,
                                                            fontSize:
                                                                "0.75rem",
                                                        }}
                                                    >
                                                        {
                                                            rule.description
                                                        }
                                                    </Typography>
                                                )}
                                            </Box>

                                            <Chip
                                                size="small"
                                                label={
                                                    rule.mode
                                                }
                                                color={getModeColor(
                                                    rule.mode,
                                                )}
                                            />
                                        </Stack>

                                        <Box
                                            sx={{
                                                mt: 1.5,

                                                p: 1.5,

                                                borderRadius:
                                                    1.75,

                                                bgcolor:
                                                    "rgba(0,0,0,0.025)",
                                            }}
                                        >
                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    fontSize:
                                                        "0.68rem",
                                                }}
                                            >
                                                Condition
                                            </Typography>

                                            <Typography
                                                fontWeight={
                                                    600
                                                }
                                                sx={{
                                                    mt: 0.25,
                                                    fontSize:
                                                        "0.8rem",
                                                }}
                                            >
                                                {getMetricLabel(
                                                    rule.metric,
                                                )}
                                                {" · "}
                                                {getOperatorLabel(
                                                    rule.operator,
                                                )}
                                                {" "}
                                                {
                                                    rule.threshold
                                                }
                                            </Typography>

                                            <Stack
                                                direction="row"
                                                spacing={2}
                                                sx={{
                                                    mt: 1.25,
                                                }}
                                            >
                                                <Box>
                                                    <Typography
                                                        color="text.secondary"
                                                        sx={{
                                                            fontSize:
                                                                "0.66rem",
                                                        }}
                                                    >
                                                        Checks
                                                    </Typography>

                                                    <Typography
                                                        fontWeight={
                                                            700
                                                        }
                                                        sx={{
                                                            fontSize:
                                                                "0.78rem",
                                                        }}
                                                    >
                                                        {
                                                            rule.consecutiveChecks
                                                        }
                                                    </Typography>
                                                </Box>

                                                <Box>
                                                    <Typography
                                                        color="text.secondary"
                                                        sx={{
                                                            fontSize:
                                                                "0.66rem",
                                                        }}
                                                    >
                                                        Severity
                                                    </Typography>

                                                    <Box
                                                        sx={{
                                                            mt: 0.25,
                                                        }}
                                                    >
                                                        <Chip
                                                            size="small"
                                                            label={
                                                                rule.severity
                                                            }
                                                            color={getSeverityColor(
                                                                rule.severity,
                                                            )}
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                </Box>
                                            </Stack>
                                        </Box>

                                        <Stack
                                            direction="row"
                                            spacing={0.75}
                                            sx={{
                                                mt: 1.5,
                                            }}
                                        >
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                disabled={
                                                    simulatingRuleId !==
                                                    null
                                                }
                                                onClick={() =>
                                                    simulateExistingRule(
                                                        rule,
                                                    )
                                                }
                                                sx={{
                                                    textTransform:
                                                        "none",
                                                }}
                                            >
                                                Simulate
                                            </Button>

                                            <Button
                                                size="small"
                                                variant="outlined"
                                                fullWidth
                                                onClick={() =>
                                                    showSimulationHistory(
                                                        rule,
                                                    )
                                                }
                                                sx={{
                                                    textTransform:
                                                        "none",
                                                }}
                                            >
                                                History
                                            </Button>

                                            <IconButton
                                                size="small"
                                                onClick={event =>
                                                    openManageMenu(
                                                        event,
                                                        rule,
                                                    )
                                                }
                                                sx={{
                                                    border:
                                                        "1px solid",
                                                    borderColor:
                                                        "divider",
                                                    borderRadius:
                                                        1.5,
                                                }}
                                            >
                                                <MoreVertRoundedIcon />
                                            </IconButton>
                                        </Stack>
                                    </Box>
                                ),
                            )}
                        </Stack>
                    </>
                )}
            </Paper>

            {/* =====================================================
                MANAGE MENU
            ===================================================== */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={closeManageMenu}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                {menuRule && (
                    <>
                        <MenuItem
                            onClick={() =>
                                simulateExistingRule(
                                    menuRule,
                                )
                            }
                        >
                            <ListItemIcon>
                                <ScienceRoundedIcon fontSize="small" />
                            </ListItemIcon>
                            Simulate
                        </MenuItem>

                        <MenuItem
                            onClick={() =>
                                showSimulationHistory(
                                    menuRule,
                                )
                            }
                        >
                            <ListItemIcon>
                                <HistoryRoundedIcon fontSize="small" />
                            </ListItemIcon>
                            Simulation History
                        </MenuItem>

                        <Divider />

                        {menuRule.mode ===
                            "Draft" && (
                            <>
                                <MenuItem
                                    onClick={() =>
                                        changeMode(
                                            menuRule,
                                            "Shadow",
                                        )
                                    }
                                >
                                    <ListItemIcon>
                                        <VisibilityRoundedIcon fontSize="small" />
                                    </ListItemIcon>
                                    Start Shadow Mode
                                </MenuItem>

                                <MenuItem
                                    onClick={() =>
                                        deleteRule(
                                            menuRule,
                                        )
                                    }
                                    sx={{
                                        color:
                                            "error.main",
                                    }}
                                >
                                    <ListItemIcon>
                                        <DeleteOutlineRoundedIcon
                                            fontSize="small"
                                            color="error"
                                        />
                                    </ListItemIcon>
                                    Delete
                                </MenuItem>
                            </>
                        )}

                        {menuRule.mode ===
                            "Shadow" && (
                            <>
                                <MenuItem
                                    onClick={() =>
                                        showShadowSummary(
                                            menuRule,
                                        )
                                    }
                                >
                                    <ListItemIcon>
                                        <VisibilityRoundedIcon fontSize="small" />
                                    </ListItemIcon>
                                    Shadow Results
                                </MenuItem>

                                <MenuItem
                                    onClick={() =>
                                        changeMode(
                                            menuRule,
                                            "Active",
                                        )
                                    }
                                >
                                    <ListItemIcon>
                                        <PlayArrowRoundedIcon fontSize="small" />
                                    </ListItemIcon>
                                    Activate Rule
                                </MenuItem>
                            </>
                        )}

                        {menuRule.mode ===
                            "Active" && (
                            <>
                                <MenuItem
                                    onClick={() =>
                                        showShadowSummary(
                                            menuRule,
                                        )
                                    }
                                >
                                    <ListItemIcon>
                                        <VisibilityRoundedIcon fontSize="small" />
                                    </ListItemIcon>
                                    Shadow Results
                                </MenuItem>

                                <MenuItem
                                    onClick={() =>
                                        changeMode(
                                            menuRule,
                                            "Disabled",
                                        )
                                    }
                                >
                                    <ListItemIcon>
                                        <BlockRoundedIcon fontSize="small" />
                                    </ListItemIcon>
                                    Disable Rule
                                </MenuItem>
                            </>
                        )}

                        {menuRule.mode ===
                            "Disabled" && (
                            <>
                                <MenuItem
                                    onClick={() =>
                                        changeMode(
                                            menuRule,
                                            "Shadow",
                                        )
                                    }
                                >
                                    <ListItemIcon>
                                        <RestartAltRoundedIcon fontSize="small" />
                                    </ListItemIcon>
                                    Test Again
                                </MenuItem>

                                <MenuItem
                                    onClick={() =>
                                        deleteRule(
                                            menuRule,
                                        )
                                    }
                                    sx={{
                                        color:
                                            "error.main",
                                    }}
                                >
                                    <ListItemIcon>
                                        <DeleteOutlineRoundedIcon
                                            fontSize="small"
                                            color="error"
                                        />
                                    </ListItemIcon>
                                    Delete
                                </MenuItem>
                            </>
                        )}
                    </>
                )}
            </Menu>

            {/* =====================================================
                CREATE RULE
            ===================================================== */}
            <Dialog
                open={createOpen}
                onClose={() =>
                    !isSimulating &&
                    setCreateOpen(false)
                }
                fullWidth
                fullScreen={isMobile}
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius: {
                            xs: 0,
                            md: 2.5,
                        },
                    },
                }}
            >
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
                    >
                        <Box>
                            <Typography
                                fontWeight={700}
                                sx={{
                                    fontSize:
                                        "1.1rem",
                                }}
                            >
                                Create Monitoring Rule
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{
                                    mt: 0.2,
                                    fontSize:
                                        "0.72rem",
                                }}
                            >
                                Configure and validate
                                the rule before deployment.
                            </Typography>
                        </Box>

                        <IconButton
                            size="small"
                            disabled={
                                isSimulating
                            }
                            onClick={() =>
                                setCreateOpen(
                                    false,
                                )
                            }
                        >
                            <CloseRoundedIcon />
                        </IconButton>
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
                    <Grid
                        container
                        spacing={2}
                    >
                        <Grid
                            size={{
                                xs: 12,
                            }}
                        >
                            <TextField
                                label="Rule name"
                                value={
                                    form.name
                                }
                                onChange={event =>
                                    updateForm(
                                        "name",
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                fullWidth
                            />
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                            }}
                        >
                            <TextField
                                label="Description"
                                value={
                                    form.description
                                }
                                onChange={event =>
                                    updateForm(
                                        "description",
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                multiline
                                minRows={2}
                                fullWidth
                            />
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                sm: 6,
                            }}
                        >
                            <FormControl fullWidth>
                                <InputLabel>
                                    Metric
                                </InputLabel>

                                <Select
                                    label="Metric"
                                    value={
                                        form.metric
                                    }
                                    onChange={event =>
                                        updateForm(
                                            "metric",
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                >
                                    {metrics.map(
                                        metric => (
                                            <MenuItem
                                                key={
                                                    metric
                                                }
                                                value={
                                                    metric
                                                }
                                            >
                                                {getMetricLabel(
                                                    metric,
                                                )}
                                            </MenuItem>
                                        ),
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                sm: 6,
                            }}
                        >
                            <FormControl fullWidth>
                                <InputLabel>
                                    Operator
                                </InputLabel>

                                <Select
                                    label="Operator"
                                    value={
                                        form.operator
                                    }
                                    onChange={event =>
                                        updateForm(
                                            "operator",
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                >
                                    {operators.map(
                                        operator => (
                                            <MenuItem
                                                key={
                                                    operator
                                                }
                                                value={
                                                    operator
                                                }
                                            >
                                                {getOperatorLabel(
                                                    operator,
                                                )}
                                            </MenuItem>
                                        ),
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                sm: 4,
                            }}
                        >
                            <TextField
                                label="Threshold"
                                type="number"
                                value={
                                    form.threshold
                                }
                                onChange={event =>
                                    updateForm(
                                        "threshold",
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                fullWidth
                            />
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                sm: 4,
                            }}
                        >
                            <TextField
                                label="Consecutive checks"
                                type="number"
                                value={
                                    form.consecutiveChecks
                                }
                                onChange={event =>
                                    updateForm(
                                        "consecutiveChecks",
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                slotProps={{
                                    htmlInput: {
                                        min: 1,
                                        max: 20,
                                    },
                                }}
                                fullWidth
                            />
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                sm: 4,
                            }}
                        >
                            <FormControl fullWidth>
                                <InputLabel>
                                    Severity
                                </InputLabel>

                                <Select
                                    label="Severity"
                                    value={
                                        form.severity
                                    }
                                    onChange={event =>
                                        updateForm(
                                            "severity",
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                >
                                    {severities.map(
                                        severity => (
                                            <MenuItem
                                                key={
                                                    severity
                                                }
                                                value={
                                                    severity
                                                }
                                            >
                                                {
                                                    severity
                                                }
                                            </MenuItem>
                                        ),
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Paper
                        variant="outlined"
                        sx={{
                            mt: 2.5,
                            p: {
                                xs: 1.75,
                                sm: 2,
                            },
                            borderRadius: 2,
                        }}
                    >
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
                        >
                            <Box>
                                <Typography
                                    fontWeight={
                                        700
                                    }
                                    sx={{
                                        fontSize:
                                            "0.9rem",
                                    }}
                                >
                                    Historical Validation
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        mt: 0.2,
                                        fontSize:
                                            "0.72rem",
                                    }}
                                >
                                    Test the configuration
                                    against collected health checks.
                                </Typography>
                            </Box>

                            <Button
                                variant="outlined"
                                startIcon={
                                    isSimulating ? (
                                        <CircularProgress
                                            size={
                                                15
                                            }
                                            color="inherit"
                                        />
                                    ) : (
                                        <ScienceRoundedIcon />
                                    )
                                }
                                disabled={
                                    isSimulating
                                }
                                onClick={
                                    runSimulation
                                }
                                sx={{
                                    textTransform:
                                        "none",
                                }}
                            >
                                {isSimulating
                                    ? "Simulating..."
                                    : "Run Simulation"}
                            </Button>
                        </Stack>

                        {simulation && (
                            <>
                                <Divider
                                    sx={{
                                        my: 2,
                                    }}
                                />

                                <SimulationResult
                                    simulation={
                                        simulation
                                    }
                                />

                                <Button
                                    variant="contained"
                                    startIcon={
                                        <CheckCircleRoundedIcon />
                                    }
                                    onClick={
                                        applyRecommendation
                                    }
                                    sx={{
                                        mt: 2,
                                        textTransform:
                                            "none",
                                    }}
                                >
                                    Apply Recommendation
                                </Button>
                            </>
                        )}
                    </Paper>
                </DialogContent>

                <Divider />

                <DialogActions
                    sx={{
                        px: {
                            xs: 2,
                            sm: 2.5,
                        },
                        py: 1.75,
                    }}
                >
                    <Button
                        color="inherit"
                        onClick={() =>
                            setCreateOpen(
                                false,
                            )
                        }
                        sx={{
                            textTransform:
                                "none",
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        disabled={
                            !form.name.trim()
                        }
                        onClick={
                            createRule
                        }
                        sx={{
                            textTransform:
                                "none",
                        }}
                    >
                        Create Draft
                    </Button>
                </DialogActions>
            </Dialog>

            {/* =====================================================
                SHADOW RESULTS
            ===================================================== */}
            <Dialog
                open={
                    shadowSummaryOpen
                }
                onClose={() =>
                    setShadowSummaryOpen(
                        false,
                    )
                }
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Shadow Mode Results
                </DialogTitle>

                <DialogContent>
                    {selectedShadowSummary && (
                        <Stack
                            spacing={2}
                            sx={{
                                mt: 1,
                            }}
                        >
                            <Typography
                                fontWeight={
                                    700
                                }
                            >
                                {
                                    selectedShadowSummary.ruleName
                                }
                            </Typography>

                            <Grid
                                container
                                spacing={1.5}
                            >
                                <ResultBox
                                    title="Evaluations"
                                    value={
                                        selectedShadowSummary.evaluations
                                    }
                                />

                                <ResultBox
                                    title="Condition Met"
                                    value={
                                        selectedShadowSummary.conditionMetChecks
                                    }
                                />

                                <ResultBox
                                    title="Condition Rate"
                                    value={`${selectedShadowSummary.conditionRatePercent}%`}
                                />

                                <ResultBox
                                    title="Would Trigger"
                                    value={
                                        selectedShadowSummary.wouldTriggerIncidents
                                    }
                                />

                                <ResultBox
                                    title="Affected Devices"
                                    value={
                                        selectedShadowSummary.affectedDevices
                                    }
                                />

                                <ResultBox
                                    title="Last Evaluation"
                                    value={formatDate(
                                        selectedShadowSummary.lastEvaluationAtUtc,
                                    )}
                                />
                            </Grid>
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() =>
                            setShadowSummaryOpen(
                                false,
                            )
                        }
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* =====================================================
                EXISTING SIMULATION
            ===================================================== */}
            <Dialog
                open={
                    existingSimulationOpen
                }
                onClose={() =>
                    !isApplyingRecommendation &&
                    setExistingSimulationOpen(
                        false,
                    )
                }
                fullWidth
                fullScreen={isMobile}
                maxWidth="sm"
            >
                <DialogTitle>
                    Simulation Result
                </DialogTitle>

                <DialogContent>
                    {existingSimulation && (
                        <Stack
                            spacing={2}
                            sx={{
                                mt: 1,
                            }}
                        >
                            <Typography
                                fontWeight={
                                    700
                                }
                                sx={{
                                    fontSize:
                                        "1rem",
                                }}
                            >
                                {
                                    existingSimulationRuleName
                                }
                            </Typography>

                            <SimulationResult
                                simulation={
                                    existingSimulation
                                }
                            />

                            {existingSimulationRuleMode ===
                                "Active" && (
                                <Alert severity="warning">
                                    Disable this rule
                                    before applying a new
                                    recommendation.
                                </Alert>
                            )}

                            {existingSimulationRuleMode ===
                                "Shadow" && (
                                <Alert severity="warning">
                                    Applying the
                                    recommendation will
                                    restart Shadow validation.
                                </Alert>
                            )}

                            <Button
                                variant="contained"
                                startIcon={
                                    isApplyingRecommendation ? (
                                        <CircularProgress
                                            size={
                                                15
                                            }
                                            color="inherit"
                                        />
                                    ) : (
                                        <CheckCircleRoundedIcon />
                                    )
                                }
                                disabled={
                                    isApplyingRecommendation ||
                                    !existingSimulationRuleId ||
                                    existingSimulation
                                        .recommendedThreshold ==
                                        null ||
                                    existingSimulationRuleMode ===
                                        "Active"
                                }
                                onClick={() =>
                                    applyExistingRecommendation(
                                        existingSimulationRuleId,
                                    )
                                }
                                sx={{
                                    textTransform:
                                        "none",
                                }}
                            >
                                {isApplyingRecommendation
                                    ? "Applying..."
                                    : "Apply Recommendation"}
                            </Button>

                            <Typography
                                color="text.secondary"
                                sx={{
                                    fontSize:
                                        "0.7rem",
                                }}
                            >
                                This simulation has been
                                saved to the rule history.
                            </Typography>
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        disabled={
                            isApplyingRecommendation
                        }
                        onClick={() =>
                            setExistingSimulationOpen(
                                false,
                            )
                        }
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* =====================================================
                HISTORY
            ===================================================== */}
            <Dialog
                open={
                    simulationHistoryOpen
                }
                onClose={() =>
                    setSimulationHistoryOpen(
                        false,
                    )
                }
                fullWidth
                fullScreen={isMobile}
                maxWidth="lg"
            >
                <DialogTitle>
                    Simulation History
                </DialogTitle>

                <DialogContent>
                    <Typography
                        fontWeight={700}
                        sx={{
                            mb: 2,
                        }}
                    >
                        {historyRuleName}
                    </Typography>

                    {isLoadingHistory ? (
                        <Box
                            sx={{
                                minHeight: 220,
                                display: "grid",
                                placeItems:
                                    "center",
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : simulationHistory.length ===
                      0 ? (
                        <Alert severity="info">
                            No saved simulations for
                            this rule yet.
                        </Alert>
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
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                Date
                                            </TableCell>
                                            <TableCell>
                                                Threshold
                                            </TableCell>
                                            <TableCell>
                                                Checks
                                            </TableCell>
                                            <TableCell>
                                                Analyzed
                                            </TableCell>
                                            <TableCell>
                                                Trigger %
                                            </TableCell>
                                            <TableCell>
                                                Incidents
                                            </TableCell>
                                            <TableCell>
                                                Quality
                                            </TableCell>
                                            <TableCell>
                                                Noise
                                            </TableCell>
                                            <TableCell>
                                                Confidence
                                            </TableCell>
                                            <TableCell>
                                                Recommended
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {simulationHistory.map(
                                            run => (
                                                <TableRow
                                                    key={
                                                        run.id
                                                    }
                                                    hover
                                                >
                                                    <TableCell
                                                        sx={{
                                                            whiteSpace:
                                                                "nowrap",
                                                        }}
                                                    >
                                                        {formatDate(
                                                            run.createdAtUtc,
                                                        )}
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            run.threshold
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            run.consecutiveChecks
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            run.healthChecksAnalyzed
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            run.triggerRatePercent
                                                        }
                                                        %
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            run.estimatedIncidents
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        <Chip
                                                            size="small"
                                                            label={
                                                                run.ruleQuality
                                                            }
                                                            color={getQualityColor(
                                                                run.ruleQuality,
                                                            )}
                                                            variant="outlined"
                                                        />
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            run.noiseLevel
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            run.evaluationConfidence
                                                        }
                                                    </TableCell>

                                                    <TableCell
                                                        sx={{
                                                            whiteSpace:
                                                                "nowrap",
                                                        }}
                                                    >
                                                        {run.recommendedThreshold ??
                                                            "—"}
                                                        {" / "}
                                                        {run.recommendedConsecutiveChecks ??
                                                            "—"}{" "}
                                                        checks
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* MOBILE */}
                            <Stack
                                spacing={1.5}
                                sx={{
                                    display: {
                                        xs: "flex",
                                        md: "none",
                                    },
                                }}
                            >
                                {simulationHistory.map(
                                    run => (
                                        <Paper
                                            key={
                                                run.id
                                            }
                                            variant="outlined"
                                            sx={{
                                                p: 1.75,
                                                borderRadius:
                                                    2,
                                            }}
                                        >
                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
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
                                                        run.createdAtUtc,
                                                    )}
                                                </Typography>

                                                <Chip
                                                    size="small"
                                                    label={
                                                        run.ruleQuality
                                                    }
                                                    color={getQualityColor(
                                                        run.ruleQuality,
                                                    )}
                                                    variant="outlined"
                                                />
                                            </Stack>

                                            <Grid
                                                container
                                                spacing={1.5}
                                                sx={{
                                                    mt: 0.5,
                                                }}
                                            >
                                                <HistoryValue
                                                    title="Threshold"
                                                    value={
                                                        run.threshold
                                                    }
                                                />

                                                <HistoryValue
                                                    title="Checks"
                                                    value={
                                                        run.consecutiveChecks
                                                    }
                                                />

                                                <HistoryValue
                                                    title="Analyzed"
                                                    value={
                                                        run.healthChecksAnalyzed
                                                    }
                                                />

                                                <HistoryValue
                                                    title="Trigger Rate"
                                                    value={`${run.triggerRatePercent}%`}
                                                />

                                                <HistoryValue
                                                    title="Incidents"
                                                    value={
                                                        run.estimatedIncidents
                                                    }
                                                />

                                                <HistoryValue
                                                    title="Noise"
                                                    value={
                                                        run.noiseLevel
                                                    }
                                                />
                                            </Grid>

                                            <Divider
                                                sx={{
                                                    my: 1.25,
                                                }}
                                            />

                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    fontSize:
                                                        "0.68rem",
                                                }}
                                            >
                                                Recommended
                                            </Typography>

                                            <Typography
                                                fontWeight={
                                                    600
                                                }
                                                sx={{
                                                    mt: 0.2,
                                                    fontSize:
                                                        "0.8rem",
                                                }}
                                            >
                                                {run.recommendedThreshold ??
                                                    "—"}{" "}
                                                /{" "}
                                                {run.recommendedConsecutiveChecks ??
                                                    "—"}{" "}
                                                checks
                                            </Typography>
                                        </Paper>
                                    ),
                                )}
                            </Stack>
                        </>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() =>
                            setSimulationHistoryOpen(
                                false,
                            )
                        }
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={Boolean(
                    successMessage,
                )}
                autoHideDuration={3500}
                onClose={() =>
                    setSuccessMessage("")
                }
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    onClose={() =>
                        setSuccessMessage("")
                    }
                >
                    {successMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}

// =============================================================
// SIMULATION RESULT
// =============================================================

function SimulationResult({
    simulation,
}) {
    return (
        <Stack spacing={1.75}>
            <Stack
                direction="row"
                spacing={0.75}
                flexWrap="wrap"
                useFlexGap
            >
                <Chip
                    size="small"
                    label={`Quality: ${simulation.ruleQuality}`}
                    variant="outlined"
                />

                <Chip
                    size="small"
                    label={`Noise: ${simulation.noiseLevel}`}
                    variant="outlined"
                />

                <Chip
                    size="small"
                    label={`Confidence: ${simulation.evaluationConfidence}`}
                    variant="outlined"
                />
            </Stack>

            <Grid
                container
                spacing={1.25}
            >
                <ResultBox
                    title="Threshold"
                    value={
                        simulation.threshold
                    }
                />

                <ResultBox
                    title="Checks"
                    value={
                        simulation.consecutiveChecks
                    }
                />

                <ResultBox
                    title="Analyzed"
                    value={
                        simulation.analyzedHealthChecks
                    }
                />

                <ResultBox
                    title="Triggered"
                    value={
                        simulation.triggeredHealthChecks
                    }
                />

                <ResultBox
                    title="Trigger Rate"
                    value={`${simulation.triggerRatePercent}%`}
                />

                <ResultBox
                    title="Incidents"
                    value={
                        simulation.potentialIncidents
                    }
                />
            </Grid>

            <Divider />

            <Stack spacing={0.6}>
                <Typography
                    color="text.secondary"
                    sx={{
                        fontSize:
                            "0.72rem",
                    }}
                >
                    Recommended configuration
                </Typography>

                <Typography
                    fontWeight={700}
                    sx={{
                        fontSize:
                            "0.9rem",
                    }}
                >
                    Threshold:{" "}
                    {simulation.recommendedThreshold ??
                        "—"}
                    {" · "}
                    Checks:{" "}
                    {simulation.recommendedConsecutiveChecks ??
                        "—"}
                </Typography>
            </Stack>

            <Alert severity="info">
                {
                    simulation.recommendationMessage
                }
            </Alert>
        </Stack>
    );
}

function ResultBox({
    title,
    value,
}) {
    return (
        <Grid
            size={{
                xs: 6,
                sm: 4,
            }}
        >
            <Box
                sx={{
                    p: 1.25,
                    borderRadius: 1.5,
                    bgcolor:
                        "action.hover",
                }}
            >
                <Typography
                    color="text.secondary"
                    sx={{
                        fontSize:
                            "0.66rem",
                    }}
                >
                    {title}
                </Typography>

                <Typography
                    fontWeight={700}
                    sx={{
                        mt: 0.25,
                        fontSize:
                            "0.82rem",
                        overflowWrap:
                            "anywhere",
                    }}
                >
                    {value ?? "—"}
                </Typography>
            </Box>
        </Grid>
    );
}

function HistoryValue({
    title,
    value,
}) {
    return (
        <Grid
            size={{
                xs: 6,
            }}
        >
            <Typography
                color="text.secondary"
                sx={{
                    fontSize:
                        "0.66rem",
                }}
            >
                {title}
            </Typography>

            <Typography
                fontWeight={600}
                sx={{
                    mt: 0.2,
                    fontSize:
                        "0.78rem",
                }}
            >
                {value ?? "—"}
            </Typography>
        </Grid>
    );
}