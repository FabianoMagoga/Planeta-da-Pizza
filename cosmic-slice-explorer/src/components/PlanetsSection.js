import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PlanetCard from "./PlanetCard";
const PlanetsSection = () => {
    const planets = [
        {
            icon: "🌍",
            name: "Terra",
            description: "O planeta das pizzas salgadas, onde os ingredientes se unem em perfeita harmonia.",
            planetColor: "hsl(210 70% 55%)",
            delay: "0s"
        },
        {
            icon: "🔴",
            name: "Marte",
            description: "Lar das pizzas doces, criadas para quem ama aventuras açucaradas.",
            planetColor: "hsl(15 85% 60%)",
            delay: "0.2s"
        },
        {
            icon: "🪐",
            name: "Saturno",
            description: "O reino dos combos especiais, perfeitos para compartilhar em qualquer galáxia.",
            planetColor: "hsl(45 75% 65%)",
            delay: "0.4s"
        },
        {
            icon: "🪩",
            name: "Júpiter",
            description: "Gigante das bebidas, refrescantes como um mergulho no espaço sideral.",
            planetColor: "hsl(35 70% 58%)",
            delay: "0.6s"
        },
        {
            icon: "☿️",
            name: "Mercúrio",
            description: "O planeta mais veloz, cheio de cupons e promoções que passam como cometas!",
            planetColor: "hsl(0 70% 65%)",
            delay: "0.8s"
        }
    ];
    return (_jsx("section", { id: "planetas", className: "py-20 px-4 relative", children: _jsxs("div", { className: "container mx-auto", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h2", { className: "text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent", children: "Nossos Planetas" }), _jsx("p", { className: "text-xl text-muted-foreground max-w-2xl mx-auto", children: "Explore cada mundo de sabores em nosso sistema solar gastron\u00F4mico" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto", children: planets.map((planet, index) => (_jsx("div", { className: "animate-float", style: { animationDelay: planet.delay }, children: _jsx(PlanetCard, { ...planet }) }, planet.name))) })] }) }));
};
export default PlanetsSection;
//# sourceMappingURL=PlanetsSection.js.map