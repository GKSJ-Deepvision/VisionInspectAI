import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import {
  User,
  Lock,
  Server,
  Save,
} from "lucide-react";

function Settings() {
  const username = localStorage.getItem("username");

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    role: "",
  });

  const [passwords, setPasswords] =useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/user/${username}`
      );

      if (res.data.success) {
        setProfile({
          username: res.data.username,
          email: res.data.email,
          role: res.data.role,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleProfile = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePassword = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  const saveChanges = async () => {
    if (
      passwords.newPassword !== passwords.confirmPassword
    ) {
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8000/update-profile",
        {
          username: profile.username,
          email: profile.email,
          role: profile.role,
        }
      );

      if (passwords.newPassword !== "") {
        await axios.post(
          "http://localhost:8000/change-password",
          {
            username: profile.username,
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword,
          }
        );
      }

      alert("Profile Updated Successfully");

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      alert("Unable to update profile");
    }
  };

  return (
    <Layout title="Settings">
      <div className="space-y-6">

        {/* Profile Card */}

        <div className="bg-[#1F2937] rounded-2xl p-8 shadow-lg flex items-center gap-6">

          <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center">

            <User
              size={45}
              className="text-white"
            />

          </div>

          <div>

            <h2 className="text-3xl font-bold text-white">
              {profile.username}
            </h2>

            <p className="text-gray-400 mt-2">
              {profile.email}
            </p>

            <span className="inline-block mt-3 bg-emerald-500/20 text-emerald-400 px-4 py-1 rounded-full text-sm">
              {profile.role}
            </span>

          </div>

        </div>

        {/* Account Information */}

        <div className="bg-[#1F2937] rounded-2xl p-8 shadow-lg">

          <div className="flex items-center gap-3 mb-6">

            <User className="text-emerald-400" />

            <h2 className="text-2xl font-bold">
              Account Information
            </h2>

          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <div>

              <label className="text-gray-400 mb-2 block">
                Username
              </label>

              <input
                type="text"
                name="username"
                value={profile.username}
                disabled
                className="w-full bg-[#111827] border border-gray-700 rounded-xl p-3"
              />

            </div>

            <div>

              <label className="text-gray-400 mb-2 block">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfile}
                className="w-full bg-[#111827] border border-gray-700 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              />

            </div>

            <div>

              <label className="text-gray-400 mb-2 block">
                Role
              </label>

              <select
                name="role"
                value={profile.role}
                onChange={handleProfile}
                className="w-full bg-[#111827] border border-gray-700 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              >
                <option>Quality Engineer</option>
                <option>Factory Supervisor</option>
              </select>

            </div>

            <div>

              <label className="text-gray-400 mb-2 block">
                Organization
              </label>

              <input
                type="text"
                value="VisionInspect AI"
                disabled
                className="w-full bg-[#111827] border border-gray-700 rounded-xl p-3"
              />

            </div>

          </div>

        </div>

        {/* Security */}

        <div className="bg-[#1F2937] rounded-2xl p-8 shadow-lg">

          <div className="flex items-center gap-3 mb-6">

            <Lock className="text-yellow-400" />

            <h2 className="text-2xl font-bold">
              Security
            </h2>

          </div>

          <div className="grid md:grid-cols-3 gap-6">

            <div>

              <label className="text-gray-400 mb-2 block">
                Current Password
              </label>

              <input
                type="password"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handlePassword}
                placeholder="Enter current password"
                className="w-full bg-[#111827] border border-gray-700 rounded-xl p-3 focus:outline-none focus:border-yellow-400"
              />

            </div>

            <div>

              <label className="text-gray-400 mb-2 block">
                New Password
              </label>

              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePassword}
                placeholder="Enter new password"
                className="w-full bg-[#111827] border border-gray-700 rounded-xl p-3 focus:outline-none focus:border-yellow-400"
              />

            </div>

            <div>

              <label className="text-gray-400 mb-2 block">
                Confirm Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePassword}
                placeholder="Confirm new password"
                className="w-full bg-[#111827] border border-gray-700 rounded-xl p-3 focus:outline-none focus:border-yellow-400"
              />

            </div>

          </div>

        </div>

        {/* System Information */}

        <div className="bg-[#1F2937] rounded-2xl p-8 shadow-lg">

          <div className="flex items-center gap-3 mb-6">

            <Server className="text-blue-400" />

            <h2 className="text-2xl font-bold">
              System Information
            </h2>

          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <div className="bg-[#111827] rounded-xl p-4">
              <p className="text-gray-400">Frontend</p>
              <h3 className="font-semibold mt-2">
                React + Tailwind CSS
              </h3>
            </div>

            <div className="bg-[#111827] rounded-xl p-4">
              <p className="text-gray-400">Backend</p>
              <h3 className="font-semibold mt-2">
                FastAPI
              </h3>
            </div>

            <div className="bg-[#111827] rounded-xl p-4">
              <p className="text-gray-400">Dataset</p>
              <h3 className="font-semibold mt-2">
                MVTec AD Dataset
              </h3>
            </div>

            <div className="bg-[#111827] rounded-xl p-4">
              <p className="text-gray-400">Version</p>
              <h3 className="font-semibold mt-2">
                VisionInspect AI v1.0
              </h3>
            </div>

          </div>

        </div>

        {/* Save Button */}

        <div className="flex justify-end">

          <button
            onClick={saveChanges}
            className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
          >
            <Save size={20} />
            Save Changes
          </button>

        </div>

      </div>
    </Layout>
  );
}

export default Settings;