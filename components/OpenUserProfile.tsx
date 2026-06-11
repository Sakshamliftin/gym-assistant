"use client";

import { useState } from "react";

export default function OpenUserProfile() {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const handleSuccess = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
    setTimeout(() => setOpen(false), 2000);
  };
  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-2 right-6 w-6 h-6 rounded-full bg-blue-600 text-white text-4xl shadow-lg cursor-pointer"
      >
        +
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-black/50 p-6 rounded-xl w-96 h-96 border-white">
            <h2 className="text-white font-semibold mb-4">Log Exercise</h2>

            <input
              className="text-white w-full border p-2 mb-2"
              placeholder="Exercise"
            />
            <input
              className="text-white w-full border p-2 mb-2"
              placeholder="Sets"
            />
            <input
              className="text-white w-full border p-2 mb-4"
              placeholder="Reps"
            />

            <button
              onClick={handleSuccess}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full cursor-pointer"
            >
              Save
            </button>
            {success && (
              <div className="fixed bottom-20 right-6 bg-green-600 text-white px-4 py-2 rounded">
                Saved successfully
              </div>
            )}

            <button
              onClick={() => setOpen(false)}
              className="mt-2 text-sm text-gray-600 w-full cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
