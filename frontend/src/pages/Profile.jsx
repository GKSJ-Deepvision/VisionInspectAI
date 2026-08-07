import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

import {
  User,
  Mail,
  Shield,
  Calendar,
  BadgeCheck,
} from "lucide-react";

export default function Profile() {

  const { token } = useAuth();

  return (

    <Layout>

      <div className="space-y-8">

        {/* Header */}

        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white p-8 shadow-xl">

          <h1 className="text-4xl font-bold">

            My Profile

          </h1>

          <p className="mt-3 text-blue-100 text-lg">

            Manage your VisionInspect AI account information.

          </p>

        </div>

        {/* Profile Card */}

        <div className="bg-white rounded-3xl shadow-xl p-10">

          <div className="flex flex-col lg:flex-row items-center gap-10">

            {/* Avatar */}

            <div
              className="
              w-40
              h-40
              rounded-full
              bg-gradient-to-r
              from-blue-600
              to-cyan-500
              flex
              items-center
              justify-center
              shadow-xl
            "
            >

              <User
                size={90}
                className="text-white"
              />

            </div>

            {/* Info */}

            <div className="flex-1">

              <h2 className="text-3xl font-bold text-slate-800">

                VisionInspect User

              </h2>

              <p className="text-gray-500 mt-2">

                Manufacturing Quality Inspector

              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-8">

                <div className="flex items-center gap-4">

                  <Mail
                    className="text-blue-600"
                  />

                  <div>

                    <p className="text-gray-500">

                      Email

                    </p>

                    <h3 className="font-semibold">

                      user@example.com

                    </h3>

                  </div>

                </div>

                <div className="flex items-center gap-4">

                  <Shield
                    className="text-green-600"
                  />

                  <div>

                    <p className="text-gray-500">

                      Account Status

                    </p>

                    <h3 className="font-semibold text-green-600">

                      Active

                    </h3>

                  </div>

                </div>

                <div className="flex items-center gap-4">

                  <Calendar
                    className="text-orange-500"
                  />

                  <div>

                    <p className="text-gray-500">

                      Joined

                    </p>

                    <h3 className="font-semibold">

                      2026

                    </h3>

                  </div>

                </div>

                <div className="flex items-center gap-4">

                  <BadgeCheck
                    className="text-cyan-600"
                  />

                  <div>

                    <p className="text-gray-500">

                      Role

                    </p>

                    <h3 className="font-semibold">

                      Administrator

                    </h3>

                  </div>

                </div>

              </div>
                          </div>

          </div>

        </div>

        {/* Account Settings */}

        <div className="grid lg:grid-cols-2 gap-8">

          {/* Change Password */}

          <div className="bg-white rounded-3xl shadow-xl p-8">

            <h2 className="text-2xl font-bold text-slate-800 mb-6">

              Account Settings

            </h2>

            <div className="space-y-5">

              <input
                type="password"
                placeholder="Current Password"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="password"
                placeholder="New Password"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                className="
                  w-full
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  py-3
                  rounded-xl
                  font-semibold
                  transition
                "
              >
                Update Password
              </button>

            </div>

          </div>

          {/* Account Information */}

          <div className="bg-white rounded-3xl shadow-xl p-8">

            <h2 className="text-2xl font-bold text-slate-800 mb-6">

              Account Information

            </h2>

            <div className="space-y-4">

              <div className="flex justify-between border-b pb-3">

                <span className="text-gray-500">

                  Account Type

                </span>

                <span className="font-semibold">

                  Enterprise

                </span>

              </div>

              <div className="flex justify-between border-b pb-3">

                <span className="text-gray-500">

                  AI Model

                </span>

                <span className="font-semibold">

                  VisionInspect AI v2.0

                </span>

              </div>

              <div className="flex justify-between border-b pb-3">

                <span className="text-gray-500">

                  Status

                </span>

                <span className="text-green-600 font-semibold">

                  Online

                </span>

              </div>

              <div className="flex justify-between border-b pb-3">

                <span className="text-gray-500">

                  Token Available

                </span>

                <span className="font-semibold">

                  {token ? "Yes" : "No"}

                </span>

              </div>

            </div>

            <button
              className="
                mt-8
                w-full
                bg-red-600
                hover:bg-red-700
                text-white
                py-3
                rounded-xl
                font-semibold
                transition
              "
            >
              Logout
            </button>

          </div>

        </div>

        {/* Footer */}

        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8 shadow-xl">

          <div className="flex flex-col md:flex-row justify-between items-center">

            <div>

              <h2 className="text-2xl font-bold">

                VisionInspect AI Profile

              </h2>

              <p className="text-slate-300 mt-2">

                Manage your account and security settings.

              </p>

            </div>

            <div className="mt-5 md:mt-0">

              <p className="text-slate-400">

                Version

              </p>

              <h3 className="text-xl font-bold text-cyan-400">

                Enterprise 2.0

              </h3>

            </div>

          </div>

        </div>

      </div>

    </Layout>

  );

}