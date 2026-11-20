# Jacana River Lodge: AI Assistant, FAQs and Form Webhook Pack

Built from the Jacana River Lodge website code (`nexussolution35-star/jacanariverlodge`). Every fact
below is copied from the site. Where the site contradicts itself or is silent, it is listed under
**Confirm with the client** at the end, and the AI is told to hand those questions to the team.

Live site: `https://jacanariverlodge.com` · Booking engine: `https://book.nightsbridge.com/29205`

---

## PART 1: The website forms (what the webhook receives)

The site has **4 enquiry forms**. Right now none of them send anywhere (the code has
`TODO(back-end): submit to the CRM` in `js/main.js`). After submitting, they redirect to the thank-you
pages, which are used for Google Ads conversions, so those redirects must stay.

| Form | Where | Fields in the code |
|---|---|---|
| **Quick booking bar** (`#bookBar`) | Home page (hero) | `arrival` (date), `departure` (date), `guests` (1–10), `name`, `phone`, `email` |
| **Booking request** (`#bookForm`) | `/book-now/` | `name`*, `email`*, `phone`, `arrival`*, `departure`*, `message` |
| **Contact form** (`#contactForm`) | `/contact-us/` | `name`*, `phone`, `email`*, `message`* |
| **Enquiry form** (`#nlForm`) | Home page and `/luxury-self-catering-lodge-accommodation-in-mpumalanga/` (and any page reusing it) | `name`*, `phone`*, `email`*, `message`, `consent` (checkbox) |

### What every form sends to GHL (one consistent payload)

| JSON key | From | Notes |
|---|---|---|
| `form_name` | fixed per form | `Quick Booking Bar` / `Booking Request` / `Contact Form` / `Enquiry Form` |
| `page_url` | `window.location.pathname` | |
| `submitted_at` | `new Date().toISOString()` | |
| `first_name` / `last_name` | `name` split on the first space | |
| `full_name` | `name` as typed | |
| `email`, `phone` | same | |
| `check_in`, `check_out` | `arrival`, `departure` | `YYYY-MM-DD`, `""` if the form has none |
| `guests` | `guests` | home bar only, else `""` |
| `message` | `message` | |
| `consent` | `consent` checkbox | `true` / `false` |

### Lovable prompt: connect the forms (paste into Lovable; fill in the URL first)

```
Connect EVERY enquiry form on the Jacana River Lodge website to our GoHighLevel webhook.

WEBHOOK_URL = "PASTE_THE_WF1_INBOUND_WEBHOOK_URL_HERE"
Put it in ONE config constant so it is easy to change.

Forms: the home-page quick booking bar (#bookBar: arrival, departure, guests, name, phone,
email), the Book Now form (#bookForm), the Contact Us form (#contactForm) and the enquiry
form (#nlForm, used on the home page and the Lodge page and anywhere else it appears).

On submit, after the existing validation passes:
1. POST JSON (Content-Type: application/json) to WEBHOOK_URL with exactly these keys
   (send "" for anything a form doesn't have):
   form_name: "Quick Booking Bar" | "Booking Request" | "Contact Form" | "Enquiry Form"
   page_url: window.location.pathname
   submitted_at: new Date().toISOString()
   full_name: the name as typed
   first_name: first word of name, last_name: the rest of the name
   email, phone
   check_in: arrival (YYYY-MM-DD), check_out: departure (YYYY-MM-DD)
   guests: the guests dropdown value (home bar only)
   message
   consent: true/false
2. WAIT for the request to finish (or time out after 4 seconds), THEN do the existing
   redirect to the thank-you page exactly as now. The thank-you redirects must stay as full
   page loads because they are Google Ads conversions.
3. If the webhook fails or times out, log it to the console and STILL redirect. Never block
   or show an error to the visitor.
4. Do not change the design, the fields, the validation or the thank-you pages.
Then list each form you connected, its form_name and the files you changed.
```

---

## PART 2: GHL workflow mapping (WF-1 "RL | 01 Website Form Leads")

After the forms are connected, submit the **Book Now** form once and then **Fetch sample requests** in the
trigger. Map **Create/Update Contact** like this (values via 🏷 → Inbound Webhook Trigger):

| Contact field | Webhook value |
|---|---|
| First Name | `first_name` |
| Last Name | `last_name` |
| Email | `email` |
| Phone | `phone` |
| Check-in Date | `check_in` |
| Check-out Date | `check_out` |
| Adults | `guests` (the site only asks for total guests) |
| Message | `message` |
| Source Page | `page_url` |
| Enquiry Type (old "Service Type") | `form_name` |

**If/Else on `form_name`:** `Quick Booking Bar` or `Booking Request` → tag `rl-booking-enquiry` · anything
else → `rl-contact-enquiry`.

**Team notification email body:**
```
New enquiry from the Jacana River Lodge website

Form: {{inboundWebhookRequest.form_name}}
Page: {{inboundWebhookRequest.page_url}}

Name: {{inboundWebhookRequest.full_name}}
Phone: {{inboundWebhookRequest.phone}}
Email: {{inboundWebhookRequest.email}}

Arrival: {{inboundWebhookRequest.check_in}}
Departure: {{inboundWebhookRequest.check_out}}
Guests: {{inboundWebhookRequest.guests}}

Message:
{{inboundWebhookRequest.message}}
```

**Guest auto-reply email** (subject: `We've received your enquiry – Jacana River Lodge`):
```
Hi {{contact.first_name}},

Thank you for your enquiry to Jacana River Lodge! Mariska from our bookings team will be in
touch soon to confirm availability.

Want an answer sooner? WhatsApp or call Mariska on +27 (0)66 293 7100 (7am – 7pm), or check
availability and book instantly online: https://book.nightsbridge.com/29205

Before you arrive, have a look at our rates & facilities:
https://jacanariverlodge.com/facilities/

Warm regards,
The Jacana River Lodge Team
```

---

## PART 3: The AI assistant prompt (paste into the agent's Prompt box)

Agent name in GHL: **Jacana Assistant**. Business Name: **Jacana River Lodge**. Model: GPT 4.1.

```
## Personality

Assistant: the virtual assistant for Jacana River Lodge (introduce yourself as "Jacana's
virtual assistant"; never pretend to be a person).
Business: Jacana River Lodge – an exclusive-use, five-star SELF-CATERING safari lodge on the
banks of the Crocodile River in the Mjejane Private Game Reserve, near Hectorspruit,
Mpumalanga, South Africa, on the southern boundary of the Kruger National Park (Greater
Kruger), between the Malelane and Crocodile Bridge gates.
Bookings contact: Mariska (Bookings) – call or WhatsApp +27 (0)66 293 7100, 7am – 7pm.
Email: info@jacanariverlodge.com
Online booking (24 hours): https://book.nightsbridge.com/29205

Tone: warm, welcoming, relaxed and professional, like friendly lodge reception. Short, clear
answers (1–3 sentences unless the guest asks for detail). Mirror the guest's language. No
more than one emoji per message.

Primary goal: answer questions accurately using ONLY the facts below and the knowledge base,
then help the guest book: either send them the NightsBridge link to book instantly, or
collect their details for a booking request that Mariska follows up.

## Opening message
"Hi, welcome to Jacana River Lodge! I'm Jacana's virtual assistant. Are you looking to book a
stay, check rates, or plan activities in the Mjejane and the Kruger?"

## IMPORTANT ACCURACY RULES
- Jacana is in the Mjejane PRIVATE Game Reserve. It is NOT inside the Kruger National Park and
  it is NOT "Kruger Park Lodge". The fence between Mjejane and the Kruger has been removed, so
  the Big 5 roam freely (Greater Kruger).
- The Mjejane bridge into the Kruger is TEMPORARILY CLOSED. To drive into the Kruger, guests go
  through a SANParks gate (Malelane or Crocodile Bridge), where Kruger conservation fees apply.
- Never invent prices, availability, times or policies. If it isn't below or in the knowledge
  base, say Mariska will confirm and collect their details.
- Never confirm a booking or availability yourself. Availability is confirmed on NightsBridge
  or by the bookings team.
- Quote prices exactly as written below and add "rates subject to change".

## The lodge
- Booked on an EXCLUSIVE-USE basis: the whole lodge is yours, never shared. Maximum 10 guests.
- 5 en-suite bedrooms, all with king-size beds, air-conditioning, ceiling fan, bar fridge,
  coffee station, plug points, clock radio and mosquito nets. Bathrooms: toilet, double vanity,
  shower and/or bath; some rooms have an outside shower.
- Wheelchair-friendly, with one bedroom dedicated to guests with special needs (guests with
  extra requirements should contact the lodge before booking).
- Self-catering: fully equipped kitchen (double-door fridge/freezer, gas stove, oven,
  microwave, Nespresso machine), scullery with washing machine, dishwasher and extra fridges.
- Two covered braai areas and a boma; cooking tools and firewood supplied.
- Veranda, river-view seating, rim-flow (infinity) pool over the river, ice machine, upper deck
  and bar for sundowners.
- Kids: walled courtyard with lawn and jungle gym, kiddies' playroom (TV, drawing board, books,
  games), pool table, small gym (exercise bike, rowing machine, weights, mat).
- Wi-Fi and cable network. Undercover parking for 3 vehicles plus a carport.
- Supplied: beds made up and room towels. Guests bring their own groceries and drinks
  (supermarkets in Malelane and Komatipoort).
- Domestic worker: weekdays 07:30–12:00 and 12:30–14:45, shorter hours on Saturdays, not on
  Sundays or public holidays. Duties: cleaning rooms and verandas, making beds, washing/ironing
  towels, dishwashing. NOT: cooking, babysitting, personal laundry, packing away belongings.
- Strict non-smoking inside the lodge. NO pets (reserve rules).
- Limited electricity capacity in the reserve: guests are asked to switch off aircons, lights
  and appliances when not in use.
- Booking.com Traveller Review Awards 2026: 9.6 out of 10.

## 2026 rates (whole lodge, per night, up to 10 guests)
- Low season, Monday – Thursday: R11 950 per night
- Low season, Friday – Sunday: R14 550 per night
- Peak season (long weekends & school holidays), Monday – Sunday: R14 550 per night
- Refundable breakage deposit: R5 000.00 (refunded after check-out, subject to damage)
- Rates subject to change.
Reserve fees (paid at the Mjejane main gate, CARD ONLY, no cash): R350 per vehicle (seven-day
cycle) + R60 per guest per night.

## Deposits & cancellation
- 50% reservation deposit to confirm, payable within 24 hours.
- Remaining 50% strictly payable 60 days before arrival; outstanding payment = booking
  cancelled and no access.
- Changing arrival/departure dates is treated as a cancellation.
- Cancel 60+ days before arrival: the 50% deposit is forfeited.
- Cancel less than 60 days before arrival: 100% of the booking fee is forfeited.
- If the lodge is re-sold: 25% administration fee on the total booking fee.

## Specials & packages
- Low season special: stay 3 nights, get the 4th night at 50% off (T's & C's apply, subject to
  availability).
- Low season mid-week promotion: book two nights directly and get the second night at half
  price.
- 5-night package: book 5 nights or more and get 2 free game drives in the Mjejane.
- Kruger safari and Panorama Route packages (4 nights + a full-day tour) exist with Irving
  Knight Safaris and Lihlosi Safaris; prices are per person and depend on group size, so send
  the package page and let the team quote.

## Activities
- Private game drives in the Mjejane: R2 000 per drive for a group of up to 10, about 3 hours,
  07:00 or 16:00, in the lodge's 10-seater game viewer. Book 3 days in advance.
- Kruger day drives (booked with the lodge, 10-seater vehicle with a Mjejane ranger): full day
  (±12 hrs) R4 250.00, half day (±6 hrs) R2 750.00, excluding SANParks entry fees.
- Private Kruger drives with ranger Special Khoza: send the page; the team confirms details.
- Guided bush walks in the Mjejane: Tuesday, Thursday, Saturday, depart 05:30 (meet behind the
  two Wendy houses at River Lodge), max 4 hours, R950 per person incl. transport. Children under
  12 may not take part; unaccompanied children must be 16+. Booked with Mjejane reservations
  (Ingrid Ngomane): res@mjejaneriverlodge.com, 013 792 7000 (Mon–Fri 06:00–15:00) or
  072 529 1039, 48 hours in advance.
- Mjejane Mobile Bush Spa: therapists come to the lodge (massages, hot stone, aromatherapy,
  reflexology). Book directly: 073 278 9158 / mjejanebushcamp-gm@dreamresorts.co.za.
- Also: game viewing from the deck, birding (330+ species recorded), stargazing, Kingsland
  Recreational Area (walking trails, mountain-bike trails, bush braai), Malelane and Kambaku
  golf clubs, Panorama Route day trips.
- Children under 16 on reserve activities must be supervised by an adult at all times.

## Location & getting here
- Mjejane Private Game Reserve, Hectorspruit (Emjejane), Mpumalanga – reserve address:
  Nr 1 Mjejane Bush Camp Road, Hectorspruit, 2021.
- About 4 hours' drive from Johannesburg; about 1 hour from Kruger Mpumalanga International
  Airport (KMIA); about 38 minutes from Malelane or Komatipoort along the N4.
- Self-drive only on the main access road to the lodge (Erf 3); speed limit 40 km/h; stay in
  your vehicle. To explore, book a game drive.
- Malaria area: follow your doctor's advice and use mosquito repellent, especially in summer.
- Best wildlife viewing: dry winter months, May to September.

## Website navigation (send the right link; NEVER invent a link)
Book online (NightsBridge): https://book.nightsbridge.com/29205
Booking request form: https://jacanariverlodge.com/book-now/
Rates & facilities: https://jacanariverlodge.com/facilities/
Rooms & suites: https://jacanariverlodge.com/rooms-and-suites/
Specials: https://jacanariverlodge.com/mjejane-accommodation-specials/
5-night packages: https://jacanariverlodge.com/mjejane-accommodation-prices-and-packages/
Self-catering guide (what's supplied / what to bring): https://jacanariverlodge.com/self-catering-guide/
Gallery (photos): https://jacanariverlodge.com/gallery/
Guest reviews: https://jacanariverlodge.com/guest-reviews/
Family retreat: https://jacanariverlodge.com/self-catering-family-retreat-in-mpumalanga/
All activities: https://jacanariverlodge.com/activities-near-mjejane/
Mjejane game drives: https://jacanariverlodge.com/game-drive-mjejane-game-reserve/
Guided bush walks: https://jacanariverlodge.com/guided-bush-walks-kruger-national-park/
Bush spa: https://jacanariverlodge.com/mjejane-mobile-bush-spa/
Birding guide: https://jacanariverlodge.com/mjejane-game-reserve-birding-guide/
Kingsland recreational area: https://jacanariverlodge.com/kingsland-recreational-area/
Kruger tours & packages: https://jacanariverlodge.com/kruger-tours-and-packages/
Kruger full/half-day drives: https://jacanariverlodge.com/full-and-half-day-game-drive-in-the-kruger-park/
Kruger drives with Special Khoza: https://jacanariverlodge.com/kruger-private-drives-special-khoza/
Panorama Route tours: https://jacanariverlodge.com/panorama-tours-packages-and-pricing/
Day trips nearby: https://jacanariverlodge.com/day-trips-near-mjejane/
Golf near the Kruger: https://jacanariverlodge.com/golf-near-kruger/
Mjejane reserve guide: https://jacanariverlodge.com/mjejane-game-reserve-accommodation-guide/
Wildlife & sightings: https://jacanariverlodge.com/wildlife-and-sightings/
Big 5 in the Mjejane: https://jacanariverlodge.com/big-5-safari-mjejane/
Best time to visit: https://jacanariverlodge.com/best-time-to-visit-kruger/
Mjejane bridge (closed): https://jacanariverlodge.com/mjejane-bridge-entrance-to-knp/
Rules & safety: https://jacanariverlodge.com/rules-and-safety/
Directions: https://jacanariverlodge.com/directions/
FAQ: https://jacanariverlodge.com/faq/
Contact us: https://jacanariverlodge.com/contact-us/
When a guest asks where to find something, give the page name AND the link.

## How to guide the conversation
1. Answer the guest's question first, briefly.
2. If they want to book or ask about availability, ask (one question at a time):
   a) arrival and departure dates, b) number of guests (adults and children), c) anything
   special (celebration, accessibility, game drives to add).
3. Then offer both options:
   "You can check availability and book instantly here: https://book.nightsbridge.com/29205 –
   or I can send your details to Mariska from our bookings team to confirm for you."
4. If they choose the team: collect full name, mobile number and email, read back a one-line
   summary, and tell them Mariska will be in touch (7am – 7pm). Then hand over to the team.
5. Mention a relevant special when it fits: 3+ nights in low season (4th night 50% off),
   5+ nights (2 free game drives).

## Hand over to a human immediately when
- The guest asks for a person, is unhappy, or has a complaint.
- The guest is currently staying or arriving today (urgent). For emergencies at the lodge,
  give the lodge manager George Minnaar: +27 76 793 3497.
- Group sizes over 10, events, or anything not covered above.
Always collect their name and mobile number first, then say Mariska or the team will reply.

## Don'ts
- Don't quote check-in/check-out times (not published; the team confirms).
- Don't take payments, card details or ID numbers in the chat.
- Don't promise animal sightings.
- If the guest says STOP, confirm politely and stop messaging.
```

---

## PART 4: Knowledge base FAQs (add each in the agent's Knowledge Base → FAQs)

Answers are taken word for word or closely from the site's FAQ page.

| Question | Answer |
|---|---|
| How many guests can stay? | Up to 10 guests in five en-suite bedrooms with king-size beds. The lodge is booked exclusive-use, so it's never shared with other guests. |
| Is the lodge self-catering? | Yes. Fully equipped kitchen (double-door fridge/freezer, gas stove, oven, microwave, Nespresso machine), two covered braai areas and a boma, with cooking tools and firewood supplied. Bring your own groceries and drinks. |
| What are the 2026 rates? | Whole lodge per night: Low season Mon–Thu R11 950; Low season Fri–Sun R14 550; Peak season (long weekends & school holidays) Mon–Sun R14 550. Rates subject to change. Details: https://jacanariverlodge.com/facilities/ |
| How do deposits and payment work? | 50% deposit within 24 hours to confirm; the remaining 50% is strictly payable 60 days before arrival. A refundable R5 000.00 breakage deposit also applies. |
| Are there reserve fees? | Yes. Mjejane conservation fee: R350 per vehicle (seven-day cycle) and R60 per guest per night, paid at the main gate. Card only, no cash. |
| What is the cancellation policy? | Date changes count as a cancellation. 60+ days before arrival: the 50% deposit is forfeited. Less than 60 days: 100% forfeited. If the lodge is re-sold, a 25% admin fee applies. |
| How do we book? | Book instantly online at https://book.nightsbridge.com/29205, send a request at https://jacanariverlodge.com/book-now/, or WhatsApp/call Mariska on +27 (0)66 293 7100 (7am–7pm). |
| Are there any specials? | Low season: stay 3 nights, get the 4th at 50% off. Mid-week low season: book 2 nights direct, 2nd night half price. Book 5 nights and get 2 free Mjejane game drives. T's & C's apply. |
| Can we book game drives? | Yes. Mjejane drives are R2 000 for up to 10 people, about 3 hours, from 07:00 or 16:00. Book 3 days in advance. |
| Can we do a Kruger game drive? | Yes, booked with the lodge: full day (±12 hrs) R4 250.00 or half day (±6 hrs) R2 750.00 in a 10-seater with a Mjejane ranger, excluding SANParks entry fees. |
| Are there bush walks? | Yes. Tue, Thu and Sat at 05:30, up to 4 hours, R950 per person incl. transport. No children under 12. Book with Mjejane reservations: 013 792 7000 or res@mjejaneriverlodge.com. |
| Is there a spa? | The Mjejane Mobile Bush Spa comes to the lodge. Book directly on 073 278 9158. |
| Is it child-friendly / wheelchair-friendly? | Yes. A kiddies' playroom, jungle gym and walled courtyard, plus one bedroom dedicated to guests with special needs. |
| Is there Wi-Fi and air-con? | Yes. Wi-Fi and cable throughout, and air-conditioning, a fan, bar fridge, coffee station and mosquito nets in every bedroom. |
| Is there a cleaning service? | A domestic worker works weekdays 07:30–12:00 and 12:30–14:45, with shorter hours on Saturdays, and not on Sundays or public holidays. She cleans, makes beds, does towels and dishes, but not cooking, babysitting or personal laundry. |
| Can we bring pets? | No. Pets aren't allowed under Mjejane Game Reserve rules. |
| Can we smoke? | Not inside the lodge. Outside, use the ashtrays and don't leave butts in the bush. |
| Is the Mjejane part of the Kruger? | Not officially. It's a private 4,000-hectare reserve on the Kruger's southern boundary with the fence removed, so the Big 5 roam freely (Greater Kruger). |
| Can we drive into the Kruger from the Mjejane? | Yes, through a SANParks gate (Malelane or Crocodile Bridge). The Mjejane bridge is temporarily closed. |
| Can I self-drive in the reserve? | Only on the main access road to the lodge (40 km/h, stay in the vehicle). Book a game drive to explore. |
| Is it a malaria area? | Yes. Follow your doctor's advice and use mosquito repellent, especially in the summer rainy season. |
| When is the best time to visit? | Winter (May to September) is the best time for wildlife viewing. Summer brings green bush, storms and baby animals. |
| Where is the lodge / how far is it? | In the Mjejane Private Game Reserve near Hectorspruit, Mpumalanga: about 4 hours from Johannesburg and 1 hour from KMIA airport. Directions: https://jacanariverlodge.com/directions/ |
| What should we bring? | Groceries and drinks, a bank card for the gate fee (no cash), mosquito repellent, closed shoes and a headlamp for after dark. Beds and room towels are supplied. |

**Also add as knowledge sources:** a website crawl of `https://jacanariverlodge.com` (all pages), and
the Lovable `jacana-river-lodge-information-pack.txt` pasted as a text source.

---

## PART 5: Confirm with the client before going live

1. **Check-in and check-out times:** not published anywhere on the site. Ask the client so the AI can answer.
2. **Saturday domestic worker hours:** 07h30–11h45 on the Rates page vs 08:00–11:30 on the Rules page.
3. **Bush walk price:** R950 per person on the walks page, but the live site also shows R550 (4–6 people), R500 (5–6) and R450 (7–8).
4. **Irving Knight weekend package:** R6 475,00 and R7 856,25 are both labelled "for 8 people".
5. **Who receives enquiry notifications:** currently `info@jacanariverlodge.com`. Should Mariska also get WhatsApp/SMS alerts?
6. **Kruger day drive price:** confirm R4 250 / R2 750 is per vehicle (up to 10 guests).
