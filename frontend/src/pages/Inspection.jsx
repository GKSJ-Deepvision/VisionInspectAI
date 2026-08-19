import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Search, Trash2, Download } from "lucide-react";

function Inspection() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // =========================================================
  // GET LOGGED-IN USER
  // =========================================================

  const username = localStorage.getItem("username") || "";
  const role = localStorage.getItem("role") || "";

  // =========================================================
  // FETCH HISTORY
  // =========================================================

  useEffect(() => {
    fetchHistory();
  }, [search, filter]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/history",
        {
          params: {
            search,
            defect: filter,
            username,
            role,
          },
        }
      );

      setHistory(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to fetch inspection history:",
        error
      );

      setHistory([]);
    }
  };

  // =========================================================
  // DELETE HISTORY
  // =========================================================

  const deleteHistory = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this inspection?"
    );

    if (!confirmDelete) return;

    try {
      const res = await axios.delete(
        `http://localhost:8000/history/${id}`,
        {
          params: {
            username,
            role,
          },
        }
      );

      if (res.data.success) {
        fetchHistory();
      } else {
        alert(
          res.data.message ||
            "Delete Failed"
        );
      }
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      alert("Delete Failed");
    }
  };

  // =========================================================
  // EXPORT CSV
  // =========================================================

  const exportCSV = () => {
    const url =
      `http://localhost:8000/history/export` +
      `?username=${encodeURIComponent(username)}` +
      `&role=${encodeURIComponent(role)}`;

    window.open(url, "_blank");
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <Layout title="Inspection History">

      {/* =====================================================
          TOP CONTROLS
      ===================================================== */}

      <div className="flex flex-col lg:flex-row gap-4 justify-between mb-6">

        {/* Search */}

        <div className="relative w-full lg:max-w-xl">

          <Search
            size={20}
            className="absolute left-4 top-3.5 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search by filename..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              w-full
              bg-[#1F2937]
              border border-gray-700
              rounded-xl
              py-3
              pl-12
              pr-4
              text-white
              placeholder-gray-500
              focus:outline-none
              focus:border-emerald-500
            "
          />

        </div>

        {/* Right Controls */}

        <div className="flex gap-3">

          {/* Filter */}

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
            className="
              bg-[#1F2937]
              border border-gray-700
              rounded-xl
              px-4
              py-3
              text-white
              focus:outline-none
              focus:border-emerald-500
            "
          >

            <option value="All">
              All
            </option>

            <option value="Defective">
              Defective
            </option>

            <option value="No Defect">
              No Defect
            </option>

          </select>

          {/* Export */}

          <button
            onClick={exportCSV}
            className="
              flex items-center gap-2
              bg-emerald-500
              hover:bg-emerald-600
              px-5
              py-3
              rounded-xl
              font-semibold
              transition
              whitespace-nowrap
            "
          >

            <Download size={18} />

            Export CSV

          </button>

        </div>

      </div>


      {/* =====================================================
          USER INFO
      ===================================================== */}

      <div className="mb-5">

        <p className="text-sm text-gray-400">

          Showing your inspection history for{" "}

          <span className="text-emerald-400 font-semibold">
            {username}
          </span>

        </p>

      </div>


      {/* =====================================================
          HISTORY TABLE
      ===================================================== */}

      <div
        className="
          bg-[#1F2937]
          rounded-2xl
          p-6
          shadow-lg
          overflow-x-auto
        "
      >

        <table className="w-full table-fixed">

          {/* =================================================
              TABLE HEADER
          ================================================= */}

          <thead>

            <tr className="border-b border-gray-700">

              {/* Filename */}

              <th
                className="
                  py-4 px-3
                  text-left
                  text-sm
                  text-gray-300
                  font-semibold
                  w-[15%]
                "
              >
                Filename
              </th>


              {/* Status */}

              <th
                className="
                  py-4 px-3
                  text-left
                  text-sm
                  text-gray-300
                  font-semibold
                  w-[11%]
                "
              >
                Status
              </th>


              {/* Size */}

              <th
                className="
                  py-4 px-3
                  text-left
                  text-sm
                  text-gray-300
                  font-semibold
                  w-[12%]
                "
              >
                Size
              </th>


              {/* Defect */}

              <th
                className="
                  py-4 px-3
                  text-left
                  text-sm
                  text-gray-300
                  font-semibold
                  w-[14%]
                "
              >
                Defect
              </th>


              {/* Severity */}

              <th
                className="
                  py-4 px-3
                  text-left
                  text-sm
                  text-gray-300
                  font-semibold
                  w-[12%]
                "
              >
                Severity
              </th>


              {/* Risk */}

              <th
                className="
                  py-4 px-3
                  text-left
                  text-sm
                  text-gray-300
                  font-semibold
                  w-[12%]
                "
              >
                Risk
              </th>


              {/* Confidence */}

              <th
                className="
                  py-4 px-3
                  text-left
                  text-sm
                  text-gray-300
                  font-semibold
                  w-[10%]
                "
              >
                Confidence
              </th>


              {/* Date */}

              <th
                className="
                  py-4 px-3
                  text-left
                  text-sm
                  text-gray-300
                  font-semibold
                  w-[10%]
                "
              >
                Date
              </th>


              {/* Action */}

              <th
                className="
                  py-4 px-3
                  text-center
                  text-sm
                  text-gray-300
                  font-semibold
                  w-[7%]
                "
              >
                Action
              </th>

            </tr>

          </thead>


          {/* =================================================
              TABLE BODY
          ================================================= */}

          <tbody>

            {history.length > 0 ? (

              history.map((item) => {

                // -------------------------------------------
                // CHECK NO DEFECT
                // -------------------------------------------

                const isNoDefect =
                  item.defect === "No Defect";

                return (

                  <tr
                    key={item._id}
                    className="
                      border-b
                      border-gray-800
                      hover:bg-[#374151]
                      transition
                    "
                  >

                    {/* =================================================
                        FILENAME
                    ================================================= */}

                    <td
                      className="
                        py-5 px-3
                        text-sm
                        text-white
                        truncate
                      "
                      title={item.filename}
                    >
                      {item.filename || "—"}
                    </td>


                    {/* =================================================
                        STATUS
                    ================================================= */}

                    <td className="py-5 px-3">

                      <span
                        className="
                          inline-flex
                          items-center
                          justify-center
                          bg-green-500/20
                          text-green-400
                          px-3
                          py-1.5
                          rounded-full
                          text-xs
                          font-medium
                          whitespace-nowrap
                        "
                      >
                        {item.status || "Completed"}
                      </span>

                    </td>


                    {/* =================================================
                        SIZE
                    ================================================= */}

                    <td
                      className="
                        py-5 px-3
                        text-sm
                        text-gray-300
                        whitespace-nowrap
                      "
                    >

                      {item.width &&
                      item.height
                        ? `${item.width} × ${item.height}`
                        : "—"}

                    </td>


                    {/* =================================================
                        DEFECT
                    ================================================= */}

                    <td className="py-5 px-3">

                      <span
                        className={`
                          inline-flex
                          items-center
                          justify-center
                          px-3
                          py-1.5
                          rounded-full
                          text-xs
                          font-semibold
                          whitespace-nowrap
                          ${
                            isNoDefect
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }
                        `}
                      >

                        {item.defect || "—"}

                      </span>

                    </td>


                    {/* =================================================
                        SEVERITY
                    ================================================= */}

                    <td className="py-5 px-3">

                      <span
                        className={`
                          inline-flex
                          items-center
                          justify-center
                          px-3
                          py-1.5
                          rounded-full
                          text-xs
                          whitespace-nowrap
                          ${
                            isNoDefect
                              ? "bg-green-500/20 text-green-400"
                              : "bg-orange-500/20 text-orange-400"
                          }
                        `}
                      >

                        {item.severity ||
                          (isNoDefect
                            ? "Low"
                            : "—")}

                      </span>

                    </td>


                    {/* =================================================
                        RISK
                    ================================================= */}

                    <td className="py-5 px-3">

                      <span
                        className={`
                          inline-flex
                          items-center
                          justify-center
                          px-3
                          py-1.5
                          rounded-full
                          text-xs
                          whitespace-nowrap
                          ${
                            isNoDefect
                              ? "bg-green-500/20 text-green-400"
                              : "bg-purple-500/20 text-purple-400"
                          }
                        `}
                      >

                        {item.risk ||
                          (isNoDefect
                            ? "No Defect"
                            : "—")}

                      </span>

                    </td>


                    {/* =================================================
                        CONFIDENCE
                    ================================================= */}

                    <td
                      className="
                        py-5 px-3
                        text-sm
                        text-white
                        whitespace-nowrap
                      "
                    >

                      {item.confidence !==
                        undefined &&
                      item.confidence !==
                        null
                        ? `${item.confidence}%`
                        : "—"}

                    </td>


                    {/* =================================================
                        DATE
                    ================================================= */}

                    <td
                      className="
                        py-5 px-3
                        text-sm
                        text-gray-400
                        whitespace-nowrap
                      "
                    >

                      {item.date || "—"}

                    </td>


                    {/* =================================================
                        ACTION
                    ================================================= */}

                    <td className="py-5 px-3 text-center">

                      <button
                        onClick={() =>
                          deleteHistory(
                            item._id
                          )
                        }
                        className="
                          inline-flex
                          items-center
                          justify-center
                          bg-red-500
                          hover:bg-red-600
                          p-2
                          rounded-lg
                          transition
                        "
                        title="Delete inspection"
                      >

                        <Trash2 size={17} />

                      </button>

                    </td>

                  </tr>

                );

              })

            ) : (

              <tr>

                <td
                  colSpan="9"
                  className="
                    py-12
                    text-center
                    text-gray-400
                  "
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