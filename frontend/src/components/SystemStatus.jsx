import {
  CheckCircle,
  Database,
  Cpu,
  Server,
} from "lucide-react";

export default function SystemStatus() {

  const systems = [
    {
      title: "Backend API",
      status: "Online",
      color: "text-green-600",
    },
    {
      title: "Database",
      status: "Connected",
      color: "text-green-600",
    },
    {
      title: "AI Model",
      status: "Ready",
      color: "text-green-600",
    },
    {
      title: "Server",
      status: "Running",
      color: "text-green-600",
    },
  ];

  const icons = [
    <Server size={28} />,
    <Database size={28} />,
    <Cpu size={28} />,
    <CheckCircle size={28} />,
  ];

  return (

    <div className="bg-white rounded-3xl shadow-xl p-8">

      <h2 className="text-2xl font-bold text-slate-800 mb-8">

        System Status

      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        {systems.map((item, index) => (

          <div
            key={index}
            className="
              rounded-2xl
              border
              p-6
              hover:shadow-lg
              transition
            "
          >

            <div className={`${item.color} mb-4`}>

              {icons[index]}

            </div>

            <h3 className="font-bold text-lg">

              {item.title}

            </h3>

            <p className={`${item.color} mt-2 font-semibold`}>

              ● {item.status}

            </p>

          </div>

        ))}

      </div>

    </div>

  );

}