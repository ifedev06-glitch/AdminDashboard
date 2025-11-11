"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function WithdrawalDashboard() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const withdrawalsPerPage = 10;

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://twoxbet-app-latest.onrender.com/api/admin/pending");
      const sorted = res.data.sort(
        (a: any, b: any) =>
          new Date(b.requestedAt || b.id).getTime() - new Date(a.requestedAt || a.id).getTime()
      );
      setWithdrawals(sorted);
    } catch (err) {
      toast.error("Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id: number) => {
    try {
      await axios.put(`https://twoxbet-app-latest.onrender.com/api/admin/${id}/pay`);
      toast.success("Withdrawal marked as PAID");
      fetchWithdrawals();
    } catch (err) {
      toast.error("Failed to update withdrawal");
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // Pagination logic
  const indexOfLast = currentPage * withdrawalsPerPage;
  const indexOfFirst = indexOfLast - withdrawalsPerPage;
  const currentWithdrawals = withdrawals.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(withdrawals.length / withdrawalsPerPage);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Welcome and Back to Bets button */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-lg font-semibold">Welcome, Mipo 👋</p>
        <Link
          href="/"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold text-sm transition"
        >
          <FaArrowLeft className="w-4 h-4" /> Back to Bets
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-center">Withdrawal Dashboard</h1>

      {loading ? (
        <p className="text-center text-gray-400">Loading withdrawals...</p>
      ) : withdrawals.length === 0 ? (
        <p className="text-center text-gray-400">No pending withdrawals</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-700 rounded-lg overflow-hidden text-sm">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">Bank</th>
                <th className="p-2 text-left">Account No</th>
                <th className="p-2 text-left">Account Name</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Requested At</th>
                <th className="p-2 text-left">Processed At</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentWithdrawals.map((w) => (
                <tr key={w.id} className="border-t border-gray-700 hover:bg-gray-800 transition">
                  <td className="p-2">{w.id}</td>
                  <td className="p-2">{w.userName}</td>
                  <td className="p-2">{w.bankName}</td>
                  <td className="p-2">{w.accountNumber}</td>
                  <td className="p-2">{w.accountName}</td>
                  <td className="p-2 font-semibold">₦{w.amount.toLocaleString()}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        w.status === "PAID"
                          ? "bg-green-700"
                          : w.status === "PENDING"
                          ? "bg-yellow-700"
                          : "bg-red-700"
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="p-2">
                    {w.requestedAt ? new Date(w.requestedAt).toLocaleString() : "-"}
                  </td>
                  <td className="p-2">{w.processedAt ? new Date(w.processedAt).toLocaleString() : "-"}</td>
                  <td className="p-2 flex gap-2 justify-center">
                    {w.status !== "PAID" && (
                      <button
                        onClick={() => markAsPaid(w.id)}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded flex items-center justify-center gap-1 transition text-xs"
                      >
                        <FaCheckCircle className="w-3 h-3" /> Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-3 mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
