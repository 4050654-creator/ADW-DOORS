import {
  FileText,
  ShoppingBag,
  CreditCard,
  UserCheck,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

const sections = [
  {
    icon: UserCheck,
    title: "1. Account & Customer Information",
    content:
      "Account create karte waqt customer ko accurate aur complete information provide karni chahiye. Customer apne account credentials ki security ka responsible hai.",
  },
  {
    icon: ShoppingBag,
    title: "2. Products & Orders",
    content:
      "Product prices, availability aur details website par display ki jati hain. Product availability change ho sakti hai. Order submit karne ke baad order confirmation system ke through process ki jati hai.",
  },
  {
    icon: CreditCard,
    title: "3. Payments",
    content:
      "Customer ko payment karte waqt correct information provide karni hogi. Online payment ke case mein transaction details accurately submit karna customer ki responsibility hai.",
  },
  {
    icon: RefreshCw,
    title: "4. Booking & Cancellation",
    content:
      "Booking products ke liye required booking amount product ke mutabiq ho sakta hai. Booking confirmation aur cancellation order ki current status aur applicable conditions par depend karegi.",
  },
  {
    icon: AlertTriangle,
    title: "5. Website Use",
    content:
      "Website ko fraudulent, illegal ya harmful activities ke liye use nahi kiya ja sakta. Website ke systems ko damage karne, unauthorized access lene ya service ko disrupt karne ki koshish strictly prohibited hai.",
  },
  {
    icon: FileText,
    title: "6. Changes to Terms",
    content:
      "ADW-DOORS future mein in Terms & Conditions ko update ya modify kar sakta hai. Updated terms website par publish hone ke baad applicable hongi.",
  },
];

function Terms() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-20 sm:py-24">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-xl shadow-orange-500/20">
            <FileText size={30} />
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
            ADW-DOORS
          </p>

          <h1 className="text-4xl font-black text-white sm:text-5xl">
            Terms & Conditions
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            ADW-DOORS website aur services use karne se pehle in terms ko
            carefully read karein.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 rounded-2xl border border-orange-100 bg-orange-50 p-5 text-sm leading-7 text-slate-700 sm:p-6">
            <strong className="text-slate-900">Important:</strong>{" "}
            ADW-DOORS ko use karke aap agree karte hain ke aap website ke
            applicable terms aur policies follow karenge.
          </div>

          <div className="space-y-5">
            {sections.map((section) => {
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

          <div className="mt-10 rounded-2xl bg-slate-950 p-6 text-center text-slate-300 sm:p-8">
            <p className="text-sm leading-7 sm:text-base">
              Agar Terms & Conditions ke hawale se koi question ho to
              ADW-DOORS support team se contact karein.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Terms;