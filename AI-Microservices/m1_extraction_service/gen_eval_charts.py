"""
Generate 2 evaluation charts for M1 README:
  1. Grouped bar — Precision / Recall / F1 per key field
  2. Line chart  — F1 degradation across difficulty levels
Skips scalar fields (name, email, phone, location).
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import os

OUT = os.path.dirname(os.path.abspath(__file__))

# ── Data (from live_results.json) ──────────────────────────────────────────
fields      = ["skills", "soft skills", "education", "experience", "courses", "projects"]
precisions  = [0.870,    0.900,         0.700,        0.900,        0.805,     0.850]
recalls     = [0.881,    0.900,         0.700,        0.900,        0.855,     0.825]
f1s         = [0.875,    0.900,         0.700,        0.900,        0.822,     0.833]

# Difficulty degradation F1 per field
clean  = [0.984, 1.000, 0.500, 1.000, 1.000, 1.000]
medium = [0.646, 0.667, 0.667, 0.667, 0.667, 0.667]
hard   = [0.969, 1.000, 0.800, 1.000, 0.843, 0.867]

# ── Colour palette ─────────────────────────────────────────────────────────
BG      = "#0d1117"
CARD    = "#161b22"
BORDER  = "#30363d"
P_CLR   = "#58a6ff"   # precision → blue
R_CLR   = "#3fb950"   # recall    → green
F_CLR   = "#d2a8ff"   # f1        → purple
CLEAN   = "#58a6ff"
MEDIUM  = "#f0883e"
HARD    = "#d2a8ff"
TEXT    = "#e6edf3"
MUTED   = "#8b949e"

x = np.arange(len(fields))
w = 0.25

# ══════════════════════════════════════════════════════════════════════════
# Chart 1 — Grouped Bar: Precision / Recall / F1
# ══════════════════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(11, 6))
fig.patch.set_facecolor(BG)
ax.set_facecolor(CARD)
for spine in ax.spines.values():
    spine.set_edgecolor(BORDER)

bars_p = ax.bar(x - w,  precisions, w, color=P_CLR, alpha=0.9, zorder=3, label="Precision")
bars_r = ax.bar(x,      recalls,    w, color=R_CLR, alpha=0.9, zorder=3, label="Recall")
bars_f = ax.bar(x + w,  f1s,        w, color=F_CLR, alpha=0.9, zorder=3, label="F1")

# Value labels on top of bars
for bars in (bars_p, bars_r, bars_f):
    for bar in bars:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width() / 2, h + 0.008,
                f"{h:.2f}", ha="center", va="bottom",
                fontsize=8, color=TEXT, fontweight="bold")

# Reference line at F1=0.85 threshold
ax.axhline(0.85, color="#f85149", linewidth=1.2, linestyle="--", zorder=2, alpha=0.8)
ax.text(len(fields) - 0.05, 0.852, "Target ≥ 0.85",
        ha="right", va="bottom", fontsize=8, color="#f85149")

ax.set_xticks(x)
ax.set_xticklabels(fields, color=TEXT, fontsize=11)
ax.set_ylim(0, 1.05)
ax.set_yticks(np.arange(0, 1.1, 0.1))
ax.set_yticklabels([f"{v:.1f}" for v in np.arange(0, 1.1, 0.1)], color=MUTED, fontsize=9)
ax.tick_params(axis="both", colors=BORDER)
ax.grid(axis="y", color=BORDER, linewidth=0.6, zorder=1)

ax.set_title("M1 Extraction — NLP Metrics per Field", color=TEXT, fontsize=14,
             fontweight="bold", pad=14)
ax.set_ylabel("Score", color=MUTED, fontsize=11)

legend = ax.legend(frameon=True, facecolor=CARD, edgecolor=BORDER,
                   labelcolor=TEXT, fontsize=10, loc="lower right")

fig.tight_layout(pad=2)
path1 = os.path.join(OUT, "eval_metrics_bar.png")
fig.savefig(path1, dpi=160, facecolor=BG)
plt.close(fig)
print(f"Saved: {path1}")

# ══════════════════════════════════════════════════════════════════════════
# Chart 2 — Line: F1 Degradation across Difficulty Levels
# ══════════════════════════════════════════════════════════════════════════
colors_line = ["#58a6ff", "#3fb950", "#f0883e", "#d2a8ff", "#ffa657", "#ff7b72"]
markers     = ["o", "s", "^", "D", "P", "*"]
levels      = ["Clean", "Medium", "Hard"]
lx          = [0, 1, 2]

fig2, ax2 = plt.subplots(figsize=(10, 6))
fig2.patch.set_facecolor(BG)
ax2.set_facecolor(CARD)
for spine in ax2.spines.values():
    spine.set_edgecolor(BORDER)

for i, (field, c_val, m_val, h_val) in enumerate(zip(fields, clean, medium, hard)):
    vals = [c_val, m_val, h_val]
    ax2.plot(lx, vals, color=colors_line[i], linewidth=2.2,
             marker=markers[i], markersize=8, label=field, zorder=3)
    # Annotate endpoint (hard)
    ax2.annotate(f"{h_val:.2f}",
                 xy=(2, h_val),
                 xytext=(8, 0), textcoords="offset points",
                 color=colors_line[i], fontsize=8, va="center")

ax2.axhline(0.85, color="#f85149", linewidth=1.1, linestyle="--", zorder=2, alpha=0.8)
ax2.text(1.98, 0.853, "Target 0.85", ha="right", va="bottom",
         fontsize=8, color="#f85149")

ax2.set_xticks(lx)
ax2.set_xticklabels(levels, color=TEXT, fontsize=12, fontweight="bold")
ax2.set_ylim(0.3, 1.08)
ax2.set_yticks(np.arange(0.3, 1.1, 0.1))
ax2.set_yticklabels([f"{v:.1f}" for v in np.arange(0.3, 1.1, 0.1)], color=MUTED, fontsize=9)
ax2.tick_params(axis="both", colors=BORDER)
ax2.grid(color=BORDER, linewidth=0.6, zorder=1, axis="both")

ax2.set_title("M1 Extraction — F1 Score by Difficulty Level", color=TEXT,
              fontsize=14, fontweight="bold", pad=14)
ax2.set_ylabel("F1 Score", color=MUTED, fontsize=11)
ax2.set_xlabel("CV Difficulty", color=MUTED, fontsize=11)

legend2 = ax2.legend(frameon=True, facecolor=CARD, edgecolor=BORDER,
                     labelcolor=TEXT, fontsize=10, loc="lower left",
                     ncol=2, columnspacing=1)

fig2.tight_layout(pad=2)
path2 = os.path.join(OUT, "eval_difficulty_line.png")
fig2.savefig(path2, dpi=160, facecolor=BG)
plt.close(fig2)
print(f"Saved: {path2}")
print("Done.")
