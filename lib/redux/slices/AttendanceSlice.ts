import { apiSlice } from "./ApiSlice";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface AttendanceRecord {
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
    date: string;
    status: AttendanceStatus;
    notes?: string;
    created_at: string;
}

export interface AttendanceStats {
    total: number;
    by_status: Array<{ status: AttendanceStatus; count: number }>;
}

export const attendanceSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAttendanceRecords: builder.query<AttendanceRecord[], void>({
            query: () => ({ url: "attendance/", method: "GET" }),
            providesTags: ["Attendance"],
        }),
        createAttendanceRecord: builder.mutation<AttendanceRecord, Partial<AttendanceRecord>>({
            query: (data) => ({ url: "attendance/", method: "POST", body: data }),
            invalidatesTags: ["Attendance"],
        }),
        updateAttendanceRecord: builder.mutation<AttendanceRecord, { id: number; data: Partial<AttendanceRecord> }>({
            query: ({ id, data }) => ({ url: `attendance/${id}/`, method: "PUT", body: data }),
            invalidatesTags: ["Attendance"],
        }),
        deleteAttendanceRecord: builder.mutation<void, number>({
            query: (id) => ({ url: `attendance/${id}/`, method: "DELETE" }),
            invalidatesTags: ["Attendance"],
        }),
        getAttendanceStatistics: builder.query<AttendanceStats, void>({
            query: () => ({ url: "attendance/statistics/", method: "GET" }),
            providesTags: ["Analytics"],
        }),
    }),
});

export const {
    useGetAttendanceRecordsQuery,
    useCreateAttendanceRecordMutation,
    useUpdateAttendanceRecordMutation,
    useDeleteAttendanceRecordMutation,
    useGetAttendanceStatisticsQuery,
} = attendanceSlice;
