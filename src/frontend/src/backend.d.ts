import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Address {
    street: string;
    country: string;
    city: string;
    postalCode: bigint;
    recipient: string;
    state: string;
}
export interface Cart {
    items: Array<CartItem>;
}
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface Product {
    name: string;
    description: string;
    category: Category;
    price: bigint;
}
export enum Category {
    shirts = "shirts",
    jeans = "jeans",
    tshirts = "tshirts"
}
export interface backendInterface {
    addItemsToCart(newItems: Array<CartItem>): Promise<void>;
    addProduct(product: Product): Promise<void>;
    checkProductExists(productId: bigint): Promise<boolean>;
    clearCart(): Promise<void>;
    getCart(): Promise<Cart>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    placeOrder(shippingAddress: Address): Promise<{
        orderId: bigint;
        totalAmount: bigint;
    }>;
    refillCatalog(newProducts: Array<Product>): Promise<void>;
    removeItemFromCart(productId: bigint): Promise<void>;
}
