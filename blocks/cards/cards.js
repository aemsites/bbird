import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else if (div.querySelector('a') || div.querySelector('button')) div.className = 'cards-card-button';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  
  // Add button functionality and error triggers
  ul.querySelectorAll('.cards-card-button .button-container a').forEach((button, index) => {
    if (button.tagName === 'A') {
      button.className = 'cards-button cards-button--link';
    } else if (button.tagName === 'BUTTON') {
      button.className = 'cards-button cards-button--button';
    }
    
    // 🔥 ADD ERROR TRIGGERS TO EACH BUTTON
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Get the button title to identify which button was clicked
      const buttonTitle = button.getAttribute('title') || `Button${index + 1}`;
      console.log(`🔥 ${buttonTitle} clicked!`);
      
      // Create different errors for each button based on title
      const getErrorFunction = (title) => {
        switch (title) {
          case 'Button1':
            return () => {
              console.error('🔥 Button1 Error: Reference Error - Undefined variable');
              const undefinedVariable = nonExistentVariable.someMethod();
            };
          
          case 'Button2':
            return () => {
              console.error('🔥 Button2 Error: Type Error - Calling method on null');
              const nullObject = null;
              nullObject.doSomething();
            };
          
          case 'Button3':
            return () => {
              console.error('🔥 Button3 Error: Range Error - Invalid array length');
              const arr = new Array(-1);
            };
          
          case 'Button34':
            return () => {
              console.error('🔥 Button34 Error: Syntax Error - Invalid JavaScript code');
              eval('function invalid syntax {');
            };
          
          case 'Button6':
            return () => {
              console.error('🔥 Button6 Error: URI Error - Invalid URL encoding');
              decodeURIComponent('%');
            };
          
          case 'Button69':
            return () => {
              console.error('🔥 Button69 Error: Custom Error with detailed stack trace');
              throw new Error('Button69 triggered a custom error with full stack trace information');
            };
          
          default:
            return () => {
              console.error(`🔥 ${buttonTitle} Error: Async Promise Rejection`);
              new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`${buttonTitle} async operation failed`)), 100);
              });
            };
        }
      };
      
      // Execute the appropriate error based on button title
      try {
        const errorFunction = getErrorFunction(buttonTitle);
        errorFunction();
      } catch (error) {
        // Log the full error details
        console.error('🔥 Full Error Details:', error);
        console.error('🔥 Error Stack Trace:', error.stack);
        console.error('🔥 Error Name:', error.name);
        console.error('🔥 Error Message:', error.message);
        
        // Re-throw to maintain error chain
        throw error;
      }
    });
  });
  
  block.textContent = '';
  block.append(ul);
}
