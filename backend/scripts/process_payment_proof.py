import sys
import os
import json
import re
import fitz  # PyMuPDF


def extract_possible_line(text, keywords):
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    for i, line in enumerate(lines):
        lower = line.lower()

        if any(keyword in lower for keyword in keywords):
            nearby = lines[i:i + 3]
            return " | ".join(nearby)

    return ""


def process_pdf(file_path):
    doc = fitz.open(file_path)

    raw_text_parts = []

    for page in doc:
        raw_text_parts.append(page.get_text("text"))

    raw_text = "\n".join(raw_text_parts).strip()

    # Create first page preview image
    preview_path = ""

    if len(doc) > 0:
        first_page = doc[0]
        pix = first_page.get_pixmap(matrix=fitz.Matrix(2, 2))

        base_dir = os.path.dirname(file_path)
        preview_path = os.path.join(base_dir, f"preview-{os.path.basename(file_path)}.png")

        pix.save(preview_path)

    doc.close()

    return {
        "raw_extracted_text": raw_text,
        "possible_amount_text": extract_possible_line(
            raw_text,
            ["amount", "paid", "total", "r ", "zar"]
        ),
        "possible_reference_text": extract_possible_line(
            raw_text,
            ["reference", "ref", "beneficiary reference", "payment reference"]
        ),
        "possible_date_text": extract_possible_line(
            raw_text,
            ["date", "payment date", "transaction date", "effective date"]
        ),
        "preview_image_path": preview_path,
    }


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        return

    file_path = sys.argv[1]

    if not os.path.exists(file_path):
        print(json.dumps({"error": "File does not exist"}))
        return

    lower = file_path.lower()

    if lower.endswith(".pdf"):
        result = process_pdf(file_path)
    else:
        result = {
            "raw_extracted_text": "",
            "possible_amount_text": "",
            "possible_reference_text": "",
            "possible_date_text": "",
            "preview_image_path": "",
        }

    print(json.dumps(result))


if __name__ == "__main__":
    main()