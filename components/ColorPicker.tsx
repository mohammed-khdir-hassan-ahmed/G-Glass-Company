'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

interface ColorPickerProps {
  colors: string[];
  onChange: (colors: string[]) => void;
  maxColors?: number;
}

const PRESET_COLORS = [
  { name: 'Metallic Grey', value: '#6B7280' },
  { name: 'Champagne', value: '#F7E7CE' },
  { name: 'Gold', value: '#FFD700' },
  { name: 'شفاف ڕوون', value: '#E8E8E8' },
  { name: 'سور', value: '#EF4444' },
  { name: 'سەوز', value: '#10B981' },
  { name: 'شین', value: '#3B82F6' },
  { name: 'ئاسمانی', value: '#06B6D4' },
  { name: 'زەرد', value: '#FBBF24' },
  { name: 'سپی', value: '#FFFFFF' },
  { name: 'ڕەش', value: '#000000' },
  { name: 'مۆر', value: '#A855F7' },
];

export default function ColorPicker({ colors, onChange, maxColors = 6 }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState('#000000');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const addColor = (color: string) => {
    if (colors.length < maxColors && !colors.includes(color)) {
      onChange([...colors, color]);
    }
  };

  const removeColor = (color: string) => {
    onChange(colors.filter((c) => c !== color));
  };

  const addCustomColor = () => {
    if (customColor && !colors.includes(customColor) && colors.length < maxColors) {
      addColor(customColor);
      setShowCustomInput(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          رەنگەکان ({colors.length}/{maxColors})
        </label>

        {/* Selected Colors Display */}
        <div className="flex flex-wrap gap-2 mb-4">
          {colors.map((color) => (
            <div
              key={color}
              className="relative group"
            >
              <div
                className={`w-12 h-12 rounded-full border-2 shadow-md cursor-pointer hover:border-gray-500 transition ${
                  color === '#FFFFFF' ? 'border-4 border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
              <button
                type="button"
                onClick={() => removeColor(color)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Preset Colors */}
        {colors.length < maxColors && (
          <div>
            <p className="text-xs text-gray-500 mb-2">رەنگە دیاریکراوەکان:</p>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => addColor(preset.value)}
                  disabled={colors.includes(preset.value)}
                  className="flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title={preset.name}
                >
                  <div
                    className="w-8 h-8 rounded-full border-2 border-gray-300 shadow"
                    style={{ backgroundColor: preset.value }}
                  />
                  <span className="text-xs text-gray-600 text-center">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Color Input */}
        {colors.length < maxColors && (
          <div className="flex gap-2">
            {showCustomInput ? (
              <>
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <button
                  type="button"
                  onClick={addCustomColor}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600 transition text-sm"
                >
                  زیادکردن
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                >
                  لابردن
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded text-gray-600 hover:border-gray-500 transition text-sm"
              >
                +    رەنگی تایبەت زیاد بکە
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

