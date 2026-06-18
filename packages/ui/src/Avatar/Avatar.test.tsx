import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  describe("with src", () => {
    it("renders an img with alt=name", () => {
      render(<Avatar src="https://example.com/photo.jpg" name="Alice Johnson" />);
      expect(screen.getByRole("img", { name: "Alice Johnson" })).toBeInTheDocument();
    });

    it("has no accessibility violations", async () => {
      const { container } = render(
        <Avatar src="https://example.com/photo.jpg" name="Alice Johnson" />,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe("without src (initials fallback)", () => {
    it("renders initials from name", () => {
      render(<Avatar name="Alice Johnson" />);
      expect(screen.getByText("AJ")).toBeInTheDocument();
    });

    it("renders only first initial for single-word names", () => {
      render(<Avatar name="Alice" />);
      expect(screen.getByText("A")).toBeInTheDocument();
    });

    it("has role=img with aria-label=name", () => {
      render(<Avatar name="Alice Johnson" />);
      expect(screen.getByRole("img", { name: "Alice Johnson" })).toBeInTheDocument();
    });

    it("has no accessibility violations", async () => {
      const { container } = render(<Avatar name="Alice Johnson" />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe("with null src (initials fallback)", () => {
    it("renders initials when src is null", () => {
      render(<Avatar src={null} name="Bob Smith" />);
      expect(screen.getByText("BS")).toBeInTheDocument();
    });
  });

  it("applies size variant via data attribute", () => {
    const { container } = render(<Avatar name="Alice Johnson" size="lg" />);
    expect(container.firstChild).toHaveAttribute("data-size", "lg");
  });

  it("defaults to size=md", () => {
    const { container } = render(<Avatar name="Alice Johnson" />);
    expect(container.firstChild).toHaveAttribute("data-size", "md");
  });

  describe("shape", () => {
    it("defaults to circle", () => {
      const { container } = render(<Avatar name="Alice Johnson" />);
      expect(container.firstChild).toHaveAttribute("data-shape", "circle");
    });

    it("applies the rounded shape via data attribute", () => {
      const { container } = render(<Avatar name="Alice Johnson" shape="rounded" />);
      expect(container.firstChild).toHaveAttribute("data-shape", "rounded");
    });

    it("renders an image in rounded shape when src is provided", () => {
      render(
        <Avatar
          src="https://example.com/photo.jpg"
          name="Alice Johnson"
          shape="rounded"
        />,
      );
      expect(screen.getByRole("img", { name: "Alice Johnson" })).toBeInTheDocument();
    });

    it("renders initials fallback in rounded shape when src is null", () => {
      render(<Avatar src={null} name="Alice Johnson" shape="rounded" />);
      expect(screen.getByText("AJ")).toBeInTheDocument();
    });

    it("applies the aspect ratio as an inline style for rounded", () => {
      const { container } = render(
        <Avatar name="Alice Johnson" shape="rounded" aspect="3 / 4" />,
      );
      expect(container.firstChild).toHaveStyle({ aspectRatio: "3 / 4" });
    });

    it("has no accessibility violations in rounded shape", async () => {
      const { container } = render(
        <Avatar src={null} name="Alice Johnson" shape="rounded" />,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
