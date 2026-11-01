import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminApp } from "./admin-app";

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted">Učitavanje…</p>}>
      <AdminGate />
    </Suspense>
  );
}

async function AdminGate() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [bookings, prices] = await Promise.all([db.listBookings(), db.listDayPrices()]);
  return <AdminApp initialBookings={bookings} initialPrices={prices} />;
}
