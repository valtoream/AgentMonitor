import {
    Alert,
    AppBar,
    Avatar,
    Box,
    Button,
    CircularProgress,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Toolbar,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import {
    NavLink,
    Route,
    Routes,
    useLocation,
} from "react-router-dom";

import { useState } from "react";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import DevicesRoundedIcon from "@mui/icons-material/DevicesRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

import DashboardPage from "../pages/DashboardPage";
import DevicesPage from "../pages/DevicesPage";
import DeviceDetailsPage from "../pages/DeviceDetailsPage";
import TicketsPage from "../pages/TicketsPage";
import MonitoringRulesPage from "../pages/MonitoringRulesPage";
import UsersPage from "../pages/UsersPage";
import AuditLogsPage from "../pages/AuditLogsPage";

const drawerWidth = 232;
const topBarHeight = 56;

export default function AppLayout({
    devices,
    tickets,
    isLoading,
    errorMessage,
    apiBaseUrl,
    currentUser,
    authenticatedFetch,
    onLogout,
    onTicketsChanged,
}) {
    const theme = useTheme();

    const isDesktop = useMediaQuery(
        theme.breakpoints.up("md"),
    );

    const location = useLocation();

    const [
        mobileDrawerOpen,
        setMobileDrawerOpen,
    ] = useState(false);

    const isAdministrator =
        currentUser?.role === "Administrator";

    const pageTitle = getPageTitle(
        location.pathname,
    );

    const username =
        currentUser?.username ?? "User";

    const role =
        currentUser?.role ?? "";

    const userInitial =
        username
            .charAt(0)
            .toUpperCase();

    function closeMobileDrawer() {
        setMobileDrawerOpen(false);
    }

    const drawerContent = (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: "#111827",
                color: "#fff",
            }}
        >
            {/* BRAND */}
            <Box
                sx={{
                    height: topBarHeight,
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                    borderBottom:
                        "1px solid rgba(255,255,255,0.08)",
                    flexShrink: 0,
                }}
            >
                <Box
                    sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.75,
                        display: "grid",
                        placeItems: "center",
                        bgcolor:
                            "rgba(255,255,255,0.09)",
                        flexShrink: 0,
                    }}
                >
                    <MonitorHeartRoundedIcon
                        sx={{
                            fontSize: 20,
                        }}
                    />
                </Box>

                <Box
                    sx={{
                        ml: 1.15,
                        minWidth: 0,
                    }}
                >
                    <Typography
                        fontWeight={700}
                        sx={{
                            fontSize: "0.88rem",
                            lineHeight: 1.2,
                        }}
                    >
                        Agent Monitor
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.15,
                            fontSize: "0.62rem",
                            color:
                                "rgba(255,255,255,0.52)",
                        }}
                    >
                        Monitoring Console
                    </Typography>
                </Box>
            </Box>

            {/* NAVIGATION */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    px: 1.25,
                    py: 2,
                }}
            >
                <Typography
                    sx={{
                        px: 1.25,
                        mb: 0.75,
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        letterSpacing: "0.09em",
                        color:
                            "rgba(255,255,255,0.4)",
                    }}
                >
                    MONITORING
                </Typography>

                <List disablePadding>
                    <NavigationItem
                        to="/"
                        end
                        icon={
                            <DashboardRoundedIcon />
                        }
                        label="Dashboard"
                        onClick={
                            closeMobileDrawer
                        }
                    />

                    <NavigationItem
                        to="/devices"
                        icon={
                            <DevicesRoundedIcon />
                        }
                        label="Devices"
                        onClick={
                            closeMobileDrawer
                        }
                    />

                    <NavigationItem
                        to="/tickets"
                        icon={
                            <ConfirmationNumberRoundedIcon />
                        }
                        label="Tickets"
                        onClick={
                            closeMobileDrawer
                        }
                    />

                    {isAdministrator && (
                        <NavigationItem
                            to="/monitoring-rules"
                            icon={
                                <RuleRoundedIcon />
                            }
                            label="Monitoring Rules"
                            onClick={
                                closeMobileDrawer
                            }
                        />
                    )}
                </List>

                {isAdministrator && (
                    <>
                        <Typography
                            sx={{
                                px: 1.25,
                                mt: 2.5,
                                mb: 0.75,
                                fontSize:
                                    "0.62rem",
                                fontWeight: 700,
                                letterSpacing:
                                    "0.09em",
                                color:
                                    "rgba(255,255,255,0.4)",
                            }}
                        >
                            ADMINISTRATION
                        </Typography>

                        <List disablePadding>
                            <NavigationItem
                                to="/users"
                                icon={
                                    <ManageAccountsRoundedIcon />
                                }
                                label="Users"
                                onClick={
                                    closeMobileDrawer
                                }
                            />

                            <NavigationItem
                                to="/audit-logs"
                                icon={
                                    <HistoryRoundedIcon />
                                }
                                label="Audit Log"
                                onClick={
                                    closeMobileDrawer
                                }
                            />
                        </List>
                    </>
                )}
            </Box>

            {/* MOBILE USER */}
            <Box
                sx={{
                    display: {
                        xs: "block",
                        md: "none",
                    },
                    p: 1.5,
                    borderTop:
                        "1px solid rgba(255,255,255,0.08)",
                }}
            >
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                >
                    <Avatar
                        sx={{
                            width: 34,
                            height: 34,
                            fontSize:
                                "0.8rem",
                            fontWeight: 700,
                            bgcolor:
                                "rgba(255,255,255,0.12)",
                            color: "#fff",
                        }}
                    >
                        {userInitial}
                    </Avatar>

                    <Box
                        sx={{
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        <Typography
                            noWrap
                            sx={{
                                fontSize:
                                    "0.8rem",
                                fontWeight: 600,
                            }}
                        >
                            {username}
                        </Typography>

                        <Typography
                            noWrap
                            sx={{
                                fontSize:
                                    "0.68rem",
                                color:
                                    "rgba(255,255,255,0.55)",
                            }}
                        >
                            {role}
                        </Typography>
                    </Box>

                    <Tooltip title="Logout">
                        <IconButton
                            onClick={onLogout}
                            sx={{
                                color:
                                    "rgba(255,255,255,0.8)",
                            }}
                        >
                            <LogoutRoundedIcon
                                fontSize="small"
                            />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>
        </Box>
    );

    return (
        <Box
            sx={{
                display: "flex",
                minHeight: "100vh",
                bgcolor: "#f4f6f8",
            }}
        >
            <CssBaseline />

            {/* TOP BAR */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    zIndex:
                        theme.zIndex.drawer + 1,

                    width: {
                        xs: "100%",
                        md:
                            `calc(100% - ${drawerWidth}px)`,
                    },

                    ml: {
                        xs: 0,
                        md:
                            `${drawerWidth}px`,
                    },

                    bgcolor:
                        "rgba(255,255,255,0.98)",

                    color:
                        "text.primary",

                    borderBottom:
                        "1px solid",

                    borderColor:
                        "divider",
                }}
            >
                <Toolbar
                    sx={{
                        minHeight:
                            `${topBarHeight}px !important`,

                        px: {
                            xs: 1.5,
                            sm: 2.5,
                            md: 3,
                        },
                    }}
                >
                    {/* MOBILE MENU */}
                    <IconButton
                        edge="start"
                        onClick={() =>
                            setMobileDrawerOpen(
                                true,
                            )
                        }
                        sx={{
                            display: {
                                xs: "inline-flex",
                                md: "none",
                            },
                            mr: 1,
                        }}
                    >
                        <MenuRoundedIcon />
                    </IconButton>

                    {/* MOBILE PAGE TITLE */}
                    <Typography
                        fontWeight={650}
                        noWrap
                        sx={{
                            display: {
                                xs: "block",
                                md: "none",
                            },
                            fontSize: "1rem",
                        }}
                    >
                        {pageTitle}
                    </Typography>

                    <Box
                        sx={{
                            flexGrow: 1,
                        }}
                    />

                    {/* USER */}
                    <Stack
                        direction="row"
                        spacing={1.25}
                        alignItems="center"
                    >
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{
                                display: {
                                    xs: "none",
                                    sm: "flex",
                                },
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 30,
                                    height: 30,
                                    fontSize:
                                        "0.72rem",
                                    fontWeight:
                                        700,
                                    bgcolor:
                                        "action.selected",
                                    color:
                                        "text.primary",
                                }}
                            >
                                {userInitial}
                            </Avatar>

                            <Box>
                                <Typography
                                    sx={{
                                        fontSize:
                                            "0.76rem",
                                        lineHeight:
                                            1.2,
                                        fontWeight:
                                            600,
                                    }}
                                >
                                    {username}
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        mt: 0.1,
                                        fontSize:
                                            "0.64rem",
                                        lineHeight:
                                            1.2,
                                    }}
                                >
                                    {role}
                                </Typography>
                            </Box>
                        </Stack>

                        <Divider
                            orientation="vertical"
                            flexItem
                            sx={{
                                display: {
                                    xs: "none",
                                    sm: "block",
                                },
                                my: 1.1,
                            }}
                        />

                        {/* DESKTOP LOGOUT */}
                        <Button
                            size="small"
                            color="inherit"
                            startIcon={
                                <LogoutRoundedIcon
                                    sx={{
                                        fontSize:
                                            "17px !important",
                                    }}
                                />
                            }
                            onClick={onLogout}
                            sx={{
                                display: {
                                    xs: "none",
                                    sm: "inline-flex",
                                },

                                minWidth: 0,
                                px: 1,

                                textTransform:
                                    "none",

                                fontWeight:
                                    600,

                                fontSize:
                                    "0.73rem",

                                color:
                                    "text.secondary",

                                "&:hover": {
                                    color:
                                        "text.primary",
                                    bgcolor:
                                        "action.hover",
                                },
                            }}
                        >
                            Logout
                        </Button>

                        {/* MOBILE LOGOUT */}
                        <Tooltip title="Logout">
                            <IconButton
                                size="small"
                                onClick={onLogout}
                                sx={{
                                    display: {
                                        xs: "inline-flex",
                                        sm: "none",
                                    },
                                }}
                            >
                                <LogoutRoundedIcon
                                    fontSize="small"
                                />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* DESKTOP DRAWER */}
            <Drawer
                variant="permanent"
                open
                sx={{
                    display: {
                        xs: "none",
                        md: "block",
                    },

                    width: drawerWidth,
                    flexShrink: 0,

                    "& .MuiDrawer-paper":
                        {
                            width:
                                drawerWidth,

                            boxSizing:
                                "border-box",

                            borderRight:
                                "none",
                        },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* MOBILE DRAWER */}
            <Drawer
                variant="temporary"
                open={mobileDrawerOpen}
                onClose={() =>
                    setMobileDrawerOpen(
                        false,
                    )
                }
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: {
                        xs: "block",
                        md: "none",
                    },

                    "& .MuiDrawer-paper":
                        {
                            width:
                                drawerWidth,

                            boxSizing:
                                "border-box",

                            borderRight:
                                "none",
                        },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* MAIN CONTENT */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    minWidth: 0,
                    minHeight: "100vh",

                    bgcolor: "#f4f6f8",

                    pt:
                        `${topBarHeight}px`,

                    px: {
                        xs: 1.5,
                        sm: 2.5,
                        md: 3,
                    },

                    pb: {
                        xs: 2.5,
                        md: 4,
                    },
                }}
            >
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: "1800px",
                        mx: "auto",

                        pt: {
                            xs: 2,
                            md: 2.5,
                        },
                    }}
                >
                    {errorMessage && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 2,
                            }}
                        >
                            {errorMessage}
                        </Alert>
                    )}

                    {isLoading ? (
                        <Box
                            sx={{
                                minHeight: 420,
                                display: "grid",
                                placeItems:
                                    "center",
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <DashboardPage
                                        devices={
                                            devices
                                        }
                                        tickets={
                                            tickets
                                        }
                                    />
                                }
                            />

                            <Route
                                path="/devices"
                                element={
                                    <DevicesPage
                                        devices={
                                            devices
                                        }
                                    />
                                }
                            />

                            <Route
                                path="/devices/:deviceId"
                                element={
                                    <DeviceDetailsPage
                                        authenticatedFetch={
                                            authenticatedFetch
                                        }
                                    />
                                }
                            />

                            <Route
                                path="/tickets"
                                element={
                                    <TicketsPage
                                        tickets={
                                            tickets
                                        }
                                        apiBaseUrl={
                                            apiBaseUrl
                                        }
                                        currentUser={
                                            currentUser
                                        }
                                        authenticatedFetch={
                                            authenticatedFetch
                                        }
                                        onTicketsChanged={
                                            onTicketsChanged
                                        }
                                    />
                                }
                            />

                            {isAdministrator && (
                                <>
                                    <Route
                                        path="/monitoring-rules"
                                        element={
                                            <MonitoringRulesPage
                                                apiBaseUrl={
                                                    apiBaseUrl
                                                }
                                                authenticatedFetch={
                                                    authenticatedFetch
                                                }
                                                currentUser={
                                                    currentUser
                                                }
                                            />
                                        }
                                    />

                                    <Route
                                        path="/users"
                                        element={
                                            <UsersPage
                                                apiBaseUrl={
                                                    apiBaseUrl
                                                }
                                                authenticatedFetch={
                                                    authenticatedFetch
                                                }
                                            />
                                        }
                                    />

                                    <Route
                                        path="/audit-logs"
                                        element={
                                            <AuditLogsPage
                                                apiBaseUrl={
                                                    apiBaseUrl
                                                }
                                                authenticatedFetch={
                                                    authenticatedFetch
                                                }
                                            />
                                        }
                                    />
                                </>
                            )}
                        </Routes>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

function NavigationItem({
    to,
    label,
    icon,
    end = false,
    onClick,
}) {
    return (
        <ListItemButton
            component={NavLink}
            to={to}
            end={end}
            onClick={onClick}
            sx={{
                position: "relative",

                minHeight: 42,

                px: 1.25,
                mb: 0.4,

                borderRadius: 1.75,

                color:
                    "rgba(255,255,255,0.74)",

                transition:
                    "background-color 0.15s ease, color 0.15s ease",

                "& .MuiListItemIcon-root":
                    {
                        color: "inherit",
                    },

                "&:hover": {
                    bgcolor:
                        "rgba(255,255,255,0.07)",
                    color: "#fff",
                },

                "&.active": {
                    bgcolor:
                        "rgba(255,255,255,0.11)",
                    color: "#fff",
                },

                "&.active::before":
                    {
                        content: '""',

                        position:
                            "absolute",

                        left: 0,

                        width: 3,
                        height: 20,

                        borderRadius:
                            "0 4px 4px 0",

                        bgcolor:
                            "#ffffff",
                    },
            }}
        >
            <ListItemIcon
                sx={{
                    minWidth: 36,

                    "& svg": {
                        fontSize: 19,
                    },
                }}
            >
                {icon}
            </ListItemIcon>

            <ListItemText
                primary={label}
                primaryTypographyProps={{
                    fontSize: "0.82rem",
                    fontWeight: 500,
                }}
            />
        </ListItemButton>
    );
}

function getPageTitle(pathname) {
    if (
        pathname.startsWith(
            "/devices/",
        )
    ) {
        return "Device Details";
    }

    switch (pathname) {
        case "/":
            return "Dashboard";

        case "/devices":
            return "Devices";

        case "/tickets":
            return "Tickets";

        case "/monitoring-rules":
            return "Monitoring Rules";

        case "/users":
            return "Users";

        case "/audit-logs":
            return "Audit Log";

        default:
            return "Agent Monitor";
    }
}