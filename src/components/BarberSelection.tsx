import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Barber {
  id: string;
  name: string;
  initials: string;
}

interface BarberSelectionProps {
  selected: Barber | null;
  onSelect: (barber: Barber) => void;
}

const BarberSelection = ({ selected, onSelect }: BarberSelectionProps) => {
  const [barbers, setBarbers] = useState<Barber[]>([]);

  useEffect(() => {
    async function loadBarbers() {
      const { data, error } = await supabase
        .from("Barbeiros")
        .select("*")
        .eq("ativo", true);

      if (error) {
        console.error("Erro ao carregar barbeiros:", error);
        return;
      }

      if (data) {
        const formatted = data.map((barber: any) => ({
          id: String(barber.id),
          name: barber.nome,
          initials: barber.nome
            .split(" ")
            .map((w: string) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase(),
        }));

        setBarbers(formatted);
      }
    }

    loadBarbers();
  }, []);

  return (
    <div>
      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans block mb-6">
        Escolha o profissional
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {barbers.map((barber, i) => (
          <motion.button
            key={barber.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: i * 0.05,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(barber)}
            data-selected={selected?.id === barber.id}
            className="flex flex-col items-center p-6 rounded-xl bg-card shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5 data-[selected=true]:ring-1 data-[selected=true]:ring-accent"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-3">
              <span className="text-sm font-sans font-medium text-secondary-foreground">
                {barber.initials}
              </span>
            </div>

            <span className="font-sans font-medium text-foreground text-sm">
              {barber.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default BarberSelection;
