// src/app/page.tsx
import Link from "next/link";
import { Droplets, Recycle, MapPinned, Trophy, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="space-y-24 py-6">
      {/* HERO */}
      <section className="relative">
        <div className="rise mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-xs font-semibold text-brand-700">
            <Droplets className="h-4 w-4" /> Community science for a cleaner planet
          </span>
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] text-ink sm:text-6xl">
            Map the litter.
            <br />
            <span className="text-brand-500">Mend the planet.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
            Every photo you take of trash in the wild becomes a data point in an open map of
            pollution powering cleanups, research, and policy. And you earn eco badges along the way.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-brand-500/25 transition hover:bg-brand-600"
            >
              Start contributing
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/map"
              className="rounded-full border border-brand-200 bg-white/70 px-7 py-3.5 text-base font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              Explore the map
            </Link>
          </div>
        </div>

        <div className="rise mx-auto mt-14 grid max-w-4xl grid-cols-3 gap-4" style={{ animationDelay: "0.15s" }}>
          {[
            { n: "8M tons", l: "of plastic enter the ocean each year" },
            { n: "1 photo", l: "is all it takes to add a data point" },
            { n: "100%", l: "open, community-owned dataset" },
          ].map((s) => (
            <div key={s.l} className="glass rounded-3xl p-5 text-center">
              <p className="font-display text-2xl font-bold text-brand-600">{s.n}</p>
              <p className="mt-1 text-xs text-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className="mx-auto max-w-4xl">
        <h2 className="text-center font-display text-3xl font-bold text-ink">Why BlueMind exists</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted">
          Pollution is invisible until it is measured. Most litter is never recorded, so cleanups
          happen blind and researchers lack ground-truth data. BlueMind turns ordinary people with
          phones into a global sensing network documenting what's out there, where, and how urgent it is.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Feature
            icon={MapPinned}
            title="Document"
            body="Snap a photo of any litter. AI identifies the type, material, and environmental impact in seconds."
          />
          <Feature
            icon={Recycle}
            title="Build the dataset"
            body="Each geotagged report joins an open map that NGOs, cities, and scientists can act on."
          />
          <Feature
            icon={Trophy}
            title="Get rewarded"
            body="Earn Bronze to Platinum badges, build streaks, and grow your Eco Score with every report."
          />
        </div>
      </section>

      {/* IMPACT */}
      <section className="mx-auto max-w-4xl">
        <div className="glass overflow-hidden rounded-[2rem] p-8 sm:p-12">
          <h2 className="font-display text-3xl font-bold text-ink">The impact of every report</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <p className="text-muted">
              A single bottle takes up to 450 years to break down. Documenting where it sits helps
              cleanup crews prioritize the most fragile ecosystems first waterways, coastlines, and
              habitats where wildlife is most at risk.
            </p>
            <p className="text-muted">
              As reports accumulate, patterns emerge: pollution hotspots, recurring waste types, and
              the effect of local policy. That evidence is what turns awareness into action.
            </p>
          </div>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
          >
            Join the movement <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
}) {
  return (
    <div className="glass rounded-3xl p-6">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-100 text-brand-600">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </div>
  );
}
