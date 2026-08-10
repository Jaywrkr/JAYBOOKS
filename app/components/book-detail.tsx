"use client";

import type { BookCard } from "../types";

type Props = {
  book: BookCard | null;
  onClose: () => void;
  onDelete: (id: string) => void;
};

export function BookDetail({ book, onClose, onDelete }: Props) {
  if (!book) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="book-dialog" role="dialog" aria-modal="true" aria-labelledby="book-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button close-button" onClick={onClose} aria-label="Cerrar detalle">×</button>
        <div className="dialog-header">
          <span className="eyebrow">Ficha de lectura</span>
          <div className="title-row">
            <h2 id="book-title">{book.titulo}</h2>
            <span className={`relevance relevance-${book.nivel_relevancia}`}>{book.nivel_relevancia}</span>
          </div>
          <p className="meta">{book.autor || "Autor no visible"}{book.categoria ? ` · ${book.categoria}` : ""}</p>
        </div>
        <div className="detail-grid">
          <section className="detail-section ideas-section">
            <h3>Ideas clave</h3>
            <ol>
              {book.ideas_clave.map((idea) => <li key={idea}>{idea}</li>)}
            </ol>
          </section>
          <section className="detail-section">
            <h3>Esta semana</h3>
            <p>{book.aplicacion_vida_diaria}</p>
          </section>
          <section className="detail-section">
            <h3>Post para @jaywrkr</h3>
            <p>{book.aplicacion_contenido}</p>
          </section>
          <section className="detail-section">
            <h3>Trabajo y liderazgo</h3>
            <p>{book.aplicacion_profesional}</p>
          </section>
        </div>
        {book.frase_destacada && <blockquote>“{book.frase_destacada}”</blockquote>}
        <button className="delete-button" onClick={() => onDelete(book.id)}>Eliminar tarjeta</button>
      </section>
    </div>
  );
}
