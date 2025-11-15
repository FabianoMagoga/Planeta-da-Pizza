import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
const PlanetCard = ({ icon, name, description, planetColor, delay = "0s" }) => {
    return (_jsxs(Card, { className: cn("relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 glow-planet", "bg-card/50 backdrop-blur-sm hover:border-accent"), style: { animationDelay: delay }, children: [_jsx("div", { className: "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30", style: { backgroundColor: planetColor } }), _jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center gap-4 mb-2", children: [_jsx("div", { className: cn("p-4 rounded-full text-4xl transition-transform duration-300 hover:rotate-12", "bg-gradient-to-br from-card to-muted"), children: icon }), _jsx(CardTitle, { className: "text-2xl font-bold", children: name })] }), _jsx(CardDescription, { className: "text-base text-muted-foreground", children: description })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-1 w-full bg-gradient-to-r from-transparent via-accent to-transparent rounded-full" }) })] }));
};
export default PlanetCard;
//# sourceMappingURL=PlanetCard.js.map