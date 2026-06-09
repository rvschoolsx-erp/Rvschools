import Link from 'next/link';

const plans = [
  {
    name: 'Basic',
    price: 4999,
    period: 'per year',
    tagline: 'Perfect for small schools',
    students: 'Up to 500 students',
    border: 'border-gray-200',
    headerBg: 'bg-gray-50',
    btn: 'bg-gray-800 hover:bg-gray-700 text-white',
    badge: null,
    features: [
      { label: 'Student & Parent Portal', included: true },
      { label: 'Attendance Management', included: true },
      { label: 'Fee Management', included: true },
      { label: 'Basic Notifications (Email)', included: true },
      { label: 'Basic Reports', included: true },
      { label: 'Email Support', included: true },
      { label: 'Exam & Marks Management', included: false },
      { label: 'PDF Report Cards', included: false },
      { label: 'SMS Notifications', included: false },
      { label: 'Analytics Dashboard', included: false },
      { label: 'White-Label Branding', included: false },
      { label: 'Custom Domain', included: false },
    ],
  },
  {
    name: 'Standard',
    price: 9999,
    period: 'per year',
    tagline: 'Best for growing schools',
    students: 'Up to 1,500 students',
    border: 'border-blue-500',
    headerBg: 'bg-blue-600',
    btn: 'bg-blue-600 hover:bg-blue-500 text-white',
    badge: 'MOST POPULAR',
    features: [
      { label: 'Student & Parent Portal', included: true },
      { label: 'Attendance Management', included: true },
      { label: 'Fee Management', included: true },
      { label: 'SMS + Email Notifications', included: true },
      { label: 'Advanced Reports', included: true },
      { label: 'Priority Support', included: true },
      { label: 'Exam & Marks Management', included: true },
      { label: 'PDF Report Cards', included: true },
      { label: 'Analytics Dashboard', included: true },
      { label: 'Homework Management', included: true },
      { label: 'White-Label Branding', included: false },
      { label: 'Custom Domain', included: false },
    ],
  },
  {
    name: 'Premium',
    price: 19999,
    period: 'per year',
    tagline: 'For large schools & resellers',
    students: 'Unlimited students',
    border: 'border-purple-500',
    headerBg: 'bg-purple-600',
    btn: 'bg-purple-600 hover:bg-purple-500 text-white',
    badge: null,
    features: [
      { label: 'Student & Parent Portal', included: true },
      { label: 'Attendance Management', included: true },
      { label: 'Fee Management', included: true },
      { label: 'SMS + Email + Push Notifications', included: true },
      { label: 'All Reports + Export', included: true },
      { label: 'Dedicated Account Manager', included: true },
      { label: 'Exam & Marks Management', included: true },
      { label: 'PDF Report Cards', included: true },
      { label: 'Analytics Dashboard', included: true },
      { label: 'Homework Management', included: true },
      { label: 'White-Label Branding', included: true },
      { label: 'Custom Domain', included: true },
    ],
  },
];

const faqs = [
  { q: 'Can I switch plans later?', a: 'Yes, you can upgrade your plan at any time. The difference is prorated for the remaining subscription period.' },
  { q: 'Is there a free trial?', a: 'Yes! Every plan comes with a 30-day free trial. No credit card required to start.' },
  { q: 'What is White-Label?', a: 'With White-Label (Premium plan), you can set your school\'s own name, logo, colors, and even a custom domain. Visitors will see your school\'s brand — not SchoolConnect.' },
  { q: 'How is student count calculated?', a: 'Only active students count toward your plan limit. Inactive, transferred, or graduated students are not counted.' },
  { q: 'Is data safe and backed up?', a: 'Yes. All data is encrypted at rest and in transit. Automatic daily backups with 30-day retention.' },
  { q: 'Can I get a custom plan for 5000+ students?', a: 'Absolutely! Contact our sales team at sales@schoolconnect.in for a custom enterprise quote.' },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">SC</div>
            <span className="font-bold text-xl text-gray-900">SchoolConnect</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Login</Link>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Annual plans. No hidden charges. GST included. Cancel anytime with 30-day money-back guarantee.
        </p>
      </section>

      {/* Plans */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(p => (
            <div key={p.name} className={`rounded-2xl border-2 ${p.border} overflow-hidden relative ${p.badge ? 'shadow-xl shadow-blue-100 scale-[1.02]' : ''}`}>
              {p.badge && (
                <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {p.badge}
                </div>
              )}
              {/* Header */}
              <div className={`${p.headerBg} p-6 ${p.name !== 'Basic' ? 'text-white' : 'text-gray-900'}`}>
                <h3 className="text-xl font-bold mb-1">{p.name}</h3>
                <p className={`text-sm mb-4 ${p.name !== 'Basic' ? 'text-white/70' : 'text-gray-500'}`}>{p.tagline}</p>
                <div>
                  <span className="text-4xl font-bold">₹{p.price.toLocaleString('en-IN')}</span>
                  <span className={`text-sm ml-1 ${p.name !== 'Basic' ? 'text-white/70' : 'text-gray-400'}`}>/{p.period}</span>
                </div>
                <p className={`text-xs mt-2 ${p.name !== 'Basic' ? 'text-white/60' : 'text-gray-400'}`}>{p.students}</p>
              </div>
              {/* Features */}
              <div className="p-6">
                <ul className="space-y-2.5 mb-6">
                  {p.features.map(f => (
                    <li key={f.label} className="flex items-start gap-2.5 text-sm">
                      {f.included
                        ? <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                        : <span className="text-gray-300 font-bold mt-0.5 flex-shrink-0">✕</span>
                      }
                      <span className={f.included ? 'text-gray-700' : 'text-gray-300'}>{f.label}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login" className={`block text-center font-bold py-3 rounded-xl transition-colors ${p.btn}`}>
                  Start Free Trial
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enterprise */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Enterprise / Reseller Plan</h3>
          <p className="text-gray-400 mb-6">For 5000+ students, multi-branch schools, or EdTech companies that want to resell SchoolConnect as their own product.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-sm">
            {['Unlimited Schools', 'Full White-Label', 'Custom SLA & Support'].map(f => (
              <div key={f} className="bg-white/10 rounded-xl py-3 px-4">{f}</div>
            ))}
          </div>
          <a href="mailto:sales@schoolconnect.in" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-colors inline-block">
            Contact Sales →
          </a>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map(f => (
              <div key={f.q} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">{f.q}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-500 py-8 text-center text-sm">
        <Link href="/" className="text-white font-bold hover:text-blue-400 transition-colors">SchoolConnect</Link>
        <span className="mx-3">·</span>
        <a href="mailto:sales@schoolconnect.in" className="hover:text-white transition-colors">sales@schoolconnect.in</a>
        <span className="mx-3">·</span>
        <span className="text-gray-600">© 2025 All rights reserved</span>
      </footer>
    </div>
  );
}
