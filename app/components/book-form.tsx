"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import type { BookInsight } from "../types";

type Props = {
  onExtracted: (book: BookInsight, cover: string | null) => void;
};

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

export function BookForm({ onExtracted }: Props) {
  const [summary, setSummary] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Usa una imagen de hasta 4 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result));
      setImageName(file.name);
      setError("");
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!summary.trim() && !image) {
      setError("Pega un resumen o selecciona una imagen.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: summary, image }),
      });
      const data = (await response.json()) as BookInsight & { error?: string };
      if (!response.ok) throw new Error(data.error || "No se pudo crear la tarjeta.");
      onExtracted(data, image);
      setSummary("");
      setImage(null);
      setImageName("");
      if (inputRef.current) inputRef.current.value = "";
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="capture-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <span className="eyebrow">Captura</span>
        <h2>Del libro a la acción.</h2>
      </div>
      <label className="field-label" htmlFor="summary">Resumen, notas o texto visible</label>
      <textarea
        id="summary"
        value={summary}
        onChange={(event) => setSummary(event.target.value)}
        placeholder="Pega un resumen o una nota del libro…"
        rows={5}
      />
      <div className="form-footer">
        <label className="upload-button" htmlFor="book-image">
          <span aria-hidden="true">+</span>
          {imageName || "Subir imagen"}
          <input ref={inputRef} id="book-image" type="file" accept="image/*" onChange={handleImage} />
        </label>
        <button className="primary-button" disabled={loading} type="submit">
          {loading ? "Analizando…" : "Crear tarjeta"}
          {!loading && <span aria-hidden="true">→</span>}
        </button>
      </div>
      {image && <p className="file-note">Imagen adjunta: {imageName}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}
