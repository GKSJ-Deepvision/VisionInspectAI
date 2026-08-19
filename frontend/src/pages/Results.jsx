import { useLocation } from "react-router-dom";
import Layout from "../components/Layout";

import {
  Download,
  CheckCircle,
  ShieldCheck,
  ImageIcon,
  Layers,
  AlertTriangle,
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Results() {
  const location = useLocation();

  const result = location.state?.result;

  /*
  =========================================================
  SHOW ONLY HIGHEST CONFIDENCE DETECTION
  =========================================================
  */

  const detections =
    result?.detections?.length > 0
      ? [
          result.detections.reduce(
            (highest, current) =>
              Number(current.confidence) >
              Number(highest.confidence)
                ? current
                : highest
          ),
        ]
      : [];

  const processedImage =
    location.state?.processedImage;

  /*
  =========================================================
  SAFE VALUES
  =========================================================
  */

  const prediction =
    result?.defect || "No Defect";

  /*
  =========================================================
  NO DEFECT CHECK
  =========================================================
  */

  const isNoDefect =
    prediction === "No Defect";

  /*
  =========================================================
  CATEGORY
  =========================================================

  Category should only be shown for defective products.
  For No Defect, category is completely hidden.
  */

  const category =
    result?.category &&
    result.category !== "No Defect" &&
    result.category !== "Unknown"
      ? result.category
      : "";

  /*
  =========================================================
  SEVERITY
  =========================================================
  */

  const severity =
    isNoDefect
      ? "Low"
      : result?.severity || "Low";

  /*
  =========================================================
  RISK
  =========================================================
  */

  const risk =
    isNoDefect
      ? "No Defect"
      : result?.risk || "Low Risk";

  /*
  =========================================================
  CONFIDENCE
  =========================================================
  */

  const confidence =
    result?.confidence ?? 0;

  /*
  =========================================================
  FINAL STATUS
  =========================================================
  */

  const finalStatus =
    isNoDefect || risk === "Low Risk"
      ? "PASSED"
      : risk === "Medium Risk"
      ? "RECHECK"
      : "REJECTED";

  /*
  =========================================================
  STATUS COLORS
  =========================================================
  */

  const getStatusColor = () => {
    if (finalStatus === "PASSED") {
      return [22, 163, 74];
    }

    if (finalStatus === "RECHECK") {
      return [202, 138, 4];
    }

    return [220, 38, 38];
  };

  /*
  =========================================================
  DRAW STATUS SYMBOL
  =========================================================
  */

  const drawStatusSymbol = (
    doc,
    status,
    centerX,
    centerY
  ) => {
    const color = getStatusColor();

    doc.setDrawColor(
      color[0],
      color[1],
      color[2]
    );

    doc.setLineWidth(1.5);

    /*
    PASSED - CHECK
    */

    if (status === "PASSED") {
      doc.line(
        centerX - 10,
        centerY,
        centerX - 3,
        centerY + 7
      );

      doc.line(
        centerX - 3,
        centerY + 7,
        centerX + 11,
        centerY - 9
      );
    }

    /*
    RECHECK - WARNING TRIANGLE
    */

    if (status === "RECHECK") {
      const x = centerX;
      const y = centerY;

      doc.line(
        x,
        y - 11,
        x - 12,
        y + 10
      );

      doc.line(
        x - 12,
        y + 10,
        x + 12,
        y + 10
      );

      doc.line(
        x + 12,
        y + 10,
        x,
        y - 11
      );

      doc.line(
        x,
        y - 5,
        x,
        y + 3
      );

      doc.circle(
        x,
        y + 7,
        0.8,
        "F"
      );
    }

    /*
    REJECTED - X
    */

    if (status === "REJECTED") {
      doc.line(
        centerX - 9,
        centerY - 9,
        centerX + 9,
        centerY + 9
      );

      doc.line(
        centerX + 9,
        centerY - 9,
        centerX - 9,
        centerY + 9
      );
    }
  };

  /*
  =========================================================
  PDF DOWNLOAD
  =========================================================
  */

  const downloadPDF = () => {
    if (!result) return;

    try {
      const doc = new jsPDF();

      /*
      =====================================================
      HEADER
      =====================================================
      */

      doc.setFillColor(
        15,
        23,
        42
      );

      doc.rect(
        0,
        0,
        210,
        42,
        "F"
      );

      doc.setTextColor(
        255,
        255,
        255
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(22);

      doc.text(
        "VisionInspect AI",
        105,
        17,
        {
          align: "center",
        }
      );

      doc.setFontSize(13);

      doc.text(
        "Quality Inspection Report",
        105,
        27,
        {
          align: "center",
        }
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(9);

      doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        105,
        35,
        {
          align: "center",
        }
      );

      /*
      =====================================================
      MAIN STATUS STAMP - CENTER
      =====================================================
      */

      let statusColor =
        getStatusColor();

      const stampX = 55;
      const stampY = 52;
      const stampW = 80;
      const stampH = 27;

      doc.setDrawColor(
        statusColor[0],
        statusColor[1],
        statusColor[2]
      );

      doc.setLineWidth(1.4);

      doc.roundedRect(
        stampX,
        stampY,
        stampW,
        stampH,
        3,
        3
      );

      /*
      STATUS SYMBOL
      */

      drawStatusSymbol(
        doc,
        finalStatus,
        78,
        stampY + 13
      );

      /*
      STATUS TEXT
      */

      doc.setTextColor(
        statusColor[0],
        statusColor[1],
        statusColor[2]
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(17);

      doc.text(
        finalStatus,
        105,
        stampY + 17,
        {
          align: "center",
        }
      );

      /*
      =====================================================
      IMAGE SECTION
      =====================================================
      */

      let y = 88;

      if (
        location.state?.originalImage ||
        processedImage
      ) {
        /*
        ORIGINAL IMAGE
        */

        if (
          location.state?.originalImage
        ) {
          doc.setTextColor(
            0,
            0,
            0
          );

          doc.setFont(
            "helvetica",
            "bold"
          );

          doc.setFontSize(11);

          doc.text(
            "Original Image",
            50,
            y,
            {
              align: "center",
            }
          );

          doc.addImage(
            location.state.originalImage,
            "PNG",
            20,
            y + 5,
            60,
            60
          );

          doc.setDrawColor(
            180,
            180,
            180
          );

          doc.setLineWidth(
            0.5
          );

          doc.rect(
            20,
            y + 5,
            60,
            60
          );
        }

        /*
        PROCESSED IMAGE
        */

        if (processedImage) {
          doc.setTextColor(
            0,
            0,
            0
          );

          doc.setFont(
            "helvetica",
            "bold"
          );

          doc.setFontSize(11);

          doc.text(
            "Processed Image",
            160,
            y,
            {
              align: "center",
            }
          );

          doc.addImage(
            processedImage,
            "PNG",
            130,
            y + 5,
            60,
            60
          );

          doc.setDrawColor(
            180,
            180,
            180
          );

          doc.rect(
            130,
            y + 5,
            60,
            60
          );
        }

        y += 78;
      }

      /*
      =====================================================
      INSPECTION DETAILS TITLE
      =====================================================
      */

      doc.setTextColor(
        15,
        23,
        42
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(14);

      doc.text(
        "Inspection Details",
        15,
        y
      );

      /*
      =====================================================
      DETAILS TABLE DATA
      =====================================================
      */

      const detailsBody = [
        [
          "Filename",
          result.filename || "-",
        ],

        [
          "Prediction",
          prediction,
        ],
      ];

      /*
      CATEGORY ONLY FOR DEFECTIVE
      */

      if (
        !isNoDefect &&
        category
      ) {
        detailsBody.push([
          "Category",
          category,
        ]);
      }

      detailsBody.push(
        [
          "Severity",
          severity,
        ],

        [
          "Risk Level",
          risk,
        ],

        [
          "Confidence",
          `${confidence}%`,
        ],

        [
          "Original Size",
          `${result.original_width || "-"} × ${
            result.original_height || "-"
          }`,
        ],

        [
          "Processed Size",
          result.processed_size || "-",
        ],

        [
          "Channels",
          result.channels || "-",
        ]
      );

      /*
      =====================================================
      DETAILS TABLE
      =====================================================
      */

      autoTable(doc, {
        startY: y + 5,

        head: [
          [
            "Field",
            "Value",
          ],
        ],

        body: detailsBody,

        theme: "grid",

        styles: {
          font: "helvetica",
          fontSize: 10,
          cellPadding: 5,
          lineColor: [
            203,
            213,
            225,
          ],
          lineWidth: 0.3,
          textColor: [
            31,
            41,
            55,
          ],
        },

        headStyles: {
          fillColor: [
            30,
            41,
            59,
          ],
          textColor: [
            255,
            255,
            255,
          ],
          fontStyle: "bold",
          halign: "left",
        },

        columnStyles: {
          0: {
            fontStyle: "bold",
            fillColor: [
              241,
              245,
              249,
            ],
            cellWidth: 60,
          },

          1: {
            cellWidth: 120,
          },
        },

        alternateRowStyles: {
          fillColor: [
            248,
            250,
            252,
          ],
        },

        didParseCell: (
          data
        ) => {
          if (
            data.section ===
              "body" &&
            data.column.index ===
              1
          ) {
            const value =
              String(
                data.cell.raw
              );

            if (
              value ===
                "High Risk" ||
              value === "High"
            ) {
              data.cell.styles.textColor =
                [
                  220,
                  38,
                  38,
                ];

              data.cell.styles.fontStyle =
                "bold";
            }

            if (
              value ===
                "Medium Risk" ||
              value === "Medium"
            ) {
              data.cell.styles.textColor =
                [
                  202,
                  138,
                  4,
                ];

              data.cell.styles.fontStyle =
                "bold";
            }

            if (
              value ===
                "Low Risk" ||
              value ===
                "Low" ||
              value ===
                "No Defect"
            ) {
              data.cell.styles.textColor =
                [
                  22,
                  163,
                  74,
                ];

              data.cell.styles.fontStyle =
                "bold";
            }
          }
        },
      });

      /*
      =====================================================
      OBJECT DETECTION RESULTS
      =====================================================
      */

      y =
        doc.lastAutoTable.finalY +
        15;

      if (
        detections.length >
        0
      ) {
        doc.setTextColor(
          15,
          23,
          42
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(14);

        doc.text(
          "Object Detection Results",
          15,
          y
        );

        autoTable(doc, {
          startY: y + 5,

          head: [
            [
              "#",
              "Class",
              "Confidence",
              "Bounding Box",
            ],
          ],

          body:
            detections.map(
              (d, index) => [
                index + 1,
                d.class || "-",
                `${d.confidence}%`,
                d.bbox?.join(
                  ", "
                ) || "-",
              ]
            ),

          theme: "grid",

          styles: {
            font: "helvetica",
            fontSize: 9,
            cellPadding: 4,
            lineColor: [
              203,
              213,
              225,
            ],
            lineWidth: 0.3,
          },

          headStyles: {
            fillColor: [
              30,
              41,
              59,
            ],
            textColor: [
              255,
              255,
              255,
            ],
            fontStyle: "bold",
          },

          alternateRowStyles: {
            fillColor: [
              248,
              250,
              252,
            ],
          },

          columnStyles: {
            0: {
              cellWidth: 15,
            },

            1: {
              textColor: [
                37,
                99,
                235,
              ],
              fontStyle:
                "bold",
            },

            2: {
              fontStyle:
                "bold",
            },
          },
        });

        y =
          doc.lastAutoTable.finalY +
          15;
      } else {
        /*
        NO DEFECT MESSAGE
        */

        doc.setFillColor(
          220,
          252,
          231
        );

        doc.setDrawColor(
          34,
          197,
          94
        );

        doc.roundedRect(
          15,
          y,
          180,
          15,
          3,
          3,
          "FD"
        );

        doc.setTextColor(
          22,
          101,
          52
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(10);

        doc.text(
          "No defects detected in the inspected image.",
          105,
          y + 9,
          {
            align: "center",
          }
        );

        y += 25;
      }

      /*
      =====================================================
      PREPROCESSING
      =====================================================
      */

      if (y > 240) {
        doc.addPage();

        y = 20;
      }

      doc.setTextColor(
        15,
        23,
        42
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(14);

      doc.text(
        "Image Preprocessing",
        15,
        y
      );

      y += 7;

      result.preprocessing?.forEach(
        (step) => {
          doc.setFillColor(
            248,
            250,
            252
          );

          doc.setDrawColor(
            226,
            232,
            240
          );

          doc.roundedRect(
            15,
            y,
            180,
            10,
            2,
            2,
            "FD"
          );

          doc.setTextColor(
            22,
            163,
            74
          );

          doc.setFont(
            "helvetica",
            "bold"
          );

          doc.text(
            "✓",
            20,
            y + 7
          );

          doc.setTextColor(
            31,
            41,
            55
          );

          doc.setFont(
            "helvetica",
            "normal"
          );

          doc.text(
            step,
            28,
            y + 7
          );

          y += 13;
        }
      );

      /*
      =====================================================
      FINAL STATUS STAMP - CENTER
      =====================================================
      */

      if (y > 235) {
        doc.addPage();

        y = 30;
      } else {
        y += 12;
      }

      doc.setDrawColor(
        statusColor[0],
        statusColor[1],
        statusColor[2]
      );

      doc.setLineWidth(1);

      doc.roundedRect(
        55,
        y,
        100,
        32,
        3,
        3
      );

      /*
      DRAW SYMBOL
      */

      drawStatusSymbol(
        doc,
        finalStatus,
        73,
        y + 16
      );

      /*
      STATUS TEXT
      */

      doc.setTextColor(
        statusColor[0],
        statusColor[1],
        statusColor[2]
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(18);

      doc.text(
        finalStatus,
        108,
        y + 21,
        {
          align: "center",
        }
      );

      y += 45;

      /*
      =====================================================
      INSPECTION SUMMARY
      =====================================================
      */

      if (y > 255) {
        doc.addPage();

        y = 25;
      }

      doc.setTextColor(
        15,
        23,
        42
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(14);

      doc.text(
        "Inspection Summary",
        15,
        y
      );

      y += 9;

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(10);

      doc.text(
        `Prediction : ${prediction}`,
        15,
        y
      );

      y += 7;

      /*
      CATEGORY ONLY FOR DEFECTIVE
      */

      if (
        !isNoDefect &&
        category
      ) {
        doc.text(
          `Category : ${category}`,
          15,
          y
        );

        y += 7;
      }

      doc.text(
        `Severity : ${severity}`,
        15,
        y
      );

      y += 7;

      doc.text(
        `Risk Level : ${risk}`,
        15,
        y
      );

      y += 7;

      /*
      FINAL DECISION
      */

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setTextColor(
        statusColor[0],
        statusColor[1],
        statusColor[2]
      );

      doc.text(
        `Final Decision : ${finalStatus}`,
        15,
        y
      );

      /*
      =====================================================
      FOOTER
      =====================================================
      */

      const pageCount =
        doc.internal.getNumberOfPages();

      for (
        let i = 1;
        i <= pageCount;
        i++
      ) {
        doc.setPage(i);

        doc.setDrawColor(
          203,
          213,
          225
        );

        doc.setLineWidth(
          0.5
        );

        doc.line(
          15,
          285,
          195,
          285
        );

        doc.setTextColor(
          100,
          116,
          139
        );

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(8);

        doc.text(
          "Generated by VisionInspect AI",
          105,
          291,
          {
            align: "center",
          }
        );

        doc.text(
          `Page ${i} of ${pageCount}`,
          190,
          291,
          {
            align: "right",
          }
        );
      }

      /*
      =====================================================
      SAVE PDF
      =====================================================
      */

      doc.save(
        "VisionInspect_AI_Inspection_Report.pdf"
      );

    } catch (error) {
      console.error(
        "PDF generation error:",
        error
      );

      alert(
        "Unable to generate PDF. Please try again."
      );
    }
  };

  /*
  =========================================================
  NO RESULT
  =========================================================
  */

  if (!result) {
    return (
      <Layout title="Results">

        <h2 className="text-center text-xl mt-10">
          No inspection result found.
        </h2>

      </Layout>
    );
  }

  /*
  =========================================================
  RISK UI HELPERS
  =========================================================
  */

  const riskColor =
    isNoDefect
      ? "text-green-400"
      : risk === "High Risk"
      ? "text-red-400"
      : risk === "Medium Risk"
      ? "text-yellow-400"
      : "text-green-400";

  const riskBorder =
    isNoDefect
      ? "border-green-500/60 bg-green-500/10"
      : risk === "High Risk"
      ? "border-red-500/60 bg-red-500/10"
      : risk === "Medium Risk"
      ? "border-yellow-500/60 bg-yellow-500/10"
      : "border-green-500/60 bg-green-500/10";

  return (
    <Layout title="AI Inspection">

      {/* =====================================================
          AI ANALYSIS
      ===================================================== */}

      <div className="grid lg:grid-cols-2 gap-8 mt-10">

        {/* ===================================================
            AI PREDICTION
        =================================================== */}

        <div className="bg-[#1F2937] rounded-2xl p-6 shadow-lg">

          <div className="flex items-center gap-3 mb-6">

            <ShieldCheck className="text-emerald-400" />

            <h2 className="text-2xl font-bold">
              AI Prediction
            </h2>

          </div>

          <div className="space-y-5">

            {/* Prediction */}

            <div className="flex justify-between border-b border-gray-700 pb-3">

              <span className="text-gray-400">
                Prediction
              </span>

              <span
                className={`font-bold ${
                  isNoDefect
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {prediction}
              </span>

            </div>

            {/* Confidence */}

            <div className="flex justify-between border-b border-gray-700 pb-3">

              <span className="text-gray-400">
                Confidence
              </span>

              <span className="font-bold">
                {confidence}%
              </span>

            </div>

            {/* Category ONLY FOR DEFECTIVE */}

            {!isNoDefect && (
              <div className="flex justify-between border-b border-gray-700 pb-3">

                <span className="text-gray-400">
                  Category
                </span>

                <span className="font-bold text-blue-400">
                  {category || "-"}
                </span>

              </div>
            )}

            {/* Severity */}

            <div className="flex justify-between border-b border-gray-700 pb-3">

              <span className="text-gray-400">
                Severity
              </span>

              <span
                className={`font-bold ${
                  isNoDefect
                    ? "text-green-400"
                    : severity === "High"
                    ? "text-red-400"
                    : severity === "Medium"
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {severity}
              </span>

            </div>

            {/* Risk */}

            <div className="flex justify-between">

              <span className="text-gray-400">
                Risk Level
              </span>

              <span
                className={`font-bold ${riskColor}`}
              >
                {risk}
              </span>

            </div>

          </div>

        </div>

        {/* ===================================================
            IMAGE INFORMATION
        =================================================== */}

        <div className="bg-[#1F2937] rounded-2xl p-6 shadow-lg">

          <div className="flex items-center gap-3 mb-6">

            <ImageIcon className="text-blue-400" />

            <h2 className="text-2xl font-bold">
              Image Information
            </h2>

          </div>

          <div className="space-y-5">

            <div className="flex justify-between border-b border-gray-700 pb-3">

              <span className="text-gray-400">
                Filename
              </span>

              <span>
                {result.filename}
              </span>

            </div>

            <div className="flex justify-between border-b border-gray-700 pb-3">

              <span className="text-gray-400">
                Original Size
              </span>

              <span>
                {result.original_width} ×{" "}
                {result.original_height}
              </span>

            </div>

            <div className="flex justify-between border-b border-gray-700 pb-3">

              <span className="text-gray-400">
                Processed Size
              </span>

              <span>
                {result.processed_size}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-gray-400">
                Channels
              </span>

              <span>
                {result.channels}
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          PROCESSED IMAGE
      ===================================================== */}

      <div className="mt-10 bg-[#1F2937] rounded-2xl p-6 shadow-lg">

        <div className="flex items-center gap-3 mb-6">

          <ImageIcon className="text-blue-400" />

          <h2 className="text-2xl font-bold">
            Processed Image
          </h2>

        </div>

        <div className="flex justify-center">

          {processedImage ? (

            <img
              src={processedImage}
              alt="Processed"
              className="rounded-xl border border-gray-700 max-h-[450px]"
              onError={(e) => {
                e.target.style.display =
                  "none";
              }}
            />

          ) : (

            <p className="text-gray-400">
              Processed image not available.
            </p>

          )}

        </div>

      </div>

      {/* =====================================================
          OBJECT DETECTION RESULTS
      ===================================================== */}

      <div className="mt-10 bg-[#1F2937] rounded-2xl p-6 shadow-lg">

        <div className="flex items-center gap-3 mb-6">

          <AlertTriangle className="text-red-400" />

          <h2 className="text-2xl font-bold">
            Object Detection Results
          </h2>

        </div>

        {detections.length > 0 ? (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-gray-700">

                  <th className="py-3 text-left">
                    #
                  </th>

                  <th className="py-3 text-left">
                    Class
                  </th>

                  <th className="py-3 text-left">
                    Confidence
                  </th>

                  <th className="py-3 text-left">
                    Bounding Box
                  </th>

                </tr>

              </thead>

              <tbody>

                {detections.map(
                  (d, index) => (

                    <tr
                      key={index}
                      className="border-b border-gray-800"
                    >

                      <td className="py-3">
                        {index + 1}
                      </td>

                      <td className="py-3 text-blue-400">
                        {d.class}
                      </td>

                      <td className="py-3">
                        {d.confidence}%
                      </td>

                      <td className="py-3 text-gray-300">
                        {d.bbox?.join(", ") ||
                          "-"}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        ) : (

          <p className="text-green-400">
            No defects detected.
          </p>

        )}

      </div>

      {/* =====================================================
          IMAGE PREPROCESSING
      ===================================================== */}

      <div className="mt-10 bg-[#1F2937] rounded-2xl p-6 shadow-lg">

        <div className="flex items-center gap-3 mb-6">

          <Layers className="text-emerald-400" />

          <h2 className="text-2xl font-bold">
            Image Preprocessing
          </h2>

        </div>

        <div className="space-y-4">

          {result.preprocessing?.map(
            (step, index) => (

              <div
                key={index}
                className="bg-[#111827] rounded-xl p-4 flex items-center gap-3"
              >

                <CheckCircle className="text-green-400" />

                <span>
                  {step}
                </span>

              </div>

            )
          )}

        </div>

      </div>

      {/* =====================================================
          QUALITY RISK ASSESSMENT
      ===================================================== */}

      <div className="mt-10 bg-[#1F2937] rounded-2xl p-6 shadow-lg">

        <div className="flex items-center gap-3 mb-6">

          <AlertTriangle
            className="text-red-400"
            size={24}
          />

          <h2 className="text-2xl font-bold">
            Quality Risk Assessment
          </h2>

        </div>

        <div
          className={`rounded-xl border p-6 ${riskBorder}`}
        >

          {/* Risk Heading */}

          <h3
            className={`text-xl font-bold mb-3 ${riskColor}`}
          >
            {isNoDefect
              ? "No Defect"
              : risk}
          </h3>

          {/* Description */}

          <p className="text-gray-200 mb-5">

            {isNoDefect
              ? "No defect was detected in the inspected image. Product quality is acceptable."
              : risk === "High Risk"
              ? "High quality issue detected. Immediate action is recommended."
              : risk === "Medium Risk"
              ? "Moderate quality issue detected. Inspection and corrective action are recommended."
              : "Low quality risk detected. Routine inspection is recommended."}

          </p>

          {/* Recommendation */}

          <h4 className="font-semibold text-white text-lg mb-4">
            Recommendation
          </h4>

          <div className="space-y-4">

            {isNoDefect && (

              <div className="flex items-start gap-3">

                <CheckCircle className="text-green-400 w-5 h-5 mt-1" />

                <span>
                  Product quality is acceptable. No immediate action is required.
                </span>

              </div>

            )}

            {risk === "High Risk" && (

              <>

                <div className="flex items-start gap-3">

                  <CheckCircle className="text-green-400 w-5 h-5 mt-1" />

                  <span>
                    Reject the product before shipment.
                  </span>

                </div>

                <div className="flex items-start gap-3">

                  <CheckCircle className="text-green-400 w-5 h-5 mt-1" />

                  <span>
                    Perform immediate quality inspection.
                  </span>

                </div>

                <div className="flex items-start gap-3">

                  <CheckCircle className="text-green-400 w-5 h-5 mt-1" />

                  <span>
                    Review the manufacturing process.
                  </span>

                </div>

              </>

            )}

            {risk === "Medium Risk" && (

              <>

                <div className="flex items-start gap-3">

                  <CheckCircle className="text-green-400 w-5 h-5 mt-1" />

                  <span>
                    Inspect the affected product carefully.
                  </span>

                </div>

                <div className="flex items-start gap-3">

                  <CheckCircle className="text-green-400 w-5 h-5 mt-1" />

                  <span>
                    Schedule maintenance if necessary.
                  </span>

                </div>

                <div className="flex items-start gap-3">

                  <CheckCircle className="text-green-400 w-5 h-5 mt-1" />

                  <span>
                    Continue monitoring production quality.
                  </span>

                </div>

              </>

            )}

            {risk === "Low Risk" && (

              <>

                <div className="flex items-start gap-3">

                  <CheckCircle className="text-green-400 w-5 h-5 mt-1" />

                  <span>
                    Approve the product for production.
                  </span>

                </div>

                <div className="flex items-start gap-3">

                  <CheckCircle className="text-green-400 w-5 h-5 mt-1" />

                  <span>
                    Maintain regular quality inspections.
                  </span>

                </div>

                <div className="flex items-start gap-3">

                  <CheckCircle className="text-green-400 w-5 h-5 mt-1" />

                  <span>
                    Continue preventive maintenance.
                  </span>

                </div>

              </>

            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          DOWNLOAD REPORT
      ===================================================== */}

      <div className="mt-10 flex justify-center">

        <button
          type="button"
          onClick={downloadPDF}
          className="
            bg-emerald-500
            hover:bg-emerald-600
            px-8
            py-4
            rounded-xl
            font-bold
            flex
            items-center
            gap-3
            transition
            shadow-lg
            hover:shadow-emerald-500/20
          "
        >

          <Download size={22} />

          Download Inspection Report

        </button>

      </div>

    </Layout>
  );
}

export default Results;