import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBooking } from "@/lib/booking";

interface ConfirmationFormProps {
  onConfirm?: (name: string, phone: string) => Promise<void> | void;
  isSubmitting: boolean;
  selectedService: {
    nome: string;
    preco?: number;
  };
  selectedBarber: {
  id: string;
  name: string;
  };
  selectedDate: Date | null;
  selectedTime: string;
}

const ConfirmationForm = ({
  onConfirm,
  isSubmitting,
  selectedService,
  selectedBarber,
  selectedDate,
  selectedTime,
}: ConfirmationFormProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) return;

    try {
     await createBooking({
  barber_id: selectedBarber.id,
  barber_name: selectedBarber.name,
  date: selectedDate?.toISOString().split("T")[0] || "",
  time: selectedTime,
  customer_name: name.trim(),
  customer_phone: phone.trim(),
  service_name: selectedService?.nome ?? "Não informado",
});
      if (onConfirm) {
        await onConfirm(name.trim(), phone.trim());
      }

      const formattedDate = selectedDate
        ? selectedDate.toLocaleDateString("pt-BR")
        : "Data não informada";

      const message = `Olá! Gostaria de confirmar meu agendamento na barbearia do Marcin.

👤 Nome: ${name}
📱 WhatsApp: ${phone}

💈 Serviço: ${selectedService?.nome ?? "Não informado"}
✂️ Profissional: ${selectedBarber?.name ?? "Não informado"}
📅 Data: ${formattedDate}
⏰ Horário: ${selectedTime || "Não informado"}

Obrigado!`;

      const url = `https://wa.me/5527999769394?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    } catch (err: any) {
      alert(err.message || "Esse horário já foi reservado!");
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans block">
        Seus dados
      </span>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-sans text-muted-foreground mb-1.5 block">
            Nome
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            required
            className="bg-input border-0 focus-visible:ring-1 focus-visible:ring-foreground rounded-lg h-12"
          />
        </div>

        <div>
          <label className="text-xs font-sans text-muted-foreground mb-1.5 block">
            WhatsApp
          </label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(27) 99999-9999"
            required
            className="bg-input border-0 focus-visible:ring-1 focus-visible:ring-foreground rounded-lg h-12"
          />
        </div>
      </div>

      <Button
        variant="hero"
        size="xl"
        type="submit"
        className="w-full"
        disabled={isSubmitting || !name.trim() || !phone.trim()}
      >
        {isSubmitting ? "Reservando..." : "Confirmar agendamento"}
      </Button>
    </motion.form>
  );
};

export default ConfirmationForm;