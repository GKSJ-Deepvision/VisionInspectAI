import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function Inspection() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:8000/history");
      setHistory(res.data);
    } catch (error) {
      console.error("Failed to fetch inspection history:", error);
    }
  };

  return (
    <Layout title="Inspection History">
      <div className="bg-[#1F2937] rounded-2xl p-8 shadow-lg">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-3 px-6 text-left font-semibold text-white">
                Filename
              </th>

              <th className="py-3 px-6 text-left font-semibold text-white">
                Status
              </th>

              <th className="py-3 px-6 text-left font-semibold text-white">
                Size
              </th>

              <th className="py-3 px-6 text-left font-semibold text-white">
                Date
              </th>
            </tr>
          </thead>

          <tbody>
            {history.length > 0 ? (
              history.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-800 hover:bg-[#374151] transition-colors"
                >
                  <td className="py-4 px-6">
                    {item.filename}
                  </td>

                  <td className="py-4 px-6">
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                     {item.status}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    {item.width} × {item.height}
                  </td>

                  <td className="py-4 px-6">
                    {item.date}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="py-8 text-center text-gray-400"
                >
                  No inspection history available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default Inspection;