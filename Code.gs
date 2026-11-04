// RSVP collector for the Laharika weds Karthikeya Sai invitation.
// Paste this into a Google Sheet: Extensions > Apps Script. Then Deploy > New deployment > Web app.
// Each RSVP is added as a new row on the "Events" or "Wedding" tab.

var TABS = { events: "Events", wedding: "Wedding" };
var HEADERS = {
  events: ["Time", "Name", "Team", "Status", "Celebrations", "Guests"],
  wedding: ["Time", "Name", "Team", "Status", "Guests"]
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var d = JSON.parse(e.postData.contents);
    var kind = d.page === "wedding" ? "wedding" : "events";
    var name = clean(d.name, 80);
    if (name.length < 2) return out({ ok: false, error: "name" });
    var side = d.side === "Team Groom" ? "Team Groom" : "Team Bride";
    var declined = d.declined === true;
    var guests = declined ? 0 : Math.max(1, Math.min(10, Number(d.guests) || 1));

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(TABS[kind]) || ss.insertSheet(TABS[kind]);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS[kind]);
      sh.getRange(1, 1, 1, HEADERS[kind].length).setFontWeight("bold");
      sh.setFrozenRows(1);
    }
    var status = declined ? "Declined" : "Attending";
    var row = kind === "events"
      ? [new Date(), name, side, status, clean(d.events, 200), guests]
      : [new Date(), name, side, status, guests];
    sh.appendRow(row);
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function doGet() { return out({ ok: true, service: "rsvp" }); }

// Stops a typed value from being read as a spreadsheet formula.
function clean(v, max) {
  v = String(v == null ? "" : v).replace(/[\r\n]+/g, " ").trim().slice(0, max);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}
function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
