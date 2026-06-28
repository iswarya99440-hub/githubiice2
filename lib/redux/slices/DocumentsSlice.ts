import { apiSlice } from "./ApiSlice";

export interface Document {
    id: number;
    user: number;
    file: string;
    name: string;
    uploaded_at: string;
}

export const documentsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDocuments: builder.query<Document[], void>({
            query: () => ({ url: "documents/", method: "GET" }),
            providesTags: ["Document"],
        }),
        getDocumentById: builder.query<Document, number>({
            query: (id) => ({ url: `documents/${id}/`, method: "GET" }),
            providesTags: ["Document"],
        }),
        createDocument: builder.mutation<Document, FormData | Partial<Document>>({
            query: (data) => ({
                url: "documents/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Document"],
        }),
        updateDocument: builder.mutation<Document, { id: number; data: Partial<Document> }>({
            query: ({ id, data }) => ({
                url: `documents/${id}/`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Document"],
        }),
        deleteDocument: builder.mutation<void, number>({
            query: (id) => ({
                url: `documents/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Document"],
        }),
    }),
});

export const {
    useGetDocumentsQuery,
    useGetDocumentByIdQuery,
    useCreateDocumentMutation,
    useUpdateDocumentMutation,
    useDeleteDocumentMutation,
} = documentsSlice;
