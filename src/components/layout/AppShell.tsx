import { Header } from "@/components/layout/Header"
import { Toaster } from "@/components/ui/sonner"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-14">
        <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6">
          {children}
        </div>
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "bg-bg-panel border-border-subtle text-text-primary",
            title: "text-text-primary",
            description: "text-text-secondary",
          },
        }}
      />
    </>
  )
}
