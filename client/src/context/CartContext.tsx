import { createContext } from "react";
import type { CartItem, Product } from "../types";

interface CartContextType {
    items: CartItem[];
    addToCart : (product: Product, quantity?: number) => void;
    removeFromCart : (productId: string) => void;
    updateQuantity : (productId: string, quantity: number) => void;
    clearCart : () => void;
    cartCount : number;
    cartTotal : number;
    isCartOpen : boolean;
    setIsCartOpen : (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined)


export function CartProvider({children} : {})