import { describe, expect, it } from "vitest";
import type { Member } from "../data/types";
import { maskContact, memberContacts } from "./contacts";

const ada: Member = {
  id: "ada", name: "Ada Byrne", email: "ada@example.com", photoUrl: null, bio: null, phone: "+49 151 123",
  whatsappUrl: "https://wa.me/49151123", social: "https://instagram.com/ada", birthday: null, role: "member", joinedAt: "", birthdayPost: true,
};

describe("memberContacts", () => {
  it("lists every channel the member has, with hrefs and display values", () => {
    expect(memberContacts(ada)).toEqual([
      { kind: "whatsapp", label: "WhatsApp", href: "https://wa.me/49151123", value: "+49 151 123" },
      { kind: "phone", label: "Phone", href: "tel:+49151123", value: "+49 151 123" },
      { kind: "email", label: "Email", href: "mailto:ada@example.com", value: "ada@example.com" },
      { kind: "social", label: "Social", href: "https://instagram.com/ada", value: "instagram.com/ada" },
    ]);
  });

  it("skips missing channels", () => {
    const kinds = memberContacts({ ...ada, phone: null, whatsappUrl: null, social: null }).map((c) => c.kind);
    expect(kinds).toEqual(["email"]);
  });
});

describe("maskContact", () => {
  it("hides the middle digits of phone numbers", () => {
    expect(maskContact({ kind: "phone", value: "+49 151 123 4567" })).toBe("+49 ••• ••• ••67");
    expect(maskContact({ kind: "whatsapp", value: "+49 151 123" })).toBe("+49 ••• •23");
  });

  it("keeps the first two letters and the domain of an email", () => {
    expect(maskContact({ kind: "email", value: "ada@example.com" })).toBe("ad•••@example.com");
  });

  it("leaves public values alone", () => {
    expect(maskContact({ kind: "social", value: "instagram.com/ada" })).toBe("instagram.com/ada");
    expect(maskContact({ kind: "whatsapp", value: "Message" })).toBe("Message");
  });
});
