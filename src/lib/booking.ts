import { supabase } from "./supabase";

export const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
];

export type AppointmentRow = {
  id: string;
  barber_id: string;
  barber_name?: string | null;
  appointment_date: string;
  appointment_time: string;
  status: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  service_name?: string | null;
  notes?: string | null;
  created_at?: string | null;
};

export function dateToDb(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeRow(row: any): AppointmentRow {
  return {
    id: row.id,
    barber_id: String(row.barber_id ?? ""),
    barber_name: row.barber_name ?? null,
    appointment_date: row.appointment_date ?? row.date ?? "",
    appointment_time: row.appointment_time ?? row.time ?? "",
    status: row.status ?? "confirmado",
    customer_name: row.customer_name ?? null,
    customer_phone: row.customer_phone ?? null,
    service_name: row.service_name ?? null,
    notes: row.notes ?? null,
    created_at: row.created_at ?? null,
  };
}

export async function fetchBusySlots(barberId: string, date: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select("id, barber_id, barber_name, appointment_date, appointment_time, date, time, status")
    .eq("barber_id", barberId)
    .or(`appointment_date.eq.${date},date.eq.${date}`)
    .in("status", ["confirmado", "bloqueado"]);

  if (error) {
    throw new Error(error.message || "Erro ao buscar horários ocupados.");
  }

  return (data || []).map((row: any) => ({
    appointment_time: row.appointment_time ?? row.time,
    status: row.status,
  }));
}

export async function createBooking(data: {
  barber_id: string;
  barber_name?: string;
  date: string;
  time: string;
  customer_name?: string;
  customer_phone?: string;
  service_name?: string;
  notes?: string | null;
}) {
  const payload = {
    barber_id: data.barber_id,
    barber_name: data.barber_name ?? null,
    appointment_date: data.date,
    appointment_time: data.time,
    date: data.date,
    time: data.time,
    status: "confirmado",
    customer_name: data.customer_name ?? null,
    customer_phone: data.customer_phone ?? null,
    service_name: data.service_name ?? null,
    notes: data.notes ?? null,
  };

  const { error } = await supabase.from("appointments").insert(payload);

  if (error) {
    const msg = error.message?.toLowerCase() || "";
    const code = error.code || "";

    if (
      code === "23505" ||
      msg.includes("unique") ||
      msg.includes("duplicate")
    ) {
      throw new Error("Esse horário já foi reservado por outra pessoa.");
    }

    throw new Error(error.message || "Erro ao agendar.");
  }
}

export async function createAppointment(data: {
  barber_id: string;
  barber_name?: string;
  date: string;
  time: string;
  customer_name?: string;
  customer_phone?: string;
  service_name?: string;
  notes?: string | null;
}) {
  return createBooking(data);
}

export async function createAdminBlock(data: {
  barber_id: string;
  barber_name?: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string | null;
}) {
  const payload = {
    barber_id: data.barber_id,
    barber_name: data.barber_name ?? null,
    appointment_date: data.appointment_date,
    appointment_time: data.appointment_time,
    date: data.appointment_date,
    time: data.appointment_time,
    status: "bloqueado",
    customer_name: "Bloqueado",
    customer_phone: null,
    service_name: "Bloqueio administrativo",
    notes: data.notes ?? null,
  };

  const { error } = await supabase.from("appointments").insert(payload);

  if (error) {
    const msg = error.message?.toLowerCase() || "";
    const code = error.code || "";

    if (
      code === "23505" ||
      msg.includes("unique") ||
      msg.includes("duplicate")
    ) {
      throw new Error("Esse horário já está ocupado ou bloqueado.");
    }

    throw new Error(error.message || "Erro ao bloquear horário.");
  }
}

export async function blockTime(
  barber_id: string,
  date: string,
  time: string
) {
  return createAdminBlock({
    barber_id,
    appointment_date: date,
    appointment_time: time,
    notes: null,
  });
}

export async function cancelAppointment(id: string) {
  const { error } = await supabase
    .from("appointments")
    .update({ status: "cancelado" })
    .eq("id", id);

  if (error) {
    throw new Error(error.message || "Erro ao cancelar agendamento.");
  }
}

export async function fetchAdminAppointments(date: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .or(`appointment_date.eq.${date},date.eq.${date}`);

  if (error) {
    throw new Error(error.message || "Erro ao carregar agenda administrativa.");
  }

  const normalized = (data || []).map(normalizeRow);

  return normalized.sort((a, b) =>
    a.appointment_time.localeCompare(b.appointment_time)
  );
}

export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message || "Erro ao entrar como admin.");
  }

  return data;
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message || "Erro ao sair.");
  }
}

export async function getAdminSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message || "Erro ao verificar sessão.");
  }

  return data.session;
}

export async function checkIsAdmin() {
  const session = await getAdminSession();

  if (!session?.user?.id) return false;

  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Erro ao validar admin.");
  }

  return !!data;
}