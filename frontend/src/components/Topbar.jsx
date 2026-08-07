import { useEffect, useState } from "react";
import {
  Bell,
  Search,
  UserCircle,
} from "lucide-react";

export default function Topbar() {

  const [time, setTime] = useState(
    new Date()
  );

  useEffect(() => {

    const timer = setInterval(() => {

      setTime(new Date());

    }, 1000);

    return () => clearInterval(timer);

  }, []);

  return (

    <header
      className="
      bg-white
      shadow-md
      px-8
      py-5
      flex
      items-center
      justify-between
    "
    >

      {/* Left */}

      <div>

        <h1 className="text-3xl font-bold text-slate-800">

          Dashboard

        </h1>

        <p className="text-gray-500">

          Welcome to VisionInspect AI

        </p>

      </div>

      {/* Search */}

      <div className="hidden lg:flex items-center relative">

        <Search
          size={18}
          className="
            absolute
            left-4
            text-gray-400
          "
        />

        <input
          type="text"
          placeholder="Search..."
          className="
            w-80
            pl-11
            pr-4
            py-3
            rounded-xl
            border
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        />

      </div>      {/* Right Section */}

      <div className="flex items-center gap-6">

        {/* Date & Time */}

        <div className="hidden md:block text-right">

          <p className="text-sm text-gray-500">
            {time.toLocaleDateString()}
          </p>

          <p className="font-semibold text-slate-700">
            {time.toLocaleTimeString()}
          </p>

        </div>

        {/* Notification */}

        <button
          className="
            relative
            p-3
            rounded-xl
            bg-gray-100
            hover:bg-blue-100
            transition
          "
        >

          <Bell
            size={22}
            className="text-slate-700"
          />

          <span
            className="
              absolute
              -top-1
              -right-1
              w-5
              h-5
              rounded-full
              bg-red-500
              text-white
              text-xs
              flex
              items-center
              justify-center
            "
          >
            3
          </span>

        </button>

        {/* User */}

        <div
          className="
            flex
            items-center
            gap-3
            bg-gray-100
            rounded-xl
            px-4
            py-2
          "
        >

          <UserCircle
            size={42}
            className="text-blue-600"
          />

          <div className="hidden lg:block">

            <p className="font-semibold text-slate-700">
              Welcome
            </p>

            <p className="text-sm text-gray-500">
              VisionInspect User
            </p>

          </div>

        </div>

      </div>

    </header>

  );

}