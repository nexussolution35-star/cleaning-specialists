# GHL Build Prompt — Campaign 1: The Cleaning Specialists Customer Check-In

> **Role:** You are a senior GoHighLevel (GHL) automation specialist at Nexus Solution. Build the campaign below
> in the client's GHL sub-account from start to finish. Follow every step in order. Do not skip the testing phase.
> Copy all message text **exactly** as written. Merge fields use GHL syntax: `{{contact.first_name}}`.

---

## 0. Campaign Overview (read first)

| Item | Detail |
|---|---|
| **Goal** | Re-engage past residential and commercial clients, surface anyone needing help, generate new bookings, and collect Google Reviews from happy customers |
| **Audience** | Past clients of The Cleaning Specialists |
| **Channel** | WhatsApp (needed for the tap-to-reply buttons), with SMS fallback |
| **Sender** | Gloria, The Cleaning Specialists |
| **Outcomes** | Google Review · Consultation call booked · Team notified by email |

**Flow map**

```
Initial Check-In
 ├─ "Yes, I loved it!"            → Review Request → (no click 3d) Review FU1 → (no click 5d) Review FU2 → Leave Review / Not Now → End
 ├─ "I need some assistance"      → AI Agent books consultation → Email team → End
 ├─ "I want to book another cleaning" → AI Agent books consultation → Email team → End
 └─ No response (5d) → Follow-up 1 → No response (7d) → Follow-up 2 → End
```

---

## PHASE 1 — Prerequisites & Account Setup

### Step 1.1 — Connect the messaging channel
1. Go to **Settings → WhatsApp** and connect the business's WhatsApp number (via the GHL WhatsApp integration / Meta Business Manager).
2. Confirm the business profile shows **The Cleaning Specialists** as the display name.
3. Make sure **Settings → Phone Numbers** has an active LC Phone number for SMS fallback, and that A2P 10DLC registration is **approved** (US numbers only).

> ⚠️ **Pro note:** Real tap buttons only work on **WhatsApp**. Plain SMS can't show buttons. For SMS contacts,
> use numbered replies instead (`Reply 1, 2 or 3`). Both versions are covered below.

### Step 1.2 — Set up the review link
1. Go to **Reputation → Settings → Review Link** and copy the Google Review link.
2. Go to **Settings → Custom Values → + Add Custom Value**:
   - Name: `Google Review Link` → Value: *(paste the link)*
   - Name: `Business Name` → Value: `The Cleaning Specialists`
   - Name: `Team Notification Email` → Value: *(client's inbox)*

### Step 1.3 — Create a trigger link to track review clicks
1. Go to **Marketing → Trigger Links → Add Link**.
2. Name: `C1 – Google Review Click` · URL: `{{custom_values.google_review_link}}` (or paste the raw review URL).
3. Save the link. You'll use it in all review messages so GHL can tell when someone has clicked.

### Step 1.4 — Custom fields
Go to **Settings → Custom Fields → Contact** and create:

| Field | Type | Options |
|---|---|---|
| `Client Type` | Dropdown | Residential, Commercial |
| `Last Service Date` | Date | — |
| `C1 Response` | Dropdown | Loved It, Needs Assistance, Book Cleaning, No Response |
| `Enquiry Details` | Multi-line text | (filled by the AI Agent) |

### Step 1.5 — Tags (make them before you build, so the names stay consistent)
```
c1-past-client          c1-sent               c1-loved-it
c1-needs-assistance     c1-book-cleaning      c1-review-clicked
c1-review-not-now       c1-no-response        c1-consult-booked
c1-completed
```

### Step 1.6 — Pipeline
Go to **Opportunities → Pipelines → Create Pipeline**, name it `Customer Check-In`, and add these stages:
1. Check-In Sent
2. Responded – Happy
3. Needs Assistance
4. Wants New Cleaning
5. Consultation Booked
6. Review Left
7. No Response / Closed

### Step 1.7 — Calendar
Go to **Calendars → Create Calendar → Round Robin or Simple**, name it `Consultation Call`, set it to 15–30 minutes, and set the availability. The AI Agent will book into this calendar.

---

## PHASE 2 — Import the Audience

1. Export past clients from the old system. Required columns: **First Name, Last Name, Phone (E.164 format, e.g. +1…), Email, Client Type, Last Service Date**.
2. Clean the list. Remove duplicates, blank phone numbers, and anyone who opted out before.
3. Go to **Contacts → Import → Upload CSV**, map each column to its field, and add the tag **`c1-past-client`** at import.
4. Spot-check 5 contacts to make sure the first names and phone numbers imported correctly.

---

## PHASE 3 — Message Templates

> WhatsApp messages sent **first by the business** (the initial message and every follow-up sent days later) must be
> **Meta-approved templates**. Submit them under **Settings → WhatsApp → Templates**, category **Marketing**, with
> **Quick Reply** buttons. Approval usually takes anywhere from a few minutes to 24 hours. Submit on Day 1.

### T1 — Initial Check-In (`c1_initial_checkin`)
```
Hi {{1}}, it's Gloria from The Cleaning Specialists.

It's been a while since we last helped take care of your space, and we wanted to check in and make sure you were still happy with the service you received from us.

If you need anything, have any concerns, or you're thinking about having us take care of another space, we're right here.
```
Quick replies: `Yes, I loved it!` · `I need some assistance` · `I want to book another cleaning`
Footer: `Reply STOP to opt out.`

### T2 — Review Request (`c1_review_request`)
```
Hi {{1}}, that's amazing to hear!

If you have a quick moment, leaving us a Google Review would really help other homeowners and businesses find The Cleaning Specialists, and it means the world to our team.

Tap below.
```
Button (URL): `Leave a Google Review` → trigger link from Step 1.3

### T3 — Review Follow-up 1 (`c1_review_fu1`)
```
Hi {{1}}, just a quick follow-up.

If you were happy with your experience with The Cleaning Specialists, we'd really appreciate you taking a moment to share your experience with us on Google.

It only takes a minute and really helps our team.
```
Button (URL): `Leave a Google Review`

### T4 — Review Follow-up 2 (`c1_review_fu2`)
```
Hi {{1}},

Thank you again for choosing The Cleaning Specialists.

If you haven't had a chance yet, we'd still love to hear your feedback. Your review helps us continue delivering great service to more homes and businesses.
```
Buttons: `Leave a Google Review` (URL) · `Not Now` (Quick Reply)

### T5 — No-Response Follow-up 1 (`c1_noresp_fu1`)
```
Hi {{1}},

Just checking in to see how things are going since we last helped with your space.

We're always here if you need assistance, have another cleaning project in mind, or simply want to let us know how your experience was.
```
Quick replies: `Yes, I loved it!` · `I need some assistance` · `I want to book another cleaning`

### T6 — No-Response Follow-up 2 (`c1_noresp_fu2`)
```
Hi {{1}},

No pressure at all, we simply wanted to make sure everything was still okay and that you were happy with the service you received from The Cleaning Specialists.

If you ever need us again, we're just one message away.
```
Quick replies: `Yes, I loved it!` · `I need some assistance` · `I want to book another cleaning`

> Map `{{1}}` → `{{contact.first_name}}` when you pick the template inside the workflow.

### SMS fallback versions
Use the same wording, and replace the buttons with:
```
Reply 1 – Yes, I loved it!
Reply 2 – I need some assistance
Reply 3 – I want to book another cleaning
Reply STOP to opt out.
```
Put the review link inline in SMS messages: `Leave a Google Review 👉 {{trigger_link.C1 – Google Review Click}}`

---

## PHASE 4 — AI Agent (Consultation Booking)

1. Go to **AI Agents → Conversation AI → Create Bot**. Name it `C1 – Consultation Booker`.
2. Mode: **Auto-Pilot**. Channels: **WhatsApp + SMS**.
3. Attach the **Consultation Call** calendar (Bot Goal → *Book Appointment*).
4. Bot instructions (paste this in):

```
You are Gloria's assistant at The Cleaning Specialists, a residential and commercial cleaning company.
You are speaking with a PAST client who just replied to a check-in message.

Your job:
1. Warmly acknowledge their reply.
2. Find out what they need:
   - If they chose "I need some assistance": ask what the issue or concern is, and when/where it happened.
   - If they chose "I want to book another cleaning": ask what type of cleaning (regular, deep, move-in/out,
     post-construction, commercial/office), property type and approximate size, and preferred timeframe.
3. Confirm the service address.
4. Offer to book a short consultation call and send available times from the Consultation Call calendar.
5. Once booked, confirm the date/time and let them know the team will call them.

Rules:
- Keep messages short (1–3 sentences), friendly, and professional. Use their first name.
- Never quote prices. Say the team will confirm pricing on the consultation call.
- If the customer is upset or reports damage, apologise sincerely, capture the details, book the call,
  and do not argue or make promises about refunds.
- Ask one question at a time.
- If they say they don't want a call, collect their details and tell them the team will reach out.
```

5. Turn on **Update contact fields**, so the bot writes a summary to `Enquiry Details`.
6. Set **Hand-off to human** when the bot is unsure, or when the customer asks for a person.

---

## PHASE 5 — Workflows

Go to **Automation → Workflows → + Create Workflow → Start from Scratch**. Build **5 workflows**. Name them exactly as shown so the team can find them.

**Global settings for every workflow** (the ⚙️ Settings tab):
- Allow Re-entry: **OFF**
- Stop on Response: **OFF**. (We handle replies with triggers and goal events so they route correctly.)
- Time Window: **Mon–Sat, 9:00 AM – 6:00 PM** (the business's timezone)
- Sender name: Gloria / The Cleaning Specialists number

---

### WF-1: `C1 | 01 Initial Check-In + No-Response Sequence`

**Trigger:** *Contact Tag Added* → tag is `c1-past-client`.
*(Or trigger it manually with Bulk Action → Add to Workflow, in batches. See Phase 7.)*

| # | Action | Configuration |
|---|---|---|
| 1 | **If/Else** — Channel check | Branch A: Contact has a WhatsApp-capable phone → WhatsApp path. Branch B (else) → SMS path |
| 2 | **Send WhatsApp** (or **Send SMS**) | Template **T1** (or the SMS version) |
| 3 | **Add Tag** | `c1-sent` |
| 4 | **Create/Update Opportunity** | Pipeline `Customer Check-In` → Stage **Check-In Sent** |
| 5 | **Wait** | *Wait for condition → Contact Reply* · Timeout **5 days** |
| 6 | **If/Else** | *Replied?* → **YES**: go to **End** (the reply workflows take over). **NO**: continue |
| 7 | **Send WhatsApp/SMS** | Template **T5** — No-Response Follow-up 1 |
| 8 | **Wait** | *Wait for condition → Contact Reply* · Timeout **7 days** |
| 9 | **If/Else** | *Replied?* → YES: End. NO: continue |
| 10 | **Send WhatsApp/SMS** | Template **T6** — No-Response Follow-up 2 |
| 11 | **Wait** | 3 days (gives them time to reply to the last message) |
| 12 | **If/Else** | Has *none* of the tags `c1-loved-it`, `c1-needs-assistance`, `c1-book-cleaning` → **Add Tag** `c1-no-response`, **Update Field** `C1 Response = No Response`, move Opportunity to **No Response / Closed** |
| 13 | **Add Tag** | `c1-completed` → **End** |

**Goal Event (add it at the top level of the workflow):** *Goal → Contact Tag Added* → any of `c1-loved-it`, `c1-needs-assistance`, `c1-book-cleaning`. When the goal is hit, **the contact exits WF-1**. This stops any more follow-ups going out once they answer.

---

### WF-2: `C1 | 02 Loved It → Google Review`

**Trigger:** *Customer Replied*
- Filter: **Reply channel** is WhatsApp or SMS
- Filter: **Message** *contains phrase* `Yes, I loved it` **OR** *exact match* `1`
- Filter: **Contact tag** includes `c1-sent`

| # | Action | Configuration |
|---|---|---|
| 1 | **Add Tag** | `c1-loved-it` (this fires WF-1's goal, so WF-1 stops) |
| 2 | **Update Contact Field** | `C1 Response = Loved It` |
| 3 | **Update Opportunity** | Stage → **Responded – Happy** |
| 4 | **Send WhatsApp/SMS** | Template **T2** — Review Request *(this is inside the 24h window, so a session message is fine)* |
| 5 | **Wait** | *Wait for condition → Trigger Link Clicked* (`C1 – Google Review Click`) · Timeout **3 days** |
| 6 | **If/Else** | Clicked? → YES: go to step 12. NO: continue |
| 7 | **Send WhatsApp/SMS** | Template **T3** — Review Follow-up 1 |
| 8 | **Wait** | *Wait for condition → Trigger Link Clicked* · Timeout **5 days** |
| 9 | **If/Else** | Clicked? → YES: go to step 12. NO: continue |
| 10 | **Send WhatsApp/SMS** | Template **T4** — Review Follow-up 2 (with **Leave a Google Review** / **Not Now**) |
| 11 | **Wait** | 3 days → then **Add Tag** `c1-completed` → **End** |
| 12 | *(Clicked path)* **Add Tag** | `c1-review-clicked` → Opportunity stage **Review Left** → `c1-completed` → **End** |

**Goal Event:** *Trigger Link Clicked* (`C1 – Google Review Click`). The contact leaves the workflow as soon as they click, at any point.

---

### WF-3: `C1 | 03 Needs Assistance → AI Agent`

**Trigger:** *Customer Replied*
- Message *contains phrase* `I need some assistance` **OR** *exact match* `2`
- Contact tag includes `c1-sent`

| # | Action | Configuration |
|---|---|---|
| 1 | **Add Tag** | `c1-needs-assistance` |
| 2 | **Update Contact Field** | `C1 Response = Needs Assistance` |
| 3 | **Update Opportunity** | Stage → **Needs Assistance** |
| 4 | **Conversation AI / AI Agent** action | Turn on bot **C1 – Consultation Booker** for this contact |
| 5 | **Wait** | *Wait for condition → Appointment booked* on **Consultation Call** calendar · Timeout **2 days** |
| 6 | **If/Else** | Booked? → YES: Tag `c1-consult-booked`, Opportunity → **Consultation Booked**. NO: go to step 7 anyway (the team still needs to follow up) |
| 7 | **Send Internal Notification → Email** | See the email below |
| 8 | **Add Task** *(optional)* | Assign to the office manager: "Follow up C1 assistance request – {{contact.name}}", due in 1 day |
| 9 | **Add Tag** | `c1-completed` → **End** |

**Internal email:**
```
To: {{custom_values.team_notification_email}}
Subject: ⚠️ Assistance Request – {{contact.first_name}} {{contact.last_name}}

A past client has asked for assistance via the Customer Check-In campaign.

Name: {{contact.name}}
Phone: {{contact.phone}}
Email: {{contact.email}}
Client Type: {{contact.client_type}}
Last Service: {{contact.last_service_date}}

Enquiry: {{contact.enquiry_details}}
Consultation: {{appointment.start_time}} (blank if not booked)

Open conversation: {{contact.url}}
```

---

### WF-4: `C1 | 04 Book Another Cleaning → AI Agent`

Same structure as WF-3, with these changes:
- **Trigger:** message *contains phrase* `I want to book another cleaning` **OR** *exact match* `3`
- Tag: `c1-book-cleaning` · Field: `C1 Response = Book Cleaning` · Stage: **Wants New Cleaning**
- Email subject: `🧽 New Cleaning Request – {{contact.first_name}} {{contact.last_name}}`
- Opportunity value *(optional)*: fill in the average job value, so pipeline reporting shows the revenue.

---

### WF-5: `C1 | 05 Review "Not Now" + Opt-out Handling`

**Trigger A:** *Customer Replied* → message contains `Not Now`
| # | Action |
|---|---|
| 1 | Add Tag `c1-review-not-now` |
| 2 | **Remove from Workflow** → `C1 | 02 Loved It → Google Review` |
| 3 | Send: `No problem at all, {{contact.first_name}}! Thanks again for choosing The Cleaning Specialists. 💙` |
| 4 | Add Tag `c1-completed` → End |

**Trigger B:** *Customer Replied* → message contains `STOP` (GHL sets DND automatically, and this makes sure the contact exits)
| # | Action |
|---|---|
| 1 | **Remove from ALL C1 workflows** (WF-1 to WF-4) |
| 2 | Add Tag `c1-opted-out` → Opportunity → **No Response / Closed** (status Lost) |

---

## PHASE 6 — Testing (required before launch)

1. Create **3 test contacts** using your own team phones. Tag them `c1-past-client`.
2. For testing only, temporarily change the waits to **1–2 minutes**.
3. Run each test and check it off:

| Test | Expected result | ✅ |
|---|---|---|
| Tap **Yes, I loved it!** | T2 received, tag `c1-loved-it`, WF-1 stops, opportunity → Responded – Happy | ☐ |
| Don't click the review link | T3, then T4 arrive on schedule | ☐ |
| Click the review link | Contact exits WF-2, tag `c1-review-clicked` | ☐ |
| Tap **Not Now** | Polite close message, contact exits WF-2 | ☐ |
| Tap **I need some assistance** | AI Agent engages, books the call, team email arrives with correct details | ☐ |
| Tap **I want to book another cleaning** | AI Agent engages, books the call, team email arrives | ☐ |
| No reply at all | FU1 → FU2 → tag `c1-no-response` | ☐ |
| Reply **STOP** | DND on, exits all workflows | ☐ |
| SMS contact replies `1`/`2`/`3` | Routes to the correct branch | ☐ |
| `{{contact.first_name}}` blank | Check the fallback (set the default to "there") | ☐ |

4. **Put all wait times back** to production values (5d / 7d / 3d / 5d), then **Publish** all 5 workflows.

---

## PHASE 7 — Launch

1. **Warm up the number.** Don't blast the whole list at once. Go to **Contacts → filter tag `c1-past-client` → Bulk Action → Add to Workflow (WF-1) → Drip mode**: **50 contacts every 1 hour** during business hours (raise the rate after Day 1 if block and report rates stay low).
2. Watch **Conversations** closely for the first 24 hours. Step in on any AI reply that goes off-script.
3. Tell the client's team to expect email notifications and consultation bookings.

---

## PHASE 8 — Reporting & Optimisation

Build a dashboard (**Dashboard → + Add Widget**) showing:
- Contacts sent (`c1-sent`)
- Response rate (loved it + assistance + book ÷ sent)
- Reviews clicked (`c1-review-clicked`) and new Google reviews in **Reputation**
- Consultations booked (`c1-consult-booked`) and pipeline value
- Opt-out rate (`c1-opted-out`) — **keep it under 2%**

**Weekly review:** Check which follow-up gets the most replies, A/B test the opening line in T1, and send the client a short results summary.

---

### Build Checklist (summary)
- [ ] WhatsApp + LC Phone connected, A2P approved
- [ ] Custom values, custom fields, tags, pipeline, calendar created
- [ ] Trigger link for the review created
- [ ] 6 WhatsApp templates approved + SMS versions written
- [ ] AI Agent built and linked to the Consultation Call calendar
- [ ] WF-1 to WF-5 built, goals set, settings set
- [ ] Full test pass completed, waits restored
- [ ] Contacts imported and drip launched
- [ ] Dashboard live
