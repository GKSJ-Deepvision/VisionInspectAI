// Mock API layer standing in for the real backend.
// Once the /upload endpoint is live, swap the body of runInspection()
// for the commented-out fetch call below and remove the setTimeout/random logic.

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
  // --- Real integration (once backend is ready) ---
  // const formData = new FormData();
  // formData.append('image', file);
  // const res = await fetch('/api/upload', { method: 'POST', body: formData });
  // if (!res.ok) throw new Error('Inspection request failed');
  // return res.json();

  // --- Mock simulation for the frontend milestone ---
  await new Promise((resolve) => setTimeout(resolve, 1200));

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
    defectType: defect.name,
    severityScore: score,
    severityLevel: level,
    decision: level === 'Critical' || level === 'High' ? 'Reject' : 'Pass',
  };
}
