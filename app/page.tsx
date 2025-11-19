"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FaRegCopy, FaArrowRight } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function AdminBetsDashboard() {
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const betsPerPage = 10;

  const fetchBets = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://aviator-app-latest.onrender.com/admin/bets"); // Aviator admin endpoint
      const sortedBets = res.data.sort(
        (a: any, b: any) =>
          new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
      );
      setBets(sortedBets);
    } catch (err) {
      toast.error("Failed to load bets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyBetCode = (betId: number) => {
    navigator.clipboard.writeText(betId.toString());
    toast.success(`Copied bet ID: ${betId}`);
  };

  useEffect(() => {
    fetchBets();
  }, []);

  // Pagination
  const indexOfLastBet = currentPage * betsPerPage;
  const indexOfFirstBet = indexOfLastBet - betsPerPage;
  const currentBets = bets.slice(indexOfFirstBet, indexOfLastBet);
  const totalPages = Math.ceil(bets.length / betsPerPage);

  // Calculate totals for current page
  const totalWin = currentBets
    .filter((b) => b.status === "CASHED_OUT")
    .reduce((sum, b) => sum + (b.winAmount ?? 0), 0);

  const totalLostByPlayers = currentBets
    .filter((b) => b.status !== "CASHED_OUT")
    .reduce((sum, b) => sum + (b.betAmount ?? 0), 0);

  const totalMadeByHouse = totalLostByPlayers - totalWin;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Aviator Admin Bet Dashboard</h1>
        <Link
          href="/withdrawal"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold text-sm transition"
        >
          Go to Withdrawals <FaArrowRight />
        </Link>
      </div>

      {/* Totals */}
      <div className="flex justify-center gap-6 mb-4 text-sm font-semibold">
        <span className="text-green-400">
          Total Made By Players: ₦{totalWin.toLocaleString()}
        </span>
        <span className="text-red-400">
          Total Lost By Players: ₦{totalLostByPlayers.toLocaleString()}
        </span>
        <span className="text-yellow-400">
          Total Made By House: ₦{totalMadeByHouse.toLocaleString()}
        </span>
      </div>

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
                <th className="p-2 text-left">Username</th>
                <th className="p-2 text-right">Bet Amount</th>
                <th className="p-2 text-right">Cashout Multiplier</th>
                <th className="p-2 text-right">Win Amount</th>
                <th className="p-2 text-right">Lost Amount</th>
                <th className="p-2 text-left">Round ID</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Placed At</th>
                <th className="p-2 text-left">Cashed Out At</th>
                <th className="p-2 text-center">Copy ID</th>
              </tr>
            </thead>
            <tbody>
              {currentBets.map((bet) => {
                const isCashedOut = bet.status === "CASHED_OUT";
                const lostAmount = !isCashedOut ? bet.betAmount : bet.lostAmount ?? 0;

                return (
                  <tr
                    key={bet.betId}
                    className="border-t border-gray-700 hover:bg-gray-800 transition"
                  >
                    <td className="p-2">{bet.betId}</td>
                    <td className="p-2">{bet.username}</td>
                    <td className="p-2 text-right font-semibold">
                      ₦{bet.betAmount.toLocaleString()}
                    </td>
                    <td className="p-2 text-right">{bet.cashoutMultiplier ?? "-"}</td>
                    <td className="p-2 text-right">
                      {isCashedOut ? `₦${bet.winAmount?.toLocaleString() ?? 0}` : "-"}
                    </td>
                    <td className="p-2 text-right">₦{lostAmount.toLocaleString()}</td>
                    <td className="p-2">{bet.roundId}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          isCashedOut ? "bg-green-700" : "bg-red-700"
                        }`}
                      >
                        {isCashedOut ? "CASHED_OUT" : "LOST"}
                      </span>
                    </td>
                    <td className="p-2">{new Date(bet.placedAt).toLocaleString()}</td>
                    <td className="p-2">
                      {isCashedOut ? new Date(bet.cashedOutAt).toLocaleString() : "-"}
                    </td>
                    <td className="p-2 flex justify-center">
                      <button
                        onClick={() => copyBetCode(bet.betId)}
                        className="text-gray-400 hover:text-white transition"
                        title="Copy bet ID"
                      >
                        <FaRegCopy className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
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
