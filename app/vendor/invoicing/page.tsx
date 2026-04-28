"use client";

import { PageHeader } from "@/components/vendor-portal/ui";
import { FinanceInvoicesTab } from "@/components/workspace/finance/FinanceInvoicesTab";

export default function VendorInvoicingPage() {
  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Invoicing"
        title="Invoices & payments"
        description="Track outstanding and paid invoices across all your weddings."
      />
      <div className="px-8 py-6">
        <FinanceInvoicesTab categoryFilter={null} />
      </div>
    </div>
  );
}
