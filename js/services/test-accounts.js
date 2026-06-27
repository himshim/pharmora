// test-accounts.js – creates demo user accounts in localStorage for testing various roles
// Load this script via a <script> tag or execute in the browser console.

(() => {
  const accounts = [
    { name: "Owner User", email: "owner@example.com", password: "owner123", role: "owner" },
    { name: "Maintainer User", email: "maintainer@example.com", password: "maint123", role: "maintainer" },
    { name: "Admin User", email: "admin@example.com", password: "admin123", role: "admin" },
    { name: "Contributor User", email: "contributor@example.com", password: "contrib123", role: "contributor" },
    { name: "Member User", email: "member@example.com", password: "member123", role: "member" },
    { name: "Student User", email: "student@example.com", password: "student123", role: "student" }
  ];

  // Helper to ensure a user exists; creates if missing
  async function ensureAccount(acc) {
    const existing = (await window.getRecords("users", { email: acc.email })).find(u => (u.email || u.data?.email) === acc.email);
    if (!existing) {
      await window.createRecord("users", {
        name: acc.name,
        email: acc.email,
        password: acc.password,
        role: acc.role,
        permissions: []
      });
    }
  }

  // Public API – call this to provision the test accounts
  window.createTestAccounts = async function() {
    for (const acc of accounts) {
      await ensureAccount(acc);
    }
    console.log("✅ Test accounts ensured in local storage.");
  };
})();
