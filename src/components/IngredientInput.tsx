import { Search, Upload, X, Loader2, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { recognizeIngredientsFromImage, validateImageFile } from '../services/imageRecognitionService';

type IngredientInputProps = {
  ingredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
  onSearch: () => void;
  onAISuggest: () => void;
  isLoading: boolean;
};

export function IngredientInput({ ingredients, onIngredientsChange, onSearch, onAISuggest, isLoading }: IngredientInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleAddIngredients = () => {
    if (!inputValue.trim()) return;

    const newIngredients = inputValue
      .split(',')
      .map(ing => ing.trim())
      .filter(ing => ing.length > 0 && !ingredients.includes(ing));

    onIngredientsChange([...ingredients, ...newIngredients]);
    setInputValue('');
  };

  const handleRemoveIngredient = (ingredient: string) => {
    onIngredientsChange(ingredients.filter(ing => ing !== ingredient));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredients();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous status
    setImageUploadStatus({ type: null, message: '' });

    // Validate the image file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setImageUploadStatus({
        type: 'error',
        message: validation.error || 'Invalid image file'
      });
      return;
    }

    setIsProcessingImage(true);
    setImageUploadStatus({
      type: 'info',
      message: 'Analyzing image for ingredients...'
    });

    try {
      // Use real image recognition
      const result = await recognizeIngredientsFromImage(file);
      
      if (result.detectedIngredients.length > 0) {
        // Add detected ingredients to the list
        const newIngredients = [...new Set([...ingredients, ...result.detectedIngredients])];
        onIngredientsChange(newIngredients);
        
        setImageUploadStatus({
          type: 'success',
          message: `Found ${result.detectedIngredients.length} ingredient(s): ${result.detectedIngredients.join(', ')}`
        });
      } else {
        // No ingredients detected - don't add anything
        setImageUploadStatus({
          type: 'info',
          message: 'No ingredients detected in the image. Please try a different image or add ingredients manually.'
        });
      }
    } catch (error) {
      console.error('Image recognition error:', error);
      
      // Don't add any ingredients on error - just show error message
      setImageUploadStatus({
        type: 'error',
        message: 'Image recognition failed. Please try again or add ingredients manually.'
      });
    } finally {
      setIsProcessingImage(false);
      // Clear the file input
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
      <h2 className="font-bold text-2xl text-gray-800 mb-2">What ingredients do you have?</h2>
      <p className="text-gray-600 mb-6">Add your available ingredients to discover amazing recipes</p>

      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter ingredients (comma-separated)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:shadow-lg focus:shadow-green-100 outline-none transition-all duration-200 hover:border-gray-400"
          />
        </div>
        <button
          onClick={handleAddIngredients}
          disabled={!inputValue.trim()}
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-200 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <label className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed rounded-xl transition-all duration-200 ${
          isProcessingImage 
            ? 'border-blue-300 bg-blue-50 cursor-not-allowed' 
            : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md cursor-pointer'
        }`}>
          {isProcessingImage ? (
            <>
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-sm text-blue-600">Processing image...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">Upload image to detect ingredients</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isProcessingImage}
            className="hidden"
          />
        </label>
      </div>

      {/* Image Upload Status */}
      {imageUploadStatus.type && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          imageUploadStatus.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200'
            : imageUploadStatus.type === 'error'
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {imageUploadStatus.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {imageUploadStatus.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {imageUploadStatus.type === 'info' && <Loader2 className="w-5 h-5 animate-spin" />}
          <span className="text-sm">{imageUploadStatus.message}</span>
        </div>
      )}

      {ingredients.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''} added
            </span>
            <button
              onClick={() => onIngredientsChange([])}
              className="text-sm font-medium transition-colors"
              style={{ color: '#3B82F6' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = '#2563EB'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = '#3B82F6'}
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {ingredients.map(ingredient => (
            <span
              key={ingredient}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
            >
                {ingredient}
                <button
                  onClick={() => handleRemoveIngredient(ingredient)}
                  className="hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onSearch}
          disabled={ingredients.length === 0 || isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl font-semibold hover:from-slate-800 hover:to-slate-900 hover:shadow-lg hover:shadow-slate-200 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Search className="w-5 h-5" />
          {isLoading ? 'Searching...' : 'Find Recipes'}
        </button>
        
        <div className="relative group flex-1">
          <button
            onClick={onAISuggest}
            disabled={ingredients.length === 0 || isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl font-semibold hover:from-slate-800 hover:to-slate-900 hover:shadow-lg hover:shadow-slate-200 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            AI Suggest
          </button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            Let AI generate recipes from your ingredients
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
