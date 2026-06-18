import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedCart = localStorage.getItem('invenio_cart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                // Check if the cart uses the old format (has product_id instead of product object)
                if (parsed.length > 0 && !parsed[0].product && parsed[0].product_id) {
                    localStorage.removeItem('invenio_cart');
                    setCart([]);
                } else {
                    setCart(parsed);
                }
            } catch (e) {
                console.error("Could not parse cart", e);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('invenio_cart', JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    const addToCart = (product, variant = null, quantity = 1) => {
        setCart(prev => {
            const existingItemIndex = prev.findIndex(item => 
                item.product.id === product.id && 
                (item.variant ? item.variant.id : null) === (variant ? variant.id : null)
            );

            if (existingItemIndex >= 0) {
                const newCart = [...prev];
                newCart[existingItemIndex].quantity += quantity;
                return newCart;
            } else {
                return [...prev, { product, variant, quantity }];
            }
        });
        toast.success("Added to cart!");
        setIsCartOpen(true);
    };

    const removeFromCart = (productId, variantId = null) => {
        setCart(prev => prev.filter(item => 
            !(item.product.id === productId && (item.variant ? item.variant.id : null) === variantId)
        ));
    };

    const updateQuantity = (productId, variantId = null, newQuantity) => {
        if (newQuantity < 1) return;
        setCart(prev => prev.map(item => {
            if (item.product.id === productId && (item.variant ? item.variant.id : null) === variantId) {
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartSubtotal = cart.reduce((total, item) => {
        const price = item.variant ? parseFloat(item.variant.price) : parseFloat(item.product.price);
        return total + (price * item.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{ 
            cart, addToCart, removeFromCart, updateQuantity, clearCart, 
            cartCount, cartSubtotal, isCartOpen, setIsCartOpen 
        }}>
            {children}
        </CartContext.Provider>
    );
};
