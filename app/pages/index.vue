<template>
  <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
    <SectionPanel class="app-hero">
      <template #header>
        <div>
          <p class="text-sm uppercase tracking-[0.25em] text-emerald-300/80">Guom AI</p>
          <h1 class="mt-2 text-4xl font-semibold text-white sm:text-5xl">Build sessions, review plans, and ship blends faster.</h1>
        </div>
      </template>

      <div class="grid gap-5">
        <p class="max-w-2xl text-base leading-7 text-slate-300">
          A clean workspace for prompt-driven sessions with cookie-based auth, file context, plan review, and blended output.
        </p>

        <div class="flex flex-wrap gap-3">
          <UButton color="primary" size="lg" to="/login">Sign in</UButton>
          <UButton color="neutral" variant="soft" size="lg" to="/signup">Create account</UButton>
          <UButton color="neutral" variant="ghost" size="lg" to="/app">Open workspace</UButton>
        </div>
      </div>
    </SectionPanel>

    <SectionPanel>
      <template #header>
        <div>
          <h2 class="text-lg font-semibold text-white">What this frontend covers</h2>
          <p class="text-sm text-slate-400">Mapped directly to your API and mockup.</p>
        </div>
      </template>

      <ul class="grid gap-3 text-sm text-slate-300">
        <li class="rounded-xl border border-white/5 bg-white/3 px-4 py-3">Auth: signup, signin, refresh, signout, profile</li>
        <li class="rounded-xl border border-white/5 bg-white/3 px-4 py-3">Sessions: start, list, status polling</li>
        <li class="rounded-xl border border-white/5 bg-white/3 px-4 py-3">Plans: fetch, review, approve</li>
        <li class="rounded-xl border border-white/5 bg-white/3 px-4 py-3">Outputs: cursor-based blends list</li>
      </ul>
    </SectionPanel>
  </div>
</template>
