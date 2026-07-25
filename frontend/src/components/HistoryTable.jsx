import { useState } from "react";

export default function HistoryTable({ history }) {
  const [search, setSearch] = useState("");

  const filtered = history.filter((item) =>
    item.image_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">
          Inspection History
        </h2>

        <input
          type="text"
          placeholder="Search image..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-64"
        />
      </div>

      <table className="w-full border-collapse">

        <thead>

          <tr className="bg-gray-100">

            <th className="p-3 text-left">ID</th>

            <th className="p-3 text-left">Image</th>

            <th className="p-3 text-left">Prediction</th>

            <th className="p-3 text-left">Confidence</th>

            <th className="p-3 text-left">Time</th>

          </tr>

        </thead>

        <tbody>

          {filtered.map((item) => (

            <tr
              key={item.id}
              className="border-b hover:bg-gray-50"
            >

              <td className="p-3">{item.id}</td>

              <td className="p-3">{item.image_name}</td>

              <td className="p-3">

                <span
                  className={`px-3 py-1 rounded-full text-white ${
                    item.prediction === "GOOD"
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
                >
                  {item.prediction}
                </span>

              </td>

              <td className="p-3">
                {Number(item.confidence).toFixed(2)}%
              </td>

              <td className="p-3">
                {new Date(item.created_at).toLocaleString()}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}