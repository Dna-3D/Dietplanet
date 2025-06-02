import { useState } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CarouselBanner } from "./CarouselBanner";
import { ProductCard } from "./ProductCard";
import { ShoppingCart } from "./ShoppingCart";
import { LoginModal } from "./LoginModal";
import { AdminDashboard } from "./AdminDashboard";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./AuthContext";
import { ProductWithCategory } from "./schema";

export function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const { userProfile } = useAuth();

  const { data: products = [], isLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar
          onCartClick={() => setIsCartOpen(true)}
          onLoginClick={() => setIsLoginOpen(true)}
          onAdminClick={() => setIsAdminOpen(true)}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading DietPlanet store...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onCartClick={() => setIsCartOpen(true)}
        onLoginClick={() => setIsLoginOpen(true)}
        onAdminClick={() => setIsAdminOpen(true)}
      />
      
      <main>
        <CarouselBanner />
        
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Our Menu</h2>
            
            {categories.map((category: any) => {
              const categoryProducts = products.filter(
                (product) => product.categoryId === category.id
              );
              
              if (categoryProducts.length === 0) return null;
              
              return (
                <div key={category.id} className="mb-16">
                  <h3 className="text-2xl font-semibold mb-8 text-center">
                    {category.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />

      <ShoppingCart open={isCartOpen} onOpenChange={setIsCartOpen} />
      <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      
      {userProfile?.isAdmin && (
        <AdminDashboard open={isAdminOpen} onOpenChange={setIsAdminOpen} />
      )}
    </div>
  );
}