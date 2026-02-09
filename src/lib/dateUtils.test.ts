import { expect, test, describe, beforeAll } from "bun:test";
import { formatTime, formatDate } from "./dateUtils";

describe("dateUtils", () => {
    beforeAll(() => {
        process.env.TZ = "UTC";
    });

    describe("formatTime", () => {
        test("should format UTC date string correctly", () => {
            const input = "2026-01-29T04:11:00Z";
            expect(formatTime(input)).toBe("04:11");
        });

        test("should add 'Z' and format as UTC if 'Z' is missing", () => {
            const input = "2026-01-29T04:11:00";
            expect(formatTime(input)).toBe("04:11");
        });

        test("should return empty string for empty input", () => {
            expect(formatTime("")).toBe("");
        });

        test("should handle different times", () => {
            expect(formatTime("2026-01-29T15:30:00Z")).toBe("15:30");
            expect(formatTime("2026-01-29T00:05:00Z")).toBe("00:05");
        });
    });

    describe("formatDate", () => {
        test("should format date-only string correctly", () => {
            const input = "2026-01-29";
            // Date-only string "YYYY-MM-DD" is parsed as UTC midnight by default in most environments
            // But the function logic says:
            // const isTimeIncluded = dateString.includes('T') || dateString.includes(':');
            // const targetDateString = isTimeIncluded && !dateString.endsWith('Z') ? dateString + 'Z' : dateString;
            // For "2026-01-29", isTimeIncluded is false, so targetDateString is "2026-01-29".
            expect(formatDate(input)).toBe("1/29/2026");
        });

        test("should format ISO string correctly", () => {
            const input = "2026-01-29T04:11:00Z";
            expect(formatDate(input)).toBe("1/29/2026");
        });

        test("should handle missing 'Z' in ISO string", () => {
            const input = "2026-01-29T04:11:00";
            // isTimeIncluded will be true, so it will append 'Z'
            expect(formatDate(input)).toBe("1/29/2026");
        });

        test("should return empty string for empty input", () => {
            expect(formatDate("")).toBe("");
        });

        test("should respect Intl.DateTimeFormatOptions", () => {
            const input = "2026-01-29T04:11:00Z";
            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            // Note: month: 'long' might depend on locale, but for undefined (en-US in this env) it should be January
            expect(formatDate(input, options)).toBe("January 29, 2026");
        });
    });
});
