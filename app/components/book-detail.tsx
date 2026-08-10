"use client";

import { FormEvent, useState } from "react";
import type { BookCard } from "../types";

type Props = { book: BookCard | null; onClose: () => void; onDelete: (id: string) => Promise<void>; onUpdate: (book: BookCard) => Promise<void> };

export function BookDetail({ book, onClose, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(() => book?.titulo ?? "");
  const [author, setAuthor] = useState(() => book?.autor ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!book) return null;
  const selectedBook = book;

  async function saveChanges(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) { setError("El título es obligatorio."); return; }
    setSaving(true); setError("");
    try { await onUpdate({ ...selectedBook, titulo: nextTitle, autor: author.trim() || null }); setEditing(false); }
    catch (caughtError) { setError(caughtError instanceof Error ? caughtError.message : "No se pudieron guardar los cambios."); }
    finally { setSaving(false); }
  }

  return <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="book-dialog" role="dialog" aria-modal="true" aria-labelledby="book-title" onMouseDown={(event) => event.stopPropagation()}>
      <button className="icon-button close-button" onClick={onClose} aria-label="Cerrar detalle">×</button>
      <div className="dialog-header"><span className="eyebrow">Ficha de lectura</span>
        {editing ? <form className="edit-book-form" onSubmit={saveChanges}>
          <label htmlFor="edit-title">Título</label><input id="edit-title" value={title} onChange={(event) => setTitle(event.target.value)} autoFocus />
          <label htmlFor="edit-author">Autor</label><input id="edit-author" value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="Autor no visible" />
          <div className="edit-actions"><button className="text-button" type="button" onClick={() => setEditing(false)}>Cancelar</button><button className="primary-button" disabled={saving} type="submit">{saving ? "Guardando…" : "Guardar"}</button></div>{error && <p className="form-error" role="alert">{error}</p>}
        </form> : <div className="title-row"><div><h2 id="book-title">{book.titulo}</h2><p className="meta">{book.autor || "Autor no visible"}{book.categoria ? ` · ${book.categoria}` : ""}</p></div><div className="detail-actions"><span className={`relevance relevance-${book.nivel_relevancia}`}>{book.nivel_relevancia}</span><button className="text-button" onClick={() => setEditing(true)}>Editar</button></div></div>}
      </div>
      <div className="detail-grid"><section className="detail-section ideas-section"><h3>Ideas clave</h3><ol>{book.ideas_clave.map((idea) => <li key={idea}>{idea}</li>)}</ol></section><section className="detail-section"><h3>Esta semana</h3><p>{book.aplicacion_vida_diaria}</p></section><section className="detail-section"><h3>Post para @jaywrkr</h3><p>{book.aplicacion_contenido}</p></section><section className="detail-section"><h3>Trabajo y liderazgo</h3><p>{book.aplicacion_profesional}</p></section></div>
      {book.frase_destacada && <blockquote>“{book.frase_destacada}”</blockquote>}<button className="delete-button" onClick={() => void onDelete(book.id)}>Eliminar tarjeta</button>
    </section>
  </div>;
}
