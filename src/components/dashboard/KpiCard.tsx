import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

type KpiCardProps = {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  subValue?: string;
};

const KpiCard = ({ label, value, icon, subValue }: KpiCardProps) => {
  return (
    <Card className="group relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl border-none bg-linear-to-br from-card/80 to-card/40 backdrop-blur-xl">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
          {label}
        </CardTitle>
        <div className="p-2 rounded-xl bg-primary/5 text-primary transition-all duration-500">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-1 relative z-10">
        <div className="text-4xl font-black tabular-nums tracking-tighter transition-transform duration-500 group-hover:translate-x-1">{value}</div>
        {subValue ? (
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 transition-opacity duration-500 group-hover:opacity-100">{subValue}</p>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
