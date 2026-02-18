import { expect, test, describe } from "bun:test";
import { cn } from "./utils";

describe("cn", () => {
    test("should merge single class names", () => {
        expect(cn("class1")).toBe("class1");
        expect(cn("class1", "class2")).toBe("class1 class2");
    });

    test("should handle conditional class names", () => {
        expect(cn("class1", true && "class2", false && "class3")).toBe("class1 class2");
        expect(cn("class1", { "class2": true, "class3": false })).toBe("class1 class2");
    });

    test("should handle arrays of class names", () => {
        expect(cn(["class1", "class2"])).toBe("class1 class2");
        expect(cn(["class1"], ["class2"])).toBe("class1 class2");
    });

    test("should handle nested arrays and objects", () => {
        expect(cn(["class1", ["class2", { "class3": true }]])).toBe("class1 class2 class3");
    });

    test("should handle undefined and null", () => {
        expect(cn("class1", undefined, null, "class2")).toBe("class1 class2");
    });

    test("should resolve tailwind class conflicts", () => {
        // px-2 and px-4 should resolve to px-4
        expect(cn("px-2", "px-4")).toBe("px-4");
        expect(cn("p-4", "p-2")).toBe("p-2");
    });

    test("should handle empty inputs", () => {
        expect(cn()).toBe("");
        expect(cn("")).toBe("");
        expect(cn(undefined as any)).toBe("");
    });
});
