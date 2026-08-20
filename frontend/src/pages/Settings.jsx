import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

import {
  User,
  Lock,
  Save,
} from "lucide-react";

function Settings() {

  const username =
    localStorage.getItem("username");


  const [profile, setProfile] = useState({
    username: "",
    email: "",
    role: "",
  });


  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });


  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    loadProfile();
  }, []);


  const loadProfile = async () => {

    try {

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/${username}`
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


  // =====================================================
  // HANDLE PROFILE
  // =====================================================

  const handleProfile = (e) => {

    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });

  };


  // =====================================================
  // HANDLE PASSWORD
  // =====================================================

  const handlePassword = (e) => {

    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });

  };


  // =====================================================
  // SAVE CHANGES
  // =====================================================

  const saveChanges = async () => {


    // Check password match

    if (
      passwords.newPassword !== "" &&
      passwords.newPassword !== passwords.confirmPassword
    ) {

      alert("New passwords do not match");

      return;

    }


    // Current password required

    if (
      passwords.newPassword !== "" &&
      passwords.currentPassword === ""
    ) {

      alert("Please enter your current password");

      return;

    }


    try {


      // =================================================
      // UPDATE PROFILE
      // =================================================

      const profileRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/update-profile`,
        {
          username: profile.username,
          email: profile.email,
          role: profile.role,
        }
      );


      if (!profileRes.data.success) {

        alert(
          profileRes.data.message ||
          "Unable to update profile"
        );

        return;

      }


      // =================================================
      // CHANGE PASSWORD
      // =================================================

      if (passwords.newPassword !== "") {

        const passwordRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/change-password`,
          {
            username: profile.username,
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword,
          }
        );


        // Check backend response

        if (!passwordRes.data.success) {

          alert(
            passwordRes.data.message ||
            "Unable to change password"
          );

          return;

        }

      }


      // =================================================
      // SUCCESS
      // =================================================

      if (passwords.newPassword !== "") {

        alert(
          "Profile and password updated successfully"
        );

      } else {

        alert(
          "Profile updated successfully"
        );

      }


      // Clear password fields

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });


    } catch (err) {

      console.log(err);

      alert(
        "Unable to update profile. Please try again."
      );

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


            {/* Username */}

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


            {/* Email */}

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


            {/* Role */}

            <div>

              <label className="text-gray-400 mb-2 block">

                Role

              </label>

              <input
                type="text"
                value={profile.role}
                disabled
                className="w-full bg-[#111827] border border-gray-700 rounded-xl p-3"
              />

            </div>


            {/* Organization */}

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


            {/* Current Password */}

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


            {/* New Password */}

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


            {/* Confirm Password */}

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
