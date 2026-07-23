// Mock API layer standing in for the real backend.
//
// EXPECTED REAL CONTRACT (confirm with backend before swapping in):
//   POST /api/upload   body: FormData { image: File }
//   response JSON: {
//     productCategory: string,
//     prediction: string,        // defect type / class label
//     confidence: number,        // 0-100
//     severityScore: number,     // 0-100
//     severityLevel: 'Low'|'Medium'|'High'|'Critical',
//     decision: 'Pass'|'Reject',
//     processedImageUrl: string, // backend-processed image (or base64)
//     heatmap: { x: number, y: number, radius: number } // % position of defect focus, or a heatmap image URL
//   }
//
// Once that's confirmed, replace the body of runInspection() with the
// commented fetch() call below and delete the random-generation logic.

const PRODUCT_CATEGORIES = ['Automotive Panel', 'PCB Board', 'Metal Bracket', 'Plastic Casing'];

const DEFECT_TYPES = [
  { name: 'Surface Scratch', typeScore: 30 },
  { name: 'Surface Crack', typeScore: 95 },
  { name: 'Missing Component', typeScore: 90 },
  { name: 'Discoloration', typeScore: 20 },
];

function levelFromScore(score) {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

export async function runInspection(file) {
  // --- Real integration (once backend confirms the contract above) ---
  // const formData = new FormData();
  // formData.append('image', file);
  // const res = await fetch('/api/upload', { method: 'POST', body: formData });
  // if (!res.ok) throw new Error('Inspection request failed');
  // return res.json();

  // --- Mock simulation for the frontend milestone ---
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const category = PRODUCT_CATEGORIES[Math.floor(Math.random() * PRODUCT_CATEGORIES.length)];
  const defect = DEFECT_TYPES[Math.floor(Math.random() * DEFECT_TYPES.length)];
  const size = Math.floor(Math.random() * 100);
  const location = Math.floor(Math.random() * 100);
  const confidence = 70 + Math.floor(Math.random() * 30);

  const score = Math.round(
    size * 0.3 + location * 0.25 + defect.typeScore * 0.25 + confidence * 0.2
  );
  const level = levelFromScore(score);

  return {
    productCategory: category,
    prediction: defect.name,
    confidence,
    severityScore: score,
    severityLevel: level,
    decision: level === 'Critical' || level === 'High' ? 'Reject' : 'Pass',
    // Position (as % of image box) where the mock heatmap "hot spot" renders.
    heatmap: {
      x: 20 + Math.floor(Math.random() * 60),
      y: 20 + Math.floor(Math.random() * 60),
      radius: 18 + Math.floor(Math.random() * 22),
    },
  };
}
