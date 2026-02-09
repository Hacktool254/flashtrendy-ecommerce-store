import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
    const categories = await prisma.category.findMany();

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Add New Product</h1>
            <ProductForm categories={categories} />
        </div>
    );
}
