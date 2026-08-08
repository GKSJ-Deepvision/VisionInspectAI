import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import UploadCard from "../components/UploadCard";

function Upload() {
    return (
        <div className="dashboard">

            <Sidebar />

            <div className="main-content">

                <Navbar />

                <div className="content">

                    <h1>Upload Image</h1>

                    <UploadCard />

                </div>

            </div>

        </div>
    );
}

export default Upload;