export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold">
          Welcome to FlashTrendy
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover the latest trends in fashion. Shop quality products at
          unbeatable prices.
        </p>
        <div className="flex justify-center space-x-4">
          <a
            href="/products"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Shop Now
          </a>
        </div>
      </div>
    </div>
  );
}

