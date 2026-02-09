"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UploadButton } from "@/lib/uploadthing";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/app/actions/products";
import Image from "next/image";
import { X } from "lucide-react";

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.string().min(1, "Price is required"),
    images: z.array(z.string()).min(1, "At least one image is required"),
    categoryId: z.string().min(1, "Category is required"),
    stock: z.string().min(1, "Stock is required"),
});

interface ProductFormProps {
    categories: { id: string; name: string }[];
    product?: {
        id: string;
        name: string;
        description: string;
        price: number;
        images: string[];
        categoryId: string;
        stock: number;
    };
}

export function ProductForm({ categories, product }: ProductFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: product?.name || "",
            description: product?.description || "",
            price: product?.price.toString() || "",
            images: product?.images || [],
            categoryId: product?.categoryId || "",
            stock: product?.stock.toString() || "",
        },
    });

    const onSubmit = async (values: z.infer<typeof productSchema>) => {
        setIsLoading(true);
        try {
            const result = product
                ? await updateProduct(product.id, values)
                : await createProduct(values);

            if (result.success) {
                toast({
                    title: "Success",
                    description: `Product ${product ? "updated" : "created"} successfully`,
                });
                router.push("/admin/products");
            } else {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Images</FormLabel>
                            <FormControl>
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-4">
                                        {field.value.map((image, index) => (
                                            <div key={index} className="relative w-24 h-24">
                                                <Image
                                                    src={image}
                                                    alt={`Product image ${index + 1}`}
                                                    fill
                                                    className="object-cover rounded-md"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newImages = [...field.value];
                                                        newImages.splice(index, 1);
                                                        field.onChange(newImages);
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-sm hover:bg-destructive/90"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <UploadButton
                                        endpoint="imageUploader"
                                        onClientUploadComplete={(res) => {
                                            if (res) {
                                                const newImages = res.map((r) => r.url);
                                                field.onChange([...field.value, ...newImages]);
                                                toast({
                                                    title: "Success",
                                                    description: "Images uploaded successfully",
                                                });
                                            }
                                        }}
                                        onUploadError={(error: Error) => {
                                            toast({
                                                title: "Error",
                                                description: error.message,
                                                variant: "destructive",
                                            });
                                        }}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid gap-8 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Product name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stock</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Product description"
                                    className="min-h-[120px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : product ? "Update Product" : "Create Product"}
                </Button>
            </form>
        </Form>
    );
}
