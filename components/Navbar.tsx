"use client";

import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import GoogleAuthButton from "./AuthButton";

export default function Navbar() {
    const router = useRouter();
    const { user } = useUser();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="w-full relative z-50 bg-bg-light">
            <nav className="flex items-center justify-between px-6 lg:px-12 py-8 w-full max-w-300 mx-auto border-b border-warm relative z-50 bg-bg-light">
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => router.push("/")}
                >
                    <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center">
                        <div className="w-3 h-3 bg-bg-light rotate-45"></div>
                    </div>
                    <span className="text-xl font-serif font-bold tracking-tight">
                        ATSS&apos;S
                    </span>
                </div>

                <button
                    className="md:hidden text-muted-dark hover:text-sage transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <motion.div
                        initial={false}
                        animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </motion.div>
                </button>

                <div className="hidden md:flex gap-10 text-[11px] uppercase tracking-[0.15em] font-semibold text-muted items-center">
                    {user ? (
                        <>
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="hover:text-sage transition-colors cursor-pointer"
                            >
                                DASHBOARD
                            </button>

                            <button
                                onClick={() => router.push("/resume")}
                                className="hover:text-sage transition-colors cursor-pointer"
                            >
                                RESUMES
                            </button>
                        </>
                    ) : (
                        <GoogleAuthButton />
                    )}
                </div>
            </nav>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            className="md:hidden fixed inset-0 top-24.25 bg-bg-light/60 backdrop-blur-md z-40"
                            onClick={() => setIsMobileMenuOpen(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        <motion.div
                            className="md:hidden absolute top-full left-4 right-4 mt-4 bg-white border border-warm/50 rounded-3xl p-3 soft-shadow-lg z-50 origin-top"
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        >
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold mb-2 px-4 pt-2">
                                    Menu
                                </span>

                                {user ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                router.push("/dashboard");
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="flex items-center justify-between w-full px-5 py-4 rounded-2xl transition-all group border hover:bg-bg-light border-transparent"
                                        >
                                            <span className="font-serif text-2xl font-bold tracking-tight">
                                                Dashboard
                                            </span>
                                            <ArrowRight className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={() => {
                                                router.push("/resume");
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="flex items-center justify-between w-full px-5 py-4 rounded-2xl transition-all group border hover:bg-bg-light border-transparent"
                                        >
                                            <span className="font-serif text-2xl font-bold tracking-tight">
                                                Resumes
                                            </span>
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="p-3">
                                        <GoogleAuthButton />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}