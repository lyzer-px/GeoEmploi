import MyHeader from "../Header";
import Footer from "../Footer";

function Admin() {
    return (
        <div className="app-layout">
            <MyHeader />
            <main className="admin-page">
                <p className="admin-kicker">Administration</p>
                <h1>Panneau d’administration</h1>
            </main>
            <Footer />
        </div>
    );
}

export default Admin;
