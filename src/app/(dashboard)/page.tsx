import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-2 max-w-xl text-sm text-slate-600">
        Las tarjetas de KPI y el gráfico por área están en la vista{" "}
        <Link
          href="/vacantes"
          className="font-medium text-orange-600 underline-offset-4 hover:underline"
        >
          Vacantes
        </Link>
        , encima de la tabla de posiciones.
      </p>
    </div>
  );
}
