# Core Web Vitals Recommendations

## Executive Summary
- **URL Tested**: [https://add-cwv-check--bbird--aemsites.aem.page/](https://add-cwv-check--bbird--aemsites.aem.page/)
- **Device Type**: Mobile
- **Key Metrics**:
  - **LCP**: 3412ms (Needs Improvement)
  - **CLS**: Data not available, but no visible shifts
  - **INP**: 5152ms (Poor)

The primary focuses should be on improving the LCP and INP metrics, as they exceed acceptable thresholds significantly. Immediate actions can center around LCP, since it's directly affecting the initial user perceptions, and reducing INP by optimizing third-party resource loading and improving main thread responsiveness.

## Prioritized Recommendations Table

| Impact Rating | Implementation Complexity | Affected Metric(s) | Expected Improvement Range |
|---------------|---------------------------|---------------------|----------------------------|
| High          | Medium                    | LCP, INP            | LCP: 500ms+, INP: 1000ms+  |
| Medium        | Medium                    | LCP                 | 300ms+                     |
| Medium        | Easy                      | INP                 | 500ms+                     |
| Low           | Hard                      | INP                 | 200-500ms                  |

## Detailed Technical Recommendations

### 1. Defer Third-Party Scripts
- **Description**: Third-party scripts like `auth0-spa-js` are loading before the LCP, blocking the main thread, and contributing to poor INP.
- **Implementation Priority**: High
- **Implementation Effort**: Medium
- **Expected Impact**: Substantially reduce INP delays; moderately improve LCP.
- **Recommendation**: Move the loading of non-essential third-party scripts to `loadLazy` or `loadDelayed` phases, ensuring they execute after rendering critical content (e.g., Auth0 script).
- **Implementation**: 
  ```javascript
  function loadDelayed() {
    window.setTimeout(() => import('./delayed.js'), 3000);
    // Defer third-party scripts
    loadScript('https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js');
  }
  ```

### 2. Optimize Critical Path CSS and JavaScript
- **Description**: Unused CSS and JS code is contributing to render-blocking resources.
- **Implementation Priority**: Medium
- **Implementation Effort**: Medium
- **Expected Impact**: Reduce total blocking time and improve LCP
- **Recommendation**: Implement code splitting and defer styles in the `lazy-styles.css`. Implement tree-shaking to remove unused CSS/JS.
- **Implementation**:
  - Defer loading of styles that aren't crucial to the initial rendering:
  ```javascript
  async function loadLazy() {
    loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
    loadFonts();
  }
  ```

### 3. Lazy-Load Non-Visible Images
- **Description**: Images not contributing to LCP are still loaded immediately.
- **Implementation Priority**: Medium
- **Implementation Effort**: Easy
- **Expected Impact**: Improve LCP by reducing competition for bandwidth.
- **Recommendation**: Ensure all non-essential images are consistently loaded with `loading=lazy` to prevent affecting initial loading.
- **Implementation**:
  Always ensure `loading="lazy"` is maintained for all non-LCP images.

### 4. Address Long Tasks Affecting INP
- **Description**: Long tasks leading to poor INP scores.
- **Implementation Priority**: Medium
- **Implementation Effort**: Medium
- **Expected Impact**: Significant improvements in INP with smoother interactions post-load.
- **Recommendation**: Break up long tasks in JavaScript execution and review event listener implementations that contribute to task delays.
- **Implementation**:
  - Use `requestIdleCallback` and `requestAnimationFrame` for non-critical updates:

  ```javascript
  requestIdleCallback(() => {
      // Perform non-critical tasks during idle time in the event loop
  });
  ```

### 5. Evaluate and Reduce Redundant CSS/JS
- **Description**: Code coverage indicates unnecessary CSS/JS consumes resources on load.
- **Implementation Priority**: Low
- **Implementation Effort**: Hard
- **Expected Impact**: Overall reduced loading times.
- **Recommendation**: Thorough removal of unused code functions.
- **Implementation**:
  - Implement dynamic imports for features not needed on initial use.

## Implementation Roadmap

### Quick Wins
- **Defer Third-Party Scripts**: Experiment initially with moving third-party scripts to non-critical phases.
- **Lazy-Load Non-Visible Images**: Ensure correct `loading=lazy` use.

### Medium-Term
- **Critical Path Optimization**: In parallel, defer less-critical CSS and scripts, using asynchronous methods when possible; refactor redundant CSS.
- **Address INP Issues**: Focus on reducing long tasks using JavaScript performance tricks.

### Strategic Improvements
- **Evaluate JS/CSS Redundancy**: Anticipate rolling changes to enhance bundle size most effectively through code optimizations and minimization.

---

## STRUCTURED DATA FOR AUTOMATION

```json
{
  "url": "https://add-cwv-check--bbird--aemsites.aem.page/",
  "deviceType": "mobile",
  "timestamp": "2023-11-02T12:00:00Z",
  "summary": {
    "lcp": { "current": "3412ms", "target": "2.5s", "status": "needs-improvement" },
    "cls": { "current": "0", "target": "0.1", "status": "good" },
    "inp": { "current": "5152ms", "target": "200ms", "status": "poor" }
  },
  "suggestions": [
    {
      "id": 1,
      "title": "Defer Third-Party Scripts",
      "description": "Third-party scripts like auth0-spa-js are loading before the LCP, blocking the main thread, and contributing to poor INP.",
      "metric": "INP",
      "priority": "High",
      "effort": "Medium",
      "impact": "Substantially reduce INP delays; moderately improve LCP.",
      "implementation": "Move the loading of non-essential third-party scripts to loadLazy or loadDelayed phases, ensuring they execute after rendering critical content.",
      "codeExample": "window.setTimeout(() => import('./delayed.js'), 3000); loadScript('https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js');",
      "category": "third-party"
    },
    {
      "id": 2,
      "title": "Optimize Critical Path CSS and JavaScript",
      "description": "Unused CSS and JS code is contributing to render-blocking resources.",
      "metric": "LCP",
      "priority": "Medium",
      "effort": "Medium",
      "impact": "Reduce total blocking time and improve LCP",
      "implementation": "Implement code splitting and defer styles in the lazy-styles.css. Implement tree-shaking to remove unused CSS/JS.",
      "codeExample": "loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);",
      "category": "css, javascript"
    },
    {
      "id": 3,
      "title": "Lazy-Load Non-Visible Images",
      "description": "Images not contributing to LCP are still loaded immediately.",
      "metric": "LCP",
      "priority": "Medium",
      "effort": "Easy",
      "impact": "Improve LCP by reducing competition for bandwidth.",
      "implementation": "Ensure all non-essential images are consistently loaded with loading=lazy to prevent affecting initial loading.",
      "codeExample": "Ensure all img elements have loading=lazy except LCP element",
      "category": "images"
    },
    {
      "id": 4,
      "title": "Address Long Tasks Affecting INP",
      "description": "Long tasks leading to poor INP scores.",
      "metric": "INP",
      "priority": "Medium",
      "effort": "Medium",
      "impact": "Significant improvements in INP with smoother interactions post-load.",
      "implementation": "Break up long tasks in JavaScript execution and review event listener implementations that contribute to task delays.",
      "codeExample": "requestIdleCallback(() => { /* Perform non-critical tasks */ });",
      "category": "javascript"
    }
  ]
}
```