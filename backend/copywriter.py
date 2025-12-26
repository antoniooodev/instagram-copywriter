"""
Instagram Copywriter - Core Logic

Logica originale del notebook mantenuta, con parametri brand configurabili.

Features:
1) Strong anti-generic blacklist (BANNED_PHRASES) injected into do_not_use.
2) Forces a single descriptive "angle" per post; avoids repeating the previous angle.
3) Optional subject from filename (better specificity, less repetition).
4) Cost controls:
   - temperature low
   - max_output_tokens capped
   - retries reduced (default 1 retry)
   - short "fix" prompt on retry
"""

import os
import re
import json
import base64
import mimetypes
from pathlib import Path
from collections import defaultdict
from datetime import date
from typing import List, Dict, Any, Optional, Tuple
from openai import OpenAI

client: Optional[OpenAI] = None

def init_client(api_key: str):
    """Initialize OpenAI client with provided API key."""
    global client
    client = OpenAI(api_key=api_key)

# -----------------------------
# Cost-control knobs
# -----------------------------
MODEL = "gpt-4o-mini"
TEMPERATURE = 0.2
MAX_OUTPUT_TOKENS_POST = 1024
MAX_OUTPUT_TOKENS_BRIEF = 1024
MAX_RETRIES_POST = 1

# -----------------------------
# Default anti-repetition blacklist
# -----------------------------
DEFAULT_BANNED_PHRASES = [
    "Ogni pezzo racconta",
    "storia unica",
    "grande attenzione ai dettagli",
    "materiale pregiato",
    "bellezza naturale",
    "con cura e attenzione",
    "Scopri la bellezza",
    "simbolo di bellezza",
    "frutto della nostra passione",
    "rendendo ogni pezzo speciale",
    "unico",
    "speciale",
]

# single-angle control
ANGLES = ["forma", "venatura", "superficie", "gesto dell'artigiano", "luce", "equilibrio visivo"]

def choose_angle(prev_angle: Optional[str]) -> str:
    """Deterministic rotation to avoid repeats."""
    if prev_angle is None:
        return ANGLES[0]
    try:
        i = ANGLES.index(prev_angle)
        return ANGLES[(i + 1) % len(ANGLES)]
    except ValueError:
        return ANGLES[0]

# -----------------------------
# Helpers
# -----------------------------
def img_to_data_url(image_path: str) -> str:
    mime, _ = mimetypes.guess_type(image_path)
    mime = mime or "image/jpeg"
    with open(image_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
    return f"data:{mime};base64,{b64}"

def ensure_paths(images: List[str]) -> List[str]:
    out = []
    for p in images:
        if not os.path.exists(p):
            raise FileNotFoundError(f"Image not found: {p}")
        out.append(p)
    return out

def count_sentences(s: str) -> int:
    parts = [p.strip() for p in re.split(r"[.!?]+", s) if p.strip()]
    return len(parts)

_EMOJI_RE = re.compile(
    "[" "\U0001F300-\U0001FAFF" "\U00002700-\U000027BF" "\U0001F1E6-\U0001F1FF" "]+",
    flags=re.UNICODE,
)

CTA_FORBIDDEN_RE = re.compile(
    r"\b(dm|messaggio|scrivimi|scrivetemi|link in bio|acquista|compra|ordina|disponibil|shop|etsy)\b",
    flags=re.IGNORECASE,
)

# -----------------------------
# Template specs builder
# -----------------------------
def build_template_specs(brand_name: str, brand_tagline: str) -> Dict[str, Any]:
    """Build template specs with brand-specific closing phrases."""
    closing_full = f"{brand_name} — {brand_tagline}" if brand_tagline else brand_name
    closing_short = brand_name
    
    return {
        "T1_OGGETTO": {
            "needs_title": False,
            "title_rule": "Return title as null.",
            "caption_rule": (
                f"Caption: massimo 3 frasi. Descrivi il prodotto visibile. "
                f"L'ultima frase deve essere esattamente: '{closing_full}.'"
            ),
            "alt_rule": "Alt text: 1 frase neutra che descrive ciò che si vede (nessun marketing).",
        },
        "T2_DETTAGLIO": {
            "needs_title": False,
            "title_rule": "Return title as null.",
            "caption_rule": (
                f"Caption: massimo 3 frasi. Focus su materiale/venatura/texture. "
                f"Niente prezzi, spedizioni, sconti. "
                f"L'ultima frase deve essere esattamente: '{closing_full}.'"
            ),
            "alt_rule": "Alt text: 1 frase neutra che descrive il dettaglio ravvicinato visibile.",
        },
        "T3_PROCESSO": {
            "needs_title": True,
            "title_rule": "Title: frase di massimo 3 parole (no emoji).",
            "caption_rule": (
                f"Caption: massimo 3 frasi. Descrivi il processo/lavorazione visibile. "
                f"L'ultima frase deve essere esattamente: '{closing_full}.'"
            ),
            "alt_rule": "Alt text: 1 frase neutra su mani/utensili/processo visibile.",
        },
        "T4_STORIA": {
            "needs_title": True,
            "title_rule": "Title: massimo 3 parole evocative sulla storia/heritage del brand.",
            "caption_rule": (
                f"Caption: massimo 3 frasi, sobria. Racconta storia o valori del brand. "
                f"L'ultima frase deve essere esattamente: '{closing_short}.'"
            ),
            "alt_rule": "Alt text: 1 frase neutra che descrive il contesto visibile.",
        },
    }

# -----------------------------
# JSON Schemas
# -----------------------------
WEEK_BRIEF_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "week_id": {"type": "string"},
        "theme": {"type": "string"},
        "goal": {"type": "string"},
        "voice": {"type": "string"},
        "featured_category": {"type": "string"},
        "availability_policy": {"type": "string"},
        "keywords": {"type": "array", "items": {"type": "string"}, "minItems": 3, "maxItems": 6},
        "cta": {
            "type": "object",
            "properties": {"day": {"type": "string", "enum": ["sun"]}, "text": {"type": "string"}},
            "required": ["day", "text"],
            "additionalProperties": False,
        },
        "continuity_rules": {"type": "string"},
    },
    "required": [
        "week_id","theme","goal","voice","featured_category","availability_policy",
        "keywords","cta","continuity_rules"
    ],
    "additionalProperties": False,
}

POST_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "template_id": {"type": "string"},
        "subject": {"type": "string"},
        "slot_index": {"type": "integer"},
        "day_name": {"type": "string"},
        "post_role": {"type": "string", "enum": ["value","material","process","story","cta"]},
        "title": {"anyOf": [{"type": "string"}, {"type": "null"}]},
        "caption": {"type": "string"},
        "keywords_used": {"type": "array", "items": {"type": "string"}, "minItems": 1, "maxItems": 2},
        "do_not_use": {"type": "array", "items": {"type": "string"}},
        "ig_caption_full": {"type": "string"},
        "content": {
            "type": "object",
            "properties": {
                "hashtags": {"type": "array", "items": {"type": "string"}},
                "alt_text": {"type": "string"},
                "visual_description": {"type": "string"},
            },
            "required": ["hashtags", "alt_text", "visual_description"],
            "additionalProperties": False,
        },
    },
    "required": [
        "template_id","subject","slot_index","day_name","post_role","title","caption",
        "keywords_used","do_not_use","ig_caption_full","content"
    ],
    "additionalProperties": False,
}

# -----------------------------
# System message builder
# -----------------------------
def build_system_message(required_hashtags: List[str]) -> str:
    return (
        "Genera copy per post Instagram in italiano per un brand.\n"
        "VINCOLI HARD:\n"
        "- Restituisci SOLO JSON conforme allo schema (nessun testo extra, niente markdown).\n"
        "- Niente emoji.\n"
        "- Caption: massimo 3 frasi (frase termina con . o ! o ?).\n"
        "- Tono sobrio, descrittivo, non aggressivo.\n"
        "- Non inventare fatti oltre a quelli forniti o visibili nell'immagine.\n"
        f"- Hashtags DEVONO includere almeno questi: {required_hashtags}\n"
    )

# -----------------------------
# Brand facts builder
# -----------------------------
def build_brand_facts(
    brand_name: str,
    brand_description: str,
    brand_tagline: str = "",
    brand_history: str = ""
) -> str:
    facts = f"Brand: {brand_name}."
    if brand_description:
        facts += f" {brand_description}"
    if brand_tagline:
        facts += f" Tagline: {brand_tagline}."
    if brand_history:
        facts += f" {brand_history}"
    return facts

# -----------------------------
# do_not_use
# -----------------------------
def default_do_not_use(
    availability_policy: str,
    cta_enabled: bool,
    custom_banned_phrases: List[str] = None
) -> List[str]:
    base = ["prezzo", "sconto", "spedizione", "offerta", "promo"]
    if not cta_enabled:
        base += ["dm", "messaggio", "scrivimi", "link", "bio", "acquista", "ordina", "etsy", "shop", "disponibili"]
    if availability_policy == "no_availability":
        base += ["disponibile", "disponibili"]
    
    banned = custom_banned_phrases if custom_banned_phrases else DEFAULT_BANNED_PHRASES
    base += banned
    return sorted(set(base))

# -----------------------------
# Subject from filename
# -----------------------------
def subject_from_filename(image_path: str, fallback: str) -> str:
    stem = Path(image_path).stem.lower()
    parts = stem.split("_")
    if len(parts) <= 1:
        return fallback
    core = parts[1:]
    core = [t for t in core if not t.isdigit()]
    if not core:
        return fallback
    return " ".join(core[:3]).replace("-", " ").strip() or fallback

# -----------------------------
# Validation
# -----------------------------
def validate_week_brief(brief: Dict[str, Any]) -> None:
    if brief["cta"]["day"] != "sun":
        raise ValueError("cta.day must be 'sun'")
    if _EMOJI_RE.search(brief["cta"]["text"]):
        raise ValueError("CTA must not contain emoji")
    if not brief["cta"]["text"].strip():
        raise ValueError("CTA text must be non-empty")

def validate_post(
    post: Dict[str, Any],
    template_id: str,
    day_name: str,
    week_brief: Dict[str, Any],
    cta_enabled: bool,
    template_specs: Dict[str, Any],
    required_hashtags: List[str]
) -> None:
    if post["template_id"] != template_id:
        raise ValueError("template_id mismatch")
    if post["day_name"] != day_name:
        raise ValueError("day_name mismatch")
    if _EMOJI_RE.search(post.get("caption","")) or _EMOJI_RE.search(post.get("title") or ""):
        raise ValueError("emoji detected")
    if count_sentences(post["caption"]) > 3:
        raise ValueError("caption > 3 sentences")
    tags = post["content"]["hashtags"]
    if not isinstance(tags, list) or any(not isinstance(t, str) for t in tags):
        raise ValueError("hashtags must be a list of strings")

    required_set = set(required_hashtags)
    tagset = set(tags)
    if not required_set.issubset(tagset):
        missing = sorted(required_set - tagset)
        raise ValueError(f"missing required hashtags: {missing}")

    if len(tags) != len(set(tags)):
        raise ValueError("hashtags contain duplicates")

    spec = template_specs[template_id]
    if not spec["needs_title"] and post["title"] is not None:
        raise ValueError("title must be null for this template")
    if spec["needs_title"]:
        if not isinstance(post["title"], str) or not post["title"].strip():
            raise ValueError("title required for this template")
        if len(post["title"].split()) > 3:
            raise ValueError("title > 3 words")

    week_kw = set(week_brief["keywords"])
    if not (1 <= len(post["keywords_used"]) <= 2):
        raise ValueError("keywords_used must have 1-2 items")
    if any(k not in week_kw for k in post["keywords_used"]):
        raise ValueError("keywords_used must come from week_brief.keywords")

    if post["caption"].strip() not in post["ig_caption_full"]:
        raise ValueError("ig_caption_full must include caption")
    hashtags_line = " ".join(tags)
    if hashtags_line not in post["ig_caption_full"]:
        raise ValueError("ig_caption_full must include the hashtags line")

    cta_text = week_brief["cta"]["text"].strip()
    if not cta_enabled:
        if CTA_FORBIDDEN_RE.search(post["caption"]):
            raise ValueError("CTA-like text on CTA-disabled slot")
        if cta_text in post["caption"]:
            raise ValueError("CTA text appears on CTA-disabled slot")
    else:
        if cta_text not in post["caption"]:
            raise ValueError("CTA slot must include exact CTA text")
        last_line = post["caption"].strip().splitlines()[-1].strip()
        if last_line != cta_text:
            raise ValueError("CTA slot caption must end with CTA line")

# -----------------------------
# Week brief generation
# -----------------------------
def generate_week_brief(
    goal: str,
    theme: str,
    brand_facts: str,
    required_hashtags: List[str],
    cta_mode: str = "dm",
    voice: str = "minimal",
    featured_category: str = "mix",
    availability_policy: str = "no_availability",
    start_date: Optional[str] = None,
    model: str = MODEL,
) -> Dict[str, Any]:
    wk = start_date or date.today().isoformat()
    if cta_mode == "dm":
        cta_hint = "CTA domenica: una riga che invita a scrivere in DM."
    elif cta_mode == "link_in_bio":
        cta_hint = "CTA domenica: una riga che invita a guardare il link in bio (senza hype)."
    elif cta_mode == "fiera":
        cta_hint = "CTA domenica: una riga che invita a chiedere info sulla prossima fiera."
    else:
        raise ValueError("cta_mode must be dm|link_in_bio|fiera")

    system_msg = build_system_message(required_hashtags)
    
    prompt = (
        f"{brand_facts}\n\n"
        f"week_id: {wk}\n"
        f"theme: {theme}\n"
        f"goal: {goal}\n"
        f"voice: {voice}\n"
        f"featured_category: {featured_category}\n"
        f"availability_policy: {availability_policy}\n"
        f"{cta_hint}\n\n"
        "Genera un WEEK_BRIEF JSON.\n"
        "Vincoli:\n"
        "- keywords: 3–6 keyword brevi e riusabili (italiano).\n"
        "- continuity_rules: 1–3 frasi.\n"
        "- Niente emoji.\n"
    )

    resp = client.responses.create(
        model=model,
        input=[{"role":"system","content":system_msg},{"role":"user","content":prompt}],
        temperature=TEMPERATURE,
        max_output_tokens=MAX_OUTPUT_TOKENS_BRIEF,
        text={"format":{"type":"json_schema","name":"week_brief","strict":True,"schema":WEEK_BRIEF_SCHEMA}},
        store=False,
    )
    brief = json.loads(resp.output_text)
    validate_week_brief(brief)
    return brief

# -----------------------------
# Writing rules builder
# -----------------------------
def build_writing_rules(angle: str, prev_angle: Optional[str]) -> str:
    return (
        "SCRITTURA (vincoli obbligatori):\n"
        "- Caption in italiano, massimo 3 frasi totali.\n"
        "- Tono: descrittivo, concreto, artigianale. Niente marketing.\n"
        "- Vietato usare frasi generiche o astratte (vedi do_not_use).\n"
        "- Usa descrizioni osservabili: forma, superficie, venatura, gesto manuale, luce.\n\n"
        "STRUTTURA (obbligatoria):\n"
        "- Frase 1: descrizione concreta di ciò che si vede nell'immagine.\n"
        "- Frase 2: un aspetto materiale o manuale specifico coerente con l'immagine.\n"
        "- Frase 3: chiusura fissa di brand (se prevista dal template).\n\n"
        "VARIAZIONE (anti-ripetizione):\n"
        f"- Angolo descrittivo di questo post: '{angle}'. Usa SOLO questo angolo.\n"
        + (f"- Angolo del post precedente: '{prev_angle}'. Non ripeterlo.\n" if prev_angle else "")
        + "\nCONTENUTO:\n"
        "- Usa ESATTAMENTE 1 o 2 parole chiave da WEEK_BRIEF.keywords.\n"
        "- Riporta le parole chiave scelte anche nel campo keywords_used.\n"
        "- Non usare CTA.\n"
    )

# -----------------------------
# Post generation
# -----------------------------
def generate_post(
    template_id: str,
    subject: str,
    image_path: str,
    slot_index: int,
    day_name: str,
    post_role: str,
    cta_enabled: bool,
    week_brief: Dict[str, Any],
    brand_facts: str,
    template_specs: Dict[str, Any],
    required_hashtags: List[str],
    base_hashtags: List[str],
    availability_policy: str,
    angle: str,
    prev_angle: Optional[str],
    custom_banned_phrases: List[str] = None,
    model: str = MODEL,
) -> Dict[str, Any]:
    spec = template_specs[template_id]
    data_url = img_to_data_url(image_path)
    cta_text = week_brief["cta"]["text"].strip()
    do_not_use = default_do_not_use(availability_policy, cta_enabled, custom_banned_phrases)

    system_msg = build_system_message(required_hashtags)
    writing_rules = build_writing_rules(angle=angle, prev_angle=prev_angle)
    
    fixed_hashtags = required_hashtags + base_hashtags

    user_instructions = (
        f"{brand_facts}\n\n"
        f"WEEK_BRIEF: {json.dumps(week_brief, ensure_ascii=False)}\n"
        f"TEMPLATE: {template_id}\n"
        f"SLOT_INDEX: {slot_index}\n"
        f"DAY_NAME: {day_name}\n"
        f"POST_ROLE: {post_role}\n"
        f"CTA_ENABLED: {cta_enabled}\n"
        f"SUBJECT (hint): {subject}\n\n"
        f"do_not_use (esattamente questa lista): {do_not_use}\n\n"
        "VINCOLI TEMPLATE:\n"
        f"- {spec['title_rule']}\n"
        f"- {spec['caption_rule']}\n"
        f"- {spec['alt_rule']}\n\n"
        + writing_rules +
        "\nOUTPUT:\n"
        "- Restituisci SOLO JSON conforme allo schema.\n"
        "- ig_caption_full = caption + newline + hashtags su una sola riga.\n"
        f"- hashtags devono includere almeno: {fixed_hashtags}\n"
        + (
            f"- Poiché CTA_ENABLED=True: la caption DEVE terminare con questa riga identica (ultima riga): {cta_text}\n"
            if cta_enabled else
            "- Poiché CTA_ENABLED=False: NON inserire CTA (DM/link/acquisto/disponibilità).\n"
        )
    )

    def _call(extra: Optional[str] = None) -> Dict[str, Any]:
        msgs = [
            {"role":"system","content":system_msg},
            {"role":"user","content":[
                {"type":"input_text","text":user_instructions},
                {"type":"input_image","image_url":data_url},
            ]},
        ]
        if extra:
            msgs.append({"role":"user","content":extra})
        r = client.responses.create(
            model=model,
            input=msgs,
            temperature=TEMPERATURE,
            max_output_tokens=MAX_OUTPUT_TOKENS_POST,
            text={"format":{"type":"json_schema","name":"post","strict":True,"schema":POST_SCHEMA}},
            store=False,
        )
        return json.loads(r.output_text)

    post = _call()
    try:
        validate_post(post, template_id, day_name, week_brief, cta_enabled, template_specs, required_hashtags)
        return post
    except Exception as e:
        if MAX_RETRIES_POST <= 0:
            raise
        post2 = _call(extra=f"Fix ONLY the validation issue: {str(e)}. Return only corrected JSON.")
        validate_post(post2, template_id, day_name, week_brief, cta_enabled, template_specs, required_hashtags)
        return post2

# -----------------------------
# Image routing
# -----------------------------
PREFIX_TO_TEMPLATE = {
    "oggetto":  "T1_OGGETTO",
    "dettaglio":"T2_DETTAGLIO",
    "processo":"T3_PROCESSO",
    "storia":   "T4_STORIA",
}

def _infer_prefix(image_path: str) -> str:
    name = Path(image_path).stem.lower()
    if "_" not in name:
        raise ValueError(f"Filename must start with prefix_ (e.g., oggetto_xxx.jpg). Got: {Path(image_path).name}")
    return name.split("_", 1)[0].strip()

def bucket_images_by_prefix(images: List[str]) -> Dict[str, List[str]]:
    buckets = defaultdict(list)
    for p in ensure_paths(images):
        prefix = _infer_prefix(p)
        if prefix not in PREFIX_TO_TEMPLATE:
            raise ValueError(f"Unknown prefix '{prefix}' in {Path(p).name}. Use: {list(PREFIX_TO_TEMPLATE)}")
        buckets[PREFIX_TO_TEMPLATE[prefix]].append(p)
    for k in buckets:
        buckets[k].sort()
    return dict(buckets)

def select_images_for_schedule(
    schedule: List[Tuple[str, str, str, bool]],
    buckets: Dict[str, List[str]],
    fallback_template: str = "T1_OGGETTO",
    strict: bool = False,
) -> List[str]:
    local = {k: v[:] for k, v in buckets.items()}

    def pop_any() -> str:
        for tid in sorted(local.keys()):
            if local[tid]:
                return local[tid].pop(0)
        raise RuntimeError("No images available in any bucket.")

    chosen = []
    for day_name, template_id, role, cta_enabled in schedule:
        if template_id in local and local[template_id]:
            chosen.append(local[template_id].pop(0))
            continue
        if strict:
            raise RuntimeError(f"Missing images for required template bucket: {template_id} (day={day_name})")
        if fallback_template in local and local[fallback_template]:
            chosen.append(local[fallback_template].pop(0))
            continue
        chosen.append(pop_any())
    return chosen

# -----------------------------
# Schedule builder
# -----------------------------
BASE_CYCLE = [
    ("mon","T1_OGGETTO","value", False),
    ("tue","T2_DETTAGLIO","material", False),
    ("wed","T1_OGGETTO","value", False),
    ("thu","T3_PROCESSO","process", False),
    ("fri","T1_OGGETTO","value", False),
    ("sat","T2_DETTAGLIO","material", False),
]
CTA_SLOT = ("sun","T4_STORIA","cta", True)

def build_schedule(n_posts: int) -> List[Tuple[str, str, str, bool]]:
    if n_posts <= 0:
        raise ValueError("n_posts must be >= 1")
    sched: List[Tuple[str,str,str,bool]] = []
    i = 0
    while len(sched) < min(n_posts, 6):
        sched.append(BASE_CYCLE[i % len(BASE_CYCLE)])
        i += 1
    if n_posts >= 7:
        while len(sched) < (n_posts - 1):
            sched.append(BASE_CYCLE[i % len(BASE_CYCLE)])
            i += 1
        sched.append(CTA_SLOT)
    return sched

# -----------------------------
# Hashtags
# -----------------------------
DEFAULT_HASHTAGS_BY_ROLE = {
    "value":    ["#artigianatoitaliano", "#creazioniartigianali", "#arteinlegno"],
    "material": ["#woodgrain", "#woodtexture", "#materialinaturali"],
    "process":  ["#lavorazioneartigianale", "#bottegaartigiana", "#handcraftedprocess"],
    "story":    ["#artigianiditalia", "#tradizione", "#madeinitaly"],
    "cta":      ["#artigianatoitaliano"],
}

def auto_hashtags_for_post(
    post: dict,
    required_hashtags: List[str],
    base_hashtags: List[str],
    hashtags_by_role: Dict[str, List[str]] = None,
    n_total: int = 10
) -> list:
    role = post.get("post_role", "value")
    
    if hashtags_by_role is None:
        hashtags_by_role = DEFAULT_HASHTAGS_BY_ROLE

    tags = []
    tags += required_hashtags
    tags += base_hashtags
    tags += hashtags_by_role.get(role, [])

    seen = set()
    out = []
    for t in tags:
        if t not in seen:
            out.append(t)
            seen.add(t)

    return out[:n_total]

# -----------------------------
# MAIN: generate_posts
# -----------------------------
def generate_posts(
    # Campaign params (from original notebook)
    goal: str,
    theme: str,
    images: List[str],
    n_posts: int = 6,
    cta_mode: str = "dm",
    voice: str = "minimal",
    featured_category: str = "mix",
    availability_policy: str = "no_availability",
    strict_routing: bool = False,
    subject_from_file: bool = True,
    # Brand params (configurable)
    brand_name: str = "Brand",
    brand_description: str = "",
    brand_tagline: str = "",
    brand_history: str = "",
    required_hashtags: List[str] = None,
    base_hashtags: List[str] = None,
    custom_banned_phrases: List[str] = None,
    # Model
    model: str = MODEL,
) -> Dict[str, Any]:
    
    # Defaults
    if required_hashtags is None:
        required_hashtags = ["#handmade"]
    if base_hashtags is None:
        base_hashtags = []
    
    # Build brand-specific components
    brand_facts = build_brand_facts(brand_name, brand_description, brand_tagline, brand_history)
    template_specs = build_template_specs(brand_name, brand_tagline)

    schedule = build_schedule(n_posts)
    buckets = bucket_images_by_prefix(images)
    chosen_images = select_images_for_schedule(schedule, buckets, strict=strict_routing)

    week_brief = generate_week_brief(
        goal=goal,
        theme=theme,
        brand_facts=brand_facts,
        required_hashtags=required_hashtags,
        cta_mode=cta_mode,
        voice=voice,
        featured_category=featured_category,
        availability_policy=availability_policy,
        model=model,
    )

    posts = []
    prev_angle: Optional[str] = None

    for idx, (day_name, template_id, post_role, cta_enabled) in enumerate(schedule):
        angle = choose_angle(prev_angle)

        subj = theme
        if subject_from_file:
            subj = subject_from_filename(chosen_images[idx], fallback=theme)

        post = generate_post(
            template_id=template_id,
            subject=subj,
            image_path=chosen_images[idx],
            slot_index=idx,
            day_name=day_name,
            post_role=post_role,
            cta_enabled=cta_enabled,
            week_brief=week_brief,
            brand_facts=brand_facts,
            template_specs=template_specs,
            required_hashtags=required_hashtags,
            base_hashtags=base_hashtags,
            availability_policy=availability_policy,
            angle=angle,
            prev_angle=prev_angle,
            custom_banned_phrases=custom_banned_phrases,
            model=model,
        )
        
        # Add hashtags
        tags = auto_hashtags_for_post(post, required_hashtags, base_hashtags, n_total=10)
        post["content"]["hashtags"] = tags
        post["ig_caption_full"] = post["caption"].rstrip() + "\n" + " ".join(tags)
        
        posts.append(post)
        prev_angle = angle

    return {
        "week_brief": week_brief,
        "schedule": schedule,
        "chosen_images": chosen_images,
        "posts": posts,
    }