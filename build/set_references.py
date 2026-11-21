"""Set the reference list on the Thank-you slide to the sources the deck actually cites.

    python3 build/set_references.py      (after merge_session_b.py; safe to re-run)

The Thank-you slide belongs to Session B, which merge_session_b.py keeps from the final deck,
so the list is rewritten in place. Formatting is copied from the list's first line.
"""
import copy
from pathlib import Path

from pptx import Presentation

DECK = Path(__file__).resolve().parents[1] / "build" / "out" / "looped-transformers.pptx"
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
REFS = [
    "Hochreiter & Schmidhuber, Long Short-Term Memory, Neural Computation 1997 · Vaswani et al., Attention Is All You Need, NeurIPS 2017",
    "Battaglia et al., Relational inductive biases, deep learning, and graph networks, arXiv:1806.01261 · Kaplan et al., Scaling Laws for Neural Language Models, arXiv:2001.08361",
    "Dehghani et al., Universal Transformers, ICLR 2019, arXiv:1807.03819 · Graves, Adaptive Computation Time for Recurrent Neural Networks, arXiv:1603.08983",
    "Giannou et al., Looped Transformers as Programmable Computers, ICML 2023, arXiv:2301.13196",
    "Saunshi et al., Reasoning with Latent Thoughts: On the Power of Looped Transformers, ICLR 2025, arXiv:2502.17416",
    "Geiping et al., Scaling up Test-Time Compute with Latent Reasoning: A Recurrent Depth Approach, arXiv:2502.05171",
    "Bae et al., Mixture-of-Recursions, arXiv:2507.10524 · Zhu et al., Scaling Latent Reasoning via Looped Language Models (Ouro), arXiv:2510.25741",
    "Zhang et al., Recurrent Looped Transformer, arXiv:2610.07591",
    "Wang, Balappanawar, Zhang, On the Chain-of-Thought Monitorability of Looped Language Models, arXiv:2610.02741",
    "OpenAI, GPT-6 Astra System Card, 3 Sept 2026 · Sources podcast (A. Heath) with S. Altman, 1 Sept 2026 · ARC Prize, OpenAI's GPT-6 Astra on ARC-AGI-3, 3 Sept 2026",
    "The Information, report on GPT-6 Astra, Sept 2026; J. Pachocki (OpenAI), Sept 2026 · S. Raschka, Ahead of AI, 2 and 9 Sept 2026",
    "Brandom, OpenAI's new reasoning technique alarms AI safety experts, TechCrunch, 2 Sept 2026 · A. Volkov (@altryne), post on X, 2 Sept 2026",
    "Arike, How concerned should we be about Astra's recurrent architecture?, LessWrong, 2 Sept 2026 · S. Alexander, The Specter of Neuralese, Astral Codex Ten, 25 Sept 2026",
]

prs = Presentation(DECK)
slide = next(s for s in prs.slides if any(sh.has_text_frame and sh.text_frame.text == "Thank you" for sh in s.shapes))
box = next(sh for sh in slide.shapes if sh.has_text_frame and "Hochreiter" in sh.text_frame.text)
paras = [p._p for p in box.text_frame.paragraphs]
template = copy.deepcopy(paras[0])
for r in template.findall(f"{A}r")[1:]:
    template.remove(r)
parent = paras[0].getparent()
at = list(parent).index(paras[0])
for p in paras:
    parent.remove(p)
for i, ref in enumerate(REFS):
    p = copy.deepcopy(template)
    p.find(f"{A}r").find(f"{A}t").text = ref
    parent.insert(at + i, p)
prs.save(DECK)
print(f"references: {len(REFS)} lines")
