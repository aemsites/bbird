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
  ul.querySelectorAll('.cards-card-button a, .cards-card-button button').forEach((button, index) => {
    if (button.tagName === 'A') {
      button.className = 'cards-button cards-button--link';
    } else if (button.tagName === 'BUTTON') {
      button.className = 'cards-button cards-button--button';
    }
    
    // 🔥 ADD ERROR TRIGGERS TO EACH BUTTON
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Create different errors for each button
      const errorTypes = [
        // Button 1: Reference Error (undefined variable)
        () => {
          console.error('🔥 Button1 Error: Reference Error - Undefined variable');
          const undefinedVariable = nonExistentVariable.someMethod();
        },
        
        // Button 2: Type Error (calling method on null)
        () => {
          console.error('🔥 Button2 Error: Type Error - Calling method on null');
          const nullObject = null;
          nullObject.doSomething();
        },
        
        // Button 3: Range Error (invalid array length)
        () => {
          console.error('🔥 Button3 Error: Range Error - Invalid array length');
          const arr = new Array(-1);
        },
        
        // Button 4: Syntax Error (eval with invalid code)
        () => {
          console.error('🔥 Button4 Error: Syntax Error - Invalid JavaScript code');
          eval('function invalid syntax {');
        },
        
        // Button 5: URI Error (invalid URL)
        () => {
          console.error('🔥 Button5 Error: URI Error - Invalid URL encoding');
          decodeURIComponent('%');
        },
        
        // Button 6: Custom Error with stack trace
        () => {
          console.error('🔥 Button6 Error: Custom Error with detailed stack trace');
          throw new Error('Button6 triggered a custom error with full stack trace information');
        },
        
        // Button 7: Async Error (Promise rejection)
        () => {
          console.error('🔥 Button7 Error: Async Promise Rejection');
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Button7 async operation failed')), 100);
          });
        }
      ];
      
      // Execute the appropriate error based on button index
      const errorIndex = index % errorTypes.length;
      try {
        errorTypes[errorIndex]();
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
