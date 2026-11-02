// Counts who visits the website - no cookies, nothing that tells one visitor from another (supabase/v47_site_stats.sql).
// Sent: the page, phone / tablet / computer, the site the visitor came from, the browser's language. Each page is
// counted once per open tab; presses on Download and WhatsApp are counted too. The Owner sees it on the System page.
(function () {
  var SUPA = "https://cfkvwguxueqmuphjmatf.supabase.co";
  var KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNma3Z3Z3V4dWVxbXVwaGptYXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5NjE0NjgsImV4cCI6MjEwNzUzNzQ2OH0.2wjFzjviww6t-uIDuJPjhmELYF5XbsiPtSDMUbQUJxU";
  var ua = navigator.userAgent || "";
  var device = /iPad|Tablet/i.test(ua) ? "tablet" : /Mobi|Android|iPhone/i.test(ua) ? "phone" : "computer";
  var page = (location.pathname.split("/").pop() || "/").toLowerCase();
  page = page === "/" || page === "index.html" ? "/" : "/" + page;
  var from = "";
  try { from = document.referrer ? new URL(document.referrer).host : ""; } catch (e) { from = ""; }
  if (from === location.host) { from = ""; }
  var lang = (navigator.language || "").slice(0, 2);
  var region = ((navigator.language || "").split("-")[1] || "").toUpperCase();

  function send(kind) {
    try {
      fetch(SUPA + "/rest/v1/rpc/site_event", {
        method: "POST", keepalive: true,
        headers: {"apikey": KEY, "Authorization": "Bearer " + KEY, "Content-Type": "application/json"},
        body: JSON.stringify({p_kind: kind, p_page: page, p_device: device, p_ref: from || null, p_lang: lang || null,
                              p_country: /^[A-Z]{2}$/.test(region) ? region : null})
      }).catch(function () {});
    } catch (e) { /* counting must never break the page */ }
  }

  var seen = "st-counted-" + page, counted = false;
  try { counted = sessionStorage.getItem(seen) === "1"; sessionStorage.setItem(seen, "1"); } catch (e) { counted = false; }
  if (!counted) { send("visit"); }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a) { return; }
    if (a.hasAttribute("data-download")) { send("download"); }
    else if (a.hasAttribute("data-whatsapp") || a.hasAttribute("data-whatsapp-link")) { send("whatsapp"); }
  }, true);
})();
