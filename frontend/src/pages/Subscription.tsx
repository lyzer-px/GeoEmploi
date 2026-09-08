import { useState } from "react";

export function Subscription() {
    type Mode = "no_sub" | "sub";
    var is_subscribe: boolean = false;
    const [mode, setMode] = useState<Mode>("no_sub");
    const API_BACKEND_URL = import.meta.env.VITE_API_BACKEND_URL;
    const INFOS_PATH = '/users/me'
    const [feedback, setFeedback] = useState<{ severity: "success" | "error"; message: string } | null>(null);
    var mail: string = "";
    var password: string = "";
    const token = localStorage.getItem("access_token");

    function Subscibe () {
        is_subscribe = true
    }

    function get_subsciprion() {
        setFeedback(null);
        fetch(API_BACKEND_URL + INFOS_PATH, {
            headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        })
        .then(async (response) => {
            if (response.status === 401) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            setCurrentUser(null);
            return;
        }

        if (!response.ok) {
        throw new Error(`GET /me HTTP ${response.status}`);
        }

        const user = await response.json();
    }

    return (
        {mode === "no_sub" ? (
            <button onClick={Subscibe}> s abonner</button>
        ) : (
            <label> Vous êtes abboné !</label>
        )}
        <div>
            <h1>Abonnement</h1>
        </div>
    )
}
