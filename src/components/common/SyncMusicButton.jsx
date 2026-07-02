"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncMusicButton({ taskId, needsSync }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!needsSync || !taskId) return null;

  const handleSync = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/suno/status?taskId=${taskId}&type=music`);
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to sync music");
      }
    } catch (error) {
      console.error(error);
      alert("Error syncing music");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <svg className="mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Syncing...
        </>
      ) : (
        "Sync Music"
      )}
    </button>
  );
}
