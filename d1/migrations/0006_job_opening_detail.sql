-- Job opening detail fields (responsibilities, nice-to-have, seniority, salary, remote, team note)
ALTER TABLE "job_openings" ADD COLUMN "responsibilities" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "job_openings" ADD COLUMN "nice_to_have" TEXT;
ALTER TABLE "job_openings" ADD COLUMN "seniority" TEXT;
ALTER TABLE "job_openings" ADD COLUMN "salary_range" TEXT;
ALTER TABLE "job_openings" ADD COLUMN "remote" TEXT;
ALTER TABLE "job_openings" ADD COLUMN "team_note" TEXT;

UPDATE "job_openings"
SET
    "description" = 'Map niche B2B markets, interview buyers, and turn findings into briefs that move pipeline.',
    "responsibilities" = '["Own a vertical and keep a living account of competitors and buying committees","Interview buyers and run desk research across the niche","Write intelligence for operators — not for slide theatre"]',
    "nice_to_have" = '["Experience in an unsexy, high-consideration B2B market","A published brief, memo, or equivalent writing sample"]',
    "seniority" = 'Mid-level',
    "remote" = 'Remote',
    "team_note" = 'Sits with Intelligence. Direct access to founders and client workstreams.'
WHERE "slug" = 'research-analyst';

UPDATE "job_openings"
SET
    "description" = 'Translate research into positioning, messaging, and go-to-market sequences for niche operators.',
    "responsibilities" = '["Tighten briefs between intelligence and delivery","Pressure-test offers and help clients act on the research","Sequence go-to-market work that operators can run"]',
    "nice_to_have" = '["Time in a specialist consultancy or operator-side product marketing role","Comfort presenting to founders and sales leaders"]',
    "seniority" = 'Associate',
    "remote" = 'Remote',
    "team_note" = 'Sits between Intelligence and delivery. Small-team, high-ownership work.'
WHERE "slug" = 'strategy-associate';
