import re
from typing import Tuple, List, Dict, Any

def strip_tags_keep_text(text: str) -> str:
    return re.sub(r"</?(?:r|y)>", "", text, flags=re.IGNORECASE)

def extract_tag_spans(annotated: str) -> Tuple[str, List[Dict[str, Any]]]:
    plain = ""
    spans: List[Dict[str, Any]] = []
    pattern = re.compile(r"(<r>.*?</r>|<y>.*?</y>)", re.IGNORECASE | re.DOTALL)
    pos_plain = 0
    for chunk in pattern.split(annotated):
        if not chunk:
            continue
        lower = chunk.lower()
        if lower.startswith("<r>") or lower.startswith("<y>"):
            risk = "high" if lower.startswith("<r>") else "medium"
            inner = re.sub(r"^<(?:r|y)>|</(?:r|y)>$", "", chunk, flags=re.IGNORECASE)
            start = pos_plain
            plain += inner
            pos_plain += len(inner)
            spans.append({"start": start, "end": pos_plain, "text": inner, "risk": risk})
        else:
            plain += chunk
            pos_plain += len(chunk)
    return plain, spans