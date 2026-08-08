import "../styles/Sidebar.css";
import { Link } from "react-router-dom";

function Sidebar() {

    return (

        <div className="sidebar">

            <h2>VisionInspect</h2>

            <ul>

                <li>
                    <Link to="/dashboard">🏠 Dashboard</Link>
                </li>

                <li>
                    <Link to="/upload">📤 Upload</Link>
                </li>

                <li>
                    <Link to="/history">📊 History</Link>
                </li>

                <li>
                    <Link to="/settings">
                        ⚙ Settings
                    </Link>
                </li>

                <li>
                    <Link to="/">🚪 Logout</Link>
                </li>

            </ul>

        </div>

    );

}

export default Sidebar;