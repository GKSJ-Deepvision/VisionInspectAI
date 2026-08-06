import {
  XMarkIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

export default function ImagePreviewGrid({
  files,
  previews,
  onRemove,
}) {
  if (!files.length) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-lg p-8">

        <div className="flex flex-col items-center justify-center h-72">

          <PhotoIcon className="w-16 h-16 text-gray-600" />

          <h2 className="text-xl font-semibold text-white mt-5">
            No Images Selected
          </h2>

          <p className="text-gray-500 mt-2 text-center">
            Upload one or more images to preview them here.
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-lg p-6">

      <h2 className="text-2xl font-bold text-white mb-6">
        Selected Images
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {previews.map((preview, index) => (

          <div
            key={index}
            className="
              relative
              rounded-2xl
              overflow-hidden
              border
              border-gray-700
              bg-black
              transition-all
              duration-300
              hover:border-blue-500
              hover:shadow-xl
            "
          >

            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              className="
                w-full
                h-56
                object-contain
                bg-black
              "
            />

            <button
              onClick={() => onRemove(index)}
              className="
                absolute
                top-3
                right-3
                bg-red-600
                hover:bg-red-700
                rounded-full
                p-2
                transition
              "
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>

            <div className="p-4 border-t border-gray-800">

              <p className="text-white font-medium truncate">
                {files[index]?.name}
              </p>

              <p className="text-gray-500 text-sm mt-1">
                {files[index]
?
(files[index].size/1024).toFixed(1)
:
0} KB
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}