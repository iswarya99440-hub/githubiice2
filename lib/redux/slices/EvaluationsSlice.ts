import { apiSlice } from "./ApiSlice";

export type EvaluationType = "MIDTERM" | "FINAL";

export interface Evaluation {
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
    supervisor: number | null;
    evaluation_type: EvaluationType;
    score: number;
    max_score?: number;
    percentage?: number;
    score_out_of_20_component?: number;
    feedback?: string;
    created_at: string;
    ratings?: EvaluationRating[];
}

export interface EvaluationSummary {
    student: NonNullable<Evaluation["student_details"]>;
    midterm: Evaluation | null;
    final: Evaluation | null;
    midterm_score: number | null;
    final_score: number | null;
    total_score: number;
    total_max_score: number;
    final_score_out_of_20: number | null;
    is_complete: boolean;
}

export interface EvaluationCriterion {
    id: number;
    name: string;
    description?: string;
    max_score: number;
    is_active: boolean;
}

export interface EvaluationRating {
    id: number;
    evaluation: number;
    criterion: number;
    score: number;
    comment?: string;
}

export interface EvaluationStatistics {
    total: number;
    by_type: Array<{ evaluation_type: EvaluationType; count: number }>;
    avg_score: number | null;
    avg_score_out_of_20?: number | null;
    completed_students?: number;
}

export const evaluationsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getEvaluations: builder.query<Evaluation[], void>({
            query: () => ({ url: "evaluations/", method: "GET" }),
            providesTags: ["Evaluation"],
        }),
        createEvaluation: builder.mutation<Evaluation, Partial<Evaluation>>({
            query: (data) => ({ url: "evaluations/", method: "POST", body: data }),
            invalidatesTags: ["Evaluation", "Analytics"],
        }),
        updateEvaluation: builder.mutation<Evaluation, { id: number; data: Partial<Evaluation> }>({
            query: ({ id, data }) => ({ url: `evaluations/${id}/`, method: "PUT", body: data }),
            invalidatesTags: ["Evaluation", "Analytics"],
        }),
        deleteEvaluation: builder.mutation<void, number>({
            query: (id) => ({ url: `evaluations/${id}/`, method: "DELETE" }),
            invalidatesTags: ["Evaluation", "Analytics"],
        }),
        getEvaluationStatistics: builder.query<EvaluationStatistics, void>({
            query: () => ({ url: "evaluations/statistics/", method: "GET" }),
            providesTags: ["Analytics"],
        }),
        getEvaluationSummaries: builder.query<EvaluationSummary[], void>({
            query: () => ({ url: "evaluations/summaries/", method: "GET" }),
            providesTags: ["Evaluation"],
        }),
        getEvaluationCriteria: builder.query<EvaluationCriterion[], void>({
            query: () => ({ url: "evaluation-criteria/", method: "GET" }),
            providesTags: ["EvaluationCriterion"],
        }),
        createEvaluationCriterion: builder.mutation<EvaluationCriterion, Partial<EvaluationCriterion>>({
            query: (data) => ({ url: "evaluation-criteria/", method: "POST", body: data }),
            invalidatesTags: ["EvaluationCriterion"],
        }),
        updateEvaluationCriterion: builder.mutation<EvaluationCriterion, { id: number; data: Partial<EvaluationCriterion> }>({
            query: ({ id, data }) => ({ url: `evaluation-criteria/${id}/`, method: "PUT", body: data }),
            invalidatesTags: ["EvaluationCriterion"],
        }),
        deleteEvaluationCriterion: builder.mutation<void, number>({
            query: (id) => ({ url: `evaluation-criteria/${id}/`, method: "DELETE" }),
            invalidatesTags: ["EvaluationCriterion"],
        }),
        getEvaluationRatings: builder.query<EvaluationRating[], void>({
            query: () => ({ url: "evaluation-ratings/", method: "GET" }),
            providesTags: ["EvaluationRating"],
        }),
        createEvaluationRating: builder.mutation<EvaluationRating, Partial<EvaluationRating>>({
            query: (data) => ({ url: "evaluation-ratings/", method: "POST", body: data }),
            invalidatesTags: ["EvaluationRating", "Evaluation"],
        }),
        updateEvaluationRating: builder.mutation<EvaluationRating, { id: number; data: Partial<EvaluationRating> }>({
            query: ({ id, data }) => ({ url: `evaluation-ratings/${id}/`, method: "PUT", body: data }),
            invalidatesTags: ["EvaluationRating", "Evaluation"],
        }),
        deleteEvaluationRating: builder.mutation<void, number>({
            query: (id) => ({ url: `evaluation-ratings/${id}/`, method: "DELETE" }),
            invalidatesTags: ["EvaluationRating", "Evaluation"],
        }),
    }),
});

export const {
    useGetEvaluationsQuery,
    useCreateEvaluationMutation,
    useUpdateEvaluationMutation,
    useDeleteEvaluationMutation,
    useGetEvaluationStatisticsQuery,
    useGetEvaluationSummariesQuery,
    useGetEvaluationCriteriaQuery,
    useCreateEvaluationCriterionMutation,
    useUpdateEvaluationCriterionMutation,
    useDeleteEvaluationCriterionMutation,
    useGetEvaluationRatingsQuery,
    useCreateEvaluationRatingMutation,
    useUpdateEvaluationRatingMutation,
    useDeleteEvaluationRatingMutation,
} = evaluationsSlice;
