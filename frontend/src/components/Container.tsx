import { ReactNode } from "react";

export default function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 ${className}`}>
            {children}
        </div>
    );
}
