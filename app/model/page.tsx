"use client";

import dynamic from "next/dynamic";

const ThreeScene = dynamic(() => import("@/threescene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-white/60">
      Initializing HPC rack scene…
    </div>
  ),
});

export default function ModelTestPage() {
  return (
    <div className="min-h-screen bg-[#01040b] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%)]" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-6 pb-16 pt-10 lg:px-10">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/70">
            Model sandbox
          </p>
          <div>
            <h1 className="text-4xl font-semibold">
              HPC rack · marker testing route
            </h1>
            <p className="mt-2 max-w-3xl text-base text-white/70">
              Private route for iterating on marker placement and labeling
              against the GLTF rack pulled from <code>/public/scene.gltf</code>.
              Adjust positions directly in <code>threescene.tsx</code> as you
              tune annotations.
            </p>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <ThreeScene />
        </section>
      </div>
    </div>
  );
}
