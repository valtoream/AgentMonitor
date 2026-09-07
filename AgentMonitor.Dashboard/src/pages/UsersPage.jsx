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
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

// =============================================================
// HELPERS
// =============================================================

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

            hour12: false,
        },
    ).format(date);
}

function getRoleColor(role) {
    switch (role) {
        case "Administrator":
            return "error";

        case "Technician":
            return "warning";

        default:
            return "default";
    }
}

function UserStatusChip({
    isActive,
}) {
    return (
        <Chip
            size="small"
            variant="outlined"
            color={
                isActive
                    ? "success"
                    : "default"
            }
            icon={
                isActive ? (
                    <CheckCircleRoundedIcon />
                ) : (
                    <BlockRoundedIcon />
                )
            }
            label={
                isActive
                    ? "Active"
                    : "Disabled"
            }
            sx={{
                height: 24,
                fontWeight: 500,
            }}
        />
    );
}

async function getApiError(
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

// =============================================================
// PAGE
// =============================================================

export default function UsersPage({
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
        users,
        setUsers,
    ] = useState([]);

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");

    const [
        successMessage,
        setSuccessMessage,
    ] = useState("");

    // =========================================================
    // CREATE USER
    // =========================================================

    const [
        createDialogOpen,
        setCreateDialogOpen,
    ] = useState(false);

    const [
        username,
        setUsername,
    ] = useState("");

    const [
        password,
        setPassword,
    ] = useState("");

    const [
        role,
        setRole,
    ] = useState("Viewer");

    const [
        isCreating,
        setIsCreating,
    ] = useState(false);

    const [
        createError,
        setCreateError,
    ] = useState("");

    // =========================================================
    // ACTION MENU
    // =========================================================

    const [
        menuAnchor,
        setMenuAnchor,
    ] = useState(null);

    const [
        menuUser,
        setMenuUser,
    ] = useState(null);

    const [
        updatingUserId,
        setUpdatingUserId,
    ] = useState(null);

    // =========================================================
    // PASSWORD
    // =========================================================

    const [
        passwordDialogOpen,
        setPasswordDialogOpen,
    ] = useState(false);

    const [
        passwordUser,
        setPasswordUser,
    ] = useState(null);

    const [
        newPassword,
        setNewPassword,
    ] = useState("");

    const [
        confirmPassword,
        setConfirmPassword,
    ] = useState("");

    const [
        isChangingPassword,
        setIsChangingPassword,
    ] = useState(false);

    const [
        passwordError,
        setPasswordError,
    ] = useState("");

    // =========================================================
    // DELETE
    // =========================================================

    const [
        deleteDialogOpen,
        setDeleteDialogOpen,
    ] = useState(false);

    const [
        deleteUser,
        setDeleteUser,
    ] = useState(null);

    const [
        isDeleting,
        setIsDeleting,
    ] = useState(false);

    const [
        deleteError,
        setDeleteError,
    ] = useState("");

    // =========================================================
    // LOAD USERS
    // =========================================================

    const loadUsers =
        useCallback(
            async () => {
                try {
                    setIsLoading(
                        true,
                    );

                    setErrorMessage(
                        "",
                    );

                    const response =
                        await authenticatedFetch(
                            `${apiBaseUrl}/api/users`,
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
                            "You do not have permission to manage users.",
                        );
                    }

                    if (
                        !response.ok
                    ) {
                        throw new Error(
                            "Could not load users.",
                        );
                    }

                    const data =
                        await response.json();

                    setUsers(
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
                            "Could not load users.",
                    );
                } finally {
                    setIsLoading(
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
        loadUsers();
    }, [loadUsers]);

    // =========================================================
    // CREATE USER
    // =========================================================

    function openCreateDialog() {
        setUsername("");
        setPassword("");
        setRole("Viewer");
        setCreateError("");

        setCreateDialogOpen(
            true,
        );
    }

    function closeCreateDialog() {
        if (isCreating) {
            return;
        }

        setCreateDialogOpen(
            false,
        );

        setCreateError("");
    }

    async function handleCreateUser() {
        try {
            setIsCreating(
                true,
            );

            setCreateError(
                "",
            );

            const response =
                await authenticatedFetch(
                    `${apiBaseUrl}/api/users`,
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
                            role,
                        }),
                    },
                );

            if (
                response.status ===
                401
            ) {
                return;
            }

            if (!response.ok) {
                throw new Error(
                    await getApiError(
                        response,
                        "Could not create user.",
                    ),
                );
            }

            setCreateDialogOpen(
                false,
            );

            setSuccessMessage(
                "User created successfully.",
            );

            await loadUsers();
        } catch (error) {
            console.error(
                error,
            );

            setCreateError(
                error.message ||
                    "Could not create user.",
            );
        } finally {
            setIsCreating(
                false,
            );
        }
    }

    // =========================================================
    // ACTION MENU
    // =========================================================

    function openMenu(
        event,
        user,
    ) {
        setMenuAnchor(
            event.currentTarget,
        );

        setMenuUser(user);
    }

    function closeMenu() {
        setMenuAnchor(null);
        setMenuUser(null);
    }

    // =========================================================
    // ENABLE / DISABLE
    // =========================================================

    async function handleToggleStatus(
        user,
    ) {
        closeMenu();

        try {
            setUpdatingUserId(
                user.id,
            );

            setErrorMessage(
                "",
            );

            const newStatus =
                !user.isActive;

            const response =
                await authenticatedFetch(
                    `${apiBaseUrl}/api/users/${user.id}/status?isActive=${newStatus}`,
                    {
                        method: "PUT",
                    },
                );

            if (
                response.status ===
                401
            ) {
                return;
            }

            if (!response.ok) {
                throw new Error(
                    await getApiError(
                        response,
                        "Could not update user status.",
                    ),
                );
            }

            setSuccessMessage(
                newStatus
                    ? `${user.username} enabled.`
                    : `${user.username} disabled.`,
            );

            await loadUsers();
        } catch (error) {
            console.error(
                error,
            );

            setErrorMessage(
                error.message ||
                    "Could not update user status.",
            );
        } finally {
            setUpdatingUserId(
                null,
            );
        }
    }

    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    function openPasswordDialog(
        user,
    ) {
        closeMenu();

        setPasswordUser(user);
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");

        setPasswordDialogOpen(
            true,
        );
    }

    function closePasswordDialog() {
        if (
            isChangingPassword
        ) {
            return;
        }

        setPasswordDialogOpen(
            false,
        );

        setPasswordUser(null);
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
    }

    async function handleChangePassword() {
        if (!passwordUser) {
            return;
        }

        if (
            newPassword.length < 8
        ) {
            setPasswordError(
                "Password must contain at least 8 characters.",
            );

            return;
        }

        if (
            newPassword !==
            confirmPassword
        ) {
            setPasswordError(
                "The passwords do not match.",
            );

            return;
        }

        try {
            setIsChangingPassword(
                true,
            );

            setPasswordError(
                "",
            );

            const response =
                await authenticatedFetch(
                    `${apiBaseUrl}/api/users/${passwordUser.id}/password`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            newPassword,
                        }),
                    },
                );

            if (
                response.status ===
                401
            ) {
                return;
            }

            if (!response.ok) {
                throw new Error(
                    await getApiError(
                        response,
                        "Could not change password.",
                    ),
                );
            }

            const usernameValue =
                passwordUser.username;

            setPasswordDialogOpen(
                false,
            );

            setPasswordUser(
                null,
            );

            setNewPassword("");
            setConfirmPassword("");

            setSuccessMessage(
                `Password changed for ${usernameValue}.`,
            );
        } catch (error) {
            console.error(
                error,
            );

            setPasswordError(
                error.message ||
                    "Could not change password.",
            );
        } finally {
            setIsChangingPassword(
                false,
            );
        }
    }

    // =========================================================
    // DELETE USER
    // =========================================================

    function openDeleteDialog(
        user,
    ) {
        closeMenu();

        setDeleteUser(user);

        setDeleteError("");

        setDeleteDialogOpen(
            true,
        );
    }

    function closeDeleteDialog() {
        if (isDeleting) {
            return;
        }

        setDeleteDialogOpen(
            false,
        );

        setDeleteUser(null);
        setDeleteError("");
    }

    async function handleDeleteUser() {
        if (!deleteUser) {
            return;
        }

        try {
            setIsDeleting(
                true,
            );

            setDeleteError(
                "",
            );

            const response =
                await authenticatedFetch(
                    `${apiBaseUrl}/api/users/${deleteUser.id}`,
                    {
                        method:
                            "DELETE",
                    },
                );

            if (
                response.status ===
                401
            ) {
                return;
            }

            if (!response.ok) {
                throw new Error(
                    await getApiError(
                        response,
                        "Could not delete user.",
                    ),
                );
            }

            const usernameValue =
                deleteUser.username;

            setDeleteDialogOpen(
                false,
            );

            setDeleteUser(
                null,
            );

            setSuccessMessage(
                `${usernameValue} deleted.`,
            );

            await loadUsers();
        } catch (error) {
            console.error(
                error,
            );

            setDeleteError(
                error.message ||
                    "Could not delete user.",
            );
        } finally {
            setIsDeleting(
                false,
            );
        }
    }

    // =========================================================
    // COUNTS
    // =========================================================

    const activeUsers =
        users.filter(
            user =>
                user.isActive,
        ).length;

    const adminUsers =
        users.filter(
            user =>
                user.role ===
                "Administrator",
        ).length;

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
                        Users
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 0.5,

                            fontSize: {
                                xs:
                                    "0.875rem",

                                sm:
                                    "1rem",
                            },
                        }}
                    >
                        Manage dashboard
                        access, roles and
                        account status.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={
                        <AddRoundedIcon />
                    }
                    onClick={
                        openCreateDialog
                    }
                    sx={{
                        alignSelf: {
                            xs:
                                "stretch",

                            sm:
                                "center",
                        },

                        textTransform:
                            "none",
                    }}
                >
                    Add User
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

            {/* USER MANAGEMENT */}
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
                        User Management
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 0.25,

                            fontSize:
                                "0.8rem",
                        }}
                    >
                        {users.length}{" "}
                        {users.length ===
                        1
                            ? "account"
                            : "accounts"}

                        {" · "}

                        {activeUsers} active

                        {" · "}

                        {adminUsers}{" "}
                        {adminUsers === 1
                            ? "administrator"
                            : "administrators"}
                    </Typography>
                </Box>

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
                ) : users.length ===
                  0 ? (
                    <Box
                        sx={{
                            py: 7,
                            px: 2,

                            textAlign:
                                "center",
                        }}
                    >
                        <PersonRoundedIcon
                            sx={{
                                fontSize:
                                    42,

                                color:
                                    "text.disabled",

                                mb: 1,
                            }}
                        />

                        <Typography
                            fontWeight={600}
                        >
                            No users found
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 0.4,

                                fontSize:
                                    "0.8rem",
                            }}
                        >
                            Create a dashboard
                            user to get started.
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {/* DESKTOP */}
                        <TableContainer
                            sx={{
                                display: {
                                    xs:
                                        "none",

                                    md:
                                        "block",
                                },
                            }}
                        >
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            User
                                        </TableCell>

                                        <TableCell>
                                            Role
                                        </TableCell>

                                        <TableCell>
                                            Status
                                        </TableCell>

                                        <TableCell>
                                            Created
                                        </TableCell>

                                        <TableCell>
                                            Last Login
                                        </TableCell>

                                        <TableCell align="right">
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {users.map(
                                        user => (
                                            <TableRow
                                                key={
                                                    user.id
                                                }
                                                hover
                                                sx={{
                                                    "& td":
                                                        {
                                                            py: 1.4,
                                                        },
                                                }}
                                            >
                                                <TableCell>
                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        alignItems="center"
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: 32,
                                                                height: 32,

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

                                                                flexShrink:
                                                                    0,
                                                            }}
                                                        >
                                                            <PersonRoundedIcon
                                                                sx={{
                                                                    fontSize:
                                                                        17,
                                                                }}
                                                            />
                                                        </Box>

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
                                                                user.username
                                                            }
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>

                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        variant="outlined"
                                                        label={
                                                            user.role
                                                        }
                                                        color={getRoleColor(
                                                            user.role,
                                                        )}
                                                        icon={
                                                            user.role ===
                                                            "Administrator" ? (
                                                                <AdminPanelSettingsRoundedIcon />
                                                            ) : undefined
                                                        }
                                                        sx={{
                                                            height:
                                                                24,
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <UserStatusChip
                                                        isActive={
                                                            user.isActive
                                                        }
                                                    />
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        fontSize:
                                                            "0.8rem",
                                                    }}
                                                >
                                                    {formatDate(
                                                        user.createdAtUtc,
                                                    )}
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        fontSize:
                                                            "0.8rem",
                                                    }}
                                                >
                                                    {formatDate(
                                                        user.lastLoginAtUtc,
                                                    )}
                                                </TableCell>

                                                <TableCell align="right">
                                                    {updatingUserId ===
                                                    user.id ? (
                                                        <CircularProgress
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    ) : (
                                                        <IconButton
                                                            size="small"
                                                            onClick={event =>
                                                                openMenu(
                                                                    event,
                                                                    user,
                                                                )
                                                            }
                                                        >
                                                            <MoreVertRoundedIcon />
                                                        </IconButton>
                                                    )}
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
                                    xs:
                                        "flex",

                                    md:
                                        "none",
                                },
                            }}
                        >
                            {users.map(
                                user => (
                                    <Box
                                        key={
                                            user.id
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
                                            spacing={1}
                                        >
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                            >
                                                <Box
                                                    sx={{
                                                        width: 36,
                                                        height: 36,

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
                                                    }}
                                                >
                                                    <PersonRoundedIcon
                                                        sx={{
                                                            fontSize:
                                                                19,
                                                        }}
                                                    />
                                                </Box>

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
                                                        {
                                                            user.username
                                                        }
                                                    </Typography>

                                                    <Typography
                                                        color="text.secondary"
                                                        sx={{
                                                            mt: 0.1,

                                                            fontSize:
                                                                "0.7rem",
                                                        }}
                                                    >
                                                        {
                                                            user.role
                                                        }
                                                    </Typography>
                                                </Box>
                                            </Stack>

                                            <Stack
                                                direction="row"
                                                spacing={0.5}
                                                alignItems="center"
                                            >
                                                <UserStatusChip
                                                    isActive={
                                                        user.isActive
                                                    }
                                                />

                                                <IconButton
                                                    size="small"
                                                    onClick={event =>
                                                        openMenu(
                                                            event,
                                                            user,
                                                        )
                                                    }
                                                >
                                                    <MoreVertRoundedIcon />
                                                </IconButton>
                                            </Stack>
                                        </Stack>

                                        <Grid
                                            container
                                            spacing={1.5}
                                            sx={{
                                                mt: 1.25,
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
                                                            "0.67rem",
                                                    }}
                                                >
                                                    Created
                                                </Typography>

                                                <Typography
                                                    fontWeight={
                                                        600
                                                    }
                                                    sx={{
                                                        mt: 0.2,

                                                        fontSize:
                                                            "0.76rem",
                                                    }}
                                                >
                                                    {formatDate(
                                                        user.createdAtUtc,
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
                                                            "0.67rem",
                                                    }}
                                                >
                                                    Last Login
                                                </Typography>

                                                <Typography
                                                    fontWeight={
                                                        600
                                                    }
                                                    sx={{
                                                        mt: 0.2,

                                                        fontSize:
                                                            "0.76rem",
                                                    }}
                                                >
                                                    {formatDate(
                                                        user.lastLoginAtUtc,
                                                    )}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                ),
                            )}
                        </Stack>
                    </>
                )}
            </Paper>

            {/* =================================================
                ACTION MENU
            ================================================= */}
            <Menu
                anchorEl={
                    menuAnchor
                }
                open={
                    Boolean(
                        menuAnchor,
                    )
                }
                onClose={
                    closeMenu
                }
                anchorOrigin={{
                    vertical:
                        "bottom",

                    horizontal:
                        "right",
                }}
                transformOrigin={{
                    vertical:
                        "top",

                    horizontal:
                        "right",
                }}
            >
                {menuUser && (
                    <>
                        <MenuItem
                            onClick={() =>
                                openPasswordDialog(
                                    menuUser,
                                )
                            }
                        >
                            <ListItemIcon>
                                <LockResetRoundedIcon fontSize="small" />
                            </ListItemIcon>

                            Change Password
                        </MenuItem>

                        <MenuItem
                            onClick={() =>
                                handleToggleStatus(
                                    menuUser,
                                )
                            }
                        >
                            <ListItemIcon>
                                {menuUser.isActive ? (
                                    <BlockRoundedIcon fontSize="small" />
                                ) : (
                                    <CheckCircleRoundedIcon fontSize="small" />
                                )}
                            </ListItemIcon>

                            {menuUser.isActive
                                ? "Disable User"
                                : "Enable User"}
                        </MenuItem>

                        <Divider />

                        <MenuItem
                            onClick={() =>
                                openDeleteDialog(
                                    menuUser,
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

                            Delete User
                        </MenuItem>
                    </>
                )}
            </Menu>

            {/* =================================================
                CREATE USER
            ================================================= */}
            <Dialog
                open={
                    createDialogOpen
                }
                onClose={
                    closeCreateDialog
                }
                fullWidth
                fullScreen={
                    isMobile
                }
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: {
                            xs: 0,
                            sm: 2.5,
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
                                fontWeight={
                                    700
                                }
                                sx={{
                                    fontSize:
                                        "1.1rem",
                                }}
                            >
                                Create User
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{
                                    mt: 0.15,

                                    fontSize:
                                        "0.72rem",
                                }}
                            >
                                Create a dashboard
                                account and assign
                                an access role.
                            </Typography>
                        </Box>

                        <IconButton
                            size="small"
                            disabled={
                                isCreating
                            }
                            onClick={
                                closeCreateDialog
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
                    <Stack
                        spacing={2}
                    >
                        {createError && (
                            <Alert severity="error">
                                {
                                    createError
                                }
                            </Alert>
                        )}

                        <TextField
                            label="Username"
                            value={
                                username
                            }
                            onChange={event =>
                                setUsername(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            fullWidth
                            disabled={
                                isCreating
                            }
                        />

                        <TextField
                            label="Password"
                            type="password"
                            value={
                                password
                            }
                            onChange={event =>
                                setPassword(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            helperText="Minimum 8 characters"
                            fullWidth
                            disabled={
                                isCreating
                            }
                        />

                        <FormControl
                            fullWidth
                            disabled={
                                isCreating
                            }
                        >
                            <InputLabel>
                                Role
                            </InputLabel>

                            <Select
                                value={role}
                                label="Role"
                                onChange={event =>
                                    setRole(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            >
                                <MenuItem value="Viewer">
                                    Viewer
                                </MenuItem>

                                <MenuItem value="Technician">
                                    Technician
                                </MenuItem>

                                <MenuItem value="Administrator">
                                    Administrator
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>

                <Divider />

                <DialogActions
                    sx={{
                        p: 2.5,
                    }}
                >
                    <Button
                        color="inherit"
                        disabled={
                            isCreating
                        }
                        onClick={
                            closeCreateDialog
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
                            isCreating ||
                            !username.trim() ||
                            password.length <
                                8
                        }
                        onClick={
                            handleCreateUser
                        }
                        startIcon={
                            isCreating ? (
                                <CircularProgress
                                    size={
                                        16
                                    }
                                    color="inherit"
                                />
                            ) : (
                                <AddRoundedIcon />
                            )
                        }
                        sx={{
                            textTransform:
                                "none",
                        }}
                    >
                        {isCreating
                            ? "Creating..."
                            : "Create User"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* =================================================
                CHANGE PASSWORD
            ================================================= */}
            <Dialog
                open={
                    passwordDialogOpen
                }
                onClose={
                    closePasswordDialog
                }
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Change Password
                </DialogTitle>

                <DialogContent>
                    <Stack
                        spacing={2}
                        sx={{
                            mt: 1,
                        }}
                    >
                        {passwordError && (
                            <Alert severity="error">
                                {
                                    passwordError
                                }
                            </Alert>
                        )}

                        <Typography
                            color="text.secondary"
                        >
                            Set a new password for{" "}
                            <strong>
                                {
                                    passwordUser?.username
                                }
                            </strong>
                            .
                        </Typography>

                        <TextField
                            label="New Password"
                            type="password"
                            value={
                                newPassword
                            }
                            onChange={event => {
                                setNewPassword(
                                    event
                                        .target
                                        .value,
                                );

                                setPasswordError(
                                    "",
                                );
                            }}
                            helperText="Minimum 8 characters"
                            disabled={
                                isChangingPassword
                            }
                            fullWidth
                        />

                        <TextField
                            label="Confirm Password"
                            type="password"
                            value={
                                confirmPassword
                            }
                            onChange={event => {
                                setConfirmPassword(
                                    event
                                        .target
                                        .value,
                                );

                                setPasswordError(
                                    "",
                                );
                            }}
                            error={
                                confirmPassword.length >
                                    0 &&
                                newPassword !==
                                    confirmPassword
                            }
                            helperText={
                                confirmPassword.length >
                                    0 &&
                                newPassword !==
                                    confirmPassword
                                    ? "Passwords do not match."
                                    : " "
                            }
                            disabled={
                                isChangingPassword
                            }
                            fullWidth
                        />
                    </Stack>
                </DialogContent>

                <DialogActions
                    sx={{
                        p: 2.5,
                    }}
                >
                    <Button
                        color="inherit"
                        disabled={
                            isChangingPassword
                        }
                        onClick={
                            closePasswordDialog
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
                            isChangingPassword ||
                            newPassword.length <
                                8 ||
                            newPassword !==
                                confirmPassword
                        }
                        onClick={
                            handleChangePassword
                        }
                        startIcon={
                            isChangingPassword ? (
                                <CircularProgress
                                    size={
                                        16
                                    }
                                    color="inherit"
                                />
                            ) : (
                                <LockResetRoundedIcon />
                            )
                        }
                        sx={{
                            textTransform:
                                "none",
                        }}
                    >
                        {isChangingPassword
                            ? "Changing..."
                            : "Change Password"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* =================================================
                DELETE USER
            ================================================= */}
            <Dialog
                open={
                    deleteDialogOpen
                }
                onClose={
                    closeDeleteDialog
                }
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    Delete User
                </DialogTitle>

                <DialogContent>
                    <Stack
                        spacing={2}
                        sx={{
                            mt: 1,
                        }}
                    >
                        {deleteError && (
                            <Alert severity="error">
                                {
                                    deleteError
                                }
                            </Alert>
                        )}

                        <Alert severity="warning">
                            This action cannot
                            be undone.
                        </Alert>

                        <Typography>
                            Permanently delete{" "}
                            <strong>
                                {
                                    deleteUser?.username
                                }
                            </strong>
                            ?
                        </Typography>
                    </Stack>
                </DialogContent>

                <DialogActions
                    sx={{
                        p: 2.5,
                    }}
                >
                    <Button
                        color="inherit"
                        disabled={
                            isDeleting
                        }
                        onClick={
                            closeDeleteDialog
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
                        color="error"
                        disabled={
                            isDeleting
                        }
                        onClick={
                            handleDeleteUser
                        }
                        startIcon={
                            isDeleting ? (
                                <CircularProgress
                                    size={
                                        16
                                    }
                                    color="inherit"
                                />
                            ) : (
                                <DeleteOutlineRoundedIcon />
                            )
                        }
                        sx={{
                            textTransform:
                                "none",
                        }}
                    >
                        {isDeleting
                            ? "Deleting..."
                            : "Delete User"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* SUCCESS */}
            <Snackbar
                open={
                    Boolean(
                        successMessage,
                    )
                }
                autoHideDuration={
                    3500
                }
                onClose={() =>
                    setSuccessMessage("")
                }
                anchorOrigin={{
                    vertical:
                        "bottom",

                    horizontal:
                        "center",
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