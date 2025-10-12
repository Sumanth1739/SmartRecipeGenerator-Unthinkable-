// Image Recognition Service using Hugging Face Ingredient Detection model
// This service recognizes individual ingredients from uploaded images

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/facebook/detr-resnet-50';
const HUGGINGFACE_API_TOKEN = import.meta.env.VITE_HUGGINGFACE_API_TOKEN;

// Using DETR model for object detection, then mapping food objects to ingredients

export interface DetectedObject {
  label: string;
  score: number;
  box: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
}

export interface ImageRecognitionResult {
  detectedIngredients: string[];
  allDetectedObjects: DetectedObject[];
  confidence: number;
}

/**
 * Recognizes ingredients from an uploaded image using Hugging Face Ingredient Detection model
 */
export async function recognizeIngredientsFromImage(imageFile: File): Promise<ImageRecognitionResult> {
  if (!HUGGINGFACE_API_TOKEN) {
    throw new Error('Hugging Face API token is not configured');
  }

  try {
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Call Hugging Face API for ingredient detection
    const response = await fetch(HUGGINGFACE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: base64Image,
        parameters: {
          threshold: 0.1, // Low threshold to catch more objects
          max_detections: 30 // Allow more detections
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', response.status, errorText);
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const results = await response.json();
    console.log('Hugging Face API response:', results);
    console.log('Response type:', typeof results);
    console.log('Response length:', Array.isArray(results) ? results.length : 'Not an array');
    
    // Check if results is an array or object
    if (Array.isArray(results)) {
      return processObjectDetectionResults(results);
    } else if (results && typeof results === 'object') {
      // Handle case where response might be wrapped in an object
      console.log('Response is an object, checking for array property...');
      if (results.predictions) {
        return processObjectDetectionResults(results.predictions);
      } else if (results.results) {
        return processObjectDetectionResults(results.results);
      } else {
        console.log('No array found in response object');
        return {
          detectedIngredients: [],
          allDetectedObjects: [],
          confidence: 0
        };
      }
    } else {
      console.log('Unexpected response format:', results);
      return {
        detectedIngredients: [],
        allDetectedObjects: [],
        confidence: 0
      };
    }
    
  } catch (error) {
    console.error('Image recognition error:', error);
    throw new Error(`Failed to recognize ingredients: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Converts a file to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Processes object detection results from DETR model and maps to ingredients
 */
function processObjectDetectionResults(results: unknown[]): ImageRecognitionResult {
  const allDetectedObjects: DetectedObject[] = [];
  const detectedIngredients: string[] = [];
  let totalConfidence = 0;
  let validDetections = 0;

  // Food-related objects that DETR can detect
  const foodObjects = [
    'apple', 'banana', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake',
    'sandwich', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl',
    'person', 'chair', 'dining table', 'book', 'laptop', 'cell phone', 'tv', 'remote',
    'keyboard', 'mouse', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator'
  ];

  // Process each detection result
  results.forEach((result: unknown) => {
    if (result && typeof result === 'object' && 'label' in result && 'score' in result && 'box' in result) {
      const resultObj = result as { label: string; score: number; box: { xmin: number; ymin: number; xmax: number; ymax: number } };
      const detectedObject: DetectedObject = {
        label: resultObj.label.toLowerCase(),
        score: resultObj.score,
        box: resultObj.box
      };

      allDetectedObjects.push(detectedObject);
      totalConfidence += resultObj.score;
      validDetections++;

      // Log all detected objects for debugging
      console.log(`Detected object: ${detectedObject.label} (confidence: ${detectedObject.score})`);

      // Check if it's a food-related object
      if (foodObjects.includes(detectedObject.label)) {
        // Convert object labels to ingredient names
        const ingredientName = mapObjectToIngredient(detectedObject.label);
        if (ingredientName && !detectedIngredients.includes(ingredientName)) {
          detectedIngredients.push(ingredientName);
          console.log(`Added ingredient: ${ingredientName}`);
        }
      }
    }
  });

  const averageConfidence = validDetections > 0 ? totalConfidence / validDetections : 0;

  // If no food objects detected, try to map any detected objects to ingredients
  if (detectedIngredients.length === 0 && allDetectedObjects.length > 0) {
    console.log('No food objects detected, trying broader mapping...');
    allDetectedObjects.forEach(obj => {
      const ingredientName = mapObjectToIngredient(obj.label);
      if (ingredientName && !detectedIngredients.includes(ingredientName)) {
        detectedIngredients.push(ingredientName);
        console.log(`Fallback ingredient: ${ingredientName}`);
      }
    });
  }

  console.log(`Final detected ingredients: ${detectedIngredients.join(', ')}`);

  return {
    detectedIngredients,
    allDetectedObjects,
    confidence: averageConfidence
  };
}

/**
 * Maps detected object labels to ingredient names
 */
function mapObjectToIngredient(objectLabel: string): string | null {
  const ingredientMap: Record<string, string | null> = {
    // Fruits
    'apple': 'apple',
    'banana': 'banana',
    'orange': 'orange',
    
    // Vegetables
    'broccoli': 'broccoli',
    'carrot': 'carrot',
    
    // Processed foods (convert to basic ingredients)
    'hot dog': 'sausage',
    'pizza': 'cheese', // Just the main ingredient
    'donut': 'flour',
    'cake': 'flour',
    'sandwich': 'bread',
    
    // Kitchen items (not ingredients, but useful for context)
    'bottle': null, // Skip non-food items
    'wine glass': null,
    'cup': null,
    'fork': null,
    'knife': null,
    'spoon': null,
    'bowl': null,
    
    // Additional objects that might be detected
    'person': null,
    'chair': null,
    'dining table': null,
    'book': null,
    'laptop': null,
    'cell phone': null,
    'tv': null,
    'remote': null,
    'keyboard': null,
    'mouse': null,
    'microwave': null,
    'oven': null,
    'toaster': null,
    'sink': null,
    'refrigerator': null
  };

  return ingredientMap[objectLabel] || null;
}

/**
 * Fallback function for when API is unavailable
 */
export function getMockIngredients(): string[] {
  return ['tomato', 'onion', 'garlic', 'chicken', 'olive oil', 'salt', 'pepper'];
}

/**
 * Validates if the uploaded file is a valid image
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a valid image file (JPEG, PNG, or WebP)'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Image file is too large. Please upload an image smaller than 10MB'
    };
  }

  return { isValid: true };
}
