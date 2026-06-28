"use client";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { Provider } from "react-redux";
import { store } from "@/lib/redux/store";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Academic Internaship Platform</title>
        <meta name="description" content="A system for managing academic internships and their tasks." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body
        className="antialiased min-h-screen flex flex-col"
        style={{
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"",
        }}
      >
        <SessionProvider>
          <Provider store={store}>
            <Toaster position={`top-right`} />
            <main className="flex-grow">{children}</main>
          </Provider>
        </SessionProvider>
      </body>
    </html>
  );
}
