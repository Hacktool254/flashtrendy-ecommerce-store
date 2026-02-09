import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { deleteProduct } from "@/app/actions/products";
import { revalidatePath } from "next/cache";
import { ExportButton } from "@/components/admin/ExportButton";
import { exportProductsCSV } from "@/app/actions/reports";

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: { q?: string; page?: string };
}) {
    const query = searchParams.q || "";
    const page = Number(searchParams.page) || 1;
    const pageSize = 10;

    const where = query
        ? {
            name: {
                contains: query,
                mode: "insensitive" as const,
            },
        }
        : {};

    const [products, totalProducts] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                category: true,
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: "desc" },
        }),
        prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(totalProducts / pageSize);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Products</h1>
                <div className="flex items-center gap-2">
                    <ExportButton exportAction={exportProductsCSV} filename="products" />
                    <Button asChild>
                        <Link href="/admin/products/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        className="pl-8"
                        defaultValue={query}
                        name="q"
                    />
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="relative w-12 h-12 rounded-md overflow-hidden">
                                            <Image
                                                src={product.images[0] || "/placeholder.jpg"}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.category.name}</TableCell>
                                    <TableCell className="text-right">
                                        ${Number(product.price).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right">{product.stock}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button asChild variant="ghost" size="icon">
                                                <Link href={`/admin/products/${product.id}/edit`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <form
                                                action={async () => {
                                                    "use server";
                                                    await deleteProduct(product.id);
                                                }}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <Button
                            key={p}
                            variant={p === page ? "default" : "outline"}
                            asChild
                        >
                            <Link href={`/admin/products?page=${p}&q=${query}`}>{p}</Link>
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}
