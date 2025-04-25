export default async function decorate(block) {
    const formHTML = `
    <section class="login-form">
      <h2 class="form-title">Opportunity Finder Portal</h2>
      <form id="setup-form">
        <div class="form-field">
          <label for="domain">Domain</label>
          <input type="text" id="domain" name="domain" placeholder="e.g. wilson" required />
        </div>
  
        <div class="form-field">
          <label for="domainkey">Domain Key</label>
          <input type="text" id="domainkey" name="domainkey" placeholder="e.g. abc123" required />
        </div>
  
        <div class="form-field">
          <label for="checkpoint">Checkpoint</label>
          <select id="checkpoint" name="checkpoint">
            <option value="click">click</option>
            <option value="conversion">conversion</option>
            <option value="scroll">scroll</option>
          </select>
        </div>
  
        <div class="form-field">
          <label for="endpoint">Endpoint</label>
          <input type="text" id="endpoint" name="endpoint" placeholder="e.g. prod" required />
        </div>
  
        <div class="form-field">
          <label for="conversions">Conversions (comma-separated)</label>
          <textarea id="conversions" name="conversions" rows="3" placeholder="e.g. signup, purchase, contact"></textarea>
        </div>
  
        <div class="form-field">
          <label for="startdate">Start Date</label>
          <input type="date" id="startdate" name="startdate" />
        </div>
  
        <div class="form-field">
          <label for="enddate">End Date</label>
          <input type="date" id="enddate" name="enddate" />
        </div>
  
        <button type="submit">Continue</button>
      </form>
    </section>
  `;
  
    block.innerHTML = formHTML;
  
    const form = document.getElementById('setup-form');
  
    // Default to past 7 days
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
  
    document.getElementById('startdate').value = lastWeek.toISOString().split('T')[0];
    document.getElementById('enddate').value = today.toISOString().split('T')[0];
  
    form.addEventListener('submit', (e) => {
        e.preventDefault();
      
        const domain = document.getElementById('domain').value;
        const domainkey = document.getElementById('domainkey').value;
        const checkpoint = document.getElementById('checkpoint').value;
        const endpoint = document.getElementById('endpoint').value;
        const startdate = document.getElementById('startdate').value;
        const enddate = document.getElementById('enddate').value;
      
        // Process comma-separated conversions into array
        const conversionsRaw = document.getElementById('conversions').value;
        const conversions = conversionsRaw
          .split(',')
          .map(c => c.trim())
          .filter(c => c.length > 0);
      
        const params = new URLSearchParams({ domain, domainkey, checkpoint, endpoint, startdate, enddate });
      
        // Add conversions to params (as repeated keys if multiple)
        conversions.forEach((c) => {
          params.append('conversions', c);
        });
      
        window.location.href = `/drafts/mrosier/opportunities?${params.toString()}`;
      });
    }