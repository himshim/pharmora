/**
 * Admin Module: Entity Manager
 */
(function () {
  'use strict';

  const ModuleEntityManager = {
    id: 'entity-manager', title: 'Entity Manager', icon: '📦', order: 3,
    permissions: ['content.manage'],

    render(container, ws) {
      container.innerHTML = '<div id="em-mount"></div>';
      if (typeof PharmoraEntityManagerUI !== 'undefined') {
        PharmoraEntityManagerUI.render('em-mount', {
          layout: 'list',
          sort:   'created',
        });
      }
    },

    toolbar() {
      return [
        { label: 'All Entities',    icon: '📦', action: "PharmoraEntityManagerUI.render('em-mount',{})" },
        { label: 'Pending',         icon: '⏳', action: "PharmoraEntityManagerUI.render('em-mount',{status:'pending_review'})" },
        { label: 'Published',       icon: '📢', action: "PharmoraEntityManagerUI.render('em-mount',{status:'published'})" },
        { label: 'Drafts',          icon: '📝', action: "PharmoraEntityManagerUI.render('em-mount',{status:'draft'})" },
        { label: 'Grid',            icon: '⊞',  action: "PharmoraEntityManagerUI.render('em-mount',{layout:'list'})" },
        { label: 'Table',           icon: '☰',  action: "PharmoraEntityManagerUI.render('em-mount',{layout:'table'})" },
        { label: 'Compact',         icon: '≡',  action: "PharmoraEntityManagerUI.render('em-mount',{layout:'compact'})" },
      ];
    },

    shortcuts() {
      return {
        'g': () => PharmoraEntityManagerUI.render('em-mount', { layout: 'list' }),
        't': () => PharmoraEntityManagerUI.render('em-mount', { layout: 'table' }),
      };
    },
  };

  window.PharmoraAdminModules = window.PharmoraAdminModules || [];
  window.PharmoraAdminModules.push(ModuleEntityManager);
})();
