import { useEffect, useState } from "react";
import winjaIcon from "/winja-icon.png";
import { getOpportunities } from "../api";
import { motion } from "framer-motion";
import { FaGooglePlay, FaAppStoreIos, FaBell, FaListAlt, FaRocket, FaMobileAlt, FaUserFriends, FaShieldAlt, FaInstagram, FaTwitter, FaFacebookF, FaEnvelope, FaSearch, FaSignInAlt } from "react-icons/fa";

// Stock images
const heroStock = "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80";
const sidebarStock = "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80";
const downloadStock = "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80";

// Testimonials reused from App.jsx
const testimonials = [
  {
    icon: "🌟",
    text: "Winja helped me land a scholarship I never knew existed. The alerts are always on point!",
    name: "Ada, Student",
  },
  {
    icon: "🚀",
    text: "I got my first freelance gig through Winja. The platform is a game changer for hustlers!",
    name: "Tunde, Freelancer",
  },
  {
    icon: "💡",
    text: "The real-time alerts are so helpful. I never miss out on opportunities anymore.",
    name: "Chiamaka, Graduate",
  },
  {
    icon: "🎯",
    text: "I found a grant for my startup through Winja. The process was seamless!",
    name: "Emeka, Entrepreneur",
  },
];

const features = [
  { icon: <FaBell className="text-2xl text-[#5b2be7]" />, title: "Real-time Alerts" },
  { icon: <FaListAlt className="text-2xl text-[#5b2be7]" />, title: "Curated Listings" },
  { icon: <FaRocket className="text-2xl text-[#5b2be7]" />, title: "Easy Application" },
  { icon: <FaMobileAlt className="text-2xl text-[#5b2be7]" />, title: "Mobile App" },
  { icon: <FaUserFriends className="text-2xl text-[#5b2be7]" />, title: "Community Support" },
  { icon: <FaShieldAlt className="text-2xl text-[#5b2be7]" />, title: "Verified & Safe" },
];

const whatsNew = [
  { title: "New Feature: Save Opportunities!", desc: "You can now save your favorite opportunities for later.", date: "2024-06-01" },
  { title: "Winja App hits 10,000 downloads!", desc: "Thank you for your support. More features coming soon.", date: "2024-05-20" },
  { title: "Partner Spotlight: TechWomen", desc: "Read about our latest partnership with TechWomen.", date: "2024-05-10" },
];

function AnimatedGradientBG() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#5b2be7] via-[#a78bfa] to-[#f8fafc] opacity-30 blur-3xl animate-pulse" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#ede9fe] via-[#c7d2fe] to-[#5b2be7] opacity-20 blur-2xl animate-pulse" />
      <div className="absolute bottom-0 left-1/2 w-[300px] h-[300px] rounded-full bg-gradient-to-tl from-[#5b2be7] via-[#ede9fe] to-[#a78bfa] opacity-10 blur-2xl animate-pulse" />
    </motion.div>
  );
}

function TestimonialCarousel() {
  const [idx, setIdx] = useState(0);
  return (
    <div className="relative w-full flex flex-col items-center mt-12 mb-8">
      <div
        key={idx}
        className="bg-white/90 rounded-2xl shadow-2xl p-10 flex flex-col items-center text-center max-w-xl mx-auto border border-white/40 backdrop-blur-lg"
      >
        <div className="text-5xl mb-4 animate-bounce">{testimonials[idx].icon}</div>
        <p className="text-gray-700 mb-4 text-lg font-medium">“{testimonials[idx].text}”</p>
        <span className="font-semibold text-[#5b2be7]">- {testimonials[idx].name}</span>
      </div>
      <div className="flex gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${i === idx ? "bg-[#5b2be7] scale-125" : "bg-gray-300"}`}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getOpportunities()
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];
        setOpportunities(data.slice(0, 12));
      })
      .catch(() => setError("Failed to load opportunities."))
      .finally(() => setLoading(false));
  }, []);

  const filteredOpportunities = opportunities.filter(
    (opp) =>
      opp.title?.toLowerCase().includes(search.toLowerCase()) ||
      opp.description?.toLowerCase().includes(search.toLowerCase()) ||
      opp.category?.toLowerCase().includes(search.toLowerCase()) ||
      opp.type?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Extract trending categories (top 3 by count)
  const categoryCounts = {};
  opportunities.forEach((opp) => {
    const cat = opp.category || opp.type?.name || "General";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const trendingCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#ede9fe] via-[#c7d2fe] to-[#5b2be7] pb-20 overflow-hidden">
      <AnimatedGradientBG />
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur shadow border-b border-[#ede9fe]">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src={winjaIcon} alt="Winja Logo" className="w-8 h-8" />
            <span className="font-bold text-[#5b2be7] text-xl">Winja</span>
          </div>
          <nav className="hidden md:flex gap-8 text-[#5b2be7] font-semibold">
            <a href="#" className="hover:text-[#4c1d95]">Home</a>
            <a href="#opportunities" className="hover:text-[#4c1d95]">Opportunities</a>
            <a href="#download" className="hover:text-[#4c1d95]">Download</a>
            <a href="#about" className="hover:text-[#4c1d95]">About</a>
          </nav>
          <div className="flex items-center gap-4">
            <a href="#login" className="flex items-center gap-1 bg-[#5b2be7] text-white px-4 py-2 rounded-full font-semibold shadow hover:bg-[#4c1d95] transition"><FaSignInAlt className="mr-1" /> Login</a>
          </div>
        </div>
      </header>
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Hero/Search Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12 pb-8 border-b border-[#ede9fe]">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#5b2be7] mb-4 drop-shadow">Discover Life-Changing Opportunities</h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-6">
              Winja connects you to scholarships, grants, jobs, and more. Never miss out on the next big thing—get real-time alerts and explore curated opportunities tailored for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-4">
              <a href="#download" className="inline-flex items-center bg-[#5b2be7] text-white px-6 py-3 rounded-full font-semibold text-lg shadow-lg hover:bg-[#4c1d95] transition"><FaGooglePlay className="mr-2 text-2xl" /> Google Play</a>
              <a href="#download" className="inline-flex items-center bg-[#5b2be7] text-white px-6 py-3 rounded-full font-semibold text-lg shadow-lg hover:bg-[#4c1d95] transition"><FaAppStoreIos className="mr-2 text-2xl" /> App Store</a>
            </div>
            <div className="flex gap-2 flex-wrap justify-center md:justify-start mb-2">
              {features.map((f) => (
                <span key={f.title} className="inline-flex items-center bg-[#ede9fe] text-[#5b2be7] text-xs font-bold px-3 py-1 rounded-full shadow-sm mr-2 mb-2">
                  {f.icon} <span className="ml-1">{f.title}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <form className="w-full max-w-md" onSubmit={e => e.preventDefault()}>
              <div className="flex items-center bg-white rounded-full shadow-lg px-4 py-2 border border-[#ede9fe]">
                <FaSearch className="text-[#5b2be7] text-xl mr-2" />
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  className="flex-1 bg-transparent outline-none text-lg text-[#5b2be7] placeholder-[#a78bfa]"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </form>
            <img src={heroStock} alt="Opportunities" className="w-64 h-40 mt-8 object-cover rounded-2xl shadow-lg" />
          </div>
        </section>
        {/* Main Content Grid */}
        <main className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Left: Featured Opportunities */}
          <section className="flex-1">
            <h2 className="text-2xl font-bold text-[#5b2be7] mb-4">Featured Opportunities</h2>
            {loading ? (
              <div className="text-center text-gray-500 py-12">Loading opportunities...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-12">{error}</div>
            ) : filteredOpportunities.length === 0 ? (
              <div className="text-center text-gray-500 py-12">No opportunities found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredOpportunities.slice(0, 6).map((opp, i) => (
                  <motion.div key={opp.id} className="bg-white/80 rounded-2xl shadow p-0 flex flex-col justify-between border border-gray-100 hover:shadow-2xl transition relative overflow-hidden" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                    {opp.image ? (
                      <img src={opp.image} alt={opp.title} className="w-full h-40 object-cover rounded-t-2xl" />
                    ) : (
                      <img src={heroStock} alt="Opportunity" className="w-full h-40 object-cover rounded-t-2xl" />
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="absolute top-4 right-4">
                        <span className="inline-block bg-[#ede9fe] text-[#5b2be7] text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                          {opp.category || opp.type?.name || "General"}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-[#5b2be7] mb-2 mt-2">{opp.title}</h3>
                      <p className="text-gray-600 mb-2 line-clamp-3" dangerouslySetInnerHTML={{ __html: opp.description || opp.sponsor || "Opportunity details coming soon." }} />
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-gray-500">{opp.sponsor || "Winja"}</span>
                        {opp.expiry && <span className="text-xs text-red-500">Expires: {opp.expiry}</span>}
                      </div>
                      {opp.application_link && (
                        <a href={opp.application_link} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block bg-[#5b2be7] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#4c1d95] transition">Apply Now</a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
          {/* Right: Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 mt-8 lg:mt-0">
            {/* Trending Categories */}
            <div className="bg-white/80 rounded-2xl shadow p-6 mb-8 border border-gray-100">
              <h3 className="text-lg font-bold text-[#5b2be7] mb-4">Trending Categories</h3>
              <ul className="flex flex-wrap gap-2">
                {trendingCategories.length === 0 ? (
                  <li className="text-gray-400">No categories yet.</li>
                ) : (
                  trendingCategories.map((cat) => (
                    <li key={cat} className="bg-[#ede9fe] text-[#5b2be7] px-3 py-1 rounded-full text-xs font-semibold">{cat}</li>
                  ))
                )}
              </ul>
              <img src={sidebarStock} alt="Categories" className="w-full h-24 object-cover rounded-xl mt-4" />
            </div>
            {/* What's New */}
            <div className="bg-white/80 rounded-2xl shadow p-6 mb-8 border border-gray-100">
              <h3 className="text-lg font-bold text-[#5b2be7] mb-4">What's New</h3>
              <ul className="space-y-3">
                {whatsNew.map((item) => (
                  <li key={item.title} className="border-l-4 border-[#5b2be7] pl-3">
                    <div className="text-sm text-[#5b2be7] font-semibold">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                    <div className="text-xs text-gray-400 mt-1">{item.date}</div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Announcements */}
            <div className="bg-white/80 rounded-2xl shadow p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-[#5b2be7] mb-4">Announcements</h3>
              <ul className="space-y-2">
                <li className="text-sm text-gray-600">Follow us on social media for the latest updates!</li>
                <li className="text-sm text-gray-600">Join our community and never miss an opportunity.</li>
              </ul>
              <img src={downloadStock} alt="Announcements" className="w-full h-20 object-cover rounded-xl mt-4" />
            </div>
          </aside>
        </main>
        {/* Testimonials Section */}
        <section className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#5b2be7] mb-8 text-center mt-20">What Our Users Say</h2>
          <TestimonialCarousel />
        </section>
        {/* Download Section */}
        <section id="download" className="flex flex-col items-center mt-20 mb-12">
          <h3 className="text-2xl font-bold text-[#5b2be7] mb-4">Get the Winja App</h3>
          <p className="text-gray-700 mb-6 max-w-xl text-center">Download Winja on your mobile device and never miss an opportunity again. Available on Android and iOS.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#" className="inline-flex items-center bg-[#5b2be7] text-white px-6 py-3 rounded-full font-semibold text-lg shadow-lg hover:bg-[#4c1d95] transition"><FaGooglePlay className="mr-2 text-2xl" /> Google Play</a>
            <a href="#" className="inline-flex items-center bg-[#5b2be7] text-white px-6 py-3 rounded-full font-semibold text-lg shadow-lg hover:bg-[#4c1d95] transition"><FaAppStoreIos className="mr-2 text-2xl" /> App Store</a>
          </div>
          <img src={downloadStock} alt="Download App" className="w-64 h-32 object-cover rounded-2xl mt-8 shadow" />
        </section>
        {/* Footer */}
        <footer className="mt-20 py-8 border-t border-[#ede9fe] bg-white/80 backdrop-blur-lg">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={winjaIcon} alt="Winja Logo" className="w-8 h-8" />
              <span className="font-bold text-[#5b2be7] text-lg">Winja</span>
            </div>
            <div className="flex gap-4 text-[#5b2be7] text-xl">
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="mailto:info@winja.com" aria-label="Email"><FaEnvelope /></a>
            </div>
            <div className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Winja. All rights reserved.</div>
          </div>
        </footer>
      </div>
    </div>
  );
} 