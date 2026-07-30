export function getAnalyticsErrorMessage(error) {
  const apiDetail = error?.response?.data?.detail;
  if (typeof apiDetail === "string" && apiDetail.trim()) {
    return apiDetail;
  }

  if (!error?.response) {
    return "The Analytics API could not be reached. Check the backend and PostgreSQL services.";
  }

  return "The Analytics service returned an unexpected error. Please try again.";
}
