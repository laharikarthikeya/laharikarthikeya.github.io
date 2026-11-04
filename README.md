# Laharika weds Karthikeya Sai: invitation site

Four pages, one RSVP sheet.

- `mehendi/` is the Mehendi (Fri 20 Nov, 2:00 PM)
- `engagement/` is the Engagement & Sangeet (Fri 20 Nov, 7:00 PM)
- `haldi/` is the Haldi (Sat 21 Nov, 12:00 PM)
- `wedding/` is the wedding (Sun 22 Nov, 10:20 AM)
- `config.js` holds the one link that connects every page to your Google Sheet
- `Code.gs` is the script that saves each RSVP as a row in your sheet

## RSVP sheet

Each page writes to its own tab: Mehendi, Engagement & Sangeet, Haldi and Wedding. The tabs are created automatically on the first RSVP.
Columns: Time, Name, Phone, Team, Status, Guests, Message.
A guest who can't come is saved with Status "Declined" and Guests 0.
Columns are matched by heading, so you can reorder them or add your own columns on the right.

## Setting up the sheet script

1. Open the Google Sheet, then Extensions > Apps Script. Paste in everything from `Code.gs` and save.
2. Deploy > New deployment > Web app. Execute as **Me**, Who has access **Anyone**. Copy the Web app URL (ends in `/exec`).
3. Paste that URL into `config.js` and commit.
4. If you change `Code.gs` later, use Deploy > Manage deployments > pencil > Version: New version, so the same URL keeps working.

## Notes

- The pages ask search engines not to list them, but anyone with the link can open them.
- Guests can send more than once. Each send is a new row, so use the latest one per name.
