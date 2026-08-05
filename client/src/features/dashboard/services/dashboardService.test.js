// dashboard.service.test.js
import { describe, test, expect, vi, beforeEach } from "vitest";
import { getDashboardStats, getUsers } from "./dashboardService";

describe("Dashboard Service - Frontend Unit Tests", () => {

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  // Test 1: should return data when API call succeeds
  test("getDashboardStats returns data on successful response", async () => {
    const mockData = { totalUsers: 10, totalStorage: "500GB" };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await getDashboardStats();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/dashboard/stats")
    );
    expect(result).toEqual(mockData);
  });

  // Test 2: should throw an error when API call fails
  test("getUsers throws an error when response is not ok", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(getUsers()).rejects.toThrow("Request failed with status 500");
  });

});