import { useState } from 'react';
import { encryptLegacy3DES, decryptLegacy3DES, encryptAESCustom, decryptAESCustom } from './utils/cryptoService';

type CryptoAlgorithm = 'AES' | '3DES';
type ActionMode = 'encrypt' | 'decrypt';

function App() {
  const [algorithm, setAlgorithm] = useState<CryptoAlgorithm>('AES');
  const [mode, setMode] = useState<ActionMode>('encrypt');
  
  const [inputText, setInputText] = useState('');
  const [secretKey, setSecretKey] = useState('');
  
  // Nuevo estado para el IV de 3DES, inicializado con tus valores legacy por comodidad
  const [legacyIv, setLegacyIv] = useState('240, 3, 45, 29, 0, 76, 173, 59');
  
  const [resultText, setResultText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleProcess = () => {
    setCopied(false);
    if (algorithm === '3DES') {
      setResultText(mode === 'encrypt' ? encryptLegacy3DES(inputText, secretKey, legacyIv) : decryptLegacy3DES(inputText, secretKey, legacyIv));
    } else {
      setResultText(mode === 'encrypt' ? encryptAESCustom(inputText, secretKey) : decryptAESCustom(inputText, secretKey));
    }
  };

  const handleCopy = () => {
    if (resultText) {
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setInputText('');
    setSecretKey('');
    setResultText('');
    setCopied(false);
  };

  // Función específica para rellenar los valores por defecto del legacy y no escribirlos a mano
  const handleAlgorithmChange = (alg: CryptoAlgorithm) => {
    setAlgorithm(alg);
    handleClear();
    if (alg === '3DES') {
      setSecretKey('CUU_BIT');
      setLegacyIv('240, 3, 45, 29, 0, 76, 173, 59');
    }
  };

  const isProcessDisabled = () => {
    if (!inputText || !secretKey) return true;
    if (algorithm === '3DES' && !legacyIv) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
        
        {/* Encabezado */}
        <div className="bg-gray-900 border-b border-gray-700 p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-100">
            Cifrado de <span className="text-yellow-500">Connection Strings</span>
          </h1>
          <p className="text-sm text-gray-400 mt-2">Soporte Dinámico para AES y 3DES</p>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          
          {/* Fila de Controles */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center mb-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Algoritmo</label>
                
                <div className="relative group ml-2 flex items-center">
                  <svg className="w-4 h-4 text-gray-500 hover:text-yellow-500 cursor-help transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-700 text-xs text-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none">
                    <div className="font-semibold text-yellow-500 mb-1">Sobre el Vector de Inicialización</div>
                    {algorithm === 'AES' 
                      ? 'Se genera un IV aleatorio de 16 bytes. El resultado final lo concatena junto al Ciphertext.'
                      : 'El IV en 3DES es estático por ejecución. Introduce los bytes separados por comas.'}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700"></div>
                  </div>
                </div>
              </div>

              <select 
                value={algorithm}
                onChange={(e) => handleAlgorithmChange(e.target.value as CryptoAlgorithm)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-yellow-500 outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="AES">AES (Custom Format)</option>
                <option value="3DES">Legacy TripleDES</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Acción</label>
              <div className="flex p-1 space-x-1 bg-gray-900 rounded-lg">
                <button
                  onClick={() => { setMode('encrypt'); setResultText(''); setInputText(''); }}
                  className={`w-1/2 py-1.5 text-sm font-medium rounded-md transition-all ${
                    mode === 'encrypt' ? 'bg-yellow-500 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  Encriptar
                </button>
                <button
                  onClick={() => { setMode('decrypt'); setResultText(''); setInputText(''); }}
                  className={`w-1/2 py-1.5 text-sm font-medium rounded-md transition-all ${
                    mode === 'decrypt' ? 'bg-yellow-500 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  Desencriptar
                </button>
              </div>
            </div>
          </div>

          <hr className="border-gray-700" />

          {/* Formulario */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {mode === 'encrypt' ? 'Cadena de Conexión (Texto Plano)' : 'Cadena Encriptada'}
              </label>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={mode === 'encrypt' 
                  ? 'Server=...;Database=...;User Id=...;Password=...;' 
                  : algorithm === 'AES' ? 'IV...Ciphertext...' : 'U2FsdGVkX1...'}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-gray-100 font-mono text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Clave Secreta (Key)
                </label>
                <input
                  type="text"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder={algorithm === 'AES' ? 'Se rellenará a 16 bytes' : 'La llave pasará por MD5'}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-gray-100 font-mono text-sm"
                />
              </div>

              {/* Input Dinámico del IV exclusivo para 3DES */}
              {algorithm === '3DES' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Vector de Inicialización (IV)
                  </label>
                  <input
                    type="text"
                    value={legacyIv}
                    onChange={(e) => setLegacyIv(e.target.value)}
                    placeholder="Ej. 240, 3, 45..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-gray-100 font-mono text-sm"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleProcess}
                disabled={isProcessDisabled()}
                className="flex-1 py-3 px-4 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-500 text-gray-900 font-bold rounded-lg transition-colors flex justify-center items-center gap-2"
              >
                {mode === 'encrypt' ? 'Generar Hash Seguro' : 'Revelar Cadena Original'}
              </button>

              <button
                onClick={handleClear}
                disabled={!inputText && !secretKey && !resultText && !legacyIv}
                className="py-3 px-6 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 font-medium rounded-lg transition-colors border border-gray-600 flex justify-center items-center"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Resultado */}
          {resultText && (
            <div className="mt-8 relative group result-container">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg blur opacity-25"></div>
              <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Resultado:
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-xs font-medium text-yellow-500 hover:text-yellow-400 transition-colors"
                  >
                    {copied ? '¡Copiado!' : 'Copiar al portapapeles'}
                  </button>
                </div>
                <code className="block text-sm text-yellow-100 break-all font-mono whitespace-pre-wrap">
                  {resultText}
                </code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;