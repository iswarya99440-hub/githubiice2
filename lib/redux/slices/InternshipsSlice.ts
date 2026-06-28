import { apiSlice } from "./ApiSlice";

export interface Organization {
    id: string;
    partner_user?: number | null;
    name: string;
    address: string;
    contact_email: string;
    contact_phone?: string;
    industry?: string;
    website?: string;
    description?: string;
    capacity?: number;
    status?: string;
    settings?: Record<string, unknown>;
    created_at?: string;
    updated_at?: string;
}

export interface InternshipPosition {
    id: string;
    title: string;
    organization: string;
    organization_details?: Organization;
    description: string;
    required_skills: string;
    capacity: number;
    occupied_capacity?: number;
    available_capacity?: number;
    is_full?: boolean;
    requirements?: string;
    location?: string;
    start_date?: string | null;
    end_date?: string | null;
    is_active?: boolean;
    created_at?: string;
    match_score?: number;
    matched_skills?: string[];
}

export type ApplicationStatus = "PENDING" | "PARTNER_ACCEPTED" | "APPROVED" | "REJECTED";

export interface UserSummary {
    id: number;
    username: string;
    email: string;
    role: string;
    profile_picture?: string | null;
    first_name?: string;
    last_name?: string;
    phone?: string;
}

export interface StudentDetails {
    id: number;
    student_id: string;
    program: string;
    year_of_study: number;
    graduation_date: string;
    skills: string;
    user?: UserSummary;
}

export interface SupervisorDetails {
    id: number;
    organization: string;
    position: string;
    user?: UserSummary;
}

export interface Application {
    id: string;
    student: number;
    student_details?: StudentDetails;
    position: string;
    position_details?: InternshipPosition;
    cover_letter: string;
    cv: string;
    status: ApplicationStatus;
    created_at: string;
}

export interface Placement {
    id: string;
    application: string;
    application_details?: Application;
    student_details?: StudentDetails;
    supervisor: number | null;
    supervisor_details?: SupervisorDetails | null;
    start_date: string;
    end_date: string;
    confirmed: boolean;
}

export interface ApplicationStatistics {
    total: number;
    by_status: Array<{ status: ApplicationStatus; count: number }>;
}

export interface PlacementStatistics {
    total: number;
    confirmed: number;
    by_supervisor: Array<{ supervisor: number | null; count: number }>;
}

export interface PartnerDashboard {
    organization: Organization | null;
    metrics: {
        positions: number;
        active_positions: number;
        applications: number;
        pending_applications: number;
        awaiting_admin_confirmation?: number;
        assigned_students: number;
        supervisors: number;
        reports_pending_feedback: number;
        average_evaluation_score: number | null;
        attendance_present: number;
        attendance_absent: number;
    };
    application_status: Array<{ status: ApplicationStatus; count: number }>;
    placement_statistics: { confirmed: number; unconfirmed: number };
    supervisors: SupervisorDetails[];
    recent_applications: Application[];
    assigned_students: Placement[];
}

export const internshipsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getOrganizations: builder.query<Organization[], void>({
            query: () => ({ url: "organizations/", method: "GET" }),
            providesTags: ["Organization"],
        }),
        getMyOrganization: builder.query<Organization | null, void>({
            query: () => ({ url: "organizations/me/", method: "GET" }),
            providesTags: ["Organization"],
        }),
        updateMyOrganization: builder.mutation<Organization, Partial<Organization>>({
            query: (data) => ({ url: "organizations/me/", method: "PATCH", body: data }),
            invalidatesTags: ["Organization", "Analytics"],
        }),
        createOrganization: builder.mutation<Organization, Partial<Organization>>({
            query: (data) => ({ url: "organizations/", method: "POST", body: data }),
            invalidatesTags: ["Organization"],
        }),
        updateOrganization: builder.mutation<Organization, { id: string; data: Partial<Organization> }>({
            query: ({ id, data }) => ({ url: `organizations/${id}/`, method: "PUT", body: data }),
            invalidatesTags: ["Organization"],
        }),
        deleteOrganization: builder.mutation<void, string>({
            query: (id) => ({ url: `organizations/${id}/`, method: "DELETE" }),
            invalidatesTags: ["Organization"],
        }),
        getPositions: builder.query<InternshipPosition[], void>({
            query: () => ({ url: "positions/", method: "GET" }),
            providesTags: ["Position"],
        }),
        createPosition: builder.mutation<InternshipPosition, Partial<InternshipPosition>>({
            query: (data) => ({ url: "positions/", method: "POST", body: data }),
            invalidatesTags: ["Position"],
        }),
        updatePosition: builder.mutation<InternshipPosition, { id: string; data: Partial<InternshipPosition> }>({
            query: ({ id, data }) => ({ url: `positions/${id}/`, method: "PATCH", body: data }),
            invalidatesTags: ["Position"],
        }),
        deletePosition: builder.mutation<void, string>({
            query: (id) => ({ url: `positions/${id}/`, method: "DELETE" }),
            invalidatesTags: ["Position"],
        }),
        getRecommendations: builder.query<InternshipPosition[], { top?: number; student_id?: number } | void>({
            query: (params) => ({
                url: "positions/recommendations/",
                method: "GET",
                params: params || undefined,
            }),
            providesTags: ["Position"],
        }),
        getApplications: builder.query<Application[], void>({
            query: () => ({ url: "applications/", method: "GET" }),
            providesTags: ["Application"],
        }),
        createApplication: builder.mutation<Application, FormData | Partial<Application>>({
            query: (data) => ({ url: "applications/", method: "POST", body: data }),
            invalidatesTags: ["Application"],
        }),
        updateApplication: builder.mutation<Application, { id: string; data: Partial<Application> }>({
            query: ({ id, data }) => ({ url: `applications/${id}/`, method: "PATCH", body: data }),
            invalidatesTags: ["Application"],
        }),
        acceptApplication: builder.mutation<Application, string>({
            query: (id) => ({ url: `applications/${id}/accept/`, method: "POST" }),
            invalidatesTags: ["Application", "Placement", "Analytics"],
        }),
        rejectApplication: builder.mutation<Application, string>({
            query: (id) => ({ url: `applications/${id}/reject/`, method: "POST" }),
            invalidatesTags: ["Application", "Analytics"],
        }),
        bulkUpdateApplicationStatus: builder.mutation<{ updated: number }, { ids: string[]; status: ApplicationStatus }>({
            query: (data) => ({
                url: "applications/bulk_status/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Application"],
        }),
        deleteApplication: builder.mutation<void, string>({
            query: (id) => ({ url: `applications/${id}/`, method: "DELETE" }),
            invalidatesTags: ["Application"],
        }),
        getApplicationStatistics: builder.query<ApplicationStatistics, void>({
            query: () => ({ url: "applications/statistics/", method: "GET" }),
            providesTags: ["Analytics"],
        }),
        getPlacements: builder.query<Placement[], void>({
            query: () => ({ url: "placements/", method: "GET" }),
            providesTags: ["Placement"],
        }),
        createPlacement: builder.mutation<Placement, Partial<Placement>>({
            query: (data) => ({ url: "placements/", method: "POST", body: data }),
            invalidatesTags: ["Placement", "Position", "Application", "Analytics"],
        }),
        updatePlacement: builder.mutation<Placement, { id: string; data: Partial<Placement> }>({
            query: ({ id, data }) => ({ url: `placements/${id}/`, method: "PUT", body: data }),
            invalidatesTags: ["Placement", "Position", "Application", "Analytics"],
        }),
        deletePlacement: builder.mutation<void, string>({
            query: (id) => ({ url: `placements/${id}/`, method: "DELETE" }),
            invalidatesTags: ["Placement", "Position", "Application", "Analytics"],
        }),
        getPlacementStatistics: builder.query<PlacementStatistics, void>({
            query: () => ({ url: "placements/statistics/", method: "GET" }),
            providesTags: ["Analytics"],
        }),
        assignPlacementSupervisor: builder.mutation<
            Placement,
            { application: string; supervisor: number; start_date: string; end_date: string }
        >({
            query: (data) => ({ url: "placements/assign_supervisor/", method: "POST", body: data }),
            invalidatesTags: ["Placement", "Position", "Application", "Analytics"],
        }),
        getPartnerDashboard: builder.query<PartnerDashboard, void>({
            query: () => ({ url: "partner/dashboard/", method: "GET" }),
            providesTags: ["Analytics", "Organization", "Application", "Placement", "Position"],
        }),
        getPartnerSupervisors: builder.query<SupervisorDetails[], void>({
            query: () => ({ url: "partner/supervisors/", method: "GET" }),
            providesTags: ["Auth"],
        }),
        createPartnerSupervisor: builder.mutation<
            { message: string; email_sent: boolean; supervisor: SupervisorDetails },
            { username: string; email: string; position: string; phone?: string }
        >({
            query: (data) => ({ url: "partner/create_supervisor/", method: "POST", body: data }),
            invalidatesTags: ["Auth", "Analytics"],
        }),
    }),
});

export const {
    useGetOrganizationsQuery,
    useCreateOrganizationMutation,
    useGetMyOrganizationQuery,
    useUpdateMyOrganizationMutation,
    useUpdateOrganizationMutation,
    useDeleteOrganizationMutation,
    useGetPositionsQuery,
    useCreatePositionMutation,
    useUpdatePositionMutation,
    useDeletePositionMutation,
    useGetRecommendationsQuery,
    useGetApplicationsQuery,
    useCreateApplicationMutation,
    useUpdateApplicationMutation,
    useAcceptApplicationMutation,
    useRejectApplicationMutation,
    useDeleteApplicationMutation,
    useBulkUpdateApplicationStatusMutation,
    useGetApplicationStatisticsQuery,
    useGetPlacementsQuery,
    useCreatePlacementMutation,
    useUpdatePlacementMutation,
    useDeletePlacementMutation,
    useGetPlacementStatisticsQuery,
    useAssignPlacementSupervisorMutation,
    useGetPartnerDashboardQuery,
    useGetPartnerSupervisorsQuery,
    useCreatePartnerSupervisorMutation,
} = internshipsSlice;
