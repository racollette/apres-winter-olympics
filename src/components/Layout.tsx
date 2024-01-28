import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <main className="relative flex min-h-screen flex-col items-center  bg-black text-white">
      <div className="flex w-full flex-col items-center justify-center p-4 md:px-4 md:py-8">
        {children}
      </div>
    </main>
  );
}
