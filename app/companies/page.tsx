import Link from "next/link";
import { prisma } from "../../src/lib/db";

export default async function CompaniesIndex() {
  const companies = await prisma.company.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Companies</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {companies.map(c => (
          <Link key={c.id} href={`/companies/${c.slug}`} className="card hover:bg-gray-50">{c.name}</Link>
        ))}
      </div>
    </div>
  );
}
