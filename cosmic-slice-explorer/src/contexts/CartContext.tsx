import { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

type CartItem = {
  id: string;
  nome: string;
  categoria: "Pizza Salgadas" | "Pizza Doces" | "Bebida";
  preco: number;
  quantidade: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (produto: { id: string; nome: string; categoria: "Pizza Salgadas" | "Pizza Doces" | "Bebida"; preco: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantidade: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  console.log("CartProvider renderizado com", items.length, "itens");

  const addItem = (produto: { id: string; nome: string; categoria: "Pizza Salgadas" | "Pizza Doces" | "Bebida"; preco: number }) => {
    console.log("addItem chamado com:", produto);
    setItems((current) => {
      const existing = current.find((item) => item.id === produto.id);
      if (existing) {
        console.log("Item já existe no carrinho, aumentando quantidade");
        return current.map((item) =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      console.log("Adicionando novo item ao carrinho");
      return [...current, { ...produto, quantidade: 1 }];
    });
    
    toast({
      title: "Adicionado ao carrinho",
      description: `${produto.nome} foi adicionado ao seu pedido`,
    });
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantidade: number) => {
    if (quantidade <= 0) {
      removeItem(id);
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantidade } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantidade, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
