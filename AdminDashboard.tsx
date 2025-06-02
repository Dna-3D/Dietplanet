import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Badge } from "./badge";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Switch } from "./switch";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  ShoppingCart, 
  BarChart3,
  DollarSign,
  Users,
  Image,
  Monitor
} from "lucide-react";
import { apiRequest, queryClient } from "./queryClient";
import { useToast } from "./use-toast";
import { ProductWithCategory, OrderWithItems, Category, InsertProduct } from "./schema";

interface AdminDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminDashboard({ open, onOpenChange }: AdminDashboardProps) {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
    isAvailable: true,
  });
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    buttonText: "",
    backgroundImage: "",
    isActive: true,
  });

  const { toast } = useToast();

  // Queries
  const { data: products = [] } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/admin/products"],
    enabled: open,
  });

  const { data: orders = [] } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/admin/orders"],
    enabled: open,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: open,
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/analytics"],
    enabled: open,
  });

  const { data: banners = [] } = useQuery({
    queryKey: ["/api/admin/banners"],
    enabled: open,
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: (data: InsertProduct) => apiRequest("POST", "/api/admin/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setIsProductModalOpen(false);
      resetProductForm();
      toast({ title: "Product created successfully" });
    },
    onError: () => {
      toast({ title: "Error creating product", variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertProduct> }) =>
      apiRequest("PUT", `/api/admin/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setIsProductModalOpen(false);
      setEditingProduct(null);
      resetProductForm();
      toast({ title: "Product updated successfully" });
    },
    onError: () => {
      toast({ title: "Error updating product", variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/products/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error deleting product", variant: "destructive" });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PUT", `/api/admin/orders/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order status updated" });
    },
    onError: () => {
      toast({ title: "Error updating order status", variant: "destructive" });
    },
  });

  const createBannerMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/banners", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      setIsBannerModalOpen(false);
      resetBannerForm();
      toast({ title: "Banner created successfully" });
    },
    onError: () => {
      toast({ title: "Error creating banner", variant: "destructive" });
    },
  });

  const updateBannerMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PUT", `/api/admin/banners/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      setIsBannerModalOpen(false);
      setEditingBanner(null);
      resetBannerForm();
      toast({ title: "Banner updated successfully" });
    },
    onError: () => {
      toast({ title: "Error updating banner", variant: "destructive" });
    },
  });

  const deleteBannerMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/banners/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      toast({ title: "Banner deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error deleting banner", variant: "destructive" });
    },
  });

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      imageUrl: "",
      isAvailable: true,
    });
  };

  const resetBannerForm = () => {
    setBannerForm({
      title: "",
      subtitle: "",
      buttonText: "",
      backgroundImage: "",
      isActive: true,
    });
  };

  const handleEditBanner = (banner: any) => {
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle,
      buttonText: banner.buttonText,
      backgroundImage: banner.backgroundImage,
      isActive: banner.isActive ?? true,
    });
    setIsBannerModalOpen(true);
  };

  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bannerData = {
      title: bannerForm.title,
      subtitle: bannerForm.subtitle,
      buttonText: bannerForm.buttonText,
      backgroundImage: bannerForm.backgroundImage,
      isActive: bannerForm.isActive,
    };

    if (editingBanner) {
      updateBannerMutation.mutate({ id: editingBanner.id, data: bannerData });
    } else {
      createBannerMutation.mutate(bannerData);
    }
  };

  const handleEditProduct = (product: ProductWithCategory) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId?.toString() || "",
      imageUrl: product.imageUrl || "",
      isAvailable: product.isAvailable ?? true,
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData: InsertProduct = {
      name: productForm.name,
      description: productForm.description,
      price: productForm.price,
      categoryId: productForm.categoryId ? parseInt(productForm.categoryId) : null,
      imageUrl: productForm.imageUrl || null,
      isAvailable: productForm.isAvailable,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Admin Dashboard</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="banners" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Banners
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Product Management</h3>
                <Button
                  onClick={() => {
                    resetProductForm();
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-4">
                      <img
                        src={product.imageUrl || "/api/placeholder/300/300"}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                      <p className="text-lg font-bold text-primary">₦{Number(product.price).toLocaleString()}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant={product.isAvailable ? "default" : "secondary"}>
                          {product.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => deleteProductMutation.mutate(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="banners" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Banner Management</h3>
                <Button
                  onClick={() => {
                    resetBannerForm();
                    setEditingBanner(null);
                    setIsBannerModalOpen(true);
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Banner
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {banners.map((banner: any) => (
                  <Card key={banner.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={banner.backgroundImage || "/api/placeholder/300/150"}
                          alt={banner.title}
                          className="w-48 h-24 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{banner.title}</h4>
                          <p className="text-gray-600 mb-2">{banner.subtitle}</p>
                          <p className="text-sm text-gray-500">Button: {banner.buttonText}</p>
                          <div className="flex items-center justify-between mt-3">
                            <Badge variant={banner.isActive ? "default" : "secondary"}>
                              {banner.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditBanner(banner)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => deleteBannerMutation.mutate(banner.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <h3 className="text-lg font-semibold">Order Management</h3>
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <Select
                            value={order.status}
                            onValueChange={(status) =>
                              updateOrderStatusMutation.mutate({ id: order.id, status })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="preparing">Preparing</SelectItem>
                              <SelectItem value="ready">Ready</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p><strong>Customer:</strong> {order.customerName}</p>
                          <p><strong>Phone:</strong> {order.customerPhone}</p>
                          <p><strong>Address:</strong> {order.customerAddress}</p>
                        </div>
                        <div>
                          <p><strong>Total:</strong> ₦{Number(order.totalAmount).toLocaleString()}</p>
                          <p><strong>Created:</strong> {new Date(order.createdAt!).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div>
                          <strong>Items:</strong>
                          <ul className="list-disc list-inside mt-2">
                            {order.items.map((item) => (
                              <li key={item.id}>
                                {item.product.name} x {item.quantity} - ₦{Number(item.price).toLocaleString()}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="bg-primary text-white p-3 rounded-full mr-4">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          ₦{analytics?.totalRevenue?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-gray-500">Total Revenue</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="bg-secondary text-white p-3 rounded-full mr-4">
                        <ShoppingCart className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {analytics?.totalOrders || 0}
                        </div>
                        <div className="text-sm text-gray-500">Total Orders</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="bg-green-600 text-white p-3 rounded-full mr-4">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {analytics?.totalCustomers || 0}
                        </div>
                        <div className="text-sm text-gray-500">Total Customers</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Product Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price (₦)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select
                value={productForm.categoryId}
                onValueChange={(value) => setProductForm({ ...productForm, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                value={productForm.imageUrl}
                onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isAvailable"
                checked={productForm.isAvailable}
                onCheckedChange={(checked) => setProductForm({ ...productForm, isAvailable: checked })}
              />
              <Label htmlFor="isAvailable">Available</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingProduct ? "Update Product" : "Create Product"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsProductModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}