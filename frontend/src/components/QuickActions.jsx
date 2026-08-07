import { useNavigate } from "react-router-dom";

import {
  Upload,
  History,
  BarChart3,
  FileText,
} from "lucide-react";

export default function QuickActions() {

  const navigate = useNavigate();

  const actions = [

    {
      title: "New Prediction",
      description: "Upload a product image for AI inspection.",
      icon: <Upload size={34} />,
      color: "from-blue-600 to-cyan-500",
      path: "/predict",
    },

    {
      title: "Inspection History",
      description: "View all previous inspections.",
      icon: <History size={34} />,
      color: "from-green-600 to-emerald-500",
      path: "/history",
    },

    {
      title: "Analytics",
      description: "View charts and production insights.",
      icon: <BarChart3 size={34} />,
      color: "from-purple-600 to-indigo-500",
      path: "/analytics",
    },

    {
      title: "Reports",
      description: "Export PDF, CSV and Excel reports.",
      icon: <FileText size={34} />,
      color: "from-orange-500 to-red-500",
      path: "/reports",
    },

  ];

  return (

    <div className="bg-white rounded-3xl shadow-xl p-8">

      <h2 className="text-2xl font-bold text-slate-800 mb-8">

        Quick Actions

      </h2>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        {actions.map((action, index) => (

          <div
            key={index}
            onClick={() => navigate(action.path)}
            className="
              cursor-pointer
              rounded-2xl
              overflow-hidden
              shadow-lg
              hover:shadow-2xl
              hover:-translate-y-2
              transition-all
              duration-300
              bg-white
              border
            "
          >

            <div
              className={`bg-gradient-to-r ${action.color} p-6 text-white`}
            >

              {action.icon}

            </div>

            <div className="p-6">

              <h3 className="text-xl font-bold text-slate-800">

                {action.title}

              </h3>

              <p className="text-gray-500 mt-3">

                {action.description}

              </p>

              <button
                className="
                  mt-5
                  w-full
                  bg-slate-900
                  hover:bg-blue-600
                  text-white
                  py-2
                  rounded-xl
                  transition
                "
              >
                Open

              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}