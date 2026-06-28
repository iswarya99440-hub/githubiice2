import { apiSlice } from "./ApiSlice";

export type ReportType = "WEEKLY" | "FINAL";

export interface Report {
    id: number;
    student: number;
    student_details?: {
        id: number;
        student_id: string;
        program: string;
        year_of_study: number;
        graduation_date: string;
        skills: string;
        user?: {
            id: number;
            username: string;
            email: string;
            role: string;
            profile_picture?: string | null;
            first_name?: string;
            last_name?: string;
            phone?: string | null;
        };
    };
    type: ReportType;
    file: string;
    feedback?: string;
    coordinator_feedback?: string;
    coordinator_approved: boolean;
    coordinator_approved_at?: string | null;
    coordinator_approved_by?: number | null;
    supervisor_approved: boolean;
    supervisor_approved_at?: string | null;
    supervisor_approved_by?: number | null;
    supervisor_approved_by_details?: {
        id: number;
        organization: string;
        position: string;
        user?: {
            id: number;
            username: string;
            email: string;
            role: string;
            first_name?: string;
            last_name?: string;
            phone?: string | null;
        } | null;
    } | null;
    submitted_at: string;
}

export const reportsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getReports: builder.query<Report[], void>({
            query: () => ({ url: "reports/", method: "GET" }),
            providesTags: ["Report"],
        }),
        getReportById: builder.query<Report, number>({
            query: (id) => ({ url: `reports/${id}/`, method: "GET" }),
            providesTags: ["Report"],
        }),
        createReport: builder.mutation<Report, FormData | Partial<Report>>({
            query: (data) => ({
                url: "reports/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Report"],
        }),
        updateReport: builder.mutation<Report, { id: number; data: Partial<Report> }>({
            query: ({ id, data }) => ({
                url: `reports/${id}/`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Report"],
        }),
        deleteReport: builder.mutation<void, number>({
            query: (id) => ({
                url: `reports/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Report"],
        }),
        setReportFeedback: builder.mutation<{ message: string; feedback: string }, { id: number; feedback: string }>({
            query: ({ id, feedback }) => ({
                url: `reports/${id}/set_feedback/`,
                method: "POST",
                body: { feedback },
            }),
            invalidatesTags: ["Report"],
        }),
        setCoordinatorReportFeedback: builder.mutation<{ message: string; coordinator_feedback: string }, { id: number; feedback: string }>({
            query: ({ id, feedback }) => ({
                url: `reports/${id}/set_coordinator_feedback/`,
                method: "POST",
                body: { feedback },
            }),
            invalidatesTags: ["Report"],
        }),
        coordinatorApproveReport: builder.mutation<Report, { id: number; feedback?: string }>({
            query: ({ id, feedback }) => ({
                url: `reports/${id}/coordinator_approve/`,
                method: "POST",
                body: feedback !== undefined ? { feedback } : {},
            }),
            invalidatesTags: ["Report"],
        }),
        approveReport: builder.mutation<Report, { id: number; feedback?: string }>({
            query: ({ id, feedback }) => ({
                url: `reports/${id}/approve/`,
                method: "POST",
                body: feedback !== undefined ? { feedback } : {},
            }),
            invalidatesTags: ["Report"],
        }),
    }),
});

export const {
    useGetReportsQuery,
    useGetReportByIdQuery,
    useCreateReportMutation,
    useUpdateReportMutation,
    useDeleteReportMutation,
    useSetReportFeedbackMutation,
    useSetCoordinatorReportFeedbackMutation,
    useCoordinatorApproveReportMutation,
    useApproveReportMutation,
} = reportsSlice;
