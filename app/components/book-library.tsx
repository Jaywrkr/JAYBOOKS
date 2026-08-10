"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { BookDetail } from "./book-detail";
import { BookForm } from "./book-form";
import type { BookCard, BookInsight } from "../types";

const STORAGE_KEY = "jaybooks-library-v1";

function readSavedBooks(): BookCard[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as BookCard[];
  } catch {
    return [];
  }
}

export function BookLibrary() {
  const [books, setBooks] = useState<BookCard[]>([]);
  const [selected, setSelected] = useState<BookCard | null>(null);
  const [query, setQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setBooks(readSavedBooks());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }, [books, hydrated]);

  const visibleBooks = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return books;
    return books.filter((book) => [book.titulo, book.autor, book.categoria, ...book.ideas_clave]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase()
      .includes(normalized));
  }, [books, query]);

  function addBook(insight: BookInsight, cover: string | null) {
    const book: BookCard = {
      ...insight,
      id: crypto.randomUUID(),
      portada: cover,
      createdAt: new Date().toISOString(),
    };
    setBooks((current) => [book, ...current]);
    setSelected(book);
  }

  function deleteBook(id: string) {
    setBooks((current) => current.filter((book) => book.id !== id));
    setSelected(null);
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="JAYBOOKS inicio">JAY<span>BOOKS</span></a>
        <p>Biblioteca de ideas aplicadas</p>
        <span className="book-count">{books.length} {books.length === 1 ? "libro" : "libros"}</span>
      </header>
      <div className="page-shell" id="top">
        <section className="hero">
          <div>
            <span className="eyebrow">Lecturas que se convierten en acción</span>
            <h1>Tu próxima buena idea<br /><em>ya está en un libro.</em></h1>
            <p className="hero-copy">Guarda lo importante, tradúcelo a contenido y úsalo para liderar mejor.</p>
          </div>
          <div className="hero-mark" aria-hidden="true"><span>J</span><i>·</i><span>B</span></div>
        </section>
        <BookForm onExtracted={addBook} />
        <section className="library-section" aria-labelledby="library-heading">
          <div className="library-toolbar">
            <div>
              <span className="eyebrow">Colección</span>
              <h2 id="library-heading">Mis tarjetas</h2>
            </div>
            <label className="search-label">
              <span className="sr-only">Buscar tarjetas</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por título, autor o idea" />
            </label>
          </div>
          {!hydrated ? <div className="empty-state">Cargando biblioteca…</div> : visibleBooks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">✦</span>
              <h3>{books.length ? "No encontramos esa tarjeta" : "Tu biblioteca empieza aquí"}</h3>
              <p>{books.length ? "Prueba con otro término de búsqueda." : "Pega un resumen o sube una imagen para crear la primera ficha."}</p>
            </div>
          ) : (
            <div className="book-grid">
              {visibleBooks.map((book) => (
                <button className="book-card" key={book.id} onClick={() => setSelected(book)}>
                  <div className={`cover cover-${book.nivel_relevancia}`}>
                    {book.portada ? <Image src={book.portada} alt="" fill sizes="(max-width: 700px) 35vw, 33vw" unoptimized /> : <span>{book.titulo.slice(0, 1).toUpperCase()}</span>}
                  </div>
                  <div className="card-copy">
                    <span className="card-category">{book.categoria || "Lectura"}</span>
                    <h3>{book.titulo}</h3>
                    <p>{book.autor || "Autor no visible"}</p>
                    <span className="open-detail">Ver ficha <span aria-hidden="true">↗</span></span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
      <BookDetail book={selected} onClose={() => setSelected(null)} onDelete={deleteBook} />
    </main>
  );
}
