import ParticipantSidebar from "@/components/dashboard/ParticipantSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#020617] pt-28 pb-20 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1 hidden lg:block">
                    {/* The Sidebar component manages its own 'sticky' state in its className if needed */}
                    <ParticipantSidebar />
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 min-h-[60vh] text-white">
                    {children}
                </div>
            </div>
        </div>
    );
}
