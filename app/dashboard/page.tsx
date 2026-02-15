"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Bookmark {
    id: string;
    title: string;
    url: string;
}

export default function Dashboard() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const router = useRouter();

    useEffect(() => {
        checkUser();
        fetchBookmarks();
        subscribeToChanges();
    }, []);

    const checkUser = async () => {
        const { data } = await supabase.auth.getSession();
        if (!data.session) router.push("/");
    };

    const fetchBookmarks = async () => {
        const { data: userData } = await supabase.auth.getUser();

        if (!userData.user) {
            console.log("No user found");
            return;
        }

        const { data, error } = await supabase
            .from("bookmarks")
            .select("*")
            .eq("user_id", userData.user.id);

        console.log("Fetched Data:", data);
        console.log("Fetch Error:", error);

        setBookmarks(data || []);
    };


    const addBookmark = async () => {
        const { data: userData, error: userError } =
            await supabase.auth.getUser();

        if (!userData.user) {
            alert("User not authenticated");
            return;
        }

        const { error } = await supabase.from("bookmarks").insert([
            {
                title,
                url,
                user_id: userData.user.id, // ✅ always real value
            },
            // setTitle(""),
            // setUrl(""),
        ]);

        // if (error) {
        //     console.log("Insert Error:", error);
        // } else {
        //     console.log("Inserted successfully");
        // }
        if (!error) {
            fetchBookmarks();
        }
    };


    const deleteBookmark = async (id: string) => {
        const { error } = await supabase
            .from("bookmarks")
            .delete()
            .eq("id", id);

        console.log("Delete Error:", error);

        if (!error) {
            fetchBookmarks(); // refresh list
        }
    };


    const subscribeToChanges = () => {
        supabase
            .channel("bookmarks")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "bookmarks" },
                () => {
                    fetchBookmarks();
                }
            )
            .subscribe();
    };

    const logout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <div className="max-w-xl mx-auto p-6">
            <div className="flex justify-between mb-6">
                <h1 className="text-xl font-bold">My Bookmarks</h1>
                <button onClick={logout} className="text-red-500">
                    Logout
                </button>
            </div>

            <div className="flex gap-2 mb-4">
                <input
                    placeholder="Title"
                    className="border p-2 w-1/3"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    placeholder="URL"
                    className="border p-2 w-2/3"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <button
                    onClick={addBookmark}
                    className="bg-black text-white px-4"
                >
                    Add
                </button>
            </div>

            <div className="space-y-2">
                {bookmarks.map((b) => (
                    <div
                        key={b.id}
                        className="flex justify-between items-center bg-white p-3 rounded shadow"
                    >
                        <a
                            href={b.url}
                            target="_blank"
                            className="text-blue-600 underline"
                        >
                            {b.title}
                        </a>
                        <button
                            onClick={() => deleteBookmark(b.id)}
                            className="text-red-500"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
