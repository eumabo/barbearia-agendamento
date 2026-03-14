import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Service {
  id: string;
  nome: string;
  duracao: string;
  preco: number;
  description: string;
}

interface ServiceSelectionProps {
  selected: Service | null;
  onSelect: (service: Service) => void;
}

const ServiceSelection = ({ selected, onSelect }: ServiceSelectionProps) => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    async function loadServices() {
      const { data, error } = await supabase
        .from("servicos")
        .select("*");

      if (error) {
        console.error("Erro ao carregar serviços:", error);
        return;
      }

      if (data) {
        setServices(data);
      }
    }

    loadServices();
  }, []);

  return (
    <div className="space-y-3">
      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans block mb-6">
        Selecione o serviço
      </span>

      {services.map((service, i) => (
        <motion.button
          key={service.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: i * 0.05,
            ease: [0.16, 1, 0.3, 1],
          }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(service)}
          data-selected={selected?.id === service.id}
          className="w-full text-left p-6 rounded-xl bg-card shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5 data-[selected=true]:ring-1 data-[selected=true]:ring-accent"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-sans font-medium text-foreground">
              {service.nome}
            </span>
            <span className="font-sans tabular-nums text-foreground font-medium">
              R$ {service.preco}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-sans">
              {service.description}
            </span>

            <span className="text-xs text-muted-foreground font-sans ml-4 shrink-0">
              {service.duracao}
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  );
};

export default ServiceSelection;
