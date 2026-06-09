import Link from 'next/link';

const stats = [
  { value: '5,000+', label: 'छात्र-छात्राएं' },
  { value: '200+',   label: 'शिक्षक' },
  { value: '30+',    label: 'वर्षों का अनुभव' },
  { value: '98%',    label: 'परीक्षा परिणाम' },
];

const features = [
  { icon: '📊', title: 'स्मार्ट एनालिटिक्स',  desc: 'रियल-टाइम प्रदर्शन रिपोर्ट और विश्लेषण' },
  { icon: '👨‍👩‍👧', title: 'अभिभावक पोर्टल',    desc: 'बच्चे की प्रगति, उपस्थिति और फीस की जानकारी' },
  { icon: '📚', title: 'डिजिटल होमवर्क',      desc: 'ऑनलाइन गृहकार्य और तत्काल अधिसूचना' },
  { icon: '🔔', title: 'स्मार्ट नोटिफिकेशन', desc: 'SMS, Email और Push अलर्ट' },
  { icon: '📋', title: 'डिजिटल रिपोर्ट कार्ड', desc: 'स्वचालित ग्रेड गणना और PDF रिपोर्ट' },
  { icon: '💰', title: 'फीस प्रबंधन',         desc: 'ऑनलाइन भुगतान और रसीद प्रणाली' },
];

const notices = [
  { date: '10 जून 2025', title: 'वार्षिक परीक्षा परिणाम घोषित',           tag: 'परीक्षा' },
  { date: '08 जून 2025', title: 'ग्रीष्मकालीन अवकाश — 15 जून से 30 जून', tag: 'छुट्टी' },
  { date: '05 जून 2025', title: 'नए शैक्षणिक सत्र 2025-26 में प्रवेश',    tag: 'प्रवेश' },
  { date: '01 जून 2025', title: 'विद्यालय स्थापना दिवस — 20 जून',         tag: 'कार्यक्रम' },
];

const portals = [
  { role: 'admin',   emoji: '🛡️', title: 'प्रशासक',   desc: 'संपूर्ण प्रबंधन',   color: 'from-purple-600 to-purple-800' },
  { role: 'teacher', emoji: '👨‍🏫', title: 'शिक्षक',    desc: 'कक्षा प्रबंधन',     color: 'from-blue-600 to-blue-800' },
  { role: 'parent',  emoji: '👨‍👩‍👧', title: 'अभिभावक', desc: 'बच्चे की प्रगति',   color: 'from-green-600 to-green-800' },
  { role: 'student', emoji: '🎓', title: 'छात्र',      desc: 'अकादमिक रिकॉर्ड', color: 'from-orange-600 to-orange-800' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#1a3c6e] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-[#1a3c6e] font-bold text-lg">श</div>
            <div>
              <p className="font-bold text-lg leading-tight" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>शहीद राम सिंह विद्यालय</p>
              <p className="text-xs text-blue-200">Shaheed Ram Singh Vidyalaya</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {['मुख्य पृष्ठ', 'प्रवेश', 'सुविधाएं', 'संपर्क'].map(item => (
              <span key={item} className="px-3 py-2 rounded-md hover:bg-blue-700 cursor-pointer transition-colors">{item}</span>
            ))}
          </nav>
          <Link href="/login" className="bg-amber-400 hover:bg-amber-300 text-[#1a3c6e] font-bold px-4 py-2 rounded-lg text-sm transition-colors">
            लॉगिन करें
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0f2140] via-[#1a3c6e] to-[#1d4ed8] text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-amber-400 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-blue-400 blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 text-amber-300 px-4 py-1.5 rounded-full text-sm mb-6">
            🎓 स्मार्ट विद्यालय प्रबंधन प्रणाली
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-3" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
            शहीद राम सिंह<span className="text-amber-400 block">विद्यालय</span>
          </h1>
          <p className="text-xl text-blue-200 mb-2">Shaheed Ram Singh Vidyalaya</p>
          <p className="text-blue-300 mb-10 text-lg">ज्ञान, संस्कार और उत्कृष्टता का केंद्र</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="bg-amber-400 hover:bg-amber-300 text-[#1a3c6e] font-bold px-8 py-3.5 rounded-xl text-base transition-all hover:scale-105 shadow-lg">
              पोर्टल में लॉगिन करें →
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="white"><path d="M0 40L1440 40L1440 0C1080 40 360 40 0 0Z"/></svg>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-bold text-[#1a3c6e]">{s.value}</p>
              <p className="text-gray-500 mt-1" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1a3c6e] text-center mb-10" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>डिजिटल सुविधाएं</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1a3c6e] text-center mb-10" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>पोर्टल एक्सेस</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {portals.map(p => (
              <Link key={p.role} href="/login" className={`rounded-2xl bg-gradient-to-br ${p.color} text-white p-6 text-center hover:scale-105 transition-transform shadow-lg`}>
                <div className="text-4xl mb-3">{p.emoji}</div>
                <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>{p.title}</h3>
                <p className="text-xs opacity-70">{p.desc}</p>
                <div className="mt-3 text-xs bg-white/20 rounded-lg py-1">लॉगिन →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Notice Board */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1a3c6e] text-center mb-8" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>सूचना पट्टिका</h2>
          <div className="space-y-3">
            {notices.map(n => (
              <div key={n.title} className="flex items-center gap-4 bg-white rounded-xl px-5 py-4 shadow-sm">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-lg font-medium whitespace-nowrap" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>{n.tag}</span>
                <p className="flex-1 text-gray-800 text-sm" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>{n.title}</p>
                <span className="text-xs text-gray-400 whitespace-nowrap">{n.date}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f2140] text-white py-10">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-2xl font-bold text-amber-400 mb-2" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>शहीद राम सिंह विद्यालय</p>
          <p className="text-blue-300 text-sm mb-4">📍 उत्तर प्रदेश, भारत &nbsp;|&nbsp; 📞 +91 XXXXX XXXXX &nbsp;|&nbsp; 📧 info@srsv.edu.in</p>
          <p className="text-blue-400 text-xs">© 2025 शहीद राम सिंह विद्यालय — सर्वाधिकार सुरक्षित</p>
        </div>
      </footer>
    </div>
  );
}
