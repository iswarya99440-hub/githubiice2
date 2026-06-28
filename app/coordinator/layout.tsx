"use client";
import { useState } from "react";
import Navbar from "@/components/coordinator/Navbar";
import Sidebar from "@/components/coordinator/Sidebar";

interface UserProfile {
    username: string;
    email: string;
    role: string;
}

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const [] = useState<UserProfile | null>({
        username: "student_user",
        email: "student@example.com",
        role: "student"
    });

    return (
        <div className="flex min-h-screen bg-gray-50">

            <Sidebar />

            <div className="flex-1 flex flex-col ml-0 md:ml-[280px] transition-all duration-300">

                <div className="sticky top-0 z-30 w-full">
                    <Navbar onSearch={(query: string) => { /* handle search here */ }} />
                </div>
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}