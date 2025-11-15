import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import Cart from "@/components/Cart";
const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const menuItems = [
        { label: "Início", href: "/", isRoute: true },
        { label: "Cardápio", href: "/menu", isRoute: true },
        { label: "Planetas", href: "#planetas", isRoute: false },
        { label: "Sobre", href: "#sobre", isRoute: false },
        { label: "Contato", href: "#contato", isRoute: false },
    ];
    const handleNavigation = (item) => {
        if (item.isRoute) {
            navigate(item.href);
            setIsMenuOpen(false);
        }
        else {
            if (location.pathname !== "/") {
                navigate("/");
                setTimeout(() => {
                    const element = document.querySelector(item.href);
                    if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                    }
                }, 100);
            }
            else {
                const element = document.querySelector(item.href);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }
            setIsMenuOpen(false);
        }
    };
    return (_jsx("header", { className: "fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsxs("div", { className: "flex items-center justify-between h-16", children: [_jsx("div", { className: "flex items-center", children: _jsx("h2", { className: "text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent", children: "Universo da Pizza" }) }), _jsxs("nav", { className: "hidden md:flex items-center space-x-8", children: [menuItems.map((item) => (_jsx("button", { onClick: () => handleNavigation(item), className: "text-foreground/80 hover:text-primary transition-colors font-medium", children: item.label }, item.label))), _jsx(Cart, {})] }), _jsxs("div", { className: "md:hidden flex items-center gap-2", children: [_jsx(Cart, {}), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => setIsMenuOpen(!isMenuOpen), "aria-label": "Toggle menu", children: isMenuOpen ? (_jsx(X, { className: "h-6 w-6" })) : (_jsx(Menu, { className: "h-6 w-6" })) })] })] }), isMenuOpen && (_jsx("nav", { className: "md:hidden py-4 space-y-2 animate-in slide-in-from-top", children: menuItems.map((item) => (_jsx("button", { onClick: () => handleNavigation(item), className: "block w-full text-left px-4 py-3 text-foreground/80 hover:text-primary hover:bg-accent/10 rounded-lg transition-colors font-medium", children: item.label }, item.label))) }))] }) }));
};
export default Header;
//# sourceMappingURL=Header.js.map