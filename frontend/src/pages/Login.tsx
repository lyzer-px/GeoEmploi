import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { PasswordInput } from "@codegouvfr/react-dsfr/blocks/PasswordInput";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { Link } from "react-router-dom";
import { ROUTES } from '../routes';
import '../Login.css'
import MyHeader from '../Header';
import Footer from '../Footer';

type Mode = "login" | "register";
type Role = "job_seeker" | "employer";

export function Login() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<Mode>("login");

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

    const API_BACKEND_URL = import.meta.env.VITE_API_BACKEND_URL;

    function sendLoginRequest() {
        fetch(`${API_BACKEND_URL}/auth/login`, {
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
                    throw new Error("Échec de la connexion");
                }

                const data = await response.json();

                localStorage.setItem(
                    "access_token",
                    data.access_token
                );

                console.log("5. data =", data);

                if (data.role === "employer") {
                    navigate("/employeur");
                } else {
                    navigate(ROUTES.HOME);
                }
            })
            .catch((error) => {
                console.error(
                    "Erreur lors de la requête de connexion :",
                    error
                );
            });
    }

    function sendRegisterRequest() {
        fetch(`${API_BACKEND_URL}/auth/register`, {
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
                    throw new Error("Échec de l'inscription");
                }
                setMode("login");
            })
            .catch((error) => {
                console.error("Erreur lors de la requête d'inscription :", error);
            });
    }

    return (
        <div className="login-container">
            <MyHeader />
            {mode === "login" ? (
                <div className="login-block">
                    <h1>Connexion à GeoEmploi</h1>
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
                        <Button priority="secondary" onClick={() => setMode("register")}>
                            Créer un compte
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="login-block">
                    <h1>Créer un compte GeoEmploi</h1>
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
                        <Button priority="secondary" onClick={() => setMode("login")}>
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
