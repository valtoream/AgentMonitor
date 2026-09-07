const deviceStatusNames = {
    0: "Unknown",
    1: "Good",
    2: "Warning",
    3: "Critical",
    Unknown: "Unknown",
    Good: "Good",
    Warning: "Warning",
    Critical: "Critical",
};

export function normalizeDeviceStatus(status) {
    return deviceStatusNames[status] ?? "Unknown";
}

export function formatLastSeen(dateValue) {
    if (!dateValue) {
        return "Never";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Unknown";
    }

    const differenceInSeconds = Math.floor(
        (Date.now() - date.getTime()) / 1000,
    );

    if (differenceInSeconds < 60) {
        return "A few seconds ago";
    }

    const differenceInMinutes = Math.floor(differenceInSeconds / 60);

    if (differenceInMinutes < 60) {
        return `${differenceInMinutes} minute${
            differenceInMinutes === 1 ? "" : "s"
        } ago`;
    }

    const differenceInHours = Math.floor(differenceInMinutes / 60);

    if (differenceInHours < 24) {
        return `${differenceInHours} hour${
            differenceInHours === 1 ? "" : "s"
        } ago`;
    }

    const differenceInDays = Math.floor(differenceInHours / 24);

    return `${differenceInDays} day${
        differenceInDays === 1 ? "" : "s"
    } ago`;
}

export function formatBytes(bytes) {
    if (!bytes || bytes <= 0) {
        return "-";
    }

    const gb = bytes / 1024 / 1024 / 1024;

    return `${gb.toFixed(1)} GB`;
}

export function formatPercent(value) {
    if (value == null) {
        return "-";
    }

    return `${Number(value).toFixed(1)}%`;
}