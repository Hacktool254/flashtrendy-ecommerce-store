import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface CategoryCardProps {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
}

export function CategoryCard({ id, name, slug, image, description }: CategoryCardProps) {
  const categoryImage = image || "/placeholder-category.jpg";

  return (
    <Link href={`/products?category=${slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={categoryImage}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
            {name}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

