import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Card, CardBody, CardFooter, CardHeader } from "./Card";

describe("Card", () => {
  it("renders its children", () => {
    render(<Card>Contents</Card>);
    expect(screen.getByText("Contents")).toBeInTheDocument();
  });

  it("renders as a div by default", () => {
    const { container } = render(<Card>Contents</Card>);
    expect(container.firstChild).toHaveProperty("tagName", "DIV");
  });

  it("supports the `as` prop to render a different element", () => {
    const { container } = render(
      <Card as="a" href="#x">
        Link card
      </Card>,
    );
    expect(container.firstChild).toHaveProperty("tagName", "A");
  });

  it("defaults to the default variant", () => {
    const { container } = render(<Card>Contents</Card>);
    expect(container.firstChild).toHaveAttribute("data-variant", "default");
  });

  it("applies the variant as a data attribute", () => {
    const { container } = render(<Card variant="active">Contents</Card>);
    expect(container.firstChild).toHaveAttribute("data-variant", "active");
  });

  it("wraps plain children in a default body (backward compat)", () => {
    render(<Card>Contents</Card>);
    expect(screen.getByText("Contents").className).toContain("body");
  });

  it("passes through arbitrary attributes", () => {
    render(<Card data-testid="my-card">Contents</Card>);
    expect(screen.getByTestId("my-card")).toBeInTheDocument();
  });

  it("merges a provided className", () => {
    const { container } = render(<Card className="extra">Contents</Card>);
    expect(container.firstChild).toHaveClass("extra");
  });

  it("renders Header / Body / Footer sections when composed", () => {
    render(
      <Card>
        <CardHeader>Head</CardHeader>
        <CardBody>Main</CardBody>
        <CardFooter>Foot</CardFooter>
      </Card>,
    );
    expect(screen.getByText("Head")).toBeInTheDocument();
    expect(screen.getByText("Main")).toBeInTheDocument();
    expect(screen.getByText("Foot")).toBeInTheDocument();
  });

  it("does not double-wrap when sections are used", () => {
    render(
      <Card>
        <CardBody>Main</CardBody>
      </Card>,
    );
    // Only one element carries the body class (the explicit CardBody).
    expect(
      document.querySelectorAll('[class*="body"]'),
    ).toHaveLength(1);
  });

  it("exposes sections as static members", () => {
    expect(Card.Header).toBe(CardHeader);
    expect(Card.Body).toBe(CardBody);
    expect(Card.Footer).toBe(CardFooter);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Card variant="accent">
        <CardHeader>Head</CardHeader>
        <CardBody>Body</CardBody>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
