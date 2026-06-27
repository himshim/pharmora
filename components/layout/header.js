/*
 Pharmora Universal Header Component v3
 Reusable dynamic header layout
*/

(function () {
  'use strict';

  // Add layout styling & animations block
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .navbar-header {
      position: relative;
      z-index: 1000;
    }
    .navbar-header .user-menu-wrapper {
      position: relative;
      display: inline-block;
    }
    .navbar-header .user-dropdown-panel {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 8px 0;
      min-width: 185px;
      box-shadow: var(--shadow-lg);
      display: none;
      flex-direction: column;
      z-index: 1001;
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
      pointer-events: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .navbar-header .user-dropdown-panel.show {
      display: flex;
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }
    .navbar-header .user-dropdown-panel a {
      padding: 10px 16px;
      color: var(--text);
      text-decoration: none;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: background 0.2s;
    }
    .navbar-header .user-dropdown-panel a:hover {
      background: var(--surface-light);
    }
    .navbar-header .header-search-bar {
      width: 100%;
    }
    .navbar-header .header-search-bar form {
      position: relative;
      display: flex;
      align-items: center;
    }
    .navbar-header .header-search-bar input {
      padding: 8px 12px 8px 32px;
      border-radius: 20px;
      border: 1px solid var(--border);
      background: var(--surface-light);
      color: var(--text);
      font-size: 0.9rem;
      width: 100%;
      transition: all 0.3s;
    }
    .navbar-header .header-search-bar input:focus {
      background: var(--surface);
      border-color: var(--primary);
      outline: none;
      box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.15);
    }
    .navbar-header .header-search-bar .search-icon {
      position: absolute;
      left: 10px;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .navbar-header .notification-panel {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      width: 360px;
      max-width: 90vw;
      max-height: 450px;
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
      display: none;
      flex-direction: column;
      z-index: 1002;
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
      pointer-events: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      padding: 16px;
    }
    .navbar-header .notification-panel.show {
      display: flex;
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }
    .navbar-header .notice-track {
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      width: 100%;
    }
    .navbar-header .notice-track span {
      display: inline-block;
      padding-left: 100%;
      animation: ticker 30s linear infinite;
    }
    .navbar-header .notice-track:hover span {
      animation-play-state: paused;
    }
    @keyframes ticker {
      0% { transform: translate3d(0, 0, 0); }
      100% { transform: translate3d(-100%, 0, 0); }
    }
    @media (max-width: 768px) {
      #header-search-container, #header-nav-container, #header-usermenu-container {
        display: none !important;
      }
      .navbar-header .menu-toggle {
        display: block !important;
      }
      .navbar-header .mobile-menu.active {
        display: block !important;
      }
    }
  `;
  document.head.appendChild(styleEl);

  async function loadHeader() {
    const root = document.getElementById("site-header");
    if (!root) return;

    // Fetch configs
    let navConfig = [];
    let siteConfig = { name: "Pharmora", logo: "", tagline: "Open Pharmacy Knowledge Ecosystem" };

    try {
      siteConfig = await fetch(appPath("config/site.json")).then(r => r.json());
      navConfig = await fetch(appPath("config/navigation.json")).then(r => r.json());
    } catch (e) {
      console.warn("Failed loading configs, using defaults", e);
    }

    // Resolve user states
    const user = typeof currentUser === "function" ? currentUser() : null;
    let profile = null;
    if (user && window.PharmoraProfile) {
      try {
        profile = await PharmoraProfile.getProfile(user.id);
      } catch (err) {}
    }

    const name = profile?.displayName || user?.name || "Profile";
    const initials = name.charAt(0).toUpperCase();

    // Resolve notifications count
    let unreadCount = 0;
    if (user && window.PharmoraNotify) {
      try {
        unreadCount = (await PharmoraNotify.unread()).length;
      } catch (err) {}
    }

    // Dynamic Permission Checks on navigation items
    const filteredLinks = [];
    for (const item of navConfig) {
      if (!item.permission) {
        filteredLinks.push(item);
      } else {
        const allowed = typeof hasPermission === "function" ? await hasPermission(item.permission) : false;
        if (allowed) {
          filteredLinks.push(item);
        }
      }
    }

    // Exposed components render API
    window.renderLogo = function () {
      const logoSrc = siteConfig.logo ? appPath(siteConfig.logo) : "";
      return `
        <a href="${appPath("")}" class="logo" style="display:flex; align-items:center; gap:10px; text-decoration:none; color:inherit;">
          ${logoSrc ? `<img class="site-logo" src="${logoSrc}" alt="${siteConfig.name}" style="height:36px;">` : "⚕"}
          <span>${siteConfig.name}</span>
        </a>
      `;
    };

    window.renderNavigation = function (links) {
      return links.map(link => `
        <a href="${appPath(link.url)}" class="nav-item" style="color:var(--text-soft); text-decoration:none; font-weight:600; font-size:0.95rem;">
          ${link.icon || ""} ${link.title}
        </a>
      `).join("");
    };

    window.renderSearch = function () {
      const queryVal = new URLSearchParams(window.location.search).get('q') || '';
      return `
        <div class="header-search-bar">
          <form onsubmit="event.preventDefault(); window.location.href='/library/?q=' + encodeURIComponent(this.querySelector('input').value);">
            <span class="search-icon">🔍</span>
            <input type="search" placeholder="Search knowledge base..." value="${queryVal}" aria-label="Search">
          </form>
        </div>
      `;
    };

    window.renderNotifications = function (id, count) {
      const dot = count ? `<span class="notification-dot" style="background:var(--secondary); color:#fff; border-radius:50%; padding:2px 6px; font-size:0.75rem; margin-left:4px; font-weight:bold;">${count}</span>` : "";
      return `
        <div class="notification-wrapper" style="position:relative;">
          <a href="#" class="notification-link" onclick="event.preventDefault(); PharmoraNotification.toggle('${id}');" style="text-decoration:none; font-size:1.1rem;">
            🔔${dot}
          </a>
          <div id="${id}" class="notification-panel"></div>
        </div>
      `;
    };

    window.renderUserMenu = function (currUser, initialsChar, dispName, count) {
      if (!currUser) {
        return `
          <a href="${appPath("auth/login.html")}" class="btn btn-primary btn-small">
            🔑 Login
          </a>
        `;
      }
      return `
        <div class="user-menu-wrapper">
          <a href="#" onclick="event.preventDefault(); toggleUserMenu(event);" class="user-chip" style="display:flex; align-items:center; gap:8px; text-decoration:none; color:var(--text);">
            <div class="avatar avatar-sm" style="width:30px; height:30px; border-radius:50%; background:var(--primary); color:#000; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:0.85rem;">${initialsChar}</div>
            <span class="user-name-text" style="font-weight:600; font-size:0.9rem; cursor:pointer;">${dispName} ▾</span>
          </a>
          <div id="header-usermenu-panel" class="user-dropdown-panel">
            <a href="${appPath("dashboard/")}">📊 Dashboard</a>
            <a href="${appPath("settings/")}">⚙ Settings</a>
            <a href="#" onclick="event.preventDefault(); toggleTheme();">🌓 Switch Theme</a>
            <a href="#" onclick="event.preventDefault(); logoutUser();">🚪 Logout</a>
          </div>
        </div>
      `;
    };

    window.renderBreadcrumbs = function () {
      const currentPath = window.location.pathname;
      if (currentPath === "/" || currentPath === "/index.html") {
        return "";
      }
      const crumbs = [{ title: "Home", url: "/" }];
      const routeMap = [];
      
      function scan(obj, prefix = []) {
        for (const key in obj) {
          const val = obj[key];
          if (typeof val === 'string') {
            routeMap.push({ path: val, keys: [...prefix, key] });
          } else if (typeof val === 'object' && val !== null) {
            scan(val, [...prefix, key]);
          }
        }
      }
      if (typeof PharmoraRoutes !== "undefined") {
        scan(PharmoraRoutes);
      }
      const extra = [
        { path: "/teach/", keys: ["teach"] },
        { path: "/admin/", keys: ["admin"] },
        { path: "/dashboard/", keys: ["dashboard"] },
        { path: "/settings/", keys: ["settings"] },
        { path: "/profile/", keys: ["profile"] },
        { path: "/profile-edit.html", keys: ["profile", "edit"] }
      ];
      extra.forEach(r => {
        if (!routeMap.some(x => x.path === r.path)) {
          routeMap.push(r);
        }
      });

      routeMap.sort((a, b) => b.path.length - a.path.length);
      const match = routeMap.find(r => currentPath.startsWith(r.path));
      if (match) {
        match.keys.forEach((key, index) => {
          const title = key.charAt(0).toUpperCase() + key.slice(1);
          if (index === match.keys.length - 1) {
            crumbs.push({ title, url: match.path });
          } else {
            crumbs.push({ title, url: null });
          }
        });
      } else {
        const segments = currentPath.split("/").filter(Boolean);
        segments.forEach((seg, index) => {
          const title = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
          crumbs.push({ title, url: "/" + segments.slice(0, index + 1).join("/") + "/" });
        });
      }

      if (crumbs.length > 1) {
        const last = crumbs[crumbs.length - 1];
        document.title = `${last.title} | Pharmora`;
      }

      return `
        <nav aria-label="breadcrumb" class="breadcrumb-nav">
          <ol class="breadcrumb" style="display:flex; gap:8px; list-style:none; padding:0; margin:0; font-size:0.85rem;">
            ${crumbs.map((c, idx) => `
              <li class="breadcrumb-item ${idx === crumbs.length - 1 ? 'active' : ''}">
                ${(c.url && idx < crumbs.length - 1) ? `<a href="${appPath(c.url)}" style="color:var(--primary);text-decoration:none;">${c.title}</a>` : `<span style="color:var(--text-muted);">${c.title}</span>`}
              </li>
            `).join('<span class="breadcrumb-separator" style="color:var(--text-muted);">/</span>')}
          </ol>
        </nav>
      `;
    };

    window.renderMobileDrawer = function (links, currUser) {
      const linksHtml = links.map(link => `
        <a href="${appPath(link.url)}" onclick="toggleMenu();" style="display:block; padding:12px; color:var(--text); text-decoration:none; border-bottom:1px solid var(--border);">
          ${link.icon || ""} ${link.title}
        </a>
      `).join("");

      let userBlock = "";
      if (currUser) {
        userBlock = `
          <div class="mobile-user-actions" style="margin-top: 20px; border-top: 1px solid var(--border); padding-top: 15px;">
            <a href="${appPath("dashboard/")}" onclick="toggleMenu();" style="display:block; padding:12px; color:var(--text); text-decoration:none;">📊 Dashboard</a>
            <a href="${appPath("settings/")}" onclick="toggleMenu();" style="display:block; padding:12px; color:var(--text); text-decoration:none;">⚙ Settings</a>
            <a href="#" onclick="event.preventDefault(); toggleTheme(); toggleMenu();" style="display:block; padding:12px; color:var(--text); text-decoration:none;">🌓 Switch Theme</a>
            <a href="#" onclick="event.preventDefault(); logoutUser();" style="display:block; padding:12px; color:var(--text); text-decoration:none;">🚪 Logout</a>
          </div>
        `;
      } else {
        userBlock = `
          <div style="margin-top: 20px; border-top: 1px solid var(--border); padding-top: 15px;">
            <a href="${appPath("auth/login.html")}" class="btn btn-primary btn-block" onclick="toggleMenu();">🔑 Login</a>
          </div>
        `;
      }

      return `
        <div class="mobile-menu" style="display:none; position:fixed; top:70px; left:0; right:0; bottom:0; background:var(--surface); z-index:999; padding:20px; border-top:1px solid var(--border); overflow-y:auto;">
          <div style="padding: 15px 0;">
            ${renderSearch()}
          </div>
          ${linksHtml}
          ${userBlock}
        </div>
      `;
    };

    // Render layout structure only once
    const navbarExists = root.querySelector(".navbar");
    if (!navbarExists) {
      root.innerHTML = `
        <header class="navbar-header" style="border-bottom: 1px solid var(--border); background: var(--surface);">
          <div class="container header-container" style="display:flex; justify-content:space-between; align-items:center; height:70px;">
            <div id="header-logo-container"></div>
            <div id="header-search-container" style="flex:1; max-width:400px; margin:0 20px;"></div>
            <nav class="nav-links" style="display:flex; align-items:center; gap:20px;">
              <div id="header-nav-container" style="display:flex; gap:20px;"></div>
              <div id="header-notifications-container"></div>
              <div id="header-usermenu-container"></div>
            </nav>
            <div class="menu-toggle" onclick="toggleMenu()" style="display:none; font-size:1.5rem; cursor:pointer;">☰</div>
          </div>
          <div class="breadcrumbs-container" style="background:var(--surface-light); border-top:1px solid var(--border); padding:8px 0;">
            <div class="container" id="header-breadcrumbs-container"></div>
          </div>
          <div id="header-mobile-drawer-container"></div>
          
          <div class="notice-bar" style="background:var(--primary); color:#fff; font-size:0.85rem; padding:4px 0; overflow:hidden;">
            <div class="container" style="display:flex; gap:10px; align-items:center;">
              <span class="notice-title" style="font-weight:bold; white-space:nowrap;">🔔 Updates</span>
              <div class="notice-track"><span id="notice-text">Loading updates...</span></div>
            </div>
          </div>
        </header>
      `;
    }

    // Populate dynamic targets
    document.getElementById("header-logo-container").innerHTML = renderLogo();
    document.getElementById("header-search-container").innerHTML = renderSearch();
    document.getElementById("header-nav-container").innerHTML = renderNavigation(filteredLinks);
    document.getElementById("header-notifications-container").innerHTML = renderNotifications("notification-panel-desktop", unreadCount);
    document.getElementById("header-usermenu-container").innerHTML = renderUserMenu(user, initials, name, unreadCount);
    document.getElementById("header-breadcrumbs-container").innerHTML = renderBreadcrumbs();
    document.getElementById("header-mobile-drawer-container").innerHTML = renderMobileDrawer(filteredLinks, user);

    loadNoticeTicker();

    setTimeout(() => {
      if (window.PharmoraNotification) {
        PharmoraNotification.refresh();
      }
    }, 300);
  }

  // Clicks management to close dynamic panels when clicking outside
  window.toggleUserMenu = function (event) {
    event.stopPropagation();
    const panel = document.getElementById("header-usermenu-panel");
    if (!panel) return;
    const notifPanel = document.getElementById("notification-panel-desktop");
    if (notifPanel) notifPanel.classList.remove("show");
    panel.classList.toggle("show");
  };

  window.toggleNotifications = function (id) {
    const panel = document.getElementById(id);
    if (!panel) return;
    const userPanel = document.getElementById("header-usermenu-panel");
    if (userPanel) userPanel.classList.remove("show");
    document.querySelectorAll(".notification-panel").forEach(item => {
      if (item !== panel) item.classList.remove("show");
    });
    panel.classList.toggle("show");
  };

  if (!window.dropdownOutsideClickListenerAttached) {
    document.addEventListener("click", (event) => {
      const userWrapper = document.querySelector(".user-menu-wrapper");
      if (userWrapper && !userWrapper.contains(event.target)) {
        const userPanel = document.getElementById("header-usermenu-panel");
        if (userPanel) userPanel.classList.remove("show");
      }
      const notifWrapper = document.querySelector(".notification-wrapper");
      if (notifWrapper && !notifWrapper.contains(event.target)) {
        const notifPanel = document.getElementById("notification-panel-desktop");
        if (notifPanel) notifPanel.classList.remove("show");
      }
    });
    window.dropdownOutsideClickListenerAttached = true;
  }

  async function loadNoticeTicker() {
    let box = document.getElementById("notice-text");
    if (!box) return;
    try {
      const response = await fetch(appPath("config/notices.json"));
      let data = await response.json();
      data = data.filter(x => x.active !== false);
      if (!data.length) {
        box.innerHTML = "Welcome to Pharmora Knowledge Ecosystem";
        return;
      }
      box.innerHTML = data.map(x => `🔔 ${x.title || ""} : ${x.message || ""}`).join(" &nbsp; • &nbsp; ");
    } catch (e) {
      box.innerHTML = "Open Pharmacy Knowledge Ecosystem";
    }
  }

  // Fix search bug: auto-fill local search box and submit search on library page load
  if (!window.searchAutostartAttached) {
    window.addEventListener("pharmora-ready", () => {
      const queryVal = new URLSearchParams(window.location.search).get('q');
      if (queryVal && window.location.pathname.includes('/library/')) {
        const localSearchInput = document.querySelector('.search-box input');
        if (localSearchInput) {
          localSearchInput.value = queryVal;
          if (typeof pharmoraSearch === "function") {
            pharmoraSearch(queryVal);
          }
        }
      }
    });
    window.searchAutostartAttached = true;
  }

  // Hook layout bootstrap
  window.loadHeader = loadHeader;
  loadHeader();

  // Handle updates dynamically without duplicating event listeners
  if (!window.headerListenerAttached) {
    window.addEventListener("profile-updated", loadHeader);
    window.headerListenerAttached = true;
  }
})();