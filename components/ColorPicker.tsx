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
  { name: 'ئاوی (شەفاف)', value: '#E2E8F0' },
  { name: 'شەفاف 50%', value: 'rgba(255, 255, 255, 0.5)' },
  { name: 'شەفاف 20%', value: 'rgba(255, 255, 255, 0.2)' },
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

// Checkerboard pattern for showing transparency
const TRANSPARENT_GRID_STYLE = {
  backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
  backgroundSize: '8px 8px',
  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
  backgroundColor: '#f3f4f6'
};

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
      addColor(customColor.trim());
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
              {/* Outer circle with checkered transparency grid */}
              <div 
                className="w-12 h-12 rounded-full border border-gray-300 shadow-md overflow-hidden relative"
                style={TRANSPARENT_GRID_STYLE}
              >
                {/* Inner color overlay */}
                <div
                  className={`w-full h-full cursor-pointer hover:border-gray-500 transition ${
                    color === '#FFFFFF' ? 'border-4 border-gray-800' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              </div>
              <button
                type="button"
                onClick={() => removeColor(color)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors z-10"
              >
                <X size={12} />
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
                    className="w-8 h-8 rounded-full border border-gray-300 shadow overflow-hidden"
                    style={TRANSPARENT_GRID_STYLE}
                  >
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: preset.value }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-600 text-center leading-tight">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Color Input */}
        {colors.length < maxColors && (
          <div className="flex flex-col gap-2 mt-2">
            {showCustomInput ? (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2">
                <p className="text-xs font-semibold text-gray-600">زیادکردنی کۆدی ڕەنگی تایبەت:</p>
                <div className="flex gap-2">
                  <div 
                    className="w-12 h-10 rounded border border-gray-300 overflow-hidden"
                    style={TRANSPARENT_GRID_STYLE}
                  >
                    <input
                      type="color"
                      value={customColor.startsWith('rgba') || customColor.startsWith('hsla') ? '#ffffff' : customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-full h-full cursor-pointer opacity-0"
                    />
                  </div>
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    placeholder="e.g. rgba(255,255,255,0.5)"
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition text-xs font-semibold"
                  >
                    لابردن
                  </button>
                  <button
                    type="button"
                    onClick={addCustomColor}
                    className="px-4 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-xs font-semibold"
                  >
                    زیادکردن
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded text-gray-600 hover:border-gray-500 transition text-sm"
              >
                +    رەنگی تایبەت بە کۆد زیاد بکە
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
