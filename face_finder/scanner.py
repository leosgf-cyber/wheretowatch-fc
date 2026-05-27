import json
import sys
from pathlib import Path

import cv2
import face_recognition
import numpy as np


def load_references(references_dir: str, tolerance: float = 0.6) -> dict:
    ref_dir = Path(references_dir)
    if not ref_dir.exists():
        print(f"Erro: pasta de referências não encontrada: {references_dir}")
        sys.exit(1)

    people = {}
    extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

    for img_path in sorted(ref_dir.iterdir()):
        if img_path.suffix.lower() not in extensions:
            continue

        name = img_path.stem.rsplit("_", 1)[0]

        img = face_recognition.load_image_file(str(img_path))
        encodings = face_recognition.face_encodings(img)

        if not encodings:
            print(f"  Aviso: nenhum rosto encontrado em '{img_path.name}', pulando.")
            continue

        if name not in people:
            people[name] = []
        people[name].append(encodings[0])

    print(f"Referências carregadas: {len(people)} pessoa(s)")
    for name, encs in people.items():
        print(f"  - {name}: {len(encs)} foto(s)")

    return people


def scan_frames(
    frames_dir: str,
    references: dict,
    tolerance: float = 0.6,
    fps: float = 1.0,
) -> dict:
    frames_path = Path(frames_dir)
    frame_files = sorted(frames_path.glob("frame_*.jpg"))

    if not frame_files:
        print(f"Nenhum frame encontrado em '{frames_dir}'")
        return {}

    print(f"\nVarrendo {len(frame_files)} frames...")

    all_known_encodings = []
    all_known_names = []
    for name, encodings in references.items():
        for enc in encodings:
            all_known_encodings.append(enc)
            all_known_names.append(name)

    results = {}
    for name in references:
        results[name] = []

    for i, frame_file in enumerate(frame_files):
        if (i + 1) % 50 == 0 or i == 0:
            print(f"  Processando frame {i + 1}/{len(frame_files)}...")

        img = cv2.imread(str(frame_file))
        if img is None:
            continue

        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb, model="hog")
        face_encodings = face_recognition.face_encodings(rgb, face_locations)

        for face_enc in face_encodings:
            distances = face_recognition.face_distance(all_known_encodings, face_enc)
            if len(distances) == 0:
                continue

            best_idx = np.argmin(distances)
            if distances[best_idx] <= tolerance:
                matched_name = all_known_names[best_idx]
                frame_number = i + 1
                timestamp_seconds = frame_number / fps
                timestamp = format_timestamp(timestamp_seconds)

                entry = {
                    "frame": frame_file.name,
                    "frame_number": frame_number,
                    "timestamp": timestamp,
                    "confidence": round(1 - float(distances[best_idx]), 3),
                }

                if entry not in results[matched_name]:
                    results[matched_name].append(entry)

    results = {name: matches for name, matches in results.items() if matches}
    return results


def format_timestamp(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    if h > 0:
        return f"{h:02d}:{m:02d}:{s:02d}"
    return f"{m:02d}:{s:02d}"


def print_results(results: dict):
    if not results:
        print("\nNenhuma pessoa identificada nos frames.")
        return

    print("\n" + "=" * 50)
    print("RESULTADOS DA VARREDURA")
    print("=" * 50)

    for name, matches in results.items():
        print(f"\n{name}: encontrado(a) em {len(matches)} frame(s)")
        for m in matches:
            print(f"  - {m['timestamp']} | {m['frame']} | confiança: {m['confidence']}")


def save_results(results: dict, output_path: str):
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\nResultados salvos em '{output_path}'")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Varrer frames buscando rostos conhecidos")
    parser.add_argument("frames", help="Pasta com os frames extraídos")
    parser.add_argument("references", help="Pasta com fotos de referência")
    parser.add_argument("-t", "--tolerance", type=float, default=0.6, help="Tolerância (0-1, menor = mais rígido, default: 0.6)")
    parser.add_argument("--fps", type=float, default=1.0, help="FPS usado na extração (para calcular timestamps)")
    parser.add_argument("-o", "--output", default="results.json", help="Arquivo de saída JSON (default: results.json)")

    args = parser.parse_args()
    refs = load_references(args.references, args.tolerance)
    results = scan_frames(args.frames, refs, args.tolerance, args.fps)
    print_results(results)
    save_results(results, args.output)
