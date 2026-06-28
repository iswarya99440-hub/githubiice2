"use client";

export function PartnerPageShell({ children }: { children: React.ReactNode }) {
    return <div className="space-y-6 p-5 lg:p-8">{children}</div>;
}

export function PartnerCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <section className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm ${className}`}>{children}</section>;
}

export function PartnerField({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
}) {
    return (
        <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
        </label>
    );
}

export function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            {message}
        </div>
    );
}
