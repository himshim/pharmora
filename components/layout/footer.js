/*
 Pharmora Universal Footer Component v3
 Responsive Footer
*/

(function () {
  'use strict';

  async function loadFooter() {
    const root = document.getElementById("site-footer");
    if (!root) return;

    let siteConfig = { name: "Pharmora", logo: "", tagline: "Open Pharmacy Knowledge Ecosystem" };
    try {
      siteConfig = await fetch(appPath("config/site.json")).then(r => r.json());
    } catch (e) {
      console.warn("Failed loading site config for footer", e);
    }

    window.renderFooterSection = function (title, links) {
      return `
        <div class="card" style="border:none; background:transparent; padding:0; margin:0; box-shadow:none;">
          <h3 style="font-size:1.1rem; margin-top:0; margin-bottom:15px; color:var(--text);">${title}</h3>
          <div class="footer-links" style="display:flex; flex-direction:column; gap:10px; font-size:0.9rem;">
            ${links.map(l => `<a href="${appPath(l.url)}" style="color:var(--text-muted); text-decoration:none; transition:0.2s;">${l.title}</a>`).join("")}
          </div>
        </div>
      `;
    };

    const sitemapExplore = [
      { title: "Learn Track", url: "learn/" },
      { title: "Resource Hub", url: "library/" },
      { title: "Subject Index", url: "learn/" }
    ];

    const sitemapCommunity = [
      { title: "Educator Center", url: "teach/" },
      { title: "Contributors", url: "community/" },
      { title: "Register / Join", url: "auth/login.html" }
    ];

    const sitemapLegal = [
      { title: "Terms of Service", url: "about/terms/" },
      { title: "Privacy Policy", url: "about/privacy/" }
    ];

    const logoSrc = siteConfig.logo ? appPath(siteConfig.logo) : "";
    const pwaStatus = navigator.onLine ? "🟢 Connected" : "🔴 Offline";

    root.innerHTML = `
      <footer class="footer" style="background:var(--surface); border-top:1px solid var(--border); padding:50px 0 20px 0; color:var(--text);">
        <div class="container">
          <div class="grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:30px; margin-bottom:40px;">
            <div class="card glass" style="border:none; background:transparent; padding:0; margin:0; box-shadow:none;">
              <a href="${appPath("")}" class="footer-brand" style="display:flex; align-items:center; gap:10px; font-size:1.4rem; font-weight:bold; text-decoration:none; color:var(--text); margin-bottom:15px;">
                ${logoSrc ? `<img class="footer-logo" src="${logoSrc}" alt="${siteConfig.name}" style="height:30px;">` : "⚕"}
                <span>${siteConfig.name}</span>
              </a>
              <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:10px;">
                ${siteConfig.tagline || "Open Pharmacy Knowledge Ecosystem"}
              </p>
              <div style="font-size:0.8rem; display:flex; gap:15px; margin-top:15px;">
                <a href="${siteConfig.links?.github || '#'}" target="_blank" rel="noopener" style="color:var(--text-muted); text-decoration:none;">GitHub</a>
                <a href="mailto:${siteConfig.links?.contact || ''}" style="color:var(--text-muted); text-decoration:none;">Contact</a>
              </div>
            </div>
            ${renderFooterSection("📚 Explore", sitemapExplore)}
            ${renderFooterSection("🌱 Community", sitemapCommunity)}
            ${renderFooterSection("🛡 Legal", sitemapLegal)}
          </div>
          
          <div class="footer-bottom" style="border-top:1px solid var(--border); padding-top:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; font-size:0.8rem; color:var(--text-muted);">
            <div>
              © ${new Date().getFullYear()} ${siteConfig.name}. Built openly for the pharmacy community.
            </div>
            <div style="display:flex; gap:20px; align-items:center;">
              <span>Version: ${siteConfig.version || "1.0.0"}</span>
              <span>Build: Stable (PWA Ready)</span>
              <span id="pwa-connectivity-badge" class="badge" style="background:var(--surface-light); border:1px solid var(--border);">${pwaStatus}</span>
            </div>
          </div>
        </div>
      </footer>
    `;

    // Listen to network status change dynamically to update badge without duplicate listeners
    if (!window.footerListenersAttached) {
      window.addEventListener("online", () => {
        const badge = document.getElementById("pwa-connectivity-badge");
        if (badge) badge.innerText = "🟢 Connected";
      });
      window.addEventListener("offline", () => {
        const badge = document.getElementById("pwa-connectivity-badge");
        if (badge) badge.innerText = "🔴 Offline";
      });
      window.footerListenersAttached = true;
    }
  }

  window.loadFooter = loadFooter;
  loadFooter();
})();