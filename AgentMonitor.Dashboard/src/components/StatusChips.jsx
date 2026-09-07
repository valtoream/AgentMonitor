import { Chip } from "@mui/material";
import { normalizeDeviceStatus } from "../utils/formatters";

export function StatusChip({ status }) {
    const normalizedStatus = normalizeDeviceStatus(status);

    if (normalizedStatus === "Good") {
        return (
            <Chip
                label="Good"
                size="small"
                color="success"
                variant="outlined"
            />
        );
    }

    if (normalizedStatus === "Warning") {
        return (
            <Chip
                label="Warning"
                size="small"
                color="warning"
                variant="outlined"
            />
        );
    }

    if (normalizedStatus === "Critical") {
        return (
            <Chip
                label="Critical"
                size="small"
                color="error"
                variant="outlined"
            />
        );
    }

    return (
        <Chip
            label="Unknown"
            size="small"
            variant="outlined"
        />
    );
}

export function SeverityChip({ severity }) {
    const value = String(severity ?? "").toLowerCase();

    if (value === "critical") {
        return (
            <Chip
                label="Critical"
                size="small"
                color="error"
                variant="outlined"
            />
        );
    }

    if (value === "high") {
        return (
            <Chip
                label="High"
                size="small"
                color="warning"
                variant="outlined"
            />
        );
    }

    if (value === "medium") {
        return (
            <Chip
                label="Medium"
                size="small"
                color="info"
                variant="outlined"
            />
        );
    }

    return (
        <Chip
            label={severity || "Low"}
            size="small"
            variant="outlined"
        />
    );
}