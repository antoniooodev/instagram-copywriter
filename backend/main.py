"""
Instagram Copywriter API
"""

import os
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import shutil

import copywriter

# =============================================================================
# API KEY 
# =============================================================================
OPENAI_API_KEY = "sk-proj-YOUR_API_KEY_HERE"
# =============================================================================

app = FastAPI(
    title="Instagram Copywriter API",
    description="API per la generazione automatica di contenuti Instagram",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
async def startup_event():
    if OPENAI_API_KEY == "sk-proj-YOUR_API_KEY_HERE":
        print("ATTENZIONE: Inserire la API key OpenAI in main.py")
    else:
        copywriter.init_client(OPENAI_API_KEY)
        print("Client OpenAI inizializzato")


# -----------------------------
# Pydantic Models
# -----------------------------
class GenerateRequest(BaseModel):
    # Campaign params (dal file originale)
    goal: str
    theme: str
    images: List[str]
    n_posts: int = 6
    cta_mode: str = "dm"  # dm | link_in_bio | fiera
    voice: str = "minimal"
    featured_category: str = "mix"
    availability_policy: str = "no_availability"
    strict_routing: bool = False
    
    # Brand params (configurabili dall'utente)
    brand_name: str
    brand_description: str
    brand_tagline: str = ""
    brand_history: str = ""
    required_hashtags: List[str]
    base_hashtags: List[str] = []


# -----------------------------
# Endpoints
# -----------------------------
@app.get("/")
async def root():
    return {
        "message": "Instagram Copywriter API",
        "version": "1.0.0",
        "status": "ready" if OPENAI_API_KEY != "sk-proj-YOUR_API_KEY_HERE" else "api_key_missing"
    }


@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload singola immagine."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Il file deve essere un'immagine")
    
    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        prefix = copywriter._infer_prefix(str(file_path))
        template = copywriter.PREFIX_TO_TEMPLATE.get(prefix, "unknown")
    except:
        template = "unknown"
    
    return {
        "filename": file.filename,
        "path": f"/uploads/{file.filename}",
        "full_path": str(file_path.absolute()),
        "inferred_template": template
    }


@app.post("/upload-multiple")
async def upload_multiple_images(files: List[UploadFile] = File(...)):
    """Upload multiple immagini."""
    results = []
    for file in files:
        if not file.content_type.startswith("image/"):
            continue
        
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        try:
            prefix = copywriter._infer_prefix(str(file_path))
            template = copywriter.PREFIX_TO_TEMPLATE.get(prefix, "unknown")
        except:
            template = "unknown"
        
        results.append({
            "filename": file.filename,
            "path": f"/uploads/{file.filename}",
            "full_path": str(file_path.absolute()),
            "inferred_template": template
        })
    
    return {"uploaded": results}


@app.post("/generate")
async def generate_posts(request: GenerateRequest):
    """Genera i post Instagram."""
    
    if OPENAI_API_KEY == "sk-proj-YOUR_API_KEY_HERE":
        raise HTTPException(
            status_code=500, 
            detail="API key OpenAI non configurata. Modificare OPENAI_API_KEY in main.py"
        )
    
    try:
        # Converti path relativi in assoluti
        image_paths = []
        for img in request.images:
            if img.startswith("/uploads/"):
                image_paths.append(str(UPLOAD_DIR / Path(img).name))
            else:
                image_paths.append(img)
        
        # Chiama generate_posts con tutti i parametri
        result = copywriter.generate_posts(
            # Campaign params
            goal=request.goal,
            theme=request.theme,
            images=image_paths,
            n_posts=request.n_posts,
            cta_mode=request.cta_mode,
            voice=request.voice,
            featured_category=request.featured_category,
            availability_policy=request.availability_policy,
            strict_routing=request.strict_routing,
            # Brand params
            brand_name=request.brand_name,
            brand_description=request.brand_description,
            brand_tagline=request.brand_tagline,
            brand_history=request.brand_history,
            required_hashtags=request.required_hashtags,
            base_hashtags=request.base_hashtags,
        )
        
        # Aggiungi URL immagini per il frontend
        for i, post in enumerate(result["posts"]):
            if i < len(request.images):
                post["image_url"] = request.images[i]
        
        return result
        
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore generazione: {str(e)}")


@app.get("/schedule-preview")
async def preview_schedule(n_posts: int = 6):
    """Anteprima calendario."""
    schedule = copywriter.build_schedule(n_posts)
    
    day_names = {
        "mon": "Lunedì", "tue": "Martedì", "wed": "Mercoledì",
        "thu": "Giovedì", "fri": "Venerdì", "sat": "Sabato", "sun": "Domenica"
    }
    
    return {
        "n_posts": n_posts,
        "schedule": [
            {
                "index": i,
                "day_code": s[0],
                "day_name": day_names[s[0]],
                "template_id": s[1],
                "post_role": s[2],
                "cta_enabled": s[3]
            }
            for i, s in enumerate(schedule)
        ]
    }


@app.get("/uploads")
async def list_uploads():
    """Lista file caricati."""
    files = []
    for f in UPLOAD_DIR.iterdir():
        if f.is_file() and f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
            try:
                prefix = copywriter._infer_prefix(str(f))
                template = copywriter.PREFIX_TO_TEMPLATE.get(prefix, "unknown")
            except:
                template = "unknown"
            
            files.append({
                "filename": f.name,
                "path": f"/uploads/{f.name}",
                "inferred_template": template
            })
    return {"files": files}


@app.delete("/uploads/{filename}")
async def delete_upload(filename: str):
    """Elimina file."""
    file_path = UPLOAD_DIR / filename
    if file_path.exists():
        file_path.unlink()
        return {"deleted": filename}
    raise HTTPException(status_code=404, detail="File non trovato")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)