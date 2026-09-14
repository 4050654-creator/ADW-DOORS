import {
  ShieldCheck,
  LockKeyhole,
  Database,
  Mail,
  UserRound,
  Settings,
} from "lucide-react";

const privacySections = [
  {
    icon: UserRound,
    title: "1. Information We Collect",
    content:
      "Account aur order process karne ke liye naam, email, phone number, delivery address aur related information collect ki ja sakti hai.",
  },
  {
    icon: Database,
    title: "2. How We Use Your Information",
    content:
      "Information ko account management, order processing, booking management, customer support aur website services provide karne ke liye use kiya jata hai.",
  },
  {
    icon: LockKeyhole,
    title: "3. Data Security",
    content:
      "Hum customer information ko reasonable security practices ke through protect karne ki koshish karte hain. Phir bhi internet par koi system 100% guaranteed secure nahi hota.",
  },
  {
    icon: Mail,
    title: "4. Communication",
    content:
      "Aapki provided contact information order updates, booking information, support responses aur important service-related communication ke liye use ki ja sakti hai.",
  },
  {
    icon: Settings,
    title: "5. Cookies & Local Storage",
    content:
      "Website kuch technical information aur browser storage ka use kar sakti hai taake login sessions, cart aur website functionality properly work kar sake.",
  },
  {
    icon: ShieldCheck,
    title: "6. Your Privacy",
    content:
      "Hum customer privacy ko seriously lete hain aur personal information ko unnecessary purposes ke liye sell ya misuse karne ka irada nahi rakhte.",
  },
];

function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-20 sm:py-24">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-xl shadow-orange-500/20">
            <ShieldCheck size={31} />
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
            ADW-DOORS
          </p>

          <h1 className="text-4xl font-black text-white sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Hum aapki privacy ko seriously lete hain. Yahan bataya gaya hai
            ke customer information kis tarah handle ki jati hai.
          </p>
        </div>
      </section>

      {/* Privacy content */}
      <section className="px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-sm leading-7 text-slate-700 sm:p-6">
            <strong className="text-slate-900">Our commitment:</strong>{" "}
            ADW-DOORS customer information ko responsibly handle karne aur
            required security measures maintain karne ki koshish karta hai.
          </div>

          <div className="space-y-5">
            {privacySections.map((section) => {
              const Icon = section.icon;

              return (
                <article
                  key={section.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-200 hover:shadow-md sm:p-8"
                >
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                      <Icon size={21} />
                    </div>

                    <div>
                      <h2 className="text-lg font-black text-slate-900 sm:text-xl">
                        {section.title}
                      </h2>

                      <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-10 rounded-3xl bg-slate-950 p-7 text-center text-white sm:p-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-500">
              <ShieldCheck size={24} />
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Your Privacy Matters
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Agar privacy ya personal information ke hawale se aapka koi
              question ho, humse Contact Us page ke through rabta karein.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default PrivacyPolicy;