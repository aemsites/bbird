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
      
      // Create different errors for each button based on title
      const getErrorFunction = (title) => {
        switch (title) {
          case 'Button1':
            return () => {
              const undefinedVariable = nonExistentVariable.someMethod();
            };
          
          case 'Button2':
            return () => {
              const nullObject = null;
              nullObject.doSomething();
            };
          
          case 'Button3':
            return () => {
              const arr = new Array(-1);
            };
          
          case 'Button34':
            return () => {
              eval('function invalid syntax {');
            };
          
          case 'Button6':
            return () => {
              decodeURIComponent('%');
            };
          
          case 'Button69':
            return () => {
              throw new Error('Button69 triggered a custom error with full stack trace information');
            };
          
          default:
            return () => {
              new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`${buttonTitle} async operation failed`)), 100);
              });
            };
        }
      };
      
      // Execute the error function - this will trigger the browser's natural error handling
      const errorFunction = getErrorFunction(buttonTitle);
      errorFunction();
    });
  });
  
  block.textContent = '';
  block.append(ul);
}
