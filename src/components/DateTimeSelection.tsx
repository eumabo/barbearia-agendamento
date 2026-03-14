import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30",
];

interface DateTimeSelectionProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectDate: (date: Date) => void;
  onSelectTime: (time: string) => void;
}

const DateTimeSelection = ({ selectedDate, selectedTime, onSelectDate, onSelectTime }: DateTimeSelectionProps) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const today = startOfDay(new Date());

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(today, weekOffset * 7 + i));
  }, [weekOffset, today]);

  return (
    <div>
      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans block mb-6">
        Data e horário
      </span>

      {/* Date picker */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))} disabled={weekOffset === 0}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-sans text-muted-foreground capitalize">
          {format(days[0], "MMMM yyyy", { locale: ptBR })}
        </span>
        <Button variant="ghost" size="icon" onClick={() => setWeekOffset(weekOffset + 1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-8">
        {days.map((day, i) => (
          <motion.button
            key={day.toISOString()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectDate(day)}
            data-selected={selectedDate ? isSameDay(day, selectedDate) : false}
            className="flex flex-col items-center py-3 rounded-lg transition-all hover:bg-secondary data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
          >
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans data-[selected=true]:text-accent-foreground">
              {format(day, "EEE", { locale: ptBR }).slice(0, 3)}
            </span>
            <span className="text-sm font-sans font-medium mt-0.5">
              {format(day, "d")}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans block mb-4">
            Horários disponíveis
          </span>
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map((time, i) => (
              <motion.button
                key={time}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectTime(time)}
                data-selected={selectedTime === time}
                className="py-3 text-sm font-sans tabular-nums rounded-lg border border-border bg-card hover:bg-secondary transition-all data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[selected=true]:border-accent"
              >
                {time}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DateTimeSelection;
