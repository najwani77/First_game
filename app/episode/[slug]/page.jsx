"use client";

import { useEffect, useState } from "react";

export default function Episode({ params }) {
  const [episode, setEpisode] = useState(null);
  const [node, setNode] = useState(null);
  const [toast, setToast] = useState("");
  const [score, setScore] = useState(0);

  // Load episode JSON + restore score
  useEffect(() => {
    const saved = Number(JSON.parse(localStorage.getItem("score") || "0"));
    setScore(saved);

    fetch(`/episodes/${params.slug}.json`, { cache: "no-store" })
      .then((r) => r.json())
      .then((ep) => {
        setEpisode(ep);
        setNode(ep.nodes[0]); // start at first node
      })
      .catch((e) => console.error(e));
  }, [params.slug]);

  // Helper: apply choice delta and show toast
  function applyDelta(delta = {}) {
    const d = Number(delta.akhlaq || 0);
    if (!d) return;
    const newScore = score + d;
    setScore(newScore);
    localStorage.setItem("score", JSON.stringify(newScore));
    setToast(`الأخلاق ${d > 0 ? "+" : ""}${d}`);
    setTimeout(() => setToast(""), 1500);
  }

  // Handle a choice click
  function choose(choice) {
    applyDelta(choice.delta);

    if (choice.end) {
      // Simple end message; we can upgrade this to a styled end-card later
      alert((choice.recap || "انتهت الحلقة.") + `\nمجموع نقاطك: ${score + (choice.delta?.akhlaq || 0)}`);
      return;
    }

    // Move to next node
    const next = episode?.nodes?.find((n) => n.key === choice.next);
    if (next) setNode(next);
  }

  // ✅ Guard: if no node yet, render a loader so nothing tries to read node.*
  if (!node) return <div className="p-6">...جاري التحميل</div>;

  // Optional vertical offset per node (to lift a character on small screens)
  const offsetY = node.charOffsetY || 0;

  return (
    <div className="vn-container">
      {/* Background */}
      {node.background && (
        <img src={node.background} className="vn-bg" alt="background" />
      )}

      {/* Characters */}
      {(node.characters || []).map((c, i) => (
        <img
          key={i}
          src={c.image}
          className={`vn-char ${c.position || "center"}`}
          style={{
            transform:
              (c.position === "center" ? "translateX(-50%) " : "") +
              `translateY(${offsetY}px)`,
          }}
          alt={c.name || "char"}
        />
      ))}

      {/* Dialogue + choices */}
      <div className="dialogue">
        {toast && (
          <div className="mb-2 rounded-lg border border-teal-700 bg-teal-900/40 p-2 text-sm">
            {toast}
          </div>
        )}
        <div className="dialogue-inner">
          {node.characters?.[0]?.name && (
            <div className="mb-1 text-sm opacity-90">
              {node.characters[0].name}
            </div>
          )}
          <p className="mb-3 dialogue-text" style={{ whiteSpace: "pre-wrap" }}>
  {node.body}
</p>

          <div className="grid gap-2">
            {node.choices?.map((c) => (
              <button
                key={c.id}
                onClick={() => choose(c)}
                className="p-3 rounded-2xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-right"
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
