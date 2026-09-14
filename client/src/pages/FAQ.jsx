import { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";

const faqs = [
  {
    question: "ADW-DOORS kya hai?",
    answer:
      "ADW-DOORS ek premium online store hai jahan customers Basant doors aur related products ki booking aur purchase kar sakte hain.",
  },
  {
    question: "Main product kaise order kar sakta hoon?",
    answer:
      "Shop page par apna pasandida product select karein, product details check karein, cart mein add karein aur checkout process complete karein.",
  },
  {
    question: "Booking kaise hoti hai?",
    answer:
      "Jin products par booking available ho, un par booking option select karke required information submit karein. Booking amount product ke mutabiq hoti hai.",
  },
  {
    question: "Kya main order track kar sakta hoon?",
    answer:
      "Ji haan. Order place hone ke baad aap apne account ke Orders section se order details aur status check kar sakte hain.",
  },
  {
    question: "Payment ke kaun se methods available hain?",
    answer:
      "ADW-DOORS par available payment methods checkout aur payment page par show kiye jate hain. Payment instructions ko carefully follow karein.",
  },
  {
    question: "Kya order cancel kiya ja sakta hai?",
    answer:
      "Order cancellation availability order ke current status aur product ki condition par depend karti hai. Cancellation ke liye support team se contact karein.",
  },
  {
    question: "Meri personal information safe hai?",
    answer:
      "Hum customer information ko responsibly handle karte hain aur account aur order processing ke liye required information hi use karte hain.",
  },
  {
    question: "Support se kaise contact karun?",
    answer:
      "Aap Contact Us page ke through apna message submit kar sakte hain. Hamari support team aapki request ko review karegi.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-20 sm:py-24">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-xl shadow-orange-500/20">
            <HelpCircle size={32} />
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
            ADW-DOORS SUPPORT
          </p>

          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
            Frequently Asked Questions
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            ADW-DOORS ke orders, bookings, payments aur support se related
            common questions ke answers yahan mil jayenge.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={faq.question}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 ${
                    isOpen
                      ? "border-orange-200 shadow-orange-100"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFAQ(index)}
                    className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-bold text-slate-900 sm:text-lg">
                      {faq.question}
                    </span>

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        isOpen
                          ? "rotate-180 bg-orange-500 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <ChevronDown size={19} />
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-7 text-slate-600 sm:px-6 sm:text-base">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Support CTA */}
          <div className="mt-12 overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl sm:p-10">
            <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2 text-orange-400">
                  <MessageCircle size={20} />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    Need More Help?
                  </span>
                </div>

                <h2 className="text-2xl font-black sm:text-3xl">
                  Still have a question?
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                  Agar aapko apne order, booking ya kisi aur matter mein help
                  chahiye to hamari support team se contact karein.
                </p>
              </div>

              <a
                href="/contact"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-orange-500 px-6 py-3.5 font-bold text-white transition hover:bg-orange-400"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default FAQ;