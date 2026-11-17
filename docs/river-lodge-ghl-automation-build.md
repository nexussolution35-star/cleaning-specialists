# River Lodge: Website, Chat Widget and AI Automation Build

> **Goal:** every enquiry from the River Lodge Lovable website (forms **and** chat) lands in the
> River Lodge GHL sub-account as a contact with full details. The team is notified, the guest gets an
> instant reply, and an AI assistant that knows the lodge inside out answers questions and moves guests
> towards a booking.

**How it fits together**

```
Lovable website
 ├─ Forms (booking / contact / events) ──POST JSON──▶ GHL Inbound Webhook ──▶ WF-1 Website Form Leads
 └─ GHL Chat Widget (script on every page) ─────────▶ AI Agent (River Lodge AI) ──▶ WF-2 Chat Leads
                                                         ▲
                       Knowledge Base: website crawl + FAQs + lodge info from Lovable
```

**Build order** (follow it in order, because each step needs the one before):

| Step | What | Where |
|---|---|---|
| 1 | Extract all lodge info from the website | Lovable (Prompt A) |
| 2 | Account basics: custom fields, tags, pipeline | GHL River Lodge |
| 3 | Webhook workflow (WF-1) and its URL | GHL |
| 4 | Connect the website forms to the webhook | Lovable (Prompt B) |
| 5 | AI agent: prompt, knowledge base, FAQs | GHL AI Studio |
| 6 | Chat widget, then add it to the website | GHL + Lovable (Prompt C) |
| 7 | Chat-lead workflow (WF-2) and AI handover | GHL |
| 8 | Test everything | Website + GHL |

---

## STEP 1: Get all the lodge info out of Lovable (Prompt A)

Open the River Lodge project in **Lovable** and paste this into the chat. **Ask Lovable not to change
any code**; this prompt is only for reading.

```
Do NOT change any code. Read the whole project and give me a complete information pack about
River Lodge in plain text, using exactly these headings. Copy facts exactly as they appear on
the site (prices, times, names, phone numbers). If something is not on the site, write
"NOT ON SITE".

1. BUSINESS DETAILS – name, tagline, physical address, GPS/directions, phone, WhatsApp, email,
   social links, operating/reception hours.
2. ACCOMMODATION – every room/unit/chalet/campsite type: name, sleeps how many, beds, bathroom,
   amenities, rates (per night / per person, seasons, weekday vs weekend), minimum stay,
   self-catering or catered.
3. FACILITIES & ACTIVITIES – pool, braai, restaurant/bar, Wi-Fi, parking, fishing, hiking,
   game drives, spa, kids facilities, pet policy, accessibility, etc.
4. CONFERENCES / EVENTS / WEDDINGS / FUNCTIONS – venues, capacity, packages, prices.
5. SPECIALS & PACKAGES – current specials, conditions, valid dates.
6. POLICIES – check-in and check-out times, deposit, payment methods, cancellation, children,
   pets, smoking, noise, load-shedding/backup power, water.
7. LOCATION & GETTING THERE – directions from nearby towns/airports, road conditions,
   distance to attractions.
8. FAQs – every question and answer on the site, word for word.
9. SITE MAP – every page: page name, route/URL path (e.g. /rooms), what is on it, and the
   buttons/links on it. Include the main navigation menu and the footer links.
10. FORMS – for EVERY form on the site: which page it is on, the form's purpose, every field
    (label, field name in code, type, required or not, dropdown options), what happens on
    submit now (where the data goes, any existing webhook/email/Supabase table), and the
    success message shown.
11. BOOKING FLOW – how a guest books right now (form, external booking engine link, phone,
    WhatsApp), step by step.
12. ANYTHING ELSE a customer could ask about.
```

**Save Lovable's whole answer** in a document. You'll paste it into GHL in Step 5, and I can turn it
into the AI prompt and FAQs for you.

---

## STEP 2: River Lodge account basics (GHL)

Switch to the **River Lodge** sub-account.

### 2.1 Custom fields
**Settings → Custom Fields → + Add Field → Contact**. Create these to match the booking form (add any
other fields that Prompt A finds on the forms):

| Field name | Type |
|---|---|
| Enquiry Type | Single line (Booking / Contact / Event / Conference / Other) |
| Check-in Date | Date picker |
| Check-out Date | Date picker |
| Adults | Number |
| Children | Number |
| Accommodation Type | Single line |
| Enquiry Message | Multi line |
| Special Requests | Multi line |
| Source Page | Single line |

### 2.2 Tags
**Settings → Tags**:
`rl-website-lead` · `rl-chat-lead` · `rl-booking-enquiry` · `rl-contact-enquiry` ·
`rl-event-enquiry` · `rl-ai-handover` · `rl-booked`

### 2.3 Pipeline
**Opportunities → Pipelines → + Create Pipeline** → `River Lodge Enquiries`. Stages:
1. New Enquiry
2. Contacted
3. Quote / Availability Sent
4. Deposit Paid / Booked
5. Lost / No Reply

### 2.4 Custom values
**Settings → Custom Values**: `Lodge Name`, `Lodge Phone`, `Lodge WhatsApp`, `Lodge Email`,
`Booking Link`, `Team Notification Email`. Fill them from the Prompt A answer.

---

## STEP 3: WF-1 Website Form Leads (webhook)

**Automation → Workflows → + Create Workflow → Start from scratch** → name it
`RL | 01 Website Form Leads`.

### 3.1 Trigger
**Add new trigger → Inbound Webhook**. Copy the **URL** (📋). You need it for Prompt B.
Leave the trigger open; you'll **Fetch sample requests** after Step 4.

### 3.2 Actions (in order)

| # | Action | Settings |
|---|---|---|
| 1 | **Create/Update Contact** | First name → `first_name`, Last name → `last_name`, Email → `email`, Phone → `phone`, Enquiry Type → `form_name`, Check-in → `check_in`, Check-out → `check_out`, Adults → `adults`, Children → `children`, Accommodation Type → `accommodation_type`, Enquiry Message → `message`, Special Requests → `special_requests`, Source Page → `page_url` (all values via 🏷 → Inbound Webhook Trigger) |
| 2 | **Add Tag** | `rl-website-lead` |
| 3 | **If/Else** on `form_name` | Booking → tag `rl-booking-enquiry` · Event/Conference → `rl-event-enquiry` · else → `rl-contact-enquiry` |
| 4 | **Create/Update Opportunity** | Pipeline `River Lodge Enquiries` → stage **New Enquiry**, name `{{contact.name}} – {{inboundWebhookRequest.form_name}}` |
| 5 | **Internal Notification → Email** | To: lodge team email · Subject `New {{inboundWebhookRequest.form_name}} – River Lodge Website` · Body: see 3.3 |
| 6 | **Send Email** (to the guest) | Instant thank-you: see 3.4 |
| 7 | **Send WhatsApp/SMS** (optional, once a number is connected) | Short version of 3.4 |
| 8 | **Wait** | 1 day |
| 9 | **If/Else** | Opportunity still in **New Enquiry** → internal reminder email "Enquiry not yet contacted" |

**Settings tab:** Allow re-entry **ON**, so a returning guest's second enquiry is not ignored. Leave the time
window off, so replies go out 24/7.

### 3.3 Team notification body
```
New enquiry from the River Lodge website

Form: {{inboundWebhookRequest.form_name}}
Page: {{inboundWebhookRequest.page_url}}

Name: {{inboundWebhookRequest.first_name}} {{inboundWebhookRequest.last_name}}
Phone: {{inboundWebhookRequest.phone}}
Email: {{inboundWebhookRequest.email}}

Check-in: {{inboundWebhookRequest.check_in}}
Check-out: {{inboundWebhookRequest.check_out}}
Guests: {{inboundWebhookRequest.adults}} adults, {{inboundWebhookRequest.children}} children
Accommodation: {{inboundWebhookRequest.accommodation_type}}

Message:
{{inboundWebhookRequest.message}}

Special requests:
{{inboundWebhookRequest.special_requests}}
```
Insert each value with **🏷 → Inbound Webhook Trigger** so the tags show **blue**.

### 3.4 Guest auto-reply
Subject: `We've received your enquiry – River Lodge`
```
Hi {{contact.first_name}},

Thank you for contacting River Lodge! We've received your enquiry and a member of our team
will get back to you shortly to confirm availability and rates.

Your enquiry:
Check-in: {{contact.check_in_date}}   Check-out: {{contact.check_out_date}}
Guests: {{contact.adults}} adults, {{contact.children}} children

Need us sooner? Call or WhatsApp us on {{custom_values.lodge_phone}}.

Warm regards,
The River Lodge Team
```

---

## STEP 4: Connect the Lovable forms to the webhook (Prompt B)

Paste into Lovable, replacing the URL:

```
Connect EVERY form on the River Lodge website to this GoHighLevel webhook:
WEBHOOK_URL = "PASTE_WF1_WEBHOOK_URL_HERE"

Requirements:
1. On submit, send a POST request with Content-Type: application/json to WEBHOOK_URL.
2. Use exactly these JSON keys for every form (send "" for fields a form doesn't have):
   form_name          – a clear name, e.g. "Booking Enquiry", "Contact Form", "Event Enquiry"
   page_url           – window.location.pathname
   submitted_at       – new Date().toISOString()
   first_name, last_name, email, phone
   check_in, check_out          – YYYY-MM-DD
   adults, children             – numbers
   accommodation_type
   message
   special_requests
   consent                      – true/false
   If a form has a single "Full name" field, split it into first_name / last_name
   (first word = first_name, rest = last_name).
3. Keep ALL existing behaviour (validation, success message, any email/Supabase saving).
   The webhook is an extra step, not a replacement.
4. If the webhook call fails, still show the success message to the visitor and log the error
   to the console. Never block the visitor.
5. Store the URL in one constant/config so it is easy to change later.
6. Do not change the design or the form fields.
Then list every form you connected, its form_name, and the file you changed.
```

Then click **Publish → Update** in Lovable.

**Now fetch the sample:** submit the **booking form** on the live site with your own details. In WF-1,
open the trigger → **Fetch sample requests** → pick it → **Save trigger**. Re-pick any orange values in
the actions. Submit each other form once so you can check them too.

> **Security note:** a webhook URL in website code is visible to anyone who views the page source.
> That is normal for GHL inbound webhooks. If you want to hide it, ask Lovable to send the form to a
> Supabase Edge Function that forwards it to GHL, with the URL stored as a secret.

---

## STEP 5: The River Lodge AI agent

**AI Studio / AI Agents → Conversation AI (Agent Studio) → + Create** → name it `River Lodge AI`
(or a persona name such as "Lerato"). Set **Business Name** to `River Lodge`. Use the model from Sarah's
setup (GPT 4.1).

### 5.1 Prompt
Replace every `[ … ]` with facts from the Prompt A answer. (Paste me the Lovable answer and I'll fill
this in for you.)

```
## Personality

Assistant Name: [Name], guest assistant for River Lodge
Business: River Lodge
Location: [Full address] – [one-line directions]
Reception hours: [Hours]
Phone / WhatsApp: [Number]   Email: [Email]

Tone: Warm, welcoming, relaxed and helpful, like friendly lodge reception staff. Short,
clear answers. Mirror the guest's language.

Primary Goal: Answer every question about River Lodge accurately using ONLY the information
below and the knowledge base, then collect the guest's details and pass the enquiry to the
team (booking enquiry or callback).

## Goal

Open every chat with:
"Hi, welcome to River Lodge! I'm [Name]. Are you looking to book a stay, plan an event, or do
you have a question about the lodge?"

## About River Lodge

Accommodation:
[Room type 1 – sleeps X – key features – rate]
[Room type 2 – ...]
Facilities & activities: [list]
Events / conferences / weddings: [venues, capacity, packages]
Current specials: [list or "none"]

## Policies
Check-in: [time]   Check-out: [time]
Deposit & payment: [policy]
Cancellation: [policy]
Children: [policy]   Pets: [policy]   Smoking: [policy]
Backup power / water: [details]

## Website Navigation (send the guest the right page)
Home: [URL]
Rooms / Accommodation: [URL]   – room photos, descriptions and rates
Specials: [URL]
Activities: [URL]
Events / Conferences: [URL]
Gallery: [URL]
Contact / Directions: [URL]   – map and directions
Book now / Booking form: [URL]
When a guest asks where to find something, give the page name AND the link. Never invent a
link that is not in this list.

## Booking Enquiry Flow (follow in order, one question at a time)
1. Ask their preferred check-in and check-out dates.
2. Ask how many adults and children (ages of children if relevant).
3. Ask which accommodation type they prefer (offer the options above if unsure).
4. Ask for any special requests (celebration, dietary, accessibility, late arrival).
5. Collect full name, mobile number and email.
6. Confirm the details back to them in one short summary.
7. Tell them: "Thanks! Our reservations team will confirm availability and the final rate
   shortly." Then hand over to the team.

## Event / Conference Flow
Ask: type of event, date, number of guests, accommodation needed (yes/no), catering needs,
then name, mobile and email, and hand over to the team.

## Rules
- Only use facts from this prompt and the knowledge base. If you don't know, say a team member
  will confirm, and collect their details. Never guess prices, availability or policies.
- Never confirm a booking or availability yourself; the team confirms.
- Rates: quote only the rates listed above and say "subject to availability and season".
- Ask one question at a time. Keep messages short (1–3 sentences).
- If the guest is unhappy, asks for a person, or has an urgent issue (already staying, arriving
  today, lost), apologise, collect their number and hand over to a human immediately.
- If they say STOP, confirm politely and stop messaging.
```

### 5.2 Knowledge Base
In the agent, open **Knowledge Base (Triggers) → + Add**:
1. **Website crawl:** enter the live River Lodge URL → crawl **all pages**.
2. **Text / document source:** paste the **full Prompt A answer**. The crawl can miss content that
   Lovable loads with JavaScript, so this is your safety net.
3. **FAQs:** add each FAQ from section 8 of the Prompt A answer, plus these common ones if the
   answers exist:
   - What time is check-in and check-out?
   - Do you allow pets? Are children welcome?
   - Is there Wi-Fi / backup power during load-shedding?
   - Is breakfast included / is it self-catering?
   - How do I pay the deposit? What is the cancellation policy?
   - How do I get there? Is the road suitable for a normal car?
   - Do you host weddings/conferences, and what's the capacity?

### 5.3 Actions
In the agent's **Actions → Setup Your Actions**:
- **Trigger a workflow** when the guest has given dates and contact details or asks for a human → choose
  **WF-2** (Step 7).
- **Update contact fields** → save dates, guests, accommodation type and summary to the custom fields from 2.1.
- **Mode:** Auto-Pilot. **Channels** (Deploy tab): **Live Chat** (+ WhatsApp / Facebook / Instagram once
  connected).

### 5.4 Test before going live
In **Test your agent**, try:
"What rooms do you have?" · "How much for 2 adults this weekend?" · "Do you allow dogs?" ·
"Where can I see photos?" (should send the Gallery link) · "I want to book" (should follow the booking flow) ·
"Can I speak to someone?" (should hand over).

---

## STEP 6: Chat widget, and add it to the website (Prompt C)

1. **Sites → Chat Widget → + New Widget**. Choose the **Live Chat / Messenger** type.
2. **Style:** River Lodge colours and logo; header `River Lodge`; welcome message:
   `Hi there! 👋 Welcome to River Lodge. Ask me anything about rooms, rates, activities or bookings.`
3. **Conversation AI:** make sure the **River Lodge AI** agent is enabled for the **Live Chat** channel.
4. **Get Code → Copy** the embed script (it starts with `<script src="https://widgets.leadconnectorhq.com/loader.js"`).
5. Paste into Lovable:

```
Add this GoHighLevel chat widget to EVERY page of the River Lodge website. Put the script once,
just before the closing </body> tag in index.html (or the root layout), so it loads site-wide.
Do not change anything else.

PASTE_CHAT_WIDGET_SCRIPT_HERE
```

6. **Publish → Update** in Lovable, open the live site (including on a phone) and check the chat bubble shows.

---

## STEP 7: WF-2 Chat Leads and AI handover

`RL | 02 Chat & AI Handover`

**Triggers** (add both):
- **AI agent "Trigger workflow" action** from Step 5.3 (the agent starts this workflow), and/or
- **Customer Replied** → filter **Reply channel = Live Chat** + **Contact does not have tag `rl-chat-lead`** (catches every new chat).

| # | Action | Settings |
|---|---|---|
| 1 | Add Tag | `rl-chat-lead` (+ `rl-ai-handover` when triggered by the AI) |
| 2 | Create/Update Opportunity | `River Lodge Enquiries` → **New Enquiry**, name `{{contact.name}} – Chat` |
| 3 | Internal Notification → Email | Subject `New chat enquiry – River Lodge`; body: name, phone, email, Check-in, Check-out, Adults, Children, Accommodation Type, Enquiry Message (contact fields) + link to the conversation |
| 4 | Add Task (optional) | Assign to reservations: "Reply to chat enquiry – {{contact.name}}", due today |

Settings: Allow re-entry **ON**.

---

## STEP 8: Test checklist

| Test | Expected | ✅ |
|---|---|---|
| Submit booking form on the live site | Contact created with dates and guests, tag `rl-booking-enquiry`, opportunity in New Enquiry, team email arrives, guest gets auto-reply | ☐ |
| Submit contact form | Tag `rl-contact-enquiry`, team email shows form name | ☐ |
| Submit event form (if any) | Tag `rl-event-enquiry` | ☐ |
| Same person submits twice | Second enquiry still notifies the team (re-entry ON) | ☐ |
| Chat: ask about rooms, pets, check-in | Correct answers from the knowledge base | ☐ |
| Chat: "where are your photos?" | Sends the correct Gallery link | ☐ |
| Chat: complete booking flow | Details saved to the contact, WF-2 fires, team notified | ☐ |
| Chat: "speak to a person" | Hands over, team notified | ☐ |
| Ask something not on the site | AI says the team will confirm (doesn't make it up) | ☐ |
| Execution logs for WF-1 and WF-2 | All steps green | ☐ |

When everything is ticked: **Publish** WF-1 and WF-2 and remove your own email from the notifications.
