interface ButtonProps {
  variant?: "primary" | "secondary" | "dashed" | "ghost";
  onClick?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Button({
  variant = "primary",
  onClick,
  children,
  style,
}: ButtonProps) {
  return (
    <button
      className={`btn-${variant} font-semibold py-1 px-3 rounded text-sm transition cursor-pointer`}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
}
