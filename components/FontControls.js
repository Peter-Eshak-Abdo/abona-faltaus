import useLocalStorage from "@/hooks/useLocalStorage";

const FontControls = () => {
  const [fontSize, setFontSize] = useLocalStorage("fontSize", 16);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setFontSize(Math.max(12, fontSize - 1))}
        className="px-2 py-1 bg-gray-200 rounded"
      >
        -
      </button>
      <span className="text-sm">{fontSize}px</span>
      <button
        onClick={() => setFontSize(Math.min(24, fontSize + 1))}
        className="px-2 py-1 bg-gray-200 rounded"
      >
        +
      </button>
    </div>
  );
};

export default FontControls;
