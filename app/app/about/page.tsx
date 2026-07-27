"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ClientLogo, CLIENTS_WITH_LOGO } from "@/components/ClientLogo";
import { ABOUT_COPY, ABOUT_CLIENTS } from "@/lib/about-copy";

export default function AboutPage() {
  return (
    <>
      <Header />

      <main className="flex-grow relative z-10 flex flex-col items-center px-5 md:px-16 pt-32 pb-16">
        {/* Hero */}
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-5xl font-extrabold tracking-tight text-primary animate-fade-in-up md:text-6xl">
            {ABOUT_COPY.hero.name}
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-secondary animate-fade-in-up delay-100">
            {ABOUT_COPY.hero.intro}
          </p>
        </section>

        {/* Journey */}
        <section className="mx-auto mt-24 max-w-3xl md:mt-32">
          <h2 className="mb-6 font-heading text-3xl font-extrabold text-primary md:text-4xl">
            {ABOUT_COPY.journey.title}
          </h2>
          <p className="text-lg leading-relaxed text-secondary">
            {ABOUT_COPY.journey.body}
          </p>
        </section>

        {/* Visionary */}
        <section className="mx-auto mt-20 max-w-3xl">
          <h2 className="mb-6 font-heading text-3xl font-extrabold text-primary md:text-4xl">
            {ABOUT_COPY.visionary.title}
          </h2>
          <p className="text-lg leading-relaxed text-secondary">
            {ABOUT_COPY.visionary.body}
          </p>
        </section>

        {/* Mission */}
        <section className="mx-auto mt-20 max-w-3xl">
          <h2 className="mb-6 font-heading text-3xl font-extrabold text-primary md:text-4xl">
            {ABOUT_COPY.mission.title}
          </h2>
          <p className="text-lg leading-relaxed text-secondary">
            {ABOUT_COPY.mission.body}
          </p>
        </section>

        {/* Notable Clients and Collaborations */}
        <section className="mx-auto mt-20 max-w-4xl">
          <h2 className="mb-10 text-center font-heading text-3xl font-extrabold text-primary md:text-4xl">
            {ABOUT_COPY.clients.title}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {ABOUT_CLIENTS.map((client) => (
              <div
                key={client}
                className="card flex items-center justify-center rounded-lg px-4 py-6 text-center"
              >
                {CLIENTS_WITH_LOGO.has(client) ? (
                  <ClientLogo name={client} className="h-8 w-auto text-secondary" />
                ) : (
                  <span className="font-heading text-sm font-bold text-secondary">
                    {client}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
