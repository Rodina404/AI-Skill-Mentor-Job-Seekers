import os
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Ensure the plots are saved in the same directory as the script
output_dir = os.path.dirname(os.path.abspath(__file__))

# Data from calculations
fields = ["name", "email", "phone", "location", "skills", "soft_skills", "education", "experience", "courses", "projects"]

# Macro metrics
precisions = [1.00, 1.00, 0.10, 0.00, 1.00, 0.00, 1.00, 1.00, 0.93, 0.95]
recalls =    [1.00, 1.00, 0.10, 0.00, 1.00, 0.00, 1.00, 1.00, 0.98, 0.93]
f1_scores =  [1.00, 1.00, 0.10, 0.00, 1.00, 0.00, 1.00, 1.00, 0.95, 0.93]

# ----------------------------------------------------
# PLOT 1: Grouped Bar Chart
# ----------------------------------------------------
plt.figure(figsize=(12, 6))
x = np.arange(len(fields))
width = 0.25

plt.bar(x - width, precisions, width, label='Precision', color='#1f77b4')
plt.bar(x, recalls, width, label='Recall', color='#ff7f0e')
plt.bar(x + width, f1_scores, width, label='F1', color='#2ca02c')

plt.xlabel('Fields', fontsize=12)
plt.ylabel('Score', fontsize=12)
plt.title('M1 Extraction — Precision / Recall / F1 per Field', fontsize=14, fontweight='bold')
plt.xticks(x, fields, rotation=45, ha='right')
plt.ylim(0, 1.05)
plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.legend()
plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'm1_precision_recall_f1.png'), dpi=300)
plt.close()

# ----------------------------------------------------
# PLOT 2: Heatmap
# ----------------------------------------------------
cvs = [f"cv_{i:03d}" for i in range(1, 11)]
heatmap_data = np.array([
    [1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0],  # cv_001
    [1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0],  # cv_002
    [1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0],  # cv_003
    [1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0],  # cv_004
    [1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0],  # cv_005
    [1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0],  # cv_006
    [1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.67, 1.0], # cv_007
    [1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.33], # cv_008
    [1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0],  # cv_009
    [1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.80, 1.0]  # cv_010
])

plt.figure(figsize=(12, 8))
sns.heatmap(heatmap_data, annot=True, fmt=".2f", xticklabels=fields, yticklabels=cvs,
            cmap=sns.diverging_palette(10, 130, as_cmap=True), vmin=0, vmax=1.0, cbar=True)
plt.title('M1 F1 Score Heatmap — CV × Field', fontsize=14, fontweight='bold')
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'm1_heatmap.png'), dpi=300)
plt.close()

# ----------------------------------------------------
# PLOT 3: Line Chart (Degradation)
# ----------------------------------------------------
difficulty_levels = ["clean", "medium", "hard"]
degradation_data = {
    "name": [1.0, 1.0, 1.0],
    "email": [1.0, 1.0, 1.0],
    "phone": [0.0, 0.0, 0.2],
    "location": [0.0, 0.0, 0.0],
    "skills": [1.0, 1.0, 1.0],
    "soft_skills": [0.0, 0.0, 0.0],
    "education": [1.0, 1.0, 1.0],
    "experience": [1.0, 1.0, 1.0],
    "courses": [1.0, 1.0, 0.89],
    "projects": [1.0, 1.0, 0.87]
}

plt.figure(figsize=(10, 6))
markers = ['o', 's', '^', 'D', 'v', 'p', '*', 'h', 'x', '+']
for idx, (field, scores) in enumerate(degradation_data.items()):
    plt.plot(difficulty_levels, scores, label=field, marker=markers[idx], linewidth=2, markersize=8)

plt.xlabel('Difficulty', fontsize=12)
plt.ylabel('Average F1 Score', fontsize=12)
plt.title('M1 F1 Degradation: Clean → Medium → Hard', fontsize=14, fontweight='bold')
plt.ylim(-0.05, 1.05)
plt.grid(True, linestyle='--', alpha=0.5)
plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'm1_difficulty_degradation.png'), dpi=300)
plt.close()

# ----------------------------------------------------
# PLOT 4: Stacked Bar (Null Handling)
# ----------------------------------------------------
# phone (cv_007), email (cv_009), education (cv_009)
null_fields = ["phone", "email", "education"]
correct_null = [1, 1, 1]
hallucinations = [0, 0, 0]

plt.figure(figsize=(8, 5))
plt.bar(null_fields, correct_null, label='Correct Null', color='green', width=0.5)
plt.bar(null_fields, hallucinations, bottom=correct_null, label='Hallucination', color='red', width=0.5)

plt.xlabel('Fields', fontsize=12)
plt.ylabel('Count', fontsize=12)
plt.title('M1 Null Handling: Correct vs Hallucinated', fontsize=14, fontweight='bold')
plt.ylim(0, 1.5)
plt.grid(axis='y', linestyle='--', alpha=0.5)
plt.legend()
plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'm1_null_handling.png'), dpi=300)
plt.close()

# ----------------------------------------------------
# PLOT 5: Radar Chart
# ----------------------------------------------------
# Number of variables
num_vars = len(fields)

# Compute angle of each axis
angles = np.linspace(0, 2 * np.pi, num_vars, endpoint=False).tolist()

# The radar chart is a circle, so we need to "complete the loop" by appending the start to the end
angles += angles[:1]
r_f1_scores = f1_scores + f1_scores[:1]
r_fields = fields + fields[:1]

fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True))
ax.fill(angles, r_f1_scores, color='teal', alpha=0.25)
ax.plot(angles, r_f1_scores, color='teal', linewidth=2)

# Set labels
ax.set_theta_offset(np.pi / 2)
ax.set_theta_direction(-1)
ax.set_thetagrids(np.degrees(angles[:-1]), fields)

# Set y-limits
ax.set_rlim(0, 1.0)
ax.set_rlabel_position(180)
plt.title('M1 Overall Extraction Profile', fontsize=14, fontweight='bold', pad=20)
plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'm1_radar.png'), dpi=300)
plt.close()

# ----------------------------------------------------
# Console Output Summary
# ----------------------------------------------------
summary = """
============ M1 EVALUATION SUMMARY ============
Overall System F1:     0.70
Best Field:            name, email, skills, education, experience (F1=1.00)
Worst Field:           location, soft_skills (F1=0.00)
Null Hallucination Rate: 0.00
Schema Consistency:    0/10 CVs fully consistent
Verdict:               NEEDS FIXES
===============================================
"""
print(summary)
