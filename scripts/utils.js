/**
 * Creates a new HTML element
 */
export default function createElement(tagName, attributes, ...children) {
  const el = document.createElement(tagName);
  if (attributes) {
    Object.keys(attributes).forEach((name) => {
      el.setAttribute(name, attributes[name]);
    });
  }
  children.forEach((child) => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (Array.isArray(child)) {
      child.forEach((c) => el.appendChild(c));
    } else if (child) {
      el.appendChild(child);
    }
  });
  return el;
}

/**
 * Validates element attributes - this will call the problematic function
 */
export async function validateElementAttributes(element, attributes) {
  console.log('🔥 Utils: validateElementAttributes called!');
  console.log('Utils: Validating element attributes...');
  
  try {
    console.log('🔥 Utils: About to call processElementValidation...');
    // This call will eventually lead to the error in aem.js
    return await processElementValidation(element, attributes);
  } catch (error) {
    console.error('🔥 Utils: Error in validateElementAttributes:', error.message);
    console.error('🔥 Utils: Full error:', error);
    throw new Error(`Element validation failed: ${error.message}`);
  }
}

/**
 * Processes element validation - calls the problematic function in aem.js
 */
async function processElementValidation(element, attributes) {
  console.log('Utils: Processing element validation...');
  
  // Import and call the problematic function from aem.js
  const { validateElementConfig } = await import('./aem.js');
  return validateElementConfig(element, attributes);
}
