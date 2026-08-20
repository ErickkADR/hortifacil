import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const next = typeof searchParams.next === "string" ? searchParams.next : undefined;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-hero-bg px-6">
      <Image
        src="/images/hero/grama.png"
        alt=""
        fill
        priority
        className="object-cover opacity-40"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-hero-bg/85 via-hero-bg/70 to-hero-bg" />

      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-surface/95 p-8 shadow-2xl backdrop-blur">
        <Link href="/" className="mb-1 block text-center font-display text-3xl font-light text-ink">
          Horti<em className="font-medium text-leaf not-italic">Fácil</em>
        </Link>
        <p className="mb-7 text-center text-sm text-ink-soft">entre pra acompanhar seus pedidos</p>

        <LoginForm next={next} />

        <Link href="/" className="mt-6 block text-center text-xs text-ink-soft hover:text-ink">
          &larr; voltar pro catálogo
        </Link>
      </div>
    </main>
  );
}
