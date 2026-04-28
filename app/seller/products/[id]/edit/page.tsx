import { notFound } from "next/navigation";
import ProductEditor from "@/components/seller/ProductEditor";
import { findProduct } from "@/lib/seller/products-seed";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = findProduct(id);
  if (!product) notFound();
  return <ProductEditor mode="edit" initial={product} />;
}
