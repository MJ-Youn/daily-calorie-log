import { expect, test, describe, mock } from "bun:test";
import { useAuth } from "./AuthContext";
import { useContext } from "react";

// Mock react to control useContext
mock.module("react", () => {
    const original = require("react");
    return {
        ...original,
        useContext: mock(),
    };
});

describe("useAuth", () => {
    test("should throw error when used outside AuthProvider", () => {
        // Arrange
        (useContext as any).mockReturnValue(undefined);

        // Act & Assert
        expect(() => useAuth()).toThrow('useAuth must be used within an AuthProvider');
    });

    test("should return context when used within AuthProvider", () => {
        // Arrange
        const mockContextValue = {
            user: { sub: '1', email: 'test@example.com', name: 'Test', picture: '', role: 'USER' },
            loading: false,
            login: () => {},
            logout: () => {},
        };
        (useContext as any).mockReturnValue(mockContextValue);

        // Act
        const result = useAuth();

        // Assert
        expect(result).toBe(mockContextValue);
    });
});
