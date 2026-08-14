import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const aiSearch = async (query) => {
  const userId = localStorage.getItem("userId");

  // User not logged in
  if (!userId) {
    console.error("User ID not found in localStorage");
    return [];
  }

  // Empty search
  if (!query || !query.trim()) {
    return [];
  }

  try {
    const response = await api.post(
      "/ai-search/search",
      {
        query: query.trim(),
        limit: 5,
      },
      {
        headers: {
          "X-User-Id": userId,
        },
      }
    );

    // Support multiple backend response formats
    return (
      response.data?.results ||
      response.data?.data ||
      response.data ||
      []
    );
  } catch (error) {
    console.error("AI Search Error:", error);

    return [];
  }
};