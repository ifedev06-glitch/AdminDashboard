"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FaTrophy, FaTimesCircle, FaRegCopy, FaMoneyCheckAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function Dashboard() {
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const betsPerPage = 10;

  const fetchBets = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://twoxbet-app-latest.onrender.com/bet/list");
      // Sort most recent first
      const sortedBets = res.data.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setBets(sortedBets);
    } catch (err) {
      toast.error("Failed to load bets");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (betId: number, status: string) => {
    try {
      await axios.put(`https://twoxbet-app-latest.onrender.com/api/admin/bets/${betId}?status=${status}`);
      toast.success(`Bet marked as ${status}`);
      fetchBets(); // Refresh after update
    } catch (err) {
      toast.error("Failed to update bet status");
    }
  };

  const copyBetCode = (betCode: string) => {
    navigator.clipboard.writeText(betCode);
    toast.success(`Copied bet code: ${betCode}`);
  };

  useEffect(() => {
    fetchBets();
  }, []);

  // Pagination logic
  const indexOfLastBet = currentPage * betsPerPage;
  const indexOfFirstBet = indexOfLastBet - betsPerPage;
  const currentBets = bets.slice(indexOfFirstBet, indexOfLastBet);
  const totalPages = Math.ceil(bets.length / betsPerPage);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Welcome and Withdrawals button */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-lg font-semibold">Welcome, Mipo 👋</p>
        <Link
          href="/withdrawal"
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded font-semibold text-sm transition"
        >
          <FaMoneyCheckAlt className="w-4 h-4" /> Withdrawals
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-center">Admin Bet Dashboard</h1>

      {loading ? (
        <p className="text-center text-gray-400">Loading bets...</p>
      ) : bets.length === 0 ? (
        <p className="text-center text-gray-400">No bets found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-700 rounded-lg overflow-hidden text-sm">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Bet Code</th>
                <th className="p-2 text-left">SportBook</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Potential Win</th>
                <th className="p-2 text-left">Potential Loss</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Created</th>
                <th className="p-2 text-left">Updated</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentBets.map((bet) => (
                <tr key={bet.id} className="border-t border-gray-700 hover:bg-gray-800 transition">
                  <td className="p-2">{bet.id}</td>
                  <td className="p-2 flex items-center gap-2">
                    {bet.betCode}
                    <button
                      onClick={() => copyBetCode(bet.betCode)}
                      className="text-gray-400 hover:text-white transition"
                      title="Copy bet code"
                    >
                      <FaRegCopy className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="p-2">{bet.sportBook}</td>
                  <td className="p-2 font-semibold">₦{bet.amount.toLocaleString()}</td>
                  <td className="p-2 font-semibold">₦{bet.potentialWin.toLocaleString()}</td>
                  <td className="p-2 font-semibold">₦{bet.potentialLoss.toLocaleString()}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        bet.status === "WON"
                          ? "bg-green-700"
                          : bet.status === "LOST"
                          ? "bg-red-700"
                          : "bg-yellow-700"
                      }`}
                    >
                      {bet.status}
                    </span>
                  </td>
                  <td className="p-2">{bet.user?.name}</td>
                  <td className="p-2">{bet.user?.phoneNumber}</td>
                  <td className="p-2">{new Date(bet.createdAt).toLocaleString()}</td>
                  <td className="p-2">{bet.updatedAt ? new Date(bet.updatedAt).toLocaleString() : "-"}</td>
                  <td className="p-2 flex gap-2 justify-center">
                    <button
                      onClick={() => updateStatus(bet.id, "WON")}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded flex items-center justify-center gap-1 transition text-xs"
                    >
                      <FaTrophy className="w-3 h-3" /> Win
                    </button>
                    <button
                      onClick={() => updateStatus(bet.id, "LOST")}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded flex items-center justify-center gap-1 transition text-xs"
                    >
                      <FaTimesCircle className="w-3 h-3" /> Lose
                    </button>
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
