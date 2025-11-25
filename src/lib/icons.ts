import { Bot, Code, Database, User, Building2, Brain, ShieldCheck, Monitor, PawPrint, Globe, Smartphone, Cloud, Server, Cpu, Activity, Zap, Layers, Box, Hash, Circle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
    Bot, Code, Database, User, Building2, Brain, ShieldCheck, Monitor, PawPrint,
    Globe, Smartphone, Cloud, Server, Cpu, Activity, Zap, Layers, Box
};

export const getIconByKey = (key: string): LucideIcon => {
    return ICON_MAP[key] || Circle; // Default to Circle if not found
};
