import { useState, useEffect } from 'react';

function StudentInvoices() {

  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    // ✅ ONLY THIS STUDENT DATA
    setInvoices([
      {
        invoiceNumber: "INV001",
        totalAmount: 20000,
        status: "Paid"
      },
      {
        invoiceNumber: "INV002",
        totalAmount: 15000,
        status: "Pending"
      }
    ]);
  }, []);

  const format = (amt) =>
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amt);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Invoices</h2>

      <div className="bg-white shadow rounded">
        {invoices.map((inv, i) => (
          <div key={i} className="flex justify-between p-4 border-b">
            <span>{inv.invoiceNumber}</span>
            <span>{format(inv.totalAmount)}</span>
            <span className={inv.status === 'Paid' ? 'text-green-600' : 'text-red-600'}>
              {inv.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentInvoices;