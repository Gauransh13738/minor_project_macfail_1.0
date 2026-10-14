"""Reproduce every result table for the paper.

    pip install -r requirements-research.txt
    python evaluate.py              # full run (~3 min; Gradient Boosting is the slow part)
    python evaluate.py --skip-models  # skip the 6-model comparison

Outputs go to results/ (CSV files, results.md, confusion_seed42.png).

Systems compared on identical splits:
  ML only            Random Forest (SMOTE-balanced), argmax of class probabilities
  Old hybrid         first version: confidence-gated override with HDF/PWF-only rules
  Rules only         the ontology rules alone (no ML)
  ML + Ontology      current system: ontology_reasoner.hybrid_decision (the code the API runs)
"""
import argparse
import os
import time

import numpy as np
import pandas as pd
from imblearn.over_sampling import SMOTE
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, balanced_accuracy_score, confusion_matrix,
                             f1_score, matthews_corrcoef, precision_recall_fscore_support)
from sklearn.model_selection import train_test_split
from sklearn.multiclass import OneVsRestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

import ontology_reasoner as onto

AT, PT, RPM, TQ, TW = ("Air temperature [K]", "Process temperature [K]", "Rotational speed [rpm]",
                       "Torque [Nm]", "Tool wear [min]")
NAMES = ["No Failure", "TWF", "HDF", "PWF", "OSF", "RNF"]
SEEDS = list(range(10))          # random 80/20 stratified splits
README_SEED = 42                 # the split used in eda.ipynb
OUT = "results"


# ── data ────────────────────────────────────────────────────────────────
def load():
    df = pd.read_csv("ai4i2020.csv", encoding="utf-8-sig")

    def label(r):   # same priority as eda.ipynb
        for col, c in (("TWF", 1), ("HDF", 2), ("PWF", 3), ("OSF", 4), ("RNF", 5)):
            if r[col] == 1:
                return c
        return 0

    y = df.apply(label, axis=1)
    X = df[["Type", AT, PT, RPM, TQ, TW]]
    return X, y


def preprocessor(X):
    return ColumnTransformer([("num", StandardScaler(), [c for c in X.columns if c != "Type"]),
                              ("cat", OneHotEncoder(drop="first"), ["Type"])])


# ── systems ─────────────────────────────────────────────────────────────
def legacy_vote(r):
    """First-version rules (HDF/PWF only, loose PWF thresholds) kept for comparison."""
    delta, power = r[PT] - r[AT], r[TQ] * r[RPM]
    if delta < 8.6 and r[RPM] < 1380:
        return 2
    if power < 20000 or power > 90000:
        return 3
    return 0


def legacy_fuse(ml, conf, vote):
    """First-version fusion logic from app.py."""
    if vote != 0:
        if ml == 0 and conf < 0.70:
            return vote
    return ml


def run_systems(Xte, proba):
    ml = proba.argmax(1)
    conf = proba.max(1)
    old, rules, new, source = [], [], [], []
    for (_, r), p, m, c in zip(Xte.iterrows(), proba, ml, conf):
        old.append(legacy_fuse(m, c, legacy_vote(r)))
        feats = onto.derive_features(r[TW], r[TQ], r[AT], r[PT], r[RPM])
        fired = onto.fire_rules(feats, r["Type"])
        rules.append(fired[0]["failure_class"] if fired else 0)
        d = onto.hybrid_decision(p, feats, r["Type"])
        new.append(d["final_class"])
        source.append(d["source"])
    return {"ML only": ml, "Old hybrid (v1)": np.array(old), "Rules only (ontology)": np.array(rules),
            "ML + Ontology (new)": np.array(new)}, np.array(source)


def metrics(y, p):
    _, _, f1, _ = precision_recall_fscore_support(y, p, labels=range(6), zero_division=0)
    return {"accuracy": accuracy_score(y, p),
            "macro_f1": f1_score(y, p, average="macro", zero_division=0),
            **{f"f1_{NAMES[i]}": f1[i] for i in range(1, 6)},
            "false_alarm_rate": float((p[y == 0] != 0).mean())}


def train_rf(X, y, seed):
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, stratify=y, random_state=seed)
    pre = preprocessor(X).fit(Xtr)
    S, Sy = SMOTE(random_state=42).fit_resample(pre.transform(Xtr), ytr)
    rf = RandomForestClassifier(n_estimators=200, max_depth=12, class_weight="balanced", random_state=42)
    rf.fit(S, Sy)
    return Xte, yte.values, rf.predict_proba(pre.transform(Xte)), (pre, Xtr, ytr, S, Sy)


# ── experiments ─────────────────────────────────────────────────────────
def model_comparison(X, y):
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, stratify=y, random_state=README_SEED)
    pre = preprocessor(X).fit(Xtr)
    S, Sy = SMOTE(random_state=42).fit_resample(pre.transform(Xtr), ytr)
    Tte = pre.transform(Xte)
    models = {
        "Logistic Regression": OneVsRestClassifier(LogisticRegression(max_iter=1000)),
        "SVM (RBF)": SVC(kernel="rbf"),
        "KNN (k=7)": KNeighborsClassifier(n_neighbors=7),
        "Decision Tree": DecisionTreeClassifier(max_depth=10, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=200, max_depth=12,
                                                class_weight="balanced", random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=150, learning_rate=0.05, random_state=42),
    }
    rows = []
    for name, m in models.items():
        t = time.time()
        p = m.fit(S, Sy).predict(Tte)
        rows.append({"model": name, "accuracy": accuracy_score(yte, p),
                     "macro_f1": f1_score(yte, p, average="macro", zero_division=0),
                     "balanced_accuracy": balanced_accuracy_score(yte, p), "mcc": matthews_corrcoef(yte, p)})
        print(f"  {name:20s} acc={rows[-1]['accuracy']:.4f} macroF1={rows[-1]['macro_f1']:.4f} ({time.time()-t:.0f}s)")
    return pd.DataFrame(rows)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--skip-models", action="store_true")
    args = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    X, y = load()
    md = []

    if not args.skip_models:
        print("Model comparison (seed 42 split)")
        mc = model_comparison(X, y)
        mc.to_csv(f"{OUT}/model_comparison.csv", index=False)
        md += ["## Table 1. Model comparison (seed-42 split, n=2000)\n", mc.round(4).to_markdown(index=False), ""]

    print("System comparison over 10 random splits + seed 42")
    rows, seed42 = [], None
    for seed in SEEDS + [README_SEED]:
        Xte, yte, proba, _ = train_rf(X, y, seed)
        preds, source = run_systems(Xte, proba)
        for name, p in preds.items():
            rows.append({"seed": seed, "system": name, **metrics(yte, p)})
        if seed == README_SEED:
            seed42 = (yte, preds, source)
        print(f"  seed {seed} done", flush=True)
    per = pd.DataFrame(rows)
    per.to_csv(f"{OUT}/per_split.csv", index=False)

    order = ["ML only", "Old hybrid (v1)", "Rules only (ontology)", "ML + Ontology (new)"]
    cols = ["accuracy", "macro_f1", "f1_TWF", "f1_HDF", "f1_PWF", "f1_OSF", "false_alarm_rate"]
    ten = per[per.seed.isin(SEEDS)]
    summ = ten.groupby("system")[cols].agg(["mean", "std"]).loc[order]
    summ.to_csv(f"{OUT}/main_comparison_mean_sd.csv")
    table = pd.DataFrame({c: [f"{summ[(c, 'mean')][s]:.4f} ± {summ[(c, 'std')][s]:.4f}" for s in order] for c in cols},
                         index=order)
    md += ["## Table 2. Systems compared (mean ± sd over 10 random 80/20 splits)\n", table.to_markdown(), ""]

    s42 = per[per.seed == README_SEED].set_index("system").loc[order][cols].round(4)
    md += ["## Table 3. Same systems on the seed-42 split\n", s42.to_markdown(), ""]

    piv = ten.pivot(index="seed", columns="system", values="macro_f1")
    pd_rows = []
    for a, b in [("ML + Ontology (new)", "ML only"), ("ML + Ontology (new)", "Old hybrid (v1)"),
                 ("ML + Ontology (new)", "Rules only (ontology)")]:
        d = piv[a] - piv[b]
        pd_rows.append({"comparison": f"{a} - {b}", "macro_f1_diff_mean": d.mean(), "sd": d.std(),
                        "wins": int((d > 0).sum()), "losses": int((d < 0).sum())})
    md += ["## Table 4. Paired macro-F1 differences over the 10 splits\n",
           pd.DataFrame(pd_rows).round(4).to_markdown(index=False), ""]

    # per-class report + decision sources for the new system on seed 42
    yte, preds, source = seed42
    p, r, f1, sup = precision_recall_fscore_support(yte, preds["ML + Ontology (new)"], labels=range(6), zero_division=0)
    pc = pd.DataFrame({"class": NAMES, "precision": p, "recall": r, "f1": f1, "support": sup})
    pc.to_csv(f"{OUT}/seed42_per_class_new_system.csv", index=False)
    vc = pd.Series(source).value_counts().to_dict()
    md += ["## Table 5. ML + Ontology per-class results (seed 42)\n", pc.round(3).to_markdown(index=False), "",
           f"Decision sources on the seed-42 test set: {vc}", ""]

    with open(f"{OUT}/results.md", "w") as fh:
        fh.write("\n".join(md))
    print("\n".join(md))

    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        fig, axes = plt.subplots(1, 2, figsize=(11, 4.6))
        for ax, name in zip(axes, ["ML only", "ML + Ontology (new)"]):
            cm = confusion_matrix(yte, preds[name], labels=range(6))
            ax.imshow(cm, cmap="Blues")
            ax.set_title(name)
            ax.set_xticks(range(6), NAMES, rotation=45, ha="right")
            ax.set_yticks(range(6), NAMES)
            ax.set_xlabel("Predicted")
            ax.set_ylabel("True")
            for i in range(6):
                for j in range(6):
                    ax.text(j, i, cm[i, j], ha="center", va="center",
                            color="white" if cm[i, j] > cm.max() / 2 else "black", fontsize=8)
        fig.tight_layout()
        fig.savefig(f"{OUT}/confusion_seed42.png", dpi=200)
    except ImportError:
        print("matplotlib not installed: skipped confusion_seed42.png")


if __name__ == "__main__":
    main()
