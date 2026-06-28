import { apiSlice } from "./ApiSlice";

export interface Notification {
    id: number;
    user: number;
    message: string;
    is_read: boolean;
    created_at: string;
}

export const notificationsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query<Notification[], void>({
            query: () => ({ url: "notifications/", method: "GET" }),
            providesTags: ["Notification"],
        }),
        getNotificationById: builder.query<Notification, number>({
            query: (id) => ({ url: `notifications/${id}/`, method: "GET" }),
            providesTags: ["Notification"],
        }),
        createNotification: builder.mutation<Notification, Partial<Notification>>({
            query: (data) => ({
                url: "notifications/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Notification"],
        }),
        updateNotification: builder.mutation<Notification, { id: number; data: Partial<Notification> }>({
            query: ({ id, data }) => ({
                url: `notifications/${id}/`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Notification"],
        }),
        deleteNotification: builder.mutation<void, number>({
            query: (id) => ({
                url: `notifications/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Notification"],
        }),
        markNotificationRead: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `notifications/${id}/mark_read/`,
                method: "POST",
            }),
            invalidatesTags: ["Notification"],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useGetNotificationByIdQuery,
    useCreateNotificationMutation,
    useUpdateNotificationMutation,
    useDeleteNotificationMutation,
    useMarkNotificationReadMutation,
} = notificationsSlice;
