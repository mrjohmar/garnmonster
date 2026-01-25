import { useState } from 'react';
import { Trash2, Save, Upload, Download, Search } from 'lucide-react';
import { YarnColor } from '@/types';
import { YARN_BRANDS, COLOR_PALETTES } from '@/services/pattern';

interface CustomPalette {
  id: string;
  name: string;
  colors: YarnColor[];
}

export default function YarnLibraryPage() {
  const [customPalettes, setCustomPalettes] = useState<CustomPalette[]>([]);
  const [selectedBrand, setSelectedBrand] = useState(YARN_BRANDS[0]);
  const [selectedColors, setSelectedColors] = useState<YarnColor[]>([]);
  const [paletteName, setPaletteName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredColors = selectedBrand.colors.filter(color =>
    color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    color.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleColorSelection = (color: YarnColor) => {
    if (selectedColors.find(c => c.id === color.id)) {
      setSelectedColors(selectedColors.filter(c => c.id !== color.id));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const savePalette = () => {
    if (!paletteName || selectedColors.length < 3) return;

    const newPalette: CustomPalette = {
      id: Date.now().toString(),
      name: paletteName,
      colors: selectedColors
    };

    setCustomPalettes([...customPalettes, newPalette]);
    setSelectedColors([]);
    setPaletteName('');
  };

  const deletePalette = (id: string) => {
    setCustomPalettes(customPalettes.filter(p => p.id !== id));
  };

  const exportPalettes = () => {
    const data = JSON.stringify(customPalettes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mina-garnpaletter.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importPalettes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          setCustomPalettes([...customPalettes, ...imported]);
        }
      } catch (error) {
        console.error('Failed to import palettes:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Garnbibliotek
        </h1>
        <p className="text-gray-600">
          Skapa egna färgpaletter från dina favoritgarner eller välj bland färdiga paletter.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Yarn Brand Selection */}
        <div className="card">
          <h2 className="text-xl font-display font-semibold text-gray-800 mb-4">
            Välj färger från garnmärke
          </h2>

          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {YARN_BRANDS.map(brand => (
              <button
                key={brand.id}
                onClick={() => setSelectedBrand(brand)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedBrand.id === brand.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Sök färg..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
            {filteredColors.map(color => {
              const isSelected = selectedColors.find(c => c.id === color.id);
              return (
                <button
                  key={color.id}
                  onClick={() => toggleColorSelection(color)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'ring-2 ring-primary-500 bg-primary-50'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div
                    className="w-full h-8 rounded mb-2 shadow-inner"
                    style={{ backgroundColor: color.hex }}
                  />
                  <p className="text-sm font-medium text-gray-800 truncate">{color.name}</p>
                  {color.productName && (
                    <p className="text-xs text-gray-500 truncate">{color.productName}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Colors & Save */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-display font-semibold text-gray-800 mb-4">
              Skapa ny palett
            </h2>

            {selectedColors.length > 0 ? (
              <>
                <div className="flex gap-1 mb-4 flex-wrap">
                  {selectedColors.map((color, index) => (
                    <div
                      key={color.id}
                      className="relative group"
                    >
                      <div
                        className="w-10 h-10 rounded-lg shadow cursor-pointer"
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                        onClick={() => toggleColorSelection(color)}
                      />
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-gray-800 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {index + 1}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Namn på palett..."
                    value={paletteName}
                    onChange={(e) => setPaletteName(e.target.value)}
                    className="input flex-1"
                  />
                  <button
                    onClick={savePalette}
                    disabled={!paletteName || selectedColors.length < 3}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Spara
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Välj minst 3 färger och ge paletten ett namn.
                </p>
              </>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Klicka på färger till vänster för att lägga till dem i din palett.
              </p>
            )}
          </div>

          {/* Saved Palettes */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-semibold text-gray-800">
                Mina paletter
              </h2>
              <div className="flex gap-2">
                <label className="btn-secondary flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Importera
                  <input
                    type="file"
                    accept=".json"
                    onChange={importPalettes}
                    className="hidden"
                  />
                </label>
                {customPalettes.length > 0 && (
                  <button
                    onClick={exportPalettes}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exportera
                  </button>
                )}
              </div>
            </div>

            {customPalettes.length > 0 ? (
              <div className="space-y-3">
                {customPalettes.map(palette => (
                  <div
                    key={palette.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-0.5">
                        {palette.colors.slice(0, 8).map(color => (
                          <div
                            key={color.id}
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: color.hex }}
                          />
                        ))}
                        {palette.colors.length > 8 && (
                          <div className="w-6 h-6 rounded bg-gray-300 flex items-center justify-center text-xs">
                            +{palette.colors.length - 8}
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-gray-800">{palette.name}</span>
                      <span className="text-sm text-gray-500">
                        ({palette.colors.length} färger)
                      </span>
                    </div>
                    <button
                      onClick={() => deletePalette(palette.id)}
                      className="p-2 rounded hover:bg-gray-200 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Du har inga sparade paletter ännu.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Preset Palettes */}
      <div className="card mt-8">
        <h2 className="text-xl font-display font-semibold text-gray-800 mb-4">
          Färdiga paletter
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLOR_PALETTES.map(palette => (
            <div key={palette.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex gap-0.5 mb-3 h-8 rounded overflow-hidden">
                {palette.colors.map((color, i) => (
                  <div
                    key={i}
                    className="flex-1"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="font-medium text-gray-800">{palette.name}</p>
              <p className="text-sm text-gray-500">{palette.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
