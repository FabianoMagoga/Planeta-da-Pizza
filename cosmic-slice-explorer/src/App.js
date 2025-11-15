import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();
const App = () => (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(TooltipProvider, { children: _jsxs(CartProvider, { children: [_jsx(Toaster, {}), _jsx(Sonner, {}), _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Index, {}) }), _jsx(Route, { path: "/menu", element: _jsx(Menu, {}) }), _jsx(Route, { path: "/checkout", element: _jsx(Checkout, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }) })] }) }) }));
export default App;
//# sourceMappingURL=App.js.map