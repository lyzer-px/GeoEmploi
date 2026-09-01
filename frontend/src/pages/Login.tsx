import { Link } from "react-router-dom";
import { ROUTES } from "../routes";

export function Login() {

    return (
        <div>
            <h1>LOGIN</h1>
            <Link to={ROUTES.HOME} className="button">
                Connexion
            </Link>
        </div>
    );
};

export default Login;
