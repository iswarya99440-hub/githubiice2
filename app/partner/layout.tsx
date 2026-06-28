"use client";

import { useEffect, useState } from "react";
import PartnerNavbar from "@/components/partner/Navbar";
import PartnerSidebar from "@/components/partner/Sidebar";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function PartnerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        if (status === "loading") {
            return;
        }

        if (status === "unauthenticated") {
            router.replace("/auth");
            return;
        }

        if (session?.user?.role !== "Partner") {
            router.replace("/auth");
            return;
        }

        if (session.user.token) {
            localStorage.setItem("access", session.user.token);
        }

        const refreshToken = (session.user as typeof session.user & { refreshToken?: string }).refreshToken;
        if (refreshToken) {
            localStorage.setItem("refresh", refreshToken);
        }

        setAuthReady(true);
    }, [router, session, status]);

    if (!authReady) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-sm text-slate-500">
                Loading partner workspace...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <PartnerSidebar />
            <div className="md:ml-[280px]">
                <PartnerNavbar />
                <main>{children}</main>
            </div>
        </div>
    );
}
