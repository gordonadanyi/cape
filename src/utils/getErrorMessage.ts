import { isAxiosError } from "axios";

/**
 * Turns a caught error into a message safe to show the user directly.
 *
 * Your NestJS backend already sends specific, readable messages via its
 * exceptions (BadRequestException, ConflictException, class-validator
 * errors, etc.) — this just knows where to find them on the axios error
 * shape, instead of every page re-guessing that shape (or giving up and
 * showing "Something went wrong").
 */
export function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string | string[] }
      | undefined;

    // class-validator failures come back as an array of messages,
    // e.g. ["customerEmail must be an email"]
    if (Array.isArray(data?.message) && data.message.length > 0) {
      return data.message.join(" ");
    }

    // Regular NestJS exceptions (NotFoundException, ConflictException, etc.)
    // come back as a single string message.
    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }

    if (err.response?.status === 401) {
      return "Your session has expired. Please log in again.";
    }
    if (err.response?.status === 404) {
      return "We couldn't find that — it may have been deleted.";
    }
    if (err.response?.status === 403) {
      return "You don't have permission to do that.";
    }
    if (!err.response) {
      return "Couldn't reach the server. Check your connection and try again.";
    }
  }

  return fallback;
}
