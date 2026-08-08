import {
  InboxIcon,
} from "@heroicons/react/24/outline";

export default function EmptyState({
  title = "Nothing to Display",
  description = "No data available.",
  icon: Icon = InboxIcon,
  action = null,
}) {
  return (
    <div
      className="
        bg-gray-900
        border
        border-gray-800
        rounded-3xl
        shadow-lg
        p-12
        flex
        flex-col
        items-center
        justify-center
        text-center
      "
    >
      <div
        className="
          w-20
          h-20
          rounded-full
          bg-gray-800
          flex
          items-center
          justify-center
          mb-6
        "
      >
        <Icon className="w-10 h-10 text-gray-500" />
      </div>

      <h2 className="text-2xl font-bold text-white">
        {title}
      </h2>

      <p className="text-gray-400 mt-3 max-w-md">
        {description}
      </p>

      {action && (
        <div className="mt-8">
          {action}
        </div>
      )}
    </div>
  );
}