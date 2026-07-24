import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Search, Trash2, Download } from "lucide-react";

function Inspection() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchHistory();
  }, [search, filter]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/history?search=${search}&defect=${filter}`
      );
      setHistory(res.data);
    } catch (error) {
      console.error("Failed to fetch inspection history:", error);
    }
  };

  const deleteHistory = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this inspection?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/history/${id}`);
      fetchHistory();
    } catch (error) {
      console.error(error);
      alert("Delete Failed");
    }
  };

  const exportCSV = () => {
    window.open("http://localhost:8000/history/export", "_blank");
  };

  return (
    <Layout title="Inspection History">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        {/* Search */}
        <div className="relative w-full md:w-1/2">
          <Search
            size={20}
            className="absolute left-4 top-3.5 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1F2937] border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Right Controls */}
        <div className="flex gap-3">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3 text-white"
          >
            <option value="All">All</option>
            <option value="Defective">Defective</option>
            <option value="No Defect">No Defect</option>
          </select>

          {/* Export */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-5 py-3 rounded-xl font-semibold transition"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-[#1F2937] rounded-2xl p-8 shadow-lg overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-3 px-6 text-left">Filename</th>
              <th className="py-3 px-6 text-left">Status</th>
              <th className="py-3 px-6 text-left">Size</th>
              <th className="py-3 px-6 text-left">Defect</th>
              <th className="py-3 px-6 text-left">Confidence</th>
              <th className="py-3 px-6 text-left">Date</th>
              <th className="py-3 px-6 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {history.length > 0 ? (
              history.map((item) => (
                <tr
                  key={item._id}
                  className="border-b border-gray-800 hover:bg-[#374151] transition"
                >
                  <td className="py-4 px-6">{item.filename}</td>

                  <td className="py-4 px-6">
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                      {item.status}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    {item.width} × {item.height}
                  </td>

                  <td className="py-4 px-6">
                    {item.defect}
                  </td>

                  <td className="py-4 px-6">
                    {item.confidence}%
                  </td>

                  <td className="py-4 px-6">
                    {item.date}
                  </td>

                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => deleteHistory(item._id)}
                      className="bg-red-500 hover:bg-red-600 p-2 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="py-8 text-center text-gray-400"
                >
                  No inspection history found.
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