// RSVP collector for the Laharika weds Karthikeya Sai invitations.
// Paste this into a Google Sheet: Extensions > Apps Script. Then Deploy > New deployment > Web app.
// Each invitation page has its own tab, and every RSVP is added as a new row on that tab.
// Columns are matched by their heading, so you can reorder them or add your own columns to the right.

var TABS = {
  mehendi: "Mehendi",
  engagement: "Engagement & Sangeet",
  haldi: "Haldi",
  wedding: "Wedding"
};
var HEADERS = ["Time", "Name", "Phone", "Team", "Status", "Guests", "Message"];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var d = JSON.parse(e.postData.contents);
    var tab = TABS[d.page];
    if (!tab) return out({ ok: false, error: "page" });
    var name = clean(d.name, 80);
    if (name.length < 2) return out({ ok: false, error: "name" });
    var declined = d.declined === true;

    var values = {
      "Time": new Date(),
      "Name": name,
      "Phone": String(d.phone == null ? "" : d.phone).replace(/[^\d+()\-.\s]/g, "").trim().slice(0, 20),
      "Team": d.side === "Team Groom" ? "Team Groom" : d.side === "Team Bride" ? "Team Bride" : "",
      "Status": declined ? "Declined" : "Attending",
      "Guests": declined ? 0 : Math.max(1, Math.min(10, Number(d.guests) || 1)),
      "Message": clean(d.message, 400)
    };

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(tab) || ss.insertSheet(tab);
    var headers = ensureHeaders(sh, HEADERS);
    var row = headers.map(function (h) { return values.hasOwnProperty(h) ? values[h] : ""; });

    var r = sh.getLastRow() + 1;
    var phoneCol = headers.indexOf("Phone") + 1;
    if (phoneCol > 0) sh.getRange(r, phoneCol).setNumberFormat("@");   // keeps +1 and leading zeros as typed
    sh.getRange(r, 1, 1, row.length).setValues([row]);
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function doGet() { return out({ ok: true, service: "rsvp" }); }

// Writes the heading row on a new tab. On an existing tab it adds any missing headings
// (for example Phone and Message) at the end and leaves your old rows alone.
function ensureHeaders(sh, defaults) {
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, defaults.length).setValues([defaults]).setFontWeight("bold");
    sh.setFrozenRows(1);
    return defaults.slice();
  }
  var width = Math.max(sh.getLastColumn(), 1);
  var headers = sh.getRange(1, 1, 1, width).getValues()[0].map(function (h) { return String(h).trim(); });
  while (headers.length && headers[headers.length - 1] === "") headers.pop();
  defaults.forEach(function (h) {
    if (headers.indexOf(h) === -1) {
      headers.push(h);
      sh.getRange(1, headers.length).setValue(h).setFontWeight("bold");
    }
  });
  return headers;
}

// Stops a typed value from being read as a spreadsheet formula.
function clean(v, max) {
  v = String(v == null ? "" : v).replace(/[\r\n]+/g, " ").trim().slice(0, max);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}
function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
