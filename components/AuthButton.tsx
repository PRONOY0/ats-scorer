"use client";

import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUser } from "@/hooks/useUser";
import { authentiCateUrl } from "@/lib/api";
import axios from "axios";

export default function GoogleAuthButton() {
    const { user, loading } = useUser();

    // 1. Wait until Firebase tells us the auth state
    if (loading) return null;

    // 2. If user exists → already signed in → show nothing
    if (user) return null;

    // 3. Otherwise show Google button
    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();

            const result = await signInWithPopup(auth, provider);

            const token = await result.user.getIdToken();

            const res = await axios.post(
                authentiCateUrl,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    withCredentials: true,
                },
            );

            console.log("printing res");
            console.log(res);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <button
            onClick={signInWithGoogle}
            className="
      w-full sm:w-auto
      relative
      px-4 sm:px-6 py-3
      rounded-2xl
      text-sm font-medium
      text-white
      overflow-hidden
      backdrop-blur-2xl
      bg-white/6
      border border-white/10
      shadow-[0_8px_32px_rgba(0,0,0,0.35)]
      transition-all duration-300
      hover:bg-white/9
      hover:border-white/20
      hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)]
      active:scale-[0.98]
    "
        >
            <span className="pointer-events-none absolute inset-0 rounded-2xl 
      bg-linear-to-b from-white/20 to-transparent opacity-40" />

            <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg font-thin tracking-wider">
                Sign in
                <FcGoogle className="text-xl sm:text-2xl shrink-0" />
            </span>
        </button>
    );
}