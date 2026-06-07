import sys
import os
import json
import re
import fitz  # PyMuPDF


def clean_line(line):
    return re.sub(r"\s+", " ", line).strip()


def get_lines(text):
    return [clean_line(line) for line in text.splitlines() if clean_line(line)]


def nearby_lines(lines, index, before=0, after=3):
    start = max(0, index - before)
    end = min(len(lines), index + after + 1)
    return " | ".join(lines[start:end])


def find_line_index(lines, keywords):
    for i, line in enumerate(lines):
        lower = line.lower()
        if any(keyword in lower for keyword in keywords):
            return i
    return -1


def find_amount(lines, raw_text):
    # Strong direct patterns first: ZAR30.00, ZAR 30.00, R850.00, R 850.00
    amount_patterns = [
        r"\bZAR\s?[\d,]+(?:\.\d{2})?\b",
        r"\bR\s?[\d,]+(?:\.\d{2})?\b",
    ]

    for pattern in amount_patterns:
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if match:
            return match.group(0)

    # Label-based fallback
    amount_keywords = [
        "cur/amount",
        "amount",
        "amount paid",
        "payment amount",
        "total amount",
        "paid amount",
        "transaction amount",
    ]

    index = find_line_index(lines, amount_keywords)

    if index != -1:
        return nearby_lines(lines, index, after=2)

    return ""


def find_reference(lines):
    reference_keywords = [
        "reference",
        "payment reference",
        "beneficiary reference",
        "recipient reference",
        "statement reference",
        "my reference",
        "your reference",
        "ref",
    ]

    index = find_line_index(lines, reference_keywords)

    if index == -1:
        return ""

    return nearby_lines(lines, index, after=2)


def find_date(lines, raw_text):
    date_keywords = [
        "date actioned",
        "payment date",
        "transaction date",
        "effective date",
        "date paid",
        "date",
    ]

    index = find_line_index(lines, date_keywords)

    if index != -1:
        return nearby_lines(lines, index, after=2)

    # Fallback date formats
    date_patterns = [
        r"\b\d{4}/\d{2}/\d{2}\b",
        r"\b\d{4}-\d{2}-\d{2}\b",
        r"\b\d{2}/\d{2}/\d{4}\b",
        r"\b\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}\b",
    ]

    for pattern in date_patterns:
        match = re.search(pattern, raw_text)
        if match:
            return match.group(0)

    return ""


def detect_bank(raw_text):
    lower = raw_text.lower()

    if "first national bank" in lower or "fnb" in lower:
        return "FNB"
    if "capitec" in lower:
        return "Capitec"
    if "standard bank" in lower:
        return "Standard Bank"
    if "nedbank" in lower:
        return "Nedbank"
    if "absa" in lower:
        return "ABSA"

    return "Unknown"


def process_pdf(file_path):
    doc = fitz.open(file_path)

    raw_text_parts = []

    for page in doc:
        raw_text_parts.append(page.get_text("text"))

    raw_text = "\n".join(raw_text_parts).strip()
    lines = get_lines(raw_text)

    preview_path = ""

    if len(doc) > 0:
        first_page = doc[0]
        pix = first_page.get_pixmap(matrix=fitz.Matrix(2, 2))

        base_dir = os.path.dirname(file_path)
        file_base = os.path.basename(file_path)
        preview_path = os.path.join(base_dir, f"preview-{file_base}.png")

        pix.save(preview_path)

    doc.close()

    detected_bank = detect_bank(raw_text)

    possible_amount = find_amount(lines, raw_text)
    possible_reference = find_reference(lines)
    possible_date = find_date(lines, raw_text)

    return {
        "detected_bank": detected_bank,
        "raw_extracted_text": raw_text,
        "possible_amount_text": possible_amount,
        "possible_reference_text": possible_reference,
        "possible_date_text": possible_date,
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
            "detected_bank": "Image upload",
            "raw_extracted_text": "",
            "possible_amount_text": "",
            "possible_reference_text": "",
            "possible_date_text": "",
            "preview_image_path": "",
        }

    print(json.dumps(result))


if __name__ == "__main__":
    main()