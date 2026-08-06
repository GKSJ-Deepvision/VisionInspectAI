import {
  ArrowUpTrayIcon,
  FolderOpenIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";

const CATEGORIES = [
  "bottle",
  "cable",
  "capsule",
  "carpet",
  "grid",
  "hazelnut",
  "leather",
  "metal_nut",
  "pill",
  "screw",
  "tile",
  "toothbrush",
  "transistor",
  "wood",
  "zipper",
];

export default function UploadPanel({
  category,
  setCategory,
  onFilesSelected,
  onInspect,
  loading,
}) {
  function handleFileChange(e) {
    if (!e.target.files.length) return;

    onFilesSelected(Array.from(e.target.files));

    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();

    if (!e.dataTransfer.files.length) return;

    onFilesSelected(Array.from(e.dataTransfer.files));
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  return (
    <div className="bg-gray-900 rounded-3xl border border-gray-800 shadow-xl p-8">

      <h2 className="text-2xl font-bold text-white mb-8">
        Upload Images
      </h2>

      {/* Upload Area */}

      <label
        htmlFor="inspection-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="
          border-2
          border-dashed
          border-gray-700
          hover:border-blue-500
          transition
          rounded-3xl
          h-72
          flex
          flex-col
          justify-center
          items-center
          cursor-pointer
          bg-gray-950
        "
      >
        <ArrowUpTrayIcon className="w-16 h-16 text-blue-400" />

        <p className="text-xl font-semibold text-white mt-6">
          Drag & Drop Images
        </p>

        <p className="text-gray-500 mt-2">
          or click to browse
        </p>

        <input
          id="inspection-upload"
          type="file"
          hidden
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
      </label>

      {/* Category */}

      <div className="mt-8">

        <label className="block text-white font-semibold mb-3">
          Product Category
        </label>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="
            w-full
            bg-gray-950
            border
            border-gray-700
            rounded-xl
            p-3
            text-white
            outline-none
            focus:border-blue-500
          "
        >
          {CATEGORIES.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item.replace("_", " ").toUpperCase()}
            </option>
          ))}
        </select>

      </div>

      {/* Buttons */}

      <div className="grid grid-cols-2 gap-4 mt-8">

        <label
          htmlFor="inspection-upload"
          className="
            flex
            items-center
            justify-center
            gap-2
            bg-gray-800
            hover:bg-gray-700
            rounded-xl
            py-3
            cursor-pointer
            transition
          "
        >

          <FolderOpenIcon className="w-6 h-6" />

          Browse

        </label>
        

        <button
          onClick={onInspect}
          disabled={loading}
          className="
            flex
            items-center
            justify-center
            gap-2
            bg-blue-600
            hover:bg-blue-700
            disabled:opacity-60
            rounded-xl
            py-3
            transition
            font-semibold
          "
        >

          <PlayCircleIcon className="w-6 h-6" />

          {loading ? "Inspecting..." : "Start Inspection"}

        </button>

      </div>

    </div>
  );
}