#!/usr/bin/env python3
import json
import os
import shutil
import threading
import uuid
from pathlib import Path

from flask import Flask, render_template, request, jsonify, send_from_directory

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from extractor import extract_frames
from scanner import load_references, scan_frames

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
RESULTS_DIR = BASE_DIR / "results"
REFERENCES_DIR = UPLOAD_DIR / "references"
VIDEOS_DIR = UPLOAD_DIR / "videos"

for d in [UPLOAD_DIR, RESULTS_DIR, REFERENCES_DIR, VIDEOS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

jobs = {}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/people", methods=["GET"])
def list_people():
    people = []
    if REFERENCES_DIR.exists():
        for person_dir in sorted(REFERENCES_DIR.iterdir()):
            if person_dir.is_dir():
                photos = [f.name for f in person_dir.iterdir() if f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}]
                people.append({"name": person_dir.name, "photo_count": len(photos)})
    return jsonify(people)


@app.route("/api/people", methods=["POST"])
def add_person():
    name = request.form.get("name", "").strip()
    if not name:
        return jsonify({"error": "Nome é obrigatório"}), 400

    person_dir = REFERENCES_DIR / name
    person_dir.mkdir(parents=True, exist_ok=True)

    files = request.files.getlist("photos")
    if not files:
        return jsonify({"error": "Envie pelo menos uma foto"}), 400

    saved = 0
    for f in files:
        if f.filename:
            ext = Path(f.filename).suffix.lower()
            if ext in {".jpg", ".jpeg", ".png", ".webp"}:
                dest = person_dir / f"{name}_{saved + 1}{ext}"
                f.save(str(dest))
                saved += 1

    return jsonify({"name": name, "photos_saved": saved})


@app.route("/api/people/<name>", methods=["DELETE"])
def delete_person(name):
    person_dir = REFERENCES_DIR / name
    if person_dir.exists():
        shutil.rmtree(person_dir)
        return jsonify({"deleted": name})
    return jsonify({"error": "Pessoa não encontrada"}), 404


@app.route("/api/process", methods=["POST"])
def start_processing():
    video = request.files.get("video")
    if not video or not video.filename:
        return jsonify({"error": "Envie um vídeo"}), 400

    people_dirs = [d for d in REFERENCES_DIR.iterdir() if d.is_dir()]
    if not people_dirs:
        return jsonify({"error": "Cadastre pelo menos uma pessoa antes de processar"}), 400

    job_id = str(uuid.uuid4())[:8]
    video_ext = Path(video.filename).suffix
    video_path = VIDEOS_DIR / f"{job_id}{video_ext}"
    video.save(str(video_path))

    fps = float(request.form.get("fps", 1.0))
    tolerance = float(request.form.get("tolerance", 0.6))
    start = request.form.get("start") or None
    end = request.form.get("end") or None

    jobs[job_id] = {
        "status": "processing",
        "progress": "Iniciando extração de frames...",
        "video": video.filename,
        "results": None,
    }

    thread = threading.Thread(
        target=_process_job,
        args=(job_id, str(video_path), fps, tolerance, start, end),
        daemon=True,
    )
    thread.start()

    return jsonify({"job_id": job_id})


def _process_job(job_id, video_path, fps, tolerance, start, end):
    try:
        frames_dir = str(RESULTS_DIR / f"frames_{job_id}")

        jobs[job_id]["progress"] = "Extraindo frames do vídeo..."
        extract_frames(video_path, frames_dir, fps, start, end)

        jobs[job_id]["progress"] = "Carregando referências..."
        refs = load_references(str(REFERENCES_DIR), tolerance)

        jobs[job_id]["progress"] = "Varrendo frames (isso pode demorar)..."
        results = scan_frames(frames_dir, refs, tolerance, fps)

        result_path = RESULTS_DIR / f"{job_id}.json"
        with open(result_path, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

        summary = {}
        for name, matches in results.items():
            summary[name] = {
                "total_appearances": len(matches),
                "timestamps": [m["timestamp"] for m in matches],
                "avg_confidence": round(sum(m["confidence"] for m in matches) / len(matches), 3) if matches else 0,
            }

        jobs[job_id]["status"] = "done"
        jobs[job_id]["progress"] = "Concluído!"
        jobs[job_id]["results"] = summary
        jobs[job_id]["full_results"] = results

    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["progress"] = f"Erro: {str(e)}"


@app.route("/api/jobs/<job_id>", methods=["GET"])
def job_status(job_id):
    if job_id not in jobs:
        return jsonify({"error": "Job não encontrado"}), 404
    return jsonify(jobs[job_id])


@app.route("/api/jobs/<job_id>/download", methods=["GET"])
def download_results(job_id):
    result_file = RESULTS_DIR / f"{job_id}.json"
    if result_file.exists():
        return send_from_directory(str(RESULTS_DIR), f"{job_id}.json", as_attachment=True)
    return jsonify({"error": "Resultados não encontrados"}), 404


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
