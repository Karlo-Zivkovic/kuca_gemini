// Inquiry form checks shared by the browser (instant per-field errors) and the server action.

/**
 * Stricter than "has an @ and a dot": the email service rejects addresses like
 * "name.@gmail.com" (a phone keyboard's stray dot), which used to lose the whole inquiry.
 */
const ATOM = "[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+";
const EMAIL = new RegExp(`^${ATOM}(\\.${ATOM})*@([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\\.)+[A-Za-z]{2,}$`);

export const isValidEmail = (s: string) => s.length <= 254 && EMAIL.test(s);

/** Fields with their own error message, in the order they appear in the form. */
export const inquiryFields = ["name", "email", "phone", "dates", "privacy"] as const;
export type InquiryField = (typeof inquiryFields)[number];

/**
 * Quick checks the browser can do on its own. The phone is only checked for a country code here;
 * the server does the full number check (libphonenumber is too big to ship to the browser).
 */
export function checkField(field: InquiryField, form: HTMLFormElement): boolean {
  const value = (name: string) => String(new FormData(form).get(name) ?? "").trim();
  switch (field) {
    case "name":
      return value("name").length >= 2;
    case "email":
      return isValidEmail(value("email"));
    case "phone": {
      const phone = value("phone");
      return !phone || /^(\+|00)\s*[1-9]/.test(phone);
    }
    case "dates":
      return !value("arrival") || Boolean(value("departure"));
    case "privacy":
      return new FormData(form).get("privacy") === "on";
  }
}
