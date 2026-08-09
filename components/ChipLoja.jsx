/**
 * Pílula branca de download da loja. É só marcação, então fica como
 * Server Component: não vai nada para o bundle do cliente.
 */
export function ChipLoja({ href, pequeno, loja }) {
  const apple = loja === "apple";
  return (
    <a href={href} className={`chip-loja${pequeno ? " chip-loja-sm" : ""}`}>
      {apple ? (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.696.91-1.377 0-2.335-1.25-3.4-2.78-1.287-1.87-2.293-4.7-2.293-7.38 0-4.29 2.7-6.57 5.36-6.57 1.377 0 2.522.9 3.395.9.833 0 2.117-.96 3.696-.96.6 0 2.76.05 4.19 2.1-.11.07-2.5 1.47-2.5 4.5 0 3.5 3 4.75 3.03 4.77l-.9.5z" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 20.5v-17c0-.6.31-1.14.81-1.44l10.66 9.44L3.81 21.94c-.5-.3-.81-.84-.81-1.44zm12.36-8-2.71 2.71-8.4-7.44 11.11 4.73zM4.25 2.06l8.4 7.44 2.71-2.7L4.25 2.06zm12.36 8-2.71-2.71 2.71-2.7 3.98 1.69c.85.36.85 1.6 0 1.96l-3.98 1.76z" /></svg>
      )}
      <span>
        <small>{apple ? "Baixar na" : "Baixar no"}</small>
        <strong>{apple ? "App Store" : "Google Play"}</strong>
      </span>
    </a>
  );
}
