import runSeoChecks from './preflight-checks/seo.js';
import runGeneralChecks from './preflight-checks/general.js';
import runAccessibilityChecks from './preflight-checks/accessibility.js';
import { scheduleTask } from '../../scripts/utils.js';

export default async function decorate(el) {
  // Run checks asynchronously to avoid blocking the main thread
  const [seoResults, generalResults, accessibilityResults] = await Promise.all([
    scheduleTask(() => runSeoChecks(), { priority: 'background' }),
    scheduleTask(() => runGeneralChecks(), { priority: 'background' }),
    scheduleTask(() => runAccessibilityChecks(), { priority: 'background' }),
  ]);

  const createResultsHtml = (results) => results.map((result) => `
    <div class="seo-item ${result.icon}">
      <h3>${result.title}</h3>
      <p>${result.description}</p>
    </div>
  `).join('');

  // Defer HTML generation to avoid blocking
  const html = await scheduleTask(() => `
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
  `, { priority: 'background' });

  el.innerHTML = html;
}
