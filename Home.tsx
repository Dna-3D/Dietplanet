import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Leaf, Clock, Heart, Shield } from "lucide-react";
import { CarouselBanner } from "@/components/CarouselBanner";
import { ProductCard } from "@/components/ProductCard";
import { ProductWithCategory, Category } from "@shared/schema";

export function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading: productsLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || 
      product.category?.name.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const features = [
    {
      icon: Leaf,
      title: "Fresh Ingredients",
      description: "Daily sourced organic produce",
      color: "bg-primary",
    },
    {
      icon: Clock,
      title: "Fast Delivery",
      description: "30 minutes or less guarantee",
      color: "bg-secondary",
    },
    {
      icon: Heart,
      title: "Made with Love",
      description: "Crafted by passionate chefs",
      color: "bg-accent",
    },
    {
      icon: Shield,
      title: "Quality Assured",
      description: "100% satisfaction guarantee",
      color: "bg-success",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Carousel Banner */}
      <CarouselBanner />

      {/* Menu Section */}
      <section id="menu" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-dark mb-4">Our Menu</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our delicious selection of pizzas and healthy snacks, 
              carefully crafted for your enjoyment
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? "bg-primary hover:bg-primary/90" : ""}
            >
              All Items
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name.toLowerCase() ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.name.toLowerCase())}
                className={selectedCategory === category.name.toLowerCase() ? "bg-primary hover:bg-primary/90" : ""}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Product Grid */}
          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-dark mb-6">About DietPlanet</h2>
              <p className="text-lg text-gray-600 mb-6">
                We're passionate about delivering fresh, healthy, and delicious food right to your doorstep. 
                Since our founding, we've been committed to using only the finest ingredients and supporting local suppliers.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Our mission is to make nutritious eating convenient and enjoyable for everyone. 
                From artisanal pizzas to healthy snacks, every item on our menu is crafted with care and attention to quality.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feature) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={feature.title} className="flex items-center">
                      <div className={`${feature.color} text-white rounded-full p-3 mr-4`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{feature.title}</h4>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"
                alt="Chef preparing food"
                className="rounded-xl shadow-lg w-full h-auto"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center">
                  <div className="bg-primary text-white rounded-full p-2 mr-3">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold">4.9/5 Rating</div>
                    <div className="text-sm text-gray-600">1000+ Reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
