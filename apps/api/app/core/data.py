from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[4]
SAMPLES_DIR = ROOT / "samples"


def _load_json(name: str) -> Any:
    with (SAMPLES_DIR / name).open("r", encoding="utf-8") as handle:
        return json.load(handle)


@lru_cache
def load_seed_data() -> dict[str, Any]:
    return _load_json("sample_data.json")


@lru_cache
def load_timeline() -> dict[str, Any]:
    return _load_json("demo_event_timeline.json")

