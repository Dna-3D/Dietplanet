import { 
  users, 
  categories, 
  products, 
  orders, 
  orderItems, 
  cartItems,
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type ProductWithCategory,
  type Order,
  type InsertOrder,
  type OrderWithItems,
  type CartItem,
  type InsertCartItem,
  type CartItemWithProduct,
  type InsertOrderItem
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  syncUser(user: InsertUser): Promise<User>;

  // Category methods
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Product methods
  getProducts(): Promise<ProductWithCategory[]>;
  getProduct(id: number): Promise<ProductWithCategory | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Cart methods
  getCartItems(userId: number): Promise<CartItemWithProduct[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, updates: Partial<InsertCartItem>): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;

  // Order methods
  getOrders(): Promise<OrderWithItems[]>;
  getOrder(id: number): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  // Analytics
  getAnalytics(): Promise<{ totalRevenue: number; totalOrders: number; totalCustomers: number }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, any>;
  private cartItems: Map<number, CartItem>;
  private currentUserId: number;
  private currentCategoryId: number;
  private currentProductId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;
  private currentCartItemId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.cartItems = new Map();
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentProductId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentCartItemId = 1;

    this.initializeData();
  }

  private initializeData() {
    // Create default categories
    const pizzaCategory: Category = {
      id: this.currentCategoryId++,
      name: "Pizza",
      description: "Fresh, handcrafted pizzas with premium ingredients",
    };
    this.categories.set(pizzaCategory.id, pizzaCategory);

    const snacksCategory: Category = {
      id: this.currentCategoryId++,
      name: "Snacks",
      description: "Healthy and delicious snacks for any time",
    };
    this.categories.set(snacksCategory.id, snacksCategory);

    const beveragesCategory: Category = {
      id: this.currentCategoryId++,
      name: "Beverages",
      description: "Refreshing drinks and smoothies",
    };
    this.categories.set(beveragesCategory.id, beveragesCategory);

    // Create sample products
    const sampleProducts = [
      {
        name: "Pepperoni Classic",
        description: "Traditional pepperoni pizza with mozzarella cheese and our signature sauce",
        price: "7500",
        categoryId: pizzaCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isAvailable: true,
        stock: 25,
      },
      {
        name: "Margherita Fresh",
        description: "Fresh basil, mozzarella, tomatoes, and olive oil on thin crust",
        price: "6800",
        categoryId: pizzaCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isAvailable: true,
        stock: 20,
      },
      {
        name: "Meat Lovers Supreme",
        description: "Pepperoni, sausage, bacon, and ham with extra cheese",
        price: "9200",
        categoryId: pizzaCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isAvailable: true,
        stock: 15,
      },
      {
        name: "Power Mix Nuts",
        description: "Premium blend of almonds, cashews, and dried cranberries",
        price: "3600",
        categoryId: snacksCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1599909533175-84e8edb265b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isAvailable: true,
        stock: 50,
      },
      {
        name: "Veggie Sticks & Hummus",
        description: "Fresh carrots, celery, and bell peppers with homemade hummus",
        price: "2800",
        categoryId: snacksCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isAvailable: true,
        stock: 30,
      },
      {
        name: "Green Power Smoothie",
        description: "Spinach, banana, mango, and coconut water blend",
        price: "3200",
        categoryId: beveragesCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1546173159-315724a31696?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isAvailable: true,
        stock: 25,
      },
    ];

    sampleProducts.forEach((productData) => {
      const product: Product = {
        id: this.currentProductId++,
        ...productData,
        createdAt: new Date(),
      };
      this.products.set(product.id, product);
    });

    // Create admin user
    const adminUser: User = {
      id: this.currentUserId++,
      firebaseUid: "admin-uid",
      email: "admin@dietplanet.com",
      displayName: "Admin User",
      photoURL: null,
      isAdmin: true,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUid === firebaseUid);
  }

  async syncUser(userData: InsertUser): Promise<User> {
    const existingUser = await this.getUserByFirebaseUid(userData.firebaseUid);
    
    if (existingUser) {
      // Update existing user
      const isAdminEmail = userData.email === 'dialadonald7@gmail.com';
      const updatedUser: User = {
        ...existingUser,
        email: userData.email,
        displayName: userData.displayName ?? null,
        photoURL: userData.photoURL ?? null,
        isAdmin: isAdminEmail || existingUser.isAdmin,
      };
      this.users.set(existingUser.id, updatedUser);
      return updatedUser;
    }

    // Create new user
    const isAdminEmail = userData.email === 'dialadonald7@gmail.com';
    const newUser: User = {
      id: this.currentUserId++,
      firebaseUid: userData.firebaseUid,
      email: userData.email,
      displayName: userData.displayName ?? null,
      photoURL: userData.photoURL ?? null,
      isAdmin: isAdminEmail,
      createdAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const category: Category = {
      id: this.currentCategoryId++,
      name: categoryData.name,
      description: categoryData.description ?? null,
    };
    this.categories.set(category.id, category);
    return category;
  }

  async getProducts(): Promise<ProductWithCategory[]> {
    return Array.from(this.products.values()).map(product => ({
      ...product,
      category: product.categoryId ? this.categories.get(product.categoryId) : undefined,
    }));
  }

  async getProduct(id: number): Promise<ProductWithCategory | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    return {
      ...product,
      category: product.categoryId ? this.categories.get(product.categoryId) : undefined,
    };
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const product: Product = {
      id: this.currentProductId++,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      categoryId: productData.categoryId ?? null,
      imageUrl: productData.imageUrl ?? null,
      isAvailable: productData.isAvailable ?? null,
      stock: productData.stock ?? null,
      createdAt: new Date(),
    };
    this.products.set(product.id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const product = this.products.get(id);
    if (!product) {
      throw new Error("Product not found");
    }

    const updatedProduct: Product = {
      ...product,
      ...updates,
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    this.products.delete(id);
  }

  async getCartItems(userId: number): Promise<CartItemWithProduct[]> {
    const userCartItems = Array.from(this.cartItems.values()).filter(
      item => item.userId === userId
    );

    return userCartItems.map(item => {
      const product = this.products.get(item.productId!);
      if (!product) {
        throw new Error(`Product not found for cart item ${item.id}`);
      }
      return {
        ...item,
        product,
      };
    });
  }

  async addToCart(cartItemData: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.userId === cartItemData.userId && item.productId === cartItemData.productId
    );

    if (existingItem) {
      // Update quantity
      const updatedItem: CartItem = {
        ...existingItem,
        quantity: existingItem.quantity + cartItemData.quantity,
      };
      this.cartItems.set(existingItem.id, updatedItem);
      return updatedItem;
    }

    // Create new cart item
    const cartItem: CartItem = {
      id: this.currentCartItemId++,
      userId: cartItemData.userId ?? null,
      productId: cartItemData.productId ?? null,
      quantity: cartItemData.quantity,
      createdAt: new Date(),
    };
    this.cartItems.set(cartItem.id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, updates: Partial<InsertCartItem>): Promise<CartItem> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    const updatedItem: CartItem = {
      ...cartItem,
      ...updates,
    };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<void> {
    this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<void> {
    const userCartItems = Array.from(this.cartItems.entries()).filter(
      ([_, item]) => item.userId === userId
    );
    userCartItems.forEach(([id]) => this.cartItems.delete(id));
  }

  async getOrders(): Promise<OrderWithItems[]> {
    const allOrders = Array.from(this.orders.values());
    
    return allOrders.map(order => {
      const items = Array.from(this.orderItems.values())
        .filter(item => item.orderId === order.id)
        .map(item => ({
          ...item,
          product: this.products.get(item.productId)!,
        }));

      return {
        ...order,
        items,
      };
    });
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const items = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id)
      .map(item => ({
        ...item,
        product: this.products.get(item.productId)!,
      }));

    return {
      ...order,
      items,
    };
  }

  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const total = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

    const order: Order = {
      id: this.currentOrderId++,
      userId: orderData.userId ?? null,
      total: total.toString(),
      status: "pending",
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone ?? null,
      deliveryAddress: orderData.deliveryAddress ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(order.id, order);

    // Create order items
    items.forEach(itemData => {
      const orderItem = {
        id: this.currentOrderItemId++,
        orderId: order.id,
        ...itemData,
      };
      this.orderItems.set(orderItem.id, orderItem);
    });

    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) {
      throw new Error("Order not found");
    }

    const updatedOrder: Order = {
      ...order,
      status,
      updatedAt: new Date(),
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getAnalytics(): Promise<{ totalRevenue: number; totalOrders: number; totalCustomers: number }> {
    const allOrders = Array.from(this.orders.values());
    const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const totalOrders = allOrders.length;
    const totalCustomers = this.users.size;

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
    };
  }
}

export const storage = new MemStorage();
