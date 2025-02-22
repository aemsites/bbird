import runSeoChecks from './preflight-checks/seo.js';
import runGeneralChecks from './preflight-checks/general.js';
import runAccessibilityChecks from './preflight-checks/accessibility.js';

export default async function decorate(el) {
  const seoResults = runSeoChecks();
  const generalResults = runGeneralChecks();
  const accessibilityResults = runAccessibilityChecks();

  const createResultsHtml = (results) => results.map((result) => `
    <div class="seo-item ${result.icon}">
      <h3>${result.title}</h3>
      <p>${result.description}</p>
    </div>
  `).join('');

  const html = `
    <div class="preflight-results">
      <h1>CME Group Preflight Check</h1>
      
      <details class="preflight-check-section">
        <summary class="preflight-check-header">SEO Checks</summary>
        <div class="preflight-check-content">
          ${createResultsHtml(seoResults)}
        </div>
      </details>

      <details class="preflight-check-section">
        <summary class="preflight-check-header">General Checks</summary>
        <div class="preflight-check-content">
          ${createResultsHtml(generalResults)}
        </div>
      </details>

      <details class="preflight-check-section">
        <summary class="preflight-check-header">Accessibility Checks</summary>
        <div class="preflight-check-content">
          ${createResultsHtml(accessibilityResults)}
        </div>
      </details>
    </div>
  `;

  el.innerHTML = html;
}
