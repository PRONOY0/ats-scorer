"use client";
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
    const navigate = useRouter();
    const pathname = usePathname();

    const navLinkClass = (path: string) => `
    font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer px-4 py-2 rounded-full
    ${pathname === path ? 'bg-[#18181b] border border-[#27272a] text-[#CCFF00]' : 'text-[#a1a1aa] hover:text-white border border-transparent'}
  `;

    return (
        <nav className="fixed top-0 left-0 w-full z-50 p-6 lg:p-8 pointer-events-none flex items-center">
            <div className="flex items-center justify-start gap-8 pointer-events-auto">
                <div
                    onClick={() => navigate.push('/')}
                    className="cursor-pointer font-black text-2xl tracking-tighter uppercase text-white hover:text-[#CCFF00] transition-colors"
                >
                    ATSs&apos;S
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate.push('/dashboard')}
                        className={navLinkClass('/dashboard')}>
                        Dashboard
                    </button>

                    <button
                        onClick={() => navigate.push('/resume')}
                        className={navLinkClass('/resume')}>
                        Resumes
                    </button>
                </div>
            </div>
        </nav>
    );
}
