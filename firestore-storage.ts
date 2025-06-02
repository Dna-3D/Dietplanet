import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  writeBatch
} from "firebase/firestore";
import { db } from "../client/src/lib/firebase";
import { IStorage } from "./storage";
import {
  User,
  InsertUser,
  Category,
  InsertCategory,
  Product,
  InsertProduct,
  ProductWithCategory,
  CartItem,
  InsertCartItem,
  CartItemWithProduct,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem,
  OrderWithItems
} from "@shared/schema";

export class FirestoreStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const userRef = doc(db, "users", id.toString());
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? { id, ...userSnap.data() } as User : undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const q = query(collection(db, "users"), where("firebaseUid", "==", firebaseUid));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return undefined;
    
    const doc = querySnapshot.docs[0];
    return { id: parseInt(doc.id), ...doc.data() } as User;
  }

  async syncUser(userData: InsertUser): Promise<User> {
    // Check if user already exists
    const existingUser = await this.getUserByFirebaseUid(userData.firebaseUid);
    
    if (existingUser) {
      // Update existing user
      const userRef = doc(db, "users", existingUser.id.toString());
      await updateDoc(userRef, {
        email: userData.email,
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
      });
      return { ...existingUser, ...userData, displayName: userData.displayName || null, photoURL: userData.photoURL || null };
    } else {
      // Create new user
      const docRef = await addDoc(collection(db, "users"), {
        ...userData,
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        isAdmin: false,
        createdAt: new Date(),
      });
      return { 
        id: parseInt(docRef.id), 
        ...userData, 
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        isAdmin: false, 
        createdAt: new Date() 
      };
    }
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    const querySnapshot = await getDocs(collection(db, "categories"));
    return querySnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as Category));
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const docRef = await addDoc(collection(db, "categories"), categoryData);
    return { id: parseInt(docRef.id), ...categoryData };
  }

  // Product methods
  async getProducts(): Promise<ProductWithCategory[]> {
    const productsSnapshot = await getDocs(collection(db, "products"));
    const categoriesSnapshot = await getDocs(collection(db, "categories"));
    
    const categories = new Map();
    categoriesSnapshot.docs.forEach(doc => {
      categories.set(parseInt(doc.id), { id: parseInt(doc.id), ...doc.data() });
    });

    return productsSnapshot.docs.map(doc => {
      const product = { id: parseInt(doc.id), ...doc.data() } as Product;
      const category = categories.get(product.categoryId);
      return { ...product, category } as ProductWithCategory;
    });
  }

  async getProduct(id: number): Promise<ProductWithCategory | undefined> {
    const productRef = doc(db, "products", id.toString());
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) return undefined;
    
    const product = { id, ...productSnap.data() } as Product;
    
    // Get category
    const categoryRef = doc(db, "categories", product.categoryId.toString());
    const categorySnap = await getDoc(categoryRef);
    const category = categorySnap.exists() ? { id: product.categoryId, ...categorySnap.data() } as Category : undefined;
    
    return { ...product, category };
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const docRef = await addDoc(collection(db, "products"), productData);
    return { id: parseInt(docRef.id), ...productData };
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const productRef = doc(db, "products", id.toString());
    await updateDoc(productRef, updates);
    
    const updatedSnap = await getDoc(productRef);
    return { id, ...updatedSnap.data() } as Product;
  }

  async deleteProduct(id: number): Promise<void> {
    await deleteDoc(doc(db, "products", id.toString()));
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItemWithProduct[]> {
    const q = query(collection(db, "cartItems"), where("userId", "==", userId));
    const cartSnapshot = await getDocs(q);
    
    const cartItems: CartItemWithProduct[] = [];
    
    for (const cartDoc of cartSnapshot.docs) {
      const cartItem = { id: parseInt(cartDoc.id), ...cartDoc.data() } as CartItem;
      
      // Get product details
      const productRef = doc(db, "products", cartItem.productId.toString());
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        const product = { id: cartItem.productId, ...productSnap.data() } as Product;
        cartItems.push({ ...cartItem, product });
      }
    }
    
    return cartItems;
  }

  async addToCart(cartItemData: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const q = query(
      collection(db, "cartItems"), 
      where("userId", "==", cartItemData.userId),
      where("productId", "==", cartItemData.productId)
    );
    const existingItems = await getDocs(q);
    
    if (!existingItems.empty) {
      // Update existing item quantity
      const existingDoc = existingItems.docs[0];
      const existingItem = { id: parseInt(existingDoc.id), ...existingDoc.data() } as CartItem;
      const newQuantity = existingItem.quantity + cartItemData.quantity;
      
      await updateDoc(doc(db, "cartItems", existingDoc.id), { quantity: newQuantity });
      return { ...existingItem, quantity: newQuantity };
    } else {
      // Add new item
      const docRef = await addDoc(collection(db, "cartItems"), cartItemData);
      return { id: parseInt(docRef.id), ...cartItemData };
    }
  }

  async updateCartItem(id: number, updates: Partial<InsertCartItem>): Promise<CartItem> {
    const cartRef = doc(db, "cartItems", id.toString());
    await updateDoc(cartRef, updates);
    
    const updatedSnap = await getDoc(cartRef);
    return { id, ...updatedSnap.data() } as CartItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await deleteDoc(doc(db, "cartItems", id.toString()));
  }

  async clearCart(userId: number): Promise<void> {
    const q = query(collection(db, "cartItems"), where("userId", "==", userId));
    const cartSnapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    cartSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }

  // Order methods
  async getOrders(): Promise<OrderWithItems[]> {
    const ordersSnapshot = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
    const orders: OrderWithItems[] = [];
    
    for (const orderDoc of ordersSnapshot.docs) {
      const order = { id: parseInt(orderDoc.id), ...orderDoc.data() } as Order;
      
      // Get order items
      const itemsQuery = query(collection(db, "orderItems"), where("orderId", "==", order.id));
      const itemsSnapshot = await getDocs(itemsQuery);
      
      const items = [];
      for (const itemDoc of itemsSnapshot.docs) {
        const orderItem = { id: parseInt(itemDoc.id), ...itemDoc.data() } as OrderItem;
        
        // Get product details
        const productRef = doc(db, "products", orderItem.productId.toString());
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          const product = { id: orderItem.productId, ...productSnap.data() } as Product;
          items.push({ ...orderItem, product });
        }
      }
      
      orders.push({ ...order, items });
    }
    
    return orders;
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const orderRef = doc(db, "orders", id.toString());
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) return undefined;
    
    const order = { id, ...orderSnap.data() } as Order;
    
    // Get order items
    const itemsQuery = query(collection(db, "orderItems"), where("orderId", "==", id));
    const itemsSnapshot = await getDocs(itemsQuery);
    
    const items = [];
    for (const itemDoc of itemsSnapshot.docs) {
      const orderItem = { id: parseInt(itemDoc.id), ...itemDoc.data() } as OrderItem;
      
      // Get product details
      const productRef = doc(db, "products", orderItem.productId.toString());
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        const product = { id: orderItem.productId, ...productSnap.data() } as Product;
        items.push({ ...orderItem, product });
      }
    }
    
    return { ...order, items };
  }

  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const batch = writeBatch(db);
    
    // Create order
    const orderRef = doc(collection(db, "orders"));
    const orderId = parseInt(orderRef.id);
    batch.set(orderRef, { ...orderData, createdAt: new Date() });
    
    // Create order items
    items.forEach(item => {
      const itemRef = doc(collection(db, "orderItems"));
      batch.set(itemRef, { ...item, orderId });
    });
    
    await batch.commit();
    
    return { id: orderId, ...orderData, createdAt: new Date() };
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const orderRef = doc(db, "orders", id.toString());
    await updateDoc(orderRef, { status });
    
    const updatedSnap = await getDoc(orderRef);
    return { id, ...updatedSnap.data() } as Order;
  }

  // Analytics
  async getAnalytics(): Promise<{ totalRevenue: number; totalOrders: number; totalCustomers: number }> {
    const ordersSnapshot = await getDocs(collection(db, "orders"));
    const usersSnapshot = await getDocs(collection(db, "users"));
    
    let totalRevenue = 0;
    ordersSnapshot.docs.forEach(doc => {
      const order = doc.data() as Order;
      totalRevenue += order.total;
    });
    
    return {
      totalRevenue,
      totalOrders: ordersSnapshot.size,
      totalCustomers: usersSnapshot.size,
    };
  }

  // Initialize with sample data
  async initializeData(): Promise<void> {
    // Check if data already exists
    const categoriesSnapshot = await getDocs(collection(db, "categories"));
    if (!categoriesSnapshot.empty) return; // Data already exists

    // Add sample categories
    const pizzaCategory = await this.createCategory({
      name: "Pizza",
      description: "Fresh, handcrafted pizzas with premium toppings"
    });

    const snacksCategory = await this.createCategory({
      name: "Snacks",
      description: "Healthy and delicious snacks for any time of day"
    });

    const beveragesCategory = await this.createCategory({
      name: "Beverages",
      description: "Refreshing drinks to complement your meal"
    });

    // Add sample products
    const sampleProducts = [
      {
        name: "Pepperoni Classic",
        description: "Traditional pepperoni pizza with mozzarella cheese and our signature tomato sauce",
        price: 7500,
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
        categoryId: pizzaCategory.id,
        inStock: true
      },
      {
        name: "Margherita Fresh",
        description: "Fresh basil, mozzarella, and tomatoes on our homemade pizza base",
        price: 6800,
        imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400",
        categoryId: pizzaCategory.id,
        inStock: true
      },
      {
        name: "Veggie Delight",
        description: "Bell peppers, onions, mushrooms, and olives with cheese",
        price: 7200,
        imageUrl: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400",
        categoryId: pizzaCategory.id,
        inStock: true
      },
      {
        name: "Protein Energy Balls",
        description: "Homemade energy balls with nuts, dates, and protein powder",
        price: 2500,
        imageUrl: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400",
        categoryId: snacksCategory.id,
        inStock: true
      },
      {
        name: "Fresh Fruit Smoothie",
        description: "Blended fresh fruits with yogurt and honey",
        price: 1800,
        imageUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400",
        categoryId: beveragesCategory.id,
        inStock: true
      }
    ];

    for (const product of sampleProducts) {
      await this.createProduct(product);
    }
  }
}