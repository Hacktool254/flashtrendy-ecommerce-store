import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({
    params,
}: {
    params: { id: string };
}) {
    const [product, categories] = await Promise.all([
        prisma.product.findUnique({
            where: { id: params.id },
        }),
        prisma.category.findMany(),
    ]);

    if (!product) {
        notFound();
    }

    const serializedProduct = {
        ...product,
        price: Number(product.price), // Convert Decimal to number
    } as any;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Edit Product</h1>
            <ProductForm categories={categories} product={serializedProduct} />
        </div>
    );
}
