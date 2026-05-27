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
                if photos:
                    first_photo = str(person_dir / photos[0])
                    people.append({"name": person_dir.name, "photo_count": len(photos), "thumb": photos[0]})
                else:
                    people.append({"name": person_dir.name, "photo_count": 0, "thumb": None})
    return jsonify(people)


@app.route("/api/people/<name>/photo/<filename>")
def get_person_photo(name, filename):
    person_dir = REFERENCES_DIR / name
    if person_dir.exists():
        return send_from_directory(str(person_dir), filename)
    return jsonify({"error": "Não encontrado"}), 404


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


@app.route("/api/videos", methods=["GET"])
def list_videos():
    vids = []
    if VIDEOS_DIR.exists():
        for f in sorted(VIDEOS_DIR.iterdir()):
            if f.is_file() and f.suffix.lower() in {".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"}:
                size_mb = round(f.stat().st_size / (1024 * 1024), 1)
                vids.append({"filename": f.name, "original_name": f.stem, "size_mb": size_mb})
    return jsonify(vids)


@app.route("/api/videos", methods=["POST"])
def upload_videos():
    files = request.files.getlist("videos")
    if not files or not files[0].filename:
        return jsonify({"error": "Envie pelo menos um vídeo"}), 400

    saved = []
    for v in files:
        if v.filename:
            original = Path(v.filename).name
            dest = VIDEOS_DIR / original
            if dest.exists():
                stem = Path(v.filename).stem
                ext = Path(v.filename).suffix
                original = f"{stem}_{uuid.uuid4().hex[:4]}{ext}"
                dest = VIDEOS_DIR / original
            v.save(str(dest))
            saved.append(original)

    return jsonify({"uploaded": saved})


@app.route("/api/videos/<filename>", methods=["DELETE"])
def delete_video(filename):
    video_path = VIDEOS_DIR / filename
    if video_path.exists():
        video_path.unlink()
        return jsonify({"deleted": filename})
    return jsonify({"error": "Vídeo não encontrado"}), 404


@app.route("/api/process", methods=["POST"])
def start_processing():
    selected = request.json.get("videos", []) if request.is_json else []

    if not selected:
        return jsonify({"error": "Selecione pelo menos um vídeo"}), 400

    people_dirs = [d for d in REFERENCES_DIR.iterdir() if d.is_dir()]
    if not people_dirs:
        return jsonify({"error": "Cadastre pelo menos uma pessoa antes de processar"}), 400

    job_id = str(uuid.uuid4())[:8]

    video_paths = []
    video_names = []
    for fname in selected:
        vpath = VIDEOS_DIR / fname
        if vpath.exists():
            video_paths.append(str(vpath))
            video_names.append(fname)

    req_data = request.json if request.is_json else {}
    fps = float(req_data.get("fps", 1.0))
    tolerance = float(req_data.get("tolerance", 0.6))
    start = req_data.get("start") or None
    end = req_data.get("end") or None

    jobs[job_id] = {
        "status": "processing",
        "progress": "Iniciando...",
        "videos": video_names,
        "results": None,
    }

    thread = threading.Thread(
        target=_process_job,
        args=(job_id, video_paths, video_names, fps, tolerance, start, end),
        daemon=True,
    )
    thread.start()

    return jsonify({"job_id": job_id})


def _process_job(job_id, video_paths, video_names, fps, tolerance, start, end):
    try:
        matches_dir = str(RESULTS_DIR / f"matches_{job_id}")
        Path(matches_dir).mkdir(parents=True, exist_ok=True)

        jobs[job_id]["progress"] = "Carregando referências..."
        refs = load_references(str(REFERENCES_DIR), tolerance)

        all_results = {}

        for idx, (video_path, video_name) in enumerate(zip(video_paths, video_names)):
            jobs[job_id]["progress"] = f"Extraindo frames: {video_name} ({idx + 1}/{len(video_paths)})..."
            frames_dir = str(RESULTS_DIR / f"frames_{job_id}_{idx}")
            extract_frames(video_path, frames_dir, fps, start, end)

            jobs[job_id]["progress"] = f"Varrendo: {video_name} ({idx + 1}/{len(video_paths)})..."
            results = scan_frames(frames_dir, refs, tolerance, fps, matches_dir)

            for name, matches in results.items():
                for m in matches:
                    m["video"] = video_name
                if name not in all_results:
                    all_results[name] = []
                all_results[name].extend(matches)

        result_path = RESULTS_DIR / f"{job_id}.json"
        with open(result_path, "w", encoding="utf-8") as f:
            json.dump(all_results, f, ensure_ascii=False, indent=2)

        summary = {}
        for name, matches in all_results.items():
            summary[name] = {
                "total_appearances": len(matches),
                "timestamps": [m["timestamp"] for m in matches],
                "videos": list(set(m["video"] for m in matches)),
                "avg_confidence": round(sum(m["confidence"] for m in matches) / len(matches), 3) if matches else 0,
                "best_matches": matches[:6],
            }

        jobs[job_id]["status"] = "done"
        jobs[job_id]["progress"] = "Concluído!"
        jobs[job_id]["results"] = summary
        jobs[job_id]["full_results"] = all_results

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


@app.route("/api/matches/<job_id>/<filename>")
def get_match_image(job_id, filename):
    matches_path = RESULTS_DIR / f"matches_{job_id}"
    if matches_path.exists():
        return send_from_directory(str(matches_path), filename)
    return jsonify({"error": "Não encontrado"}), 404


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("-p", "--port", type=int, default=8080)
    args = parser.parse_args()
    app.run(debug=True, host="0.0.0.0", port=args.port)
