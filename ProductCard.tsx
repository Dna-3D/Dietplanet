import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductWithCategory } from "@shared/schema";
import { useCart } from "@/contexts/CartContext";
import { Plus } from "lucide-react";

interface ProductCardProps {
  product: ProductWithCategory;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case "pizza":
        return "bg-primary text-white";
      case "snacks":
        return "bg-secondary text-white";
      case "beverages":
        return "bg-success text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="relative">
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.category && (
          <Badge
            className={`absolute top-2 left-2 ${getCategoryColor(product.category.name)}`}
          >
            {product.category.name}
          </Badge>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>
        {product.stock !== null && product.stock < 10 && product.stock > 0 && (
          <p className="text-sm text-amber-600 mb-2">
            Only {product.stock} left in stock!
          </p>
        )}
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        <div className="flex items-center justify-between w-full">
          <span className="text-2xl font-bold text-primary">
            ₦{parseFloat(product.price).toLocaleString()}
          </span>
          <Button
            onClick={handleAddToCart}
            disabled={!product.isAvailable || (product.stock !== null && product.stock <= 0)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
