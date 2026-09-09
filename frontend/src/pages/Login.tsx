import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { PasswordInput } from "@codegouvfr/react-dsfr/blocks/PasswordInput";
import { Select } from "@codegouvfr/react-dsfr/Select";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { Link } from "react-router-dom";
import { ROUTES } from '../routes';
import '../Login.css'
import MyHeader from '../Header';
import Footer from '../Footer';

type Mode = "login" | "register";
type Role = "job_seeker" | "employer";

export function Login() {
    const API_BACKEND_URL = import.meta.env.VITE_API_BACKEND_URL;
    const LOGIN_PATH = `/auth/login`;
    const REGISTER_PATH = `/auth/register`;

    const navigate = useNavigate();
    const [mode, setMode] = useState<Mode>("login");

    const [feedback, setFeedback] = useState<{ severity: "success" | "error"; message: string } | null>(null);

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const isLoginDisabled = loginEmail === "" || loginPassword === "";

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [role, setRole] = useState<Role>("job_seeker");
    const isRegisterDisabled =
        firstName === "" || lastName === "" || registerEmail === "" || registerPassword === "";

   function sendLoginRequest() {
        setFeedback(null);
        fetch(API_BACKEND_URL + LOGIN_PATH, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: loginEmail,
                password: loginPassword
            }),
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error("Email ou mot de passe incorrect");
                }
                const data = await response.json();
                localStorage.setItem("access_token", data.tokens.access_token);
                localStorage.setItem("refresh_token", data.tokens.refresh_token);
                localStorage.setItem("current_user", JSON.stringify(data.user));
                
                setFeedback({ severity: "success", message: "Connexion réussie, redirection..." });
                
                const userRoles = data.user.roles || [];
                
                if (userRoles.includes("admin")) {
                    navigate(ROUTES.ADMIN);
                } else if (userRoles.includes("employer")) {
                    navigate(ROUTES.EMPLOYER);
                } else {
                    navigate(ROUTES.HOME); // Par défaut (job_seeker)
                }
            })
            .catch((error: Error) => {
                setFeedback({ severity: "error", message: error.message });
                console.error("Erreur lors de la requête de connexion :", error);
            });
    }

    function sendRegisterRequest() {
        setFeedback(null);
        fetch(API_BACKEND_URL + REGISTER_PATH, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                email: registerEmail,
                password: registerPassword,
                role: role
            }),
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error("Échec de l'inscription, vérifiez vos informations");
                }
                const data = await response.json().catch(() => null);
                if (data?.tokens?.access_token) {
                    localStorage.setItem("access_token", data.tokens.access_token);
                    localStorage.setItem("refresh_token", data.tokens.refresh_token);
                    localStorage.setItem("current_user", JSON.stringify(data.user));
                }

                setFeedback({ severity: "success", message: "Compte créé, redirection..." });

                if (role === "employer") {
                    navigate(ROUTES.EMPLOYER);
                } else {
                    navigate(ROUTES.HOME);
                }
            })
            .catch((error: Error) => {
                setFeedback({ severity: "error", message: error.message });
                console.error("Erreur lors de la requête d'inscription :", error);
            });
    }

    return (
        <div className="login-container">
            <MyHeader />
            {mode === "login" ? (
                <div className="login-block">
                    <h1>Connexion à GeoEmploi</h1>
                    {feedback && (
                        <Alert
                            severity={feedback.severity}
                            title={feedback.severity === "success" ? "Succès" : "Erreur"}
                            description={feedback.message}
                            closable
                            onClose={() => setFeedback(null)}
                            className="fr-mb-2w"
                        />
                    )}
                    <Input
                        label="Adresse mail"
                        state="default"
                        nativeInputProps={{
                            value: loginEmail,
                            onChange: (e) => setLoginEmail(e.target.value),
                        }}
                    />
                    <PasswordInput
                        label="Mot de passe"
                        nativeInputProps={{
                            value: loginPassword,
                            onChange: (e) => setLoginPassword(e.target.value),
                        }}
                    />
                    <Link to={ROUTES.FORGOT_PASSWORD}>Mot de passe oublié</Link>
                    <div className="login-space">
                        <Button disabled={isLoginDisabled} onClick={sendLoginRequest}>
                            Connexion
                        </Button>
                    </div>
                    <div className="login-space">
                        <Button priority="secondary" onClick={() => { setMode("register"); setFeedback(null); }}>
                            Créer un compte
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="login-block">
                    <h1>Créer un compte GeoEmploi</h1>
                    {feedback && (
                        <Alert
                            severity={feedback.severity}
                            title={feedback.severity === "success" ? "Succès" : "Erreur"}
                            description={feedback.message}
                            closable
                            onClose={() => setFeedback(null)}
                            className="fr-mb-2w"
                        />
                    )}
                    <Select
                        label="Je suis"
                        nativeSelectProps={{
                            value: role,
                            onChange: (e) => setRole(e.target.value as Role),
                        }}
                    >
                        <option value="job_seeker">Chercheur d'emploi</option>
                        <option value="employer">Employeur</option>
                    </Select>
                    <Input
                        label="Prénom"
                        state="default"
                        nativeInputProps={{
                            value: firstName,
                            onChange: (e) => setFirstName(e.target.value),
                        }}
                    />
                    <Input
                        label="Nom"
                        state="default"
                        nativeInputProps={{
                            value: lastName,
                            onChange: (e) => setLastName(e.target.value),
                        }}
                    />
                    <Input
                        label="Adresse mail"
                        state="default"
                        nativeInputProps={{
                            value: registerEmail,
                            onChange: (e) => setRegisterEmail(e.target.value),
                        }}
                    />
                    <PasswordInput
                        label="Mot de passe"
                        nativeInputProps={{
                            value: registerPassword,
                            onChange: (e) => setRegisterPassword(e.target.value),
                        }}
                    />
                    <div className="login-space">
                        <Button disabled={isRegisterDisabled} onClick={sendRegisterRequest}>
                            Créer mon compte
                        </Button>
                    </div>
                    <div className="login-space">
                        <Button priority="secondary" onClick={() => { setMode("login"); setFeedback(null); }}>
                            J'ai déjà un compte
                        </Button>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}

export default Login;