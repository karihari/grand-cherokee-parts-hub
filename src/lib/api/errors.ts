import { ApiError } from "./client";

// Customer- and admin-facing wording for the API's error codes.
const MESSAGES: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS:
    "Wrong email or password. After 5 failed attempts the account is locked for 15 minutes.",
  AUTH_USER_DISABLED: "This account is disabled. Ask the shop admin.",
  AUTH_SESSION_REVOKED: "You were signed out. Please sign in again.",
  AUTH_UNAUTHORIZED: "Please sign in.",
  AUTH_ACCESS_TOKEN_EXPIRED: "Your session expired. Please sign in again.",
  AUTH_REFRESH_TOKEN_INVALID: "Your session expired. Please sign in again.",
  AUTH_FORBIDDEN_ROLE: "Your role does not allow this.",
  AUTH_WRONG_CURRENT_PASSWORD: "The current password is wrong.",
  AUTH_NEW_PASSWORD_SAME_AS_OLD: "The new password must be different from the current one.",
  TOO_MANY_REQUESTS: "Too many attempts. Please wait a minute and try again.",
  ORIGIN_NOT_ALLOWED: "This website is not allowed to talk to the shop server.",
  ORDER_PRODUCT_UNAVAILABLE: "A part in your cart is no longer for sale. Please remove it.",
  ORDER_PRODUCT_NO_PRICE:
    "A part in your cart does not have a price yet. Message us or remove it from your cart.",
  ORDER_ALREADY_CANCELLED: "A cancelled order cannot be changed.",
  ENQUIRY_NOT_FOUND: "This message no longer exists.",
  ORDER_NOT_FOUND: "This order no longer exists.",
  PRODUCT_NOT_FOUND: "This product no longer exists.",
  PRODUCT_OLD_PRICE_NOT_HIGHER: "Old price must be higher than price.",
  PRODUCT_FITMENT_YEARS_REVERSED: "In fitment, 'year from' must not be after 'year to'.",
  IMAGE_TYPE_NOT_ALLOWED: "Only JPEG, PNG or WebP photos can be uploaded.",
  IMAGE_TOO_LARGE: "The photo is too large (max 3 MB).",
  USER_EMAIL_TAKEN: "An admin with this email already exists.",
  USER_CANNOT_CHANGE_SELF: "You cannot change your own role or disable yourself.",
  ENQUIRY_DELIVERY_FAILED: "We could not deliver your message. Please try WhatsApp or Telegram.",
  INTERNAL_SERVER_ERROR: "Something went wrong on our side. Please try again.",
};

export function errorText(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "ORDER_INSUFFICIENT_STOCK") {
      const { name, available } = error.details as { name?: string; available?: number };
      return `Not enough stock for "${name ?? "a part"}" (${available ?? 0} left). Please lower the quantity.`;
    }
    if (error.code === "VALIDATION_ERROR") {
      return error.fieldErrors.map((f) => `${f.field}: ${f.errors.join(", ")}`).join("; ");
    }
    return MESSAGES[error.code] ?? "Something went wrong. Please try again.";
  }
  if (error instanceof TypeError) return "Cannot reach the shop server. Check your connection.";
  return "Something went wrong. Please try again.";
}
