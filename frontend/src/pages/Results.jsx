import Layout from "../components/Layout";
import { useLocation } from "react-router-dom";
import {
  CheckCircle,
  Image,
} from "lucide-react";

function Results() {

  const { state } = useLocation();

  if (!state) {
    return (
      <Layout title="Inspection Results">
        <h2>No Inspection Found</h2>
      </Layout>
    );
  }

  const { image, result } = state;

  return (
    <Layout title="Inspection Results">

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Image */}

        <div className="bg-[#1F2937] rounded-2xl p-8">

          <h2 className="text-2xl font-bold mb-6">

            Uploaded Image

          </h2>

          <img
            src={image}
            alt=""
            className="rounded-xl w-full"
          />

        </div>

        {/* Result */}

        <div className="bg-[#1F2937] rounded-2xl p-8">

          <div className="flex items-center gap-3">

            <CheckCircle
              className="text-green-400"
            />

            <h2 className="text-2xl font-bold">

              Inspection Details

            </h2>

          </div>

          <div className="space-y-5 mt-8">

            <div>

              <p className="text-gray-400">
                Message
              </p>

              <h3>{result.message}</h3>

            </div>

            <div>

              <p className="text-gray-400">
                Filename
              </p>

              <h3>{result.filename}</h3>

            </div>

            <div>

              <p className="text-gray-400">
                Original Size
              </p>

              <h3>

                {result.original_width} × {result.original_height}

              </h3>

            </div>

            <div>

              <p className="text-gray-400">
                Channels
              </p>

              <h3>

                {result.channels}

              </h3>

            </div>

            <div>

              <p className="text-gray-400">
                Processed Size
              </p>

              <h3>

                {result.processed_size}

              </h3>

            </div>

          </div>

          <div className="mt-8">

            <h2 className="text-xl font-bold mb-4">

              Preprocessing

            </h2>

            {result.preprocessing.map((step, index) => (

              <div
                key={index}
                className="bg-[#111827] p-3 rounded-xl mb-3"
              >

                ✅ {step}

              </div>

            ))}

          </div>

        </div>

      </div>

    </Layout>
  );
}

export default Results;