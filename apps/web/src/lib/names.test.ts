import { describe, expect, it } from "vitest";
import { firstName, shortName, surnameInitial } from "./names";

describe("names", () => {
  it("takes the first name", () => {
    expect(firstName("  Ada Byrne ")).toBe("Ada");
  });

  it("takes the surname initial", () => {
    expect(surnameInitial("Ana María López")).toBe("L.");
    expect(surnameInitial("Cher")).toBeNull();
  });

  it("shortens to first name and surname initial", () => {
    expect(shortName("Georgios Papadakis")).toBe("Georgios P.");
    expect(shortName("Ana María López")).toBe("Ana L.");
    expect(shortName("Cher")).toBe("Cher");
  });
});
