import {
    useCallback,
    useEffect,
    useState,
} from "react";

import { BrowserRouter } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";

const apiBaseUrl = "";

const tokenStorageKey =
    "agentMonitor.accessToken";

const userStorageKey =
    "agentMonitor.user";

const refreshIntervalMilliseconds =
    10000;

export default function App() {
    const [accessToken, setAccessToken] =
        useState(() =>
            localStorage.getItem(
                tokenStorageKey,
            ),
        );

    const [currentUser, setCurrentUser] =
        useState(() => {
            const storedUser =
                localStorage.getItem(
                    userStorageKey,
                );

            if (!storedUser) {
                return null;
            }

            try {
                return JSON.parse(storedUser);
            } catch {
                return null;
            }
        });

    const [devices, setDevices] =
        useState([]);

    const [tickets, setTickets] =
        useState([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [
        isCheckingAuthentication,
        setIsCheckingAuthentication,
    ] = useState(Boolean(accessToken));

    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");

    const logout = useCallback(() => {
        localStorage.removeItem(
            tokenStorageKey,
        );

        localStorage.removeItem(
            userStorageKey,
        );

        setAccessToken(null);
        setCurrentUser(null);
        setDevices([]);
        setTickets([]);
        setErrorMessage("");
        setIsLoading(false);
    }, []);

    const authenticatedFetch =
        useCallback(
            async (
                url,
                options = {},
            ) => {
                const headers = {
                    ...(options.headers ?? {}),
                };

                if (accessToken) {
                    headers.Authorization =
                        `Bearer ${accessToken}`;
                }

                const response =
                    await fetch(url, {
                        ...options,
                        headers,
                    });

                if (
                    response.status === 401 &&
                    accessToken
                ) {
                    logout();
                }

                return response;
            },
            [
                accessToken,
                logout,
            ],
        );

    const loadData =
        useCallback(
            async (
                signal,
                showLoading = true,
            ) => {
                if (!accessToken) {
                    return;
                }

                try {
                    if (showLoading) {
                        setIsLoading(true);
                    }

                    setErrorMessage("");

                    const [
                        devicesResponse,
                        ticketsResponse,
                    ] =
                        await Promise.all([
                            authenticatedFetch(
                                `${apiBaseUrl}/api/devices`,
                                {
                                    signal,
                                },
                            ),

                            authenticatedFetch(
                                `${apiBaseUrl}/api/ticket-management`,
                                {
                                    signal,
                                },
                            ),
                        ]);

                    if (
                        devicesResponse.status ===
                            401 ||
                        ticketsResponse.status ===
                            401
                    ) {
                        return;
                    }

                    if (
                        !devicesResponse.ok
                    ) {
                        throw new Error(
                            "Could not load registered devices.",
                        );
                    }

                    if (
                        !ticketsResponse.ok
                    ) {
                        throw new Error(
                            "Could not load tickets.",
                        );
                    }

                    const [
                        devicesData,
                        ticketsData,
                    ] =
                        await Promise.all([
                            devicesResponse.json(),
                            ticketsResponse.json(),
                        ]);

                    setDevices(
                        Array.isArray(
                            devicesData,
                        )
                            ? devicesData
                            : [],
                    );

                    setTickets(
                        Array.isArray(
                            ticketsData,
                        )
                            ? ticketsData
                            : [],
                    );
                } catch (error) {
                    if (
                        error.name ===
                        "AbortError"
                    ) {
                        return;
                    }

                    console.error(error);

                    setErrorMessage(
                        error.message ||
                            "Could not connect to AgentMonitorAPI.",
                    );
                } finally {
                    if (
                        !signal?.aborted &&
                        showLoading
                    ) {
                        setIsLoading(false);
                    }
                }
            },
            [
                accessToken,
                authenticatedFetch,
            ],
        );

    useEffect(() => {
        if (!accessToken) {
            setIsCheckingAuthentication(
                false,
            );

            return;
        }

        const abortController =
            new AbortController();

        async function validateAuthentication() {
            try {
                const response =
                    await authenticatedFetch(
                        `${apiBaseUrl}/api/auth/me`,
                        {
                            signal:
                                abortController.signal,
                        },
                    );

                if (
                    response.status === 401
                ) {
                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        "Could not validate the current session.",
                    );
                }

                const user =
                    await response.json();

                const normalizedUser = {
                    id:
                        user.id ??
                        user.Id ??
                        null,

                    username:
                        user.username ??
                        user.Username ??
                        "",

                    role:
                        user.role ??
                        user.Role ??
                        "",
                };

                setCurrentUser(
                    normalizedUser,
                );

                localStorage.setItem(
                    userStorageKey,
                    JSON.stringify(
                        normalizedUser,
                    ),
                );
            } catch (error) {
                if (
                    error.name !==
                    "AbortError"
                ) {
                    console.error(error);

                    logout();
                }
            } finally {
                if (
                    !abortController
                        .signal.aborted
                ) {
                    setIsCheckingAuthentication(
                        false,
                    );
                }
            }
        }

        validateAuthentication();

        return () => {
            abortController.abort();
        };
    }, [
        accessToken,
        authenticatedFetch,
        logout,
    ]);

    useEffect(() => {
        if (
            !accessToken ||
            isCheckingAuthentication
        ) {
            return;
        }

        const abortController =
            new AbortController();

        // Initial loading.
        loadData(
            abortController.signal,
            true,
        );

        // Background refresh every 10 seconds.
        const intervalId =
            setInterval(() => {
                loadData(
                    abortController.signal,
                    false,
                );
            }, refreshIntervalMilliseconds);

        return () => {
            clearInterval(intervalId);
            abortController.abort();
        };
    }, [
        accessToken,
        isCheckingAuthentication,
        loadData,
    ]);

    function handleLogin(loginResponse) {
        const user = {
            username:
                loginResponse.username,
            role:
                loginResponse.role,
        };

        localStorage.setItem(
            tokenStorageKey,
            loginResponse.accessToken,
        );

        localStorage.setItem(
            userStorageKey,
            JSON.stringify(user),
        );

        setCurrentUser(user);

        setAccessToken(
            loginResponse.accessToken,
        );

        setIsCheckingAuthentication(
            false,
        );
    }

    async function refreshTickets() {
        try {
            setErrorMessage("");

            const response =
                await authenticatedFetch(
                    `${apiBaseUrl}/api/ticket-management`,
                );

            if (
                response.status === 401
            ) {
                return;
            }

            if (!response.ok) {
                throw new Error(
                    "Could not refresh tickets.",
                );
            }

            const data =
                await response.json();

            setTickets(
                Array.isArray(data)
                    ? data
                    : [],
            );
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.message ||
                    "Could not refresh tickets.",
            );
        }
    }

    if (!accessToken) {
        return (
            <LoginPage
                apiBaseUrl={apiBaseUrl}
                onLogin={handleLogin}
            />
        );
    }

    if (isCheckingAuthentication) {
        return null;
    }

    return (
        <BrowserRouter>
            <AppLayout
                devices={devices}
                tickets={tickets}
                isLoading={isLoading}
                errorMessage={errorMessage}
                apiBaseUrl={apiBaseUrl}
                accessToken={accessToken}
                currentUser={currentUser}
                authenticatedFetch={
                    authenticatedFetch
                }
                onLogout={logout}
                onTicketsChanged={
                    refreshTickets
                }
            />
        </BrowserRouter>
    );
}