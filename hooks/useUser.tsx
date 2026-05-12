"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import axios from "axios";
import { authentiCateUrl, callUser } from "@/lib/api";

interface DbUser {
  id: string;
  name: string;
  avatarUrl: string;
}

interface UserContextType {
  user: User | null;
  dbUser: DbUser | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  dbUser: null,
  loading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  console.log("1. UserProvider rendered");
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("2. useEffect ran");
    console.log("3. auth object:", auth);

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      console.log("4. onAuthStateChanged fired, user:", u);
      setUser(u);

      if (u) {
        try {
          const token = await u.getIdToken();

          await axios.post(
            authentiCateUrl,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            }
          );

          const res = await axios.get(callUser, {
            withCredentials: true,
          });

          setDbUser(res.data.user);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setDbUser(null);
        }
      } else {
        setDbUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, dbUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);