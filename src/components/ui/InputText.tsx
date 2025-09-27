export interface InputTextProps {
  onChange?: (value: string) => void;
  value?: string;
  onClick?: () => void;
  readonly?: boolean;
}

export function InputText({
  onChange,
  value,
  onClick,
  readonly,
}: InputTextProps) {
  return (
    <input
      type="text"
      className="border w-[100px] rounded px-2 py-1 border-dashed border-gray-400 text-gray-800 outline-none focus:border-dashed focus:border-blue-500 read-only:bg-gray-100"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onClick={onClick}
      readOnly={readonly}
    />
  );
}
