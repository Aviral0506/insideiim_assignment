const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export function buildResearchStreamUrl(companyName) {
  const params = new URLSearchParams({ company: companyName });
  return `${API_BASE_URL}/api/research/stream?${params.toString()}`;
}
