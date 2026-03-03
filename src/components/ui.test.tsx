import { expect, test, describe } from "bun:test";
import React from 'react';
import { Card, Button } from "./ui";

describe("Card", () => {
    test("should render children and apply default classes", () => {
        const children = <span>Test Content</span>;
        const card = Card({ children }) as any;

        expect(card.type).toBe('div');
        expect(card.props.children).toBe(children);
        expect(card.props.className).toContain('bg-white');
        expect(card.props.className).toContain('p-6');
    });

    test("should merge custom className", () => {
        const card = Card({ children: "test", className: "custom-class" }) as any;
        expect(card.props.className).toContain('custom-class');
        expect(card.props.className).toContain('bg-white');
    });
});

describe("Button", () => {
    test("should render children and apply default classes", () => {
        const children = "Click me";
        const button = Button({ children }) as any;

        expect(button.type).toBe('button');
        // In our mock createElement, multiple children are passed as an array
        if (Array.isArray(button.props.children)) {
            expect(button.props.children).toContain(children);
        } else {
            expect(button.props.children).toBe(children);
        }
        expect(button.props.className).toContain('inline-flex');
    });

    test("should show loading spinner when isLoading is true", () => {
        const button = Button({ children: "test", isLoading: true }) as any;
        expect(button.props.disabled).toBe(true);

        const children = button.props.children;
        expect(Array.isArray(children)).toBe(true);
        const spinner = children.find((c: any) => c && c.type === 'span' && c.props.className.includes('animate-spin'));
        expect(spinner).toBeDefined();
    });

    test("should be disabled when disabled prop is true", () => {
        const button = Button({ children: "test", disabled: true }) as any;
        expect(button.props.disabled).toBe(true);
    });

    test("should merge custom className", () => {
        const button = Button({ children: "test", className: "custom-button" }) as any;
        expect(button.props.className).toContain('custom-button');
    });
});
