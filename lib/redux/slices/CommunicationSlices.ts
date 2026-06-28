import { apiSlice } from "./ApiSlice";

export interface CommunicationMessage {
    id: number;
    sender: number;
    receiver: number;
    message_content: string;
    subject: string;
    message_type: string;
    priority: string;
    is_read: boolean;
    timestamp: string;
    time_since?: string;
    sender_details?: {
        id: number;
        username: string;
        full_name: string;
        email: string;
        role?: string;
    };
    receiver_details?: {
        id: number;
        username: string;
        full_name: string;
        email: string;
        role?: string;
    };
}

export interface SendMessagePayload {
    receiver: number;
    subject: string;
    message_content: string;
    message_type?: string;
    priority?: string;
}

export interface CommunicationUser {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    email: string;
    role?: string;
}

export const communicationSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllMessages: builder.query<CommunicationMessage[], unknown>({
            query: () => ({
                url: "communications/",
                method: "GET",
            }),
            providesTags: ["Communication"],
        }),
        getCommunicationUsers: builder.query<CommunicationUser[], unknown>({
            query: () => ({
                url: "communications/users/",
                method: "GET",
            }),
            providesTags: ["Communication"],
        }),
        sendMessage: builder.mutation<CommunicationMessage, SendMessagePayload>({
            query: (message) => ({
                url: "communications/",
                method: "POST",
                body: message,
            }),
            invalidatesTags: ["Communication"],
        }),
    }),
});

export const {
    useGetAllMessagesQuery,
    useGetCommunicationUsersQuery,
    useSendMessageMutation
} = communicationSlice;
