import EventList from "@/components/EventList";

const features = [
  {
    title: "Discover opportunities",
    description:
      "Explore workshops, seminars and competitions across your campus.",
  },
  {
    title: "Connect with your community",
    description:
      "Meet students who share your interests and learn together.",
  },
  {
    title: "Develop your skills",
    description:
      "Learn beyond the classroom through practical campus activities.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="badge badge-outline border-indigo-400 text-indigo-200">
              Your campus. Your community.
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-6xl">
              Make your campus life
              <span className="text-indigo-300"> unforgettable.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Discover exciting events, learn new skills and connect with
              your campus community—all in one place.
            </p>

            <a href="#events" className="btn btn-primary mt-8">
              Explore Events
            </a>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/5 p-6 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-300">
              Find your next experience
            </p>

            <div className="mt-6 space-y-4">
              {[
                ["Workshops", "Learn by doing"],
                ["Competitions", "Challenge yourself"],
                ["Seminars", "Explore new ideas"],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <h2 className="text-xl font-bold">{title}</h2>
                  <p className="mt-1 text-slate-300">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="events"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16"
      >
        <div className="mb-8">
          <p className="font-semibold text-primary">Explore & participate</p>

          <h2 className="mt-2 text-3xl font-bold">Campus Events</h2>

          <p className="mt-3 text-base-content/70">
            Find an experience that matches your interests.
          </p>
        </div>

        <EventList />
      </section>

      <section className="bg-base-200">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-center text-3xl font-bold">
            More than just events
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-base-300 bg-base-100 p-6"
              >
                <span className="text-3xl font-extrabold text-primary">
                  0{index + 1}
                </span>

                <h3 className="mt-4 text-xl font-bold">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-base-content/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}