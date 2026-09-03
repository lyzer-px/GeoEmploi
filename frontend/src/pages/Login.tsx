import { useState } from "react";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { PasswordInput } from "@codegouvfr/react-dsfr/blocks/PasswordInput";
import '../Login.css'


export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const endpoint = "/api/v1/auth/login";
    const passwordDisabled = email === "";
    const isDisabled = email === "" || password === "";

    var send_mail: string = "";
    var send_password:string = "";
    var showCreateAccount: boolean = false;
    var isSeker: boolean = false;
    var isEmployer: boolean = false;

    
    function sendLoginRequest() {
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: send_mail,
            password: send_password
        })
        }).then(response => {
            if (response.ok) {
                console.log('Connexion réussie');
            }
        }).catch(error => {
            console.error('Erreur lors de la requête de connexion :', error);
        });
    }

    function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
        setEmail(e.target.value);
        send_mail = e.target.value;
    }

    function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
        setPassword(e.target.value);
        send_password = e.target.value;
    }

    function createAccount() {
        showCreateAccount = true;
    }

    return (
        <div className="login-container">
            <h1>Connexion à GeoEmploi</h1>
            <div className="login-block">
                <Input
                    hintText=""
                    label="Adresse mail"
                    state="default"
                    stateRelatedMessage="Text de validation / d'explication de l'erreur"
                    nativeInputProps={{ onChange: handleEmailChange }}
                />
                <PasswordInput
                    disabled = {passwordDisabled}
                    label="Mot de passe"
                    nativeInputProps={{ onChange: handlePasswordChange }}
                />
            </div>
            <a href="/forgot-password">Mot de passe oublié</a>
            <div className="login-space">
                <div>
                    <Button disabled={isDisabled} onClick={sendLoginRequest}>
                        Connexion
                    </Button>
                </div>
                <div>
                    <Button onClick={createAccount}>Créer un compte</Button>
                </div>
            </div>
        </div>
    );
}

export default Login;
