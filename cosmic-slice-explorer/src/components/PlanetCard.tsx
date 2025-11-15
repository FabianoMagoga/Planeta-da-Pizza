import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PlanetCardProps {
  icon: ReactNode;
  name: string;
  description: string;
  planetColor: string;
  delay?: string;
}

const PlanetCard = ({ icon, name, description, planetColor, delay = "0s" }: PlanetCardProps) => {
  return (
    <Card 
      className={cn(
        "relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 glow-planet",
        "bg-card/50 backdrop-blur-sm hover:border-accent"
      )}
      style={{ animationDelay: delay }}
    >
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: planetColor }}
      />
      
      <CardHeader>
        <div className="flex items-center gap-4 mb-2">
          <div className={cn(
            "p-4 rounded-full text-4xl transition-transform duration-300 hover:rotate-12",
            "bg-gradient-to-br from-card to-muted"
          )}>
            {icon}
          </div>
          <CardTitle className="text-2xl font-bold">{name}</CardTitle>
        </div>
        <CardDescription className="text-base text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-accent to-transparent rounded-full" />
      </CardContent>
    </Card>
  );
};

export default PlanetCard;
