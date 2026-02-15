"use client";

import { supabase } from "./lib/supabaseClient";

export default function Home() {
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
      redirectTo: "http://localhost:3000/dashboard",
    },
    });
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={login}
        className="px-6 py-3 bg-black text-white rounded-md"
      >
        Sign in with Google
      </button>
    </div>
  );
}
