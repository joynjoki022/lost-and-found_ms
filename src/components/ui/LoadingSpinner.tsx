// components/ui/LoadingSpinner.tsx
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-2 border-border-default border-t-green-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-green-primary animate-pulse" />
        </div>
      </div>
    </div>
  );
}