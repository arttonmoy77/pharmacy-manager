#!/usr/bin/env python3
"""
Summarise the pharmacy survey.

Usage:
    python analyze_survey.py                          # reads responses.csv
    python analyze_survey.py responses_example.csv    # try it with the fake example
    python analyze_survey.py responses.csv --out results

Writes <out>/results.md and, if matplotlib is installed, PNG charts in <out>/charts/.
Only the Python standard library is required (matplotlib is optional, for charts).
"""
import argparse
import csv
import os
import sys
from collections import Counter


def read_rows(path):
    with open(path, newline="", encoding="utf-8-sig") as f:
        return [{k.strip(): (v or "").strip() for k, v in row.items() if k} for row in csv.DictReader(f)]


def split_multi(value):
    return [x.strip() for x in value.split(";") if x.strip()]


def norm_method(value):
    v = value.strip().lower()
    return {"app": "App", "manual": "Manual", "both": "Both"}.get(v, value.strip().title() or "Unknown")


def pct(n, total):
    return f"{n / total * 100:.0f}%" if total else "0%"


def md_table(headers, rows):
    out = ["| " + " | ".join(headers) + " |", "|" + "|".join("---" for _ in headers) + "|"]
    out += ["| " + " | ".join(str(c) for c in r) + " |" for r in rows]
    return "\n".join(out)


def counter_rows(counter, total):
    return [(k, n, pct(n, total)) for k, n in counter.most_common()]


def bar_chart(counter, title, path, total):
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        return False
    items = counter.most_common()[::-1]
    if not items:
        return False
    fig, ax = plt.subplots(figsize=(7, 0.55 * len(items) + 1.4))
    bars = ax.barh([k for k, _ in items], [n for _, n in items], color="#0F6B5C")
    for bar, (_, n) in zip(bars, items):
        ax.text(bar.get_width() + 0.05, bar.get_y() + bar.get_height() / 2,
                f"{n} ({pct(n, total)})", va="center", fontsize=9)
    ax.set_title(title, loc="left", fontsize=12, fontweight="bold")
    ax.set_xlim(0, max(n for _, n in items) * 1.25)
    ax.spines[["top", "right"]].set_visible(False)
    ax.set_xlabel("Number of pharmacies")
    fig.tight_layout()
    fig.savefig(path, dpi=150)
    plt.close(fig)
    return True


def main():
    ap = argparse.ArgumentParser(description="Summarise the pharmacy survey")
    ap.add_argument("csv", nargs="?", default="responses.csv")
    ap.add_argument("--out", default="results", help="output folder (default: results)")
    args = ap.parse_args()

    if not os.path.exists(args.csv):
        sys.exit(f"File not found: {args.csv}\n"
                 "Copy responses_template.csv to responses.csv, add your answers, then run again.\n"
                 "To just try the script: python analyze_survey.py responses_example.csv")

    rows = read_rows(args.csv)
    if not rows:
        sys.exit("The file has no answers yet.")
    total = len(rows)
    is_example = "example" in os.path.basename(args.csv).lower()

    methods = Counter(norm_method(r.get("method", "")) for r in rows)
    manual = [r for r in rows if norm_method(r.get("method", "")) == "Manual"]
    reasons = Counter(x for r in manual for x in split_multi(r.get("reasons", "")))
    adopt = Counter(r["would_adopt"].title() for r in rows if r.get("would_adopt"))
    areas = Counter(r.get("area", "") or "Unknown" for r in rows)
    staff = [int(r["staff_count"]) for r in rows if r.get("staff_count", "").isdigit()]

    lines = ["# Survey results", ""]
    if is_example:
        lines += ["> **EXAMPLE DATA - not real.** This file was produced from `responses_example.csv` only to demonstrate the script.", ""]
    lines += [f"Pharmacies surveyed: **{total}**" + (f"  |  Areas: {', '.join(f'{a} ({n})' for a, n in areas.most_common())}" if areas else ""), ""]
    if staff:
        lines += [f"Average people at the counter: **{sum(staff) / len(staff):.1f}**", ""]

    lines += ["## Which method do pharmacies use?", "", md_table(["Method", "Pharmacies", "Share"], counter_rows(methods, total)), ""]
    only_manual = len(manual)
    lines += [f"**{only_manual} of {total} ({pct(only_manual, total)}) work manually only.**", ""]

    if manual:
        lines += ["## Why do manual-only pharmacies not use an app?", "",
                  f"Multiple answers were allowed, so shares add up to more than 100%. Base: {only_manual} manual-only pharmacies.", "",
                  md_table(["Reason", "Pharmacies", f"Share of {only_manual}"], counter_rows(reasons, only_manual)), ""]
    if adopt:
        lines += ["## Would they use a free, offline app?", "", md_table(["Answer", "Pharmacies", "Share"], counter_rows(adopt, sum(adopt.values()))), ""]

    os.makedirs(os.path.join(args.out, "charts"), exist_ok=True)
    with open(os.path.join(args.out, "results.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    made = []
    for name, counter, title, base in [("method.png", methods, "Method used", total),
                                       ("reasons.png", reasons, "Why manual-only pharmacies do not use an app", only_manual),
                                       ("would_adopt.png", adopt, "Would use a free offline app?", sum(adopt.values()))]:
        if counter and bar_chart(counter, title, os.path.join(args.out, "charts", name), base):
            made.append(name)
    print(f"Wrote {os.path.join(args.out, 'results.md')}" + (f" and charts: {', '.join(made)}" if made else " (install matplotlib for charts)"))


if __name__ == "__main__":
    main()
