import { getAnalyticsErrorMessage } from "../analyticsError";


describe("getAnalyticsErrorMessage", () => {
  test("uses the structured API detail", () => {
    const error = {
      response: {
        data: { detail: "Analytics database unavailable." },
      },
    };

    expect(getAnalyticsErrorMessage(error)).toBe(
      "Analytics database unavailable."
    );
  });

  test("explains network failures", () => {
    expect(getAnalyticsErrorMessage(new Error("Network Error"))).toMatch(
      /backend and PostgreSQL services/i
    );
  });
});
