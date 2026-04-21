import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-gray-900 text-slate-300 pt-12 pb-6 px-6 md:px-20 mt-16 border-t border-slate-700/30">

      {/* Top Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 border-b border-slate-700/30 pb-10">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            UniNest
          </h2>
          <p className="text-sm leading-relaxed mb-6 text-slate-400">
            Smart hostel management and billing system designed for seamless student living and efficient administration.
          </p>

          {/* Social Icons */}
          <div className="flex space-x-4">
            <a href="#" className="hover:text-indigo-400 transition text-slate-400"><FaFacebookF /></a>
            <a href="#" className="hover:text-indigo-400 transition text-slate-400"><FaTwitter /></a>
            <a href="#" className="hover:text-indigo-400 transition text-slate-400"><FaInstagram /></a>
            <a href="#" className="hover:text-indigo-400 transition text-slate-400"><FaLinkedinIn /></a>
          </div>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Features</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/invoice" className="text-slate-400 hover:text-indigo-400 transition">Invoices</a></li>
            <li><a href="/payments" className="text-slate-400 hover:text-indigo-400 transition">Payments</a></li>
            <li><a href="/payment-history" className="text-slate-400 hover:text-indigo-400 transition">Payment History</a></li>
            <li><a href="/dashboard" className="text-slate-400 hover:text-indigo-400 transition">Dashboard</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition">Help Center</a></li>
            <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition">User Guide</a></li>
            <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition">FAQs</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>Email: support@uninest.com</li>
            <li>Phone: +94 77 123 4567</li>
            <li>Colombo, Sri Lanka</li>
          </ul>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-8 text-sm text-slate-500">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="text-indigo-400 font-semibold">UniNest</span>. All rights reserved.
        </p>

        <div className="flex space-x-4 mt-3 md:mt-0">
          <a href="#" className="text-slate-500 hover:text-indigo-400 transition">Privacy Policy</a>
          <a href="#" className="text-slate-500 hover:text-indigo-400 transition">Terms</a>
          <a href="#" className="text-slate-500 hover:text-indigo-400 transition">Cookies</a>
        </div>
      </div>

    </footer>
  );
}

export default Footer;