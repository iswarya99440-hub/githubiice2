import { apiSlice } from "./ApiSlice";

export interface ProgressLog {
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
        };
    };
    date: string;
    hours_completed: string;
    summary: string;
    supervisor: number | null;
    approved: boolean;
    created_at: string;
}

export interface Milestone {
    id: number;
    student: number;
    title: string;
    description?: string;
    due_date: string;
    completed: boolean;
    completed_at?: string | null;
}

export interface ProgressStatistics {
    total_logs: number;
    total_hours: string | null;
    hours_by_student: Array<{ student: number; total_hours: string }>;
}

export const trackingSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProgressLogs: builder.query<ProgressLog[], void>({
            query: () => ({ url: "progress-logs/", method: "GET" }),
            providesTags: ["ProgressLog"],
        }),
        createProgressLog: builder.mutation<ProgressLog, Partial<ProgressLog>>({
            query: (data) => ({ url: "progress-logs/", method: "POST", body: data }),
            invalidatesTags: ["ProgressLog"],
        }),
        updateProgressLog: builder.mutation<ProgressLog, { id: number; data: Partial<ProgressLog> }>({
            query: ({ id, data }) => ({ url: `progress-logs/${id}/`, method: "PUT", body: data }),
            invalidatesTags: ["ProgressLog"],
        }),
        deleteProgressLog: builder.mutation<void, number>({
            query: (id) => ({ url: `progress-logs/${id}/`, method: "DELETE" }),
            invalidatesTags: ["ProgressLog"],
        }),
        approveProgressLog: builder.mutation<{ message: string }, number>({
            query: (id) => ({ url: `progress-logs/${id}/approve/`, method: "POST" }),
            invalidatesTags: ["ProgressLog"],
        }),
        rejectProgressLog: builder.mutation<{ message: string }, number>({
            query: (id) => ({ url: `progress-logs/${id}/reject/`, method: "POST" }),
            invalidatesTags: ["ProgressLog"],
        }),
        getProgressStatistics: builder.query<ProgressStatistics, void>({
            query: () => ({ url: "progress-logs/statistics/", method: "GET" }),
            providesTags: ["Analytics"],
        }),
        getMilestones: builder.query<Milestone[], void>({
            query: () => ({ url: "milestones/", method: "GET" }),
            providesTags: ["Milestone"],
        }),
        createMilestone: builder.mutation<Milestone, Partial<Milestone>>({
            query: (data) => ({ url: "milestones/", method: "POST", body: data }),
            invalidatesTags: ["Milestone"],
        }),
        updateMilestone: builder.mutation<Milestone, { id: number; data: Partial<Milestone> }>({
            query: ({ id, data }) => ({ url: `milestones/${id}/`, method: "PUT", body: data }),
            invalidatesTags: ["Milestone"],
        }),
        deleteMilestone: builder.mutation<void, number>({
            query: (id) => ({ url: `milestones/${id}/`, method: "DELETE" }),
            invalidatesTags: ["Milestone"],
        }),
    }),
});

export const {
    useGetProgressLogsQuery,
    useCreateProgressLogMutation,
    useUpdateProgressLogMutation,
    useDeleteProgressLogMutation,
    useApproveProgressLogMutation,
    useRejectProgressLogMutation,
    useGetProgressStatisticsQuery,
    useGetMilestonesQuery,
    useCreateMilestoneMutation,
    useUpdateMilestoneMutation,
    useDeleteMilestoneMutation,
} = trackingSlice;
