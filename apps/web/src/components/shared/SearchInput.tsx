import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
};

/** A search box that waits until typing stops before it calls `onChange`. */
export function SearchInput({ value, onChange, label, placeholder }: Props) {
  const [text, setText] = useState(value);

  // Follow the URL when it changes from outside (back button, link). Keep the
  // typed text when it already matches, so a trailing space is not lost.
  useEffect(
    () => setText((current) => (current.trim() === value ? current : value)),
    [value],
  );

  useEffect(() => {
    if (text.trim() === value) return;
    const timer = setTimeout(() => onChange(text), 300);
    return () => clearTimeout(timer);
  }, [text, value, onChange]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        className="h-10 bg-card pl-9"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
    </div>
  );
}
