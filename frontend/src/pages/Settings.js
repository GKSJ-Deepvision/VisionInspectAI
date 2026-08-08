import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/Settings.css";

function Settings() {

    return (

        <div className="dashboard">

            <Sidebar />

            <div className="main-content">

                <Navbar />

                <div className="settings-page">

                    <h1>Settings</h1>

                    <div className="settings-card">

                        <h3>Account Settings</h3>

                        <label>Name</label>

                        <input
                            type="text"
                            defaultValue="Admin"
                        />

                        <label>Email</label>

                        <input
                            type="email"
                            defaultValue="admin@gmail.com"
                        />

                        <label>Password</label>

                        <input
                            type="password"
                            defaultValue="admin123"
                        />

                        <button>
                            Save Changes
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Settings;