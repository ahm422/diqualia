"use client";

import { useMemo, useState } from "react";

import { CareerRoleCard } from "./CareerRoleCard";

type Role = {
  id: number;
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
};

export function CareerRolesFilter({ roles }: { roles: Role[] }) {
  const departments = useMemo(
    () => Array.from(new Set(roles.map((r) => r.department).filter(Boolean))),
    [roles],
  );
  const [active, setActive] = useState<string>("All");

  const filtered =
    active === "All" ? roles : roles.filter((r) => r.department === active);

  return (
    <div>
      {departments.length > 1 ? (
        <div
          className="mt-8 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter roles by department"
        >
          {["All", ...departments].map((dept) => {
            const isActive = dept === active;
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setActive(dept)}
                aria-pressed={isActive}
                className="rounded-pill border px-4 py-2 text-[10px] tracking-[0.22em] uppercase transition-colors"
                style={
                  isActive
                    ? {
                        borderColor: "var(--gold)",
                        color: "var(--gold)",
                        background: "color-mix(in oklab, var(--gold) 8%, transparent)",
                      }
                    : {
                        borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
                        color: "var(--muted-foreground)",
                      }
                }
              >
                {dept}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((role) => (
          <CareerRoleCard
            key={role.id}
            slug={role.slug}
            title={role.title}
            department={role.department}
            type={role.type}
            location={role.location}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-[13px] text-muted-foreground">
          No roles in this team right now.
        </p>
      ) : null}
    </div>
  );
}
