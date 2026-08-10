"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { BookDetail } from "./book-detail";
import { BookForm } from "./book-form";
import type { BookCard, BookInsight } from "../types";

const ACCESS_SESSION_KEY = "jaybooks-access-code";
const LEGACY_STORAGE_KEY = "jaybooks-library-v1";

async function requestLibrary(accessCode: string) {
  const response = await fetch("/api/books", { headers: { "x-jaybooks-pin": accessCode }, cache: "no-store" });
  const payload = (await response.json()) as { books?: BookCard[]; error?: string };
  if (!response.ok) throw new Error(payload.error || "No se pudo cargar la biblioteca.");
  return payload.books ?? [];
}

function readLegacyBooks() {
  try {
    const saved = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved as BookCard[] : [];
  } catch {
    return [];
  }
}

async function saveBook(accessCode: string, book: BookCard) {
  const response = await fetch("/api/books", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-jaybooks-pin": accessCode },
    body: JSON.stringify({ book }),
  });
  const payload = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(payload.error || "No se pudo guardar la tarjeta.");
}

export function BookLibrary() {
  const [books, setBooks] = useState<BookCard[]>([]);
  const [selected, setSelected] = useState<BookCard | null>(null);
  const [query, setQuery] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [ready, setReady] = useState(false);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [accessError, setAccessError] = useState("");

  useEffect(() => {
    const savedCode = sessionStorage.getItem(ACCESS_SESSION_KEY);
    if (!savedCode) return;
    setLoadingLibrary(true);
    requestLibrary(savedCode)
      .then((savedBooks) => { setBooks(savedBooks); setAccessCode(savedCode); setReady(true); })
      .catch(() => sessionStorage.removeItem(ACCESS_SESSION_KEY))
      .finally(() => setLoadingLibrary(false));
  }, []);

  const visibleBooks = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return books;
    return books.filter((book) => [book.titulo, book.autor, book.categoria, ...book.ideas_clave].filter(Boolean).join(" ").toLocaleLowerCase().includes(normalized));
  }, [books, query]);

  const highRelevanceCount = books.filter((book) => book.nivel_relevancia === "alta").length;

  async function unlockLibrary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedCode = accessCode.trim();
    if (!submittedCode) return;
    setLoadingLibrary(true);
    setAccessError("");
    try {
      const savedBooks = await requestLibrary(submittedCode);
      const cloudIds = new Set(savedBooks.map((book) => book.id));
      const legacyBooks = readLegacyBooks()
        .filter((book) => !cloudIds.has(book.id))
        .map((book) => ({ ...book, portada: null }));
      for (const legacyBook of legacyBooks) await saveBook(submittedCode, legacyBook);
      if (legacyBooks.length) localStorage.removeItem(LEGACY_STORAGE_KEY);
      sessionStorage.setItem(ACCESS_SESSION_KEY, submittedCode);
      setBooks([...legacyBooks, ...savedBooks]);
      setReady(true);
    } catch (error) {
      setAccessError(error instanceof Error ? error.message : "No se pudo abrir la biblioteca.");
    } finally {
      setLoadingLibrary(false);
    }
  }

  async function addBook(insight: BookInsight, _cover: string | null) {
    const book: BookCard = { ...insight, id: crypto.randomUUID(), portada: null, createdAt: new Date().toISOString() };
    await saveBook(accessCode, book);
    setBooks((current) => [book, ...current]);
    setSelected(book);
  }

  async function deleteBook(id: string) {
    const response = await fetch(`/api/books?id=${encodeURIComponent(id)}`, { method: "DELETE", headers: { "x-jaybooks-pin": accessCode } });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) { alert(payload.error || "No se pudo eliminar la tarjeta."); return; }
    setBooks((current) => current.filter((book) => book.id !== id));
    setSelected(null);
  }

  if (!ready) {
    return <main className="access-gate"><section className="access-card" aria-labelledby="access-title">
      <a className="brand" href="#top">JAY<span>BOOKS</span></a>
      <span className="eyebrow">Acceso privado</span>
      <h1 id="access-title">Tu biblioteca,<br /><em>siempre guardada.</em></h1>
      <p>Ingresa el código de prueba para ver y guardar tus tarjetas en la nube.</p>
      <form onSubmit={unlockLibrary} className="access-form">
        <label htmlFor="access-code">Código de acceso</label>
        <input id="access-code" inputMode="numeric" autoComplete="one-time-code" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} placeholder="••••" type="password" />
        <button className="primary-button" disabled={loadingLibrary} type="submit">{loadingLibrary ? "Abriendo…" : "Entrar"}{!loadingLibrary && <span aria-hidden="true">→</span>}</button>
      </form>
      {accessError && <p className="form-error" role="alert">{accessError}</p>}
    </section></main>;
  }

  return (
    <main>
      <header className="topbar"><a className="brand" href="#top" aria-label="JAYBOOKS inicio">JAY<span>BOOKS</span></a><p>Ideas que se convierten en movimiento</p><span className="book-count">{books.length.toString().padStart(2, "0")} tarjetas</span></header>
      <div className="page-shell" id="top">
        <section className="hero"><div className="hero-copy-block"><span className="eyebrow">Biblioteca personal</span><h1>Ideas de libros.<br /><em>En acción.</em></h1><p className="hero-copy">Guarda lo importante. Vuelve a usarlo cuando lo necesites.</p><div className="hero-actions"><a className="hero-button" href="#capture">Nueva tarjeta <span aria-hidden="true">↘</span></a><span className="hero-caption">{books.length} tarjetas · {highRelevanceCount} prioritarias</span></div></div></section>
        <div id="capture"><BookForm onExtracted={addBook} /></div>
        <section className="library-section" aria-labelledby="library-heading"><div className="library-toolbar"><div><span className="eyebrow">Colección</span><h2 id="library-heading">Mis tarjetas</h2></div><label className="search-label"><span className="sr-only">Buscar tarjetas</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por título, autor o idea" /></label></div>
          {visibleBooks.length === 0 ? <div className="empty-state"><h3>{books.length ? "No encontramos esa tarjeta" : "Haz que una lectura cuente"}</h3><p>{books.length ? "Prueba con otro término de búsqueda." : "Sube una página o pega un resumen. Claude se encarga de la ficha."}</p></div> : <div className="book-grid">{visibleBooks.map((book) => <button className="book-card" key={book.id} onClick={() => setSelected(book)}><div className={`cover cover-${book.nivel_relevancia}`}>{book.portada ? <Image src={book.portada} alt="" fill sizes="(max-width: 700px) 35vw, 33vw" unoptimized /> : <span>{book.titulo.slice(0, 1).toUpperCase()}</span>}</div><div className="card-copy"><span className="card-category">{book.categoria || "Lectura"}</span><h3>{book.titulo}</h3><p>{book.autor || "Autor no visible"}</p><span className="open-detail">Ver ficha <span aria-hidden="true">↗</span></span></div></button>)}</div>}
        </section>
      </div>
      <BookDetail book={selected} onClose={() => setSelected(null)} onDelete={deleteBook} />
    </main>
  );
}
