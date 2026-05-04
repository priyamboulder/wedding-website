import { redirect } from "next/navigation";

// The marketing copy lives at /tools (the hub), and the builder lives at
// /tools/budget/build. /tools/budget itself is just an entry point — drop
// straight into the builder so the link from the hub doesn't waste a click.
export default function BudgetHubRedirect() {
  redirect("/tools/budget/build");
}
