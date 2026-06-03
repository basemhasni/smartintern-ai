def chunk_text(text: str, chunk_size: int = 500) -> list[str]:
    cleaned_text = " ".join((text or "").split())

    if not cleaned_text:
        return []

    chunks = []
    start = 0

    while start < len(cleaned_text):
        chunk = cleaned_text[start:start + chunk_size].strip()
        if chunk:
            chunks.append(chunk)
        start += chunk_size

    return chunks
