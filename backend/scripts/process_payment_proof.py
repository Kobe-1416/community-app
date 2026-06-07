import sys
import os
import json
import re
import fitz  # PyMuPDF


def clean_line(line):
    return re.sub(r"\s+", " ", line).strip()


def get_lines(text):
    return [clean_line(line) for line in text.splitlines() if clean_line(line)]


def detect_bank(raw_text):
    lower = raw_text.lower()

    if "first national bank" in lower or "fnb" in lower:
        return "FNB"
    if "absa" in lower:
        return "ABSA"
    if "tymebank" in lower or "tyme bank" in lower:
        return "TymeBank"
    if "capitec" in lower:
        return "Capitec"
    if "nedbank" in lower:
        return "Nedbank"
    if "standard bank" in lower:
        return "Standard Bank"

    return "Unknown"


def value_from_label(lines, labels, max_lookahead=3):
    labels_lower = [label.lower() for label in labels]

    for i, line in enumerate(lines):
        lower = line.lower()

        for label in labels_lower:
            if label in lower:
                # Case 1: "Payment date: 2026-05-27"
                if ":" in line:
                    after_colon = line.split(":", 1)[1].strip()
                    if after_colon:
                        return f"{line}"

                # Case 2: label on one line, value on next line
                for j in range(i + 1, min(len(lines), i + 1 + max_lookahead)):
                    candidate = lines[j].strip()
                    if candidate:
                        return f"{line} | {candidate}"

                return line

    return ""


def extract_amount(lines, raw_text):
    amount_labels = [
        "cur/amount",
        "for the amount of",
        "payment amount",
        "amount paid",
        "paid amount",
        "transaction amount",
        "amount",
    ]

    section = value_from_label(lines, amount_labels, max_lookahead=3)

    # Try extract amount from the section first
    amount_patterns = [
        r"\bZAR\s?[\d,]+(?:\.\d{2})?\b",
        r"\bR\s?[\d,]+(?:\.\d{2})?\b",
        r"\b[\d,]+\.\d{2}\b",
    ]

    for pattern in amount_patterns:
        match = re.search(pattern, section, re.IGNORECASE)
        if match:
            return match.group(0)

    # Fallback: currency anywhere in document
    for pattern in [
        r"\bZAR\s?[\d,]+(?:\.\d{2})?\b",
        r"\bR\s?[\d,]+(?:\.\d{2})?\b",
    ]:
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if match:
            return match.group(0)

    return section


def extract_reference(lines):
    reference_labels = [
        "reference on beneficiary statement",
        "payment reference",
        "beneficiary reference",
        "recipient reference",
        "statement reference",
        "my reference",
        "your reference",
        "reference",
        "ref",
    ]

    return value_from_label(lines, reference_labels, max_lookahead=3)


def extract_date(lines, raw_text):
    date_labels = [
        "date actioned",
        "payment date and time",
        "payment date",
        "transaction date",
        "effective date",
        "value date",
        "date paid",
        "date",
    ]

    section = value_from_label(lines, date_labels, max_lookahead=3)

    date_patterns = [
        r"\b\d{4}/\d{2}/\d{2}\b",
        r"\b\d{4}-\d{2}-\d{2}\b",
        r"\b\d{2}/\d{2}/\d{4}\b",
        r"\b\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}\b",
    ]

    for pattern in date_patterns:
        match = re.search(pattern, section)
        if match:
            return match.group(0)

    for pattern in date_patterns:
        match = re.search(pattern, raw_text)
        if match:
            return match.group(0)

    return section


def extract_recipient(lines):
    recipient_labels = [
        "payment made to",
        "recipient",
        "recipient name",
        "beneficiary name",
        "beneficiary",
        "payee",
        "name",
    ]

    return value_from_label(lines, recipient_labels, max_lookahead=3)


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

    return {
        "detected_bank": detect_bank(raw_text),
        "raw_extracted_text": raw_text,
        "possible_amount_text": extract_amount(lines, raw_text),
        "possible_reference_text": extract_reference(lines),
        "possible_date_text": extract_date(lines, raw_text),
        "possible_recipient_text": extract_recipient(lines),
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

    if file_path.lower().endswith(".pdf"):
        result = process_pdf(file_path)
    else:
        result = {
            "detected_bank": "Image upload",
            "raw_extracted_text": "",
            "possible_amount_text": "",
            "possible_reference_text": "",
            "possible_date_text": "",
            "possible_recipient_text": "",
            "preview_image_path": "",
        }

    print(json.dumps(result))


if __name__ == "__main__":
    main()