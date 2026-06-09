import Link from 'next/link';
import Image from 'next/image';

const features = [
  { icon: '📊', title: 'Smart Analytics',      desc: 'Real-time dashboards for attendance, marks, and revenue' },
  { icon: '👨‍👩‍👧', title: 'Parent Portal',        desc: 'Live updates on attendance, marks, fees & homework' },
  { icon: '📚', title: 'Homework Manager',     desc: 'Assign, submit and grade homework digitally' },
  { icon: '🔔', title: 'Multi-Channel Alerts', desc: 'SMS, Email & Push notifications for all stakeholders' },
  { icon: '📋', title: 'Auto Report Cards',    desc: 'PDF report cards with custom grading & rank calculation' },
  { icon: '💰', title: 'Fee Management',       desc: 'Online payments, receipts, and overdue tracking' },
  { icon: '📅', title: 'Timetable Manager',    desc: 'Digital timetable for classes, subjects & teachers' },
  { icon: '🎓', title: 'Student Portal',       desc: 'Marks, attendance, and homework at students\' fingertips' },
];

const plans = [
  {
    name: 'Basic',
    price: '₹4,999',
    students: 'Up to 500 students',
    border: 'border-gray-200',
    btn: 'bg-gray-800 hover:bg-gray-700',
    badge: null,
    features: ['Student & Parent Portal', 'Attendance Management', 'Fee Management', 'Basic Reports', 'Email Support'],
  },
  {
    name: 'Standard',
    price: '₹9,999',
    students: 'Up to 1,500 students',
    border: 'border-blue-500',
    btn: 'bg-blue-600 hover:bg-blue-500',
    badge: 'MOST POPULAR',
    features: ['Everything in Basic', 'Exam & Marks Entry', 'PDF Report Cards', 'SMS Notifications', 'Analytics Dashboard', 'Priority Support'],
  },
  {
    name: 'Premium',
    price: '₹19,999',
    students: 'Unlimited students',
    border: 'border-purple-500',
    btn: 'bg-purple-600 hover:bg-purple-500',
    badge: null,
    features: ['Everything in Standard', 'White-Label Branding', 'Custom Domain', 'Multi-Branch Support', 'API Access', 'Dedicated Account Manager'],
  },
];

const testimonials = [
  { name: 'Principal Sharma', school: 'Delhi Public School', text: 'SchoolConnect transformed how we manage 2000+ students. Parent engagement is up 60%.' },
  { name: 'Admin Priya', school: 'Sunrise Academy', text: 'Fee collection is now fully digital. We save 3 hours every single day.' },
  { name: 'Director Verma', school: 'City International School', text: 'The white-label option lets us brand it as our own system. Excellent product.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/">
            <Image src="/logo.png" alt="SchoolConnect" width={140} height={48} className="h-12 w-auto object-contain" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-blue-600 transition-colors">Reviews</a>
            <Link href="/pricing" className="hover:text-blue-600 transition-colors">Plans</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium hidden sm:block">Login</Link>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            🚀 Trusted by 500+ Schools Across India
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            The Smartest Way to<br />
            <span className="text-blue-600">Run Your School</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Complete School ERP — Admissions, Attendance, Marks, Fees, Parent Communication — everything in one platform. Hindi & English both.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl text-base transition-all hover:scale-105 shadow-lg shadow-blue-200">
              Start Free Trial →
            </Link>
            <a href="#pricing" className="bg-white border-2 border-gray-200 hover:border-blue-300 text-gray-700 font-bold px-8 py-4 rounded-xl text-base transition-all hover:scale-105">
              View Pricing
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-4">No credit card required • Setup in 10 minutes • Free for 30 days</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '500+', label: 'Schools Using' },
            { value: '2L+',  label: 'Students Managed' },
            { value: '99.9%',label: 'Uptime' },
            { value: '4.9★', label: 'Customer Rating' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-4xl font-bold text-blue-600">{s.value}</p>
              <p className="text-gray-500 mt-1 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything Your School Needs</h2>
            <p className="text-gray-500 text-lg">Built for Indian schools. Available in Hindi & English.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Behind SchoolConnect</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Meet the Founder</h2>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 border border-blue-100">
            <div className="flex-shrink-0">
              <div className="relative">
                <Image src="/vikrant.jpg" alt="Vikrant Shekhawat" width={180} height={180} className="rounded-2xl object-cover shadow-xl" />
                <div className="absolute -bottom-3 -right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow">
                  Founder & CEO
                </div>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Vikrant Shekhawat</h3>
              <p className="text-blue-600 font-semibold mb-4">Full Stack Developer & Designer</p>
              <p className="text-gray-600 leading-relaxed mb-6">
                With <span className="font-semibold text-gray-800">11+ years of experience</span> working with MNCs and domestic companies,
                Vikrant built SchoolConnect to solve the real challenges Indian schools face every day.
                From enterprise-grade architecture to pixel-perfect UI, every part of SchoolConnect
                reflects his passion for building software that actually works.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
                {['Full Stack Development', 'UI/UX Design', 'System Architecture', 'EdTech', 'SaaS Products'].map(skill => (
                  <span key={skill} className="bg-white border border-blue-200 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex gap-4 justify-center md:justify-start">
                <a href="mailto:vikrant@schoolconnect.in" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  📧 Get in Touch
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-300 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  LinkedIn →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple, Transparent Pricing</h2>
            <p className="text-gray-500">Annual plans. No hidden fees. GST included.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(p => (
              <div key={p.name} className={`rounded-2xl border-2 ${p.border} p-6 relative ${p.badge ? 'shadow-xl shadow-blue-100' : ''}`}>
                {p.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    {p.badge}
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{p.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{p.students}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{p.price}</span>
                  <span className="text-gray-400 text-sm">/year</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 font-bold mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className={`block text-center text-white font-bold py-3 rounded-xl transition-colors ${p.btn}`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-8">
            Need a custom plan for 5000+ students?{' '}
            <a href="mailto:sales@schoolconnect.in" className="text-blue-600 hover:underline">Contact Sales →</a>
          </p>
        </div>
      </section>

      {/* White Label Banner */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-4xl mb-4">🏷️</div>
          <h2 className="text-3xl font-bold mb-4">White-Label Ready</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Sell SchoolConnect under your own brand. Set your school's logo, colors, and domain. Your clients see only your brand — not SchoolConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors">
              Try White-Label Demo →
            </Link>
            <a href="#pricing" className="border-2 border-white/40 text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
              See Premium Plan
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Loved by School Leaders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.school}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Transform Your School?</h2>
          <p className="text-gray-500 mb-8">Join 500+ schools already using SchoolConnect. Free trial, no credit card needed.</p>
          <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg shadow-blue-200 inline-block">
            Start Free Trial Today →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <Link href="/">
              <Image src="/logo.png" alt="SchoolConnect" width={130} height={44} className="h-10 w-auto object-contain brightness-0 invert" />
            </Link>
            <div className="flex gap-6 text-sm">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
              <a href="mailto:support@schoolconnect.in" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-xs text-gray-600">© 2025 SchoolConnect — School Management Software for Modern Indian Schools</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
