// lib/email/index.ts
// Call this from any API route to send a transactional email.
// It calls sendEmail() directly (server-side safe).

export { sendEmail } from "./resend";
export * from "./templates";
