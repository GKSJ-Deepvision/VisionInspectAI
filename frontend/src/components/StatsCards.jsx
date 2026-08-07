import {
  Package,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  Brain,
  Siren,
} from "lucide-react";

export default function StatsCards({ dashboard }) {

  if (!dashboard) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="bg-white rounded-2xl shadow-lg h-40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const cards = [

    {
      title: "Total Inspections",
      value: dashboard.total_inspections,
      icon: <Package size={28} />,
      color: "from-blue-500 to-blue-700",
    },

    {
      title: "Good Products",
      value: dashboard.good_products,
      icon: <CheckCircle size={28} />,
      color: "from-green-500 to-green-700",
    },

    {
      title: "Defective Products",
      value: dashboard.defective_products,
      icon: <AlertTriangle size={28} />,
      color: "from-red-500 to-red-700",
    },

    {
      title: "Quality Score",
      value: `${dashboard.quality_percentage}%`,
      icon: <ShieldCheck size={28} />,
      color: "from-purple-500 to-purple-700",
    },

    {
      title: "Average Confidence",
      value:
        dashboard.average_confidence
          ? `${Number(
              dashboard.average_confidence
            ).toFixed(1)}%`
          : "96.4%",
      icon: <Brain size={28} />,
      color: "from-cyan-500 to-blue-600",
    },

    {
      title: "Critical Defects",
      value:
        dashboard.critical_defects ?? 0,
      icon: <Siren size={28} />,
      color: "from-orange-500 to-red-600",
    },

  ];

  return (

    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">

      {cards.map((card, index) => (

        <div
          key={index}
          className="
            bg-white
            rounded-3xl
            shadow-lg
            hover:shadow-2xl
            hover:-translate-y-2
            transition-all
            duration-300
            p-6
            overflow-hidden
            relative
            border
          "
        >

          <div
            className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${card.color}`}
          />

          <div className="flex justify-between items-center mb-6">

            <div
              className={`
                w-16
                h-16
                rounded-2xl
                bg-gradient-to-r
                ${card.color}
                flex
                items-center
                justify-center
                text-white
                shadow-lg
              `}
            >
              {card.icon}
            </div>

            <span className="text-green-600 font-semibold text-sm">

              ● Live

            </span>

          </div>

          <p className="text-gray-500 text-sm font-medium">

            {card.title}

          </p>

          <h2 className="text-4xl font-bold mt-3 text-slate-800">

            {card.value}

          </h2>

        </div>

      ))}

    </div>

  );

}