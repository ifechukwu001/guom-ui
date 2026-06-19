<template>
  <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
    <SectionPanel class="app-hero">
      <template #header>
        <div>
          <p class="text-sm uppercase tracking-[0.25em] text-emerald-300/80">
            Guom AI
          </p>
          <h1 class="mt-2 text-4xl font-semibold text-white sm:text-5xl">
            Start sessions, review plans, and enjoy reading blends of your
            documents.
          </h1>
        </div>
      </template>

      <div class="grid gap-5">
        <p class="max-w-2xl text-base leading-7 text-slate-300">
          Guom AI is an AI Agent that reads for you. It can read your documents
          and summarize them into blends, which you can then review and approve.
          You can also start sessions to have the AI read your documents in
          real-time.
        </p>

        <div class="flex flex-wrap gap-3">
          <UButton color="neutral" variant="soft" size="lg" to="/signup"
            >Get Started</UButton
          >
          <UButton color="neutral" variant="ghost" size="lg" to="/app"
            >Start Blending</UButton
          >
        </div>
      </div>
    </SectionPanel>

    <SectionPanel>
      <template #header>
        <div>
          <h2 class="text-lg font-semibold text-white">Features</h2>
          <p class="text-sm text-slate-400">
            Guom AI is built on top of the Guom API, which provides a set of
            endpoints for managing sessions, plans, and outputs.
          </p>
        </div>
      </template>

      <ul class="grid gap-3 text-sm text-slate-300">
        <li class="rounded-xl border border-white/5 bg-white/3 px-4 py-3">
          Sessions: real-time reading of documents
        </li>
        <li class="rounded-xl border border-white/5 bg-white/3 px-4 py-3">
          Plans: manage your reading plans
        </li>
        <li class="rounded-xl border border-white/5 bg-white/3 px-4 py-3">
          Outputs: review and approve blends
        </li>
      </ul>
    </SectionPanel>
  </div>
</template>
