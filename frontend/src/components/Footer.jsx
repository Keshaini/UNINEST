function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h2 className="text-xl font-bold text-white">UniNest</h2>
            <p className="text-sm mt-2">
              Smart hostel management and billing system for seamless student living.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Quick Links</h3>
            <ul className="space-y-1 text-sm">
              <li className="hover:text-white cursor-pointer">Invoices</li>
              <li className="hover:text-white cursor-pointer">Payments</li>
              <li className="hover:text-white cursor-pointer">Payment History</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Support</h3>
            <ul className="space-y-1 text-sm">
              <li>Email: support@uninest.com</li>
              <li>Phone: +94 77 123 4567</li>
              <li className="hover:text-white cursor-pointer">Help Center</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 pt-4 text-center text-sm">
          (c) 2026 UniNest. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
