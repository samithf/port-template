import { useState } from "react";

interface ToggleSwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
}

export function ToggleSwitch({
  checked = false,
  onChange,
  label,
}: ToggleSwitchProps) {
  const [isOn, setIsOn] = useState(checked);

  const handleToggle = () => {
    const newValue = !isOn;
    setIsOn(newValue);
    onChange?.(newValue);
  };

  return (
    <div
      className="flex items-center gap-2 cursor-pointer select-none"
      onClick={handleToggle}
    >
      {/* Switch */}
      <div
        className={`relative w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-300 
          ${isOn ? "bg-blue-500" : "bg-gray-300"}`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300
            ${isOn ? "translate-x-4" : "translate-x-0"}`}
        ></div>
      </div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </div>
  );
}
