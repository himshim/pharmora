/*
 Pharmora Universal Header Component v3
 Reusable dynamic header layout
*/

(function () {
  'use strict';

  // Add layout responsiveness style block
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .navbar-header .user-menu-wrapper {
      position: relative;
      display: inline-block;
    }
    .navbar-header .user-dropdown-panel {
      position: absolute;
      top: 100%;
      right: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 0;
      min-width: 160px;
      box-shadow: var(--shadow-lg);
      display: none;
      flex-direction: column;
      z-index: 1001;
    }
    .navbar-header .user-menu-wrapper:hover .user-dropdown-panel {
      display: flex;
    }
    .navbar-header .user-dropdown-panel a {
      padding: 8px 16px;
      color: var(--text);
      text-decoration: none;
      font-size: 0.9rem;
      transition: background 0.2s;
    }
    .navbar-header .user-dropdown-panel a:hover {
      background: var(--surface-light);
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
    }
    .navbar-header .header-search-bar .search-icon {
      position: absolute;
      left: 10px;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    @media (max-width: 768px) {
      #header-search-container, #header-nav-container, #header-usermenu-container {
        display: none !important;
      }
      .navbar-header .menu-toggle {
        display: block !important;
      }
    }
  `;
  document.head.appendChild(styleEl);

  async function loadHeader() {
    const root = document.getElementById("site-header");
    if (!root) return;

    // Fetch navigation configuration
    let navConfig = [];
    let siteConfig = { name: "Pharmora", logo: "", tagline: "Open Pharmacy Knowledge Ecosystem" };

    try {
      siteConfig = await fetch(appPath("config/site.json")).then(r => r.json());
      navConfig = await fetch(appPath("config/navigation.json")).then(r => r.json());
    } catch (e) {
      console.warn("Failed loading configs, using fallbacks", e);
    }

    // Resolve user state
    const user = typeof currentUser === "function" ? currentUser() : null;
    let profile = null;
    if (user && window.PharmoraProfile) {
      try {
        profile = await PharmoraProfile.getProfile(user.id);
      } catch (err) {}
    }

    const name = profile?.displayName || user?.name || "Profile";
    const initials = name.charAt(0).toUpperCase();

    // Resolve unread notifications
    let unreadCount = 0;
    if (user && window.PharmoraNotify) {
      try {
        unreadCount = (await PharmoraNotify.unread()).length;
      } catch (err) {}
    }

    // Central Navigation Registry - permission based filtering
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

    // Reusable render functions
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
      const dot = count ? `<span class="notification-dot" style="background:var(--secondary); color:#fff; border-radius:50%; padding:2px 6px; font-size:0.75rem; margin-left:4px;">${count}</span>` : "";
      return `
        <div class="notification-wrapper" style="position:relative;">
          <a href="#" class="notification-link" onclick="event.preventDefault(); PharmoraNotification.toggle('${id}');" style="text-decoration:none;">
            🔔${dot}
          </a>
          <div id="${id}" class="notification-panel" style="position:absolute; top:100%; right:0; background:var(--surface); border:1px solid var(--border); border-radius:8px; width:300px; max-height:400px; overflow-y:auto; display:none; flex-direction:column; z-index:1002; padding:15px; box-shadow:var(--shadow-lg);"></div>
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
          <a href="${appPath("dashboard/")}" class="user-chip" style="display:flex; align-items:center; gap:8px; text-decoration:none; color:var(--text);">
            <div class="avatar avatar-sm" style="width:30px; height:30px; border-radius:50%; background:var(--primary); color:#000; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:0.85rem;">${initialsChar}</div>
            <span class="user-name-text">${dispName}</span>
          </a>
          <div class="user-dropdown-panel">
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

    // Render structure only once
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
            <div class="container" style="display:flex; gap:10px;">
              <span class="notice-title" style="font-weight:bold; white-space:nowrap;">🔔 Updates</span>
              <div class="notice-track" style="overflow:hidden; white-space:nowrap;"><span id="notice-text">Loading updates...</span></div>
            </div>
          </div>
        </header>
      `;
    }

    // Populate target containers
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

  // Hook layout bootstrap
  window.loadHeader = loadHeader;
  loadHeader();

  // Handle updates dynamically without duplicating event listeners
  if (!window.headerListenerAttached) {
    window.addEventListener("profile-updated", loadHeader);
    window.headerListenerAttached = true;
  }
})();