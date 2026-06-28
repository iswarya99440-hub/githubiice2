import { apiSlice } from "./ApiSlice";

export interface AuditLog {
    id: number;
    user: string | null;
    target_user: string | null;
    action: string;
    ip_address?: string | null;
    user_agent?: string;
    additional_data?: Record<string, unknown> | null;
    timestamp: string;
}

export const auditLogsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAuditLogs: builder.query<AuditLog[], void>({
            query: () => ({ url: "audit-logs/", method: "GET" }),
            providesTags: ["AuditLog"],
        }),
        getMyAuditLogs: builder.query<AuditLog[], void>({
            query: () => ({ url: "audit-logs/me/", method: "GET" }),
            providesTags: ["AuditLog"],
        }),
    }),
});

export const { useGetAuditLogsQuery, useGetMyAuditLogsQuery } = auditLogsSlice;
