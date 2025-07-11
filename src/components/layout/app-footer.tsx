export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-6 text-center text-050 font-caption border-t border-[#1A1A1A] bg-transparent">
      <div
        style={{
          maxWidth: "var(--layout-desktop-container)",
          margin: "0 auto",
          padding: "0 36px",
        }}
        className="flex flex-col md:flex-row justify-between items-center"
      >
        <div>©{currentYear} NODO. All rights reserved</div>
        <div>
          NODO Global Limited 10 Anson Road #22-06 International Plaza,
          Singapore 079903
        </div>
      </div>
    </footer>
  );
}
