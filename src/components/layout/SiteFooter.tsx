export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-2 px-6 py-12">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 text-sm sm:grid-cols-3">
        <div>
          <h3 className="mb-3 font-semibold text-ink">Mais populares</h3>
          <ul className="flex flex-col gap-1.5 text-ink-soft">
            <li>Banana</li>
            <li>Maçã</li>
            <li>Morango</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-ink">Navegação</h3>
          <ul className="flex flex-col gap-1.5 text-ink-soft">
            <li><a href="#" className="hover:text-ink">Voltar ao começo</a></li>
            <li><a href="#catalogo" className="hover:text-ink">Catálogo de produtos</a></li>
            <li><a href="/login" className="hover:text-ink">Página de login</a></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-ink">Redes sociais</h3>
          <ul className="flex flex-col gap-1.5 text-ink-soft">
            <li>Instagram</li>
            <li>Facebook</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
