# Flip: Figma Design Brief

Instructions for designing every screen of **Flip**, an AI-powered flashcard and quiz web app for college and senior high school students. Follow it step by step to build the file by hand, or paste a page's section into Figma's AI ("First Draft" / Figma Make) to generate that screen.

The app already works in code (React + Tailwind + shadcn/ui). This brief uses the app's real tokens, components and copy, so the finished designs map straight back onto the code. **Keep the variable and component names exactly as written here**; that is what makes the handoff painless.

---

## 1. Set up the file

Create a Figma design file named **`Flip: App Design`** with these pages, in this order:

| Page | Contents |
|---|---|
| `00 Cover` | Title, version, date |
| `01 Foundations` | Colour variables, type styles, spacing, radius, shadows |
| `02 Components` | Every reusable component with all its states (section 4) |
| `03 Public` | Login, Sign up, Pricing, Setup notice |
| `04 App: Decks` | Dashboard, Deck detail, Deck editor |
| `05 App: Study` | Study session, Quiz setup, Quiz question, Quiz results |
| `06 App: AI` | Generate, Review generated cards |
| `07 App: Account` | Account, Delete-account dialog, Billing success, Billing cancelled |
| `08 App: Analytics` | Analytics (Free and Pro versions) |
| `09 Mobile` | Mobile versions of the key screens (section 6) |

### Frame sizes

| Breakpoint | Frame | Content width | Side padding |
|---|---|---|---|
| Desktop | 1440 × auto | max 1024 px, centred | 16 px minimum |
| Tablet (check only) | 768 × auto | fluid | 16 px |
| Mobile | 390 × auto | fluid | 16 px |

Name frames `Page / State / Breakpoint`, e.g. `Dashboard / Empty / Desktop`.

Use **auto layout everywhere**. Nothing should be absolutely positioned except toasts, tooltips and dialogs.

---

## 2. Foundations

### 2.1 Colour variables

Create a variable collection **`Theme`** with two modes, **`Light`** and **`Dark`**. Create every variable below in both modes. Names match the CSS tokens in `client/src/index.css`.

| Variable | Light | Dark | Use for |
|---|---|---|---|
| `background` | `#FFFFFF` | `#0A0A0A` | Page background |
| `foreground` | `#0A0A0A` | `#FAFAFA` | Main text |
| `card` | `#FFFFFF` | `#171717` | Card surfaces |
| `card-foreground` | `#0A0A0A` | `#FAFAFA` | Text on cards |
| `popover` | `#FFFFFF` | `#171717` | Menus, tooltips, dialogs |
| `primary` | `#4F39F6` | `#7C86FF` | Brand indigo: primary buttons, active states, charts |
| `primary-foreground` | `#FAFAFA` | `#0A0A0A` | Text on primary |
| `secondary` | `#F5F5F5` | `#262626` | Secondary buttons |
| `secondary-foreground` | `#171717` | `#FAFAFA` | Text on secondary |
| `muted` | `#F5F5F5` | `#262626` | Subtle fills, progress track |
| `muted-foreground` | `#737373` | `#A1A1A1` | Secondary text, captions, axis labels |
| `accent` | `#F5F5F5` | `#262626` | Hover fills |
| `destructive` | `#E7000B` | `#FF6467` | Errors, delete, over-limit |
| `border` | `#E5E5E5` | `#FFFFFF` at 10% | Borders, dividers, gridlines |
| `input` | `#E5E5E5` | `#FFFFFF` at 15% | Input borders |
| `ring` | `#615FFF` | `#615FFF` | Focus ring (use at 50% opacity, 3 px) |
| `success` | `#16A34A` | `#16A34A` | Correct quiz answers only |

Set variable scopes: surfaces get `Frame fill` + `Shape fill`, text colours get `Text fill`, `border`/`input` get `Stroke`.

**Rules:** indigo is the only brand colour; everything else is neutral grey. Never use colour alone to carry meaning: correct/incorrect also needs an icon, and locked features need a lock icon plus text.

### 2.2 Typography

Font: **Inter** (variable). Create these text styles:

| Style | Size / Line height | Weight | Use |
|---|---|---|---|
| `Display` | 48 / 56 | Bold | Quiz score, hero numbers |
| `H1` | 30 / 36 | Bold | Pricing headline |
| `H2` | 24 / 32 | Bold | Page titles |
| `H3` | 18 / 28 | Semi Bold | Section and dialog titles |
| `Card title` | 16 / 24 | Semi Bold | Card headings |
| `Body` | 16 / 24 | Regular | Default text |
| `Body small` | 14 / 20 | Regular | Most UI text, descriptions |
| `Label` | 14 / 20 | Medium | Form labels, buttons |
| `Caption` | 12 / 16 | Medium | Badges, axis labels, uppercase eyebrows (+5% letter spacing) |
| `Stat value` | 24 / 32 | Bold | Stat tile numbers |

### 2.3 Spacing, radius, elevation

- **Spacing scale (px):** 4, 8, 12, 16, 24, 32, 40. Page sections are 32 apart; items inside a card 16; form fields 16; label to input 8.
- **Radius:** `radius-md` 8 (inputs, buttons, small cards), `radius-lg` 12 (cards, dialogs), `radius-xl` 16 (flashcard, dropzone, empty states), `radius-full` (badges, avatars, progress bars).
- **Elevation:** cards get a 1 px `border` and *no* shadow. Hovered cards get `0 4 12 rgba(0,0,0,0.08)`. Popovers, menus and dialogs get `0 8 24 rgba(0,0,0,0.12)`.
- **Icons:** Lucide icon set, 16 px in buttons, 20 px in stat tiles, 32 px in empty states. Stroke 2.

---

## 3. App shell

### Top navigation bar (desktop)
Height 56, full width, sticky, `background` at 80% with background blur, bottom border `border`. Inner row centred at max 1024:

- **Left:** logo = Lucide `layers` icon in `primary` + "Flip" (Card title, Bold). Links to Dashboard.
- **Nav links** (Body small, Medium, gap 24): Dashboard · Create · AI generate · Analytics · Pricing. Inactive `muted-foreground`; active and hover `primary`.
- **Right:** "New deck" small primary button with `plus` icon, then a 32 px circular avatar showing the user's initial. The avatar opens the **account menu**: email (muted, caption) · divider · "Account" (`user` icon) · "Sign out" (`log-out` icon).
- **Signed out** (Pricing page only): nav shows just "Pricing"; right side shows "Log in" (ghost) and "Sign up" (primary).

### Mobile navigation
Logo on the left, avatar and a `menu` (hamburger) icon button on the right. Hamburger opens a **left sheet** 256 wide listing the same nav links stacked, gap 16.

### Payment warning banner
Under the nav, only when a payment failed: full-width strip, `destructive` at 10% fill, bottom border `destructive` at 40%. Content: `alert-triangle` icon + "Your last payment failed." + underlined link "Update payment method".

### Page body
Max width 1024, centred, padding 32 top/bottom, 16 sides.

---

## 4. Components (page `02 Components`)

Build each as a Figma **component** (variants where listed). Every interactive component needs **Default, Hover, Focus (3 px `ring` at 50%), Disabled (50% opacity)**.

| Component | Variants / properties | Spec |
|---|---|---|
| `Button` | variant: primary, secondary, outline, ghost, destructive, link · size: sm (h32), md (h36), icon (36×36) · icon-left: on/off · state | Radius 8, Label text, padding 16 h. Loading = label like "Saving…" + disabled |
| `Badge` | default (primary), secondary, outline | Caption, radius full, padding 2×8. Used for "Pro", "Free", "8 due", "42 cards" |
| `Input` | default, focus, error, disabled | h36, radius 8, `input` border. Error: `destructive` border + 14 px error text below |
| `Textarea` | default, focus, error | Same as Input, min height 80 |
| `Form field` | — | Label (Label style) + control + optional hint/error, gap 8 |
| `Checkbox`, `Radio group`, `Switch` | checked/unchecked · state | Checked fill `primary` |
| `Tabs` | 2 to 3 tabs | Pill track `muted`, active tab `background` with small shadow |
| `Card` | with/without header action | Radius 12, 1 px border, padding 24, header = Card title + description (Body small, muted) + optional right-aligned action |
| `Avatar` | — | 32 circle, `muted` fill, initial centred |
| `Progress` | normal, warning (≥80%), full (100%) | Track h4 `muted`, radius full; fill `primary`; warning/full fill `destructive` |
| `Skeleton` | — | `muted` fill, radius 8, for loading states |
| `Toast` | success, error, info | Bottom-right, popover surface, icon + one line |
| `Tooltip` | — | Popover, padding 8×12, value Bold then label |
| `Dialog` | default, destructive | 480 wide, radius 12, title (H3) + description + body + footer buttons right-aligned |
| `Dropdown menu` | — | Popover, items h32 with icon + label |
| `Empty state` | with/without icon, with/without action | Dashed 1 px border, radius 16, padding 40, centred: icon (32, muted), H3 title, Body small description (max 384 wide), action |
| `Stat tile` | with icon | Card; icon in a 36 px rounded square of `primary` at 10% with `primary` icon; Stat value + Body small muted label |
| `Usage meter` | normal, warning, limit reached | Row: "AI generations this month" + "2 / 5" right-aligned (Medium; turns `destructive` at warning). Progress below. Warning text: "You're almost out of free generations." Limit: "Limit reached. Upgrade to Pro for unlimited generations." in `destructive` |
| `Flashcard` | front, back | 576 max wide × 256 tall, radius 16, border, small shadow. Front: `card` fill, Caption "QUESTION" (60% opacity) above question text (20/28 Semi Bold, centred). Back: `primary` fill, `primary-foreground` text, Caption "ANSWER" |
| `Deck card` | with/without due badge, hover | Card; title row = `book-open` icon (primary) + deck title; 2-line clamped description; badges "42 cards" (secondary) + "8 due" (primary, only if due > 0) |
| `Answer option` | idle, hover, selected, correct, incorrect, disabled | Full width, radius 12, border, padding 16. Left: 28 px circle with letter A to D. Selected: `primary` border + 10% fill. Correct: `success` border + 10% fill + `check` icon. Incorrect: `destructive` border + 10% fill + `x` icon |
| `Card editor row` | — | Card; row number (muted), two textareas side by side "Front" / "Back" (stacked on mobile), trash icon button |
| `Generated card preview` | included, excluded (50% opacity) | Checkbox · "Question" + "Answer" textareas · "Wrong answers (for quizzes)" with 3 small inputs · trash icon |
| `Plan card` | Free, Pro (highlighted) | Card; name + "Popular" badge on Pro; description; price (30 Bold); feature list with `check` (primary) or `lock` (muted, text muted); full-width button. Pro has `primary` border + shadow |
| `File dropzone` | idle, hover/drag-over, file selected | Dashed 2 px border, radius 16, padding 40, centred `file-up` icon, "Drop a PDF here or click to browse", caption "Up to 10 MB · text-based PDFs only". Drag-over: `primary` border + 5% fill |
| `Locked panel` | — | Dashed border, radius 16, centred `lock` icon, title, one line, button "See Pro" |
| `Chart card` | chart view, table view | Card with title + description and a ghost "View table"/"View chart" button in the header's top-right |

---

## 5. Screens

Every screen needs its **Default** state plus the extra states listed. Use the exact copy shown in quotes.

### 5.1 Login / Sign up (`03 Public`)
Centred card 384 wide on `background`, vertically centred.
- Logo icon (32, primary) centred, H2 **"Welcome back"** / **"Create your account"**, subtitle "Sign in to keep studying." / "Start turning notes into flashcards."
- Outline button full width "Continue with Google", then a small centred "or".
- Email field, Password field, primary full-width button "Log in" / "Sign up".
- Login only: centred link "Forgot password?" (12 px).
- Footer: "New to Flip? **Sign up**" / "Already have an account? **Log in**".
- **States:** field errors ("Enter a valid email", "At least 6 characters"), button busy.

### 5.2 Pricing (`03 Public`)
Signed-out shell. Centred H1 **"Simple, student-friendly pricing"** + "Start free. Upgrade when you want unlimited AI and PDF uploads."
Two plan cards side by side (stacked on mobile):
- **Free**: "₱0", "For trying Flip out"; features: Unlimited manual decks and cards · Flashcard and quiz modes · 5 AI generations per month (paste text) · 🔒 PDF upload · 🔒 Full analytics; button "Get started" (outline).
- **Pro** (highlighted): "₱149/month", "For serious studying"; features: Everything in Free · Unlimited AI generations · Upload PDFs and notes · Full analytics; button "Upgrade to Pro".
- Footnote: "Payments are handled securely by Stripe. Cancel any time from your account."
- **States:** signed-in Free user (Free button disabled "Current plan"), Pro user (Pro button disabled "Current plan"), Pro button "Redirecting…".

### 5.3 Setup notice (`03 Public`)
Plain page, max 576 wide: H2 "Flip needs a little setup", muted line, a numbered list of 3 steps with inline code chips. Low priority; it only shows to developers.

### 5.4 Dashboard (`04 App: Decks`)
- Header row: H2 **"Your decks"** left; right: "Review 14 due" (secondary, `graduation-cap` icon, only when cards are due), "Generate with AI" (outline, `sparkles`), "New deck" (primary, `plus`).
- Row of 3 stat tiles: Decks · Total cards · Cards due.
- Search input with `search` icon, max 384 wide, placeholder "Search decks".
- Deck grid: 3 columns desktop, 2 tablet, 1 mobile, gap 16.
- **States:** Loading (3 skeleton cards), **Empty** (empty state: "No decks yet" / "Create a deck by hand, or let AI build one from your notes." / buttons "Generate with AI" + "Create manually"), No search results ("No decks match "bio"."), Error (red text line).

### 5.5 Deck detail (`04 App: Decks`)
- Title (H2), description (muted), "42 cards" (small muted).
- Button row (wraps on mobile): **Study** (primary, `graduation-cap`), **Quiz** (secondary, `list-checks`), Edit (outline, `pencil`), Duplicate (outline, `copy`), Delete (destructive, `trash-2`).
- Card list: each card shows "FRONT · 1" eyebrow + front text, and "BACK" + back text, two columns on desktop.
- **States:** Empty deck ("This deck is empty" + "Add cards"), **Delete confirmation dialog** ("Delete "Biology 101"?" / "This permanently removes the deck and all its cards." / Cancel + Delete).

### 5.6 Deck editor (`04 App: Decks`)
- H2 "New deck" / "Edit deck".
- Title input (placeholder "Biology — Chapter 3"), Description textarea "(optional)".
- Stack of Card editor rows, then outline "Add card" button.
- Footer: "Save deck" (primary) + "Cancel" (ghost). Busy: "Saving…".

### 5.7 Study session (`05 App: Study`)
Centred column, max 576.
- Top: deck name (muted, left) + "3 / 20" (right), progress bar below.
- Flashcard component.
- **Front side state:** helper text "Click the card (or focus it and press Space) to reveal the answer."
- **Back side state:** 4 buttons in a row (2×2 on mobile): Again `1`, Hard `2`, **Good `3`** (primary), Easy `4`; each shows its key as a small faded keycap.
- **States:** Nothing due (empty state, `check-circle` icon: "Nothing due right now" / "You're all caught up…" / "Study all cards anyway"), **Session complete** (primary check icon, "Session complete", "You reviewed 20 cards. 12 more are waiting.", buttons "Done" + "Keep going").

### 5.8 Quiz (`05 App: Study`)
- **Setup:** max 384 wide; H2 "Start a quiz"; radio group "10 questions" / "20 questions" / "Every card"; primary "Start quiz".
- **Question:** max 576 wide; deck name (muted) + progress bar; "Question 3 of 10" (muted); question (H3, 20 px); 4 Answer options; "Next" / "Finish" button appears after answering.
- **Answered state:** chosen wrong option red with ✕, correct option green with ✓, others neutral and disabled.
- **Error state:** "A quiz needs at least 4 cards with different answers, or custom wrong answers." + "Back".

### 5.9 Quiz results (`05 App: Study`)
- Centred Display number **"80%"** in `primary`, "8 of 10 correct" below.
- Buttons: "Try again" (primary), "Study this deck" (outline), "Back to deck" (ghost).
- "2 missed. Those cards are scheduled for review again." (muted).
- List of cards: ✓/✕ icon, question (Medium), then either the answer (muted) or "Your answer: …" (destructive) + "Correct: …" (muted).

### 5.10 Generate with AI (`06 App: AI`)
Max 672 wide.
- H2 with `sparkles` icon "Generate with AI" + "Turn your notes into flashcards and quiz questions. You can review everything before saving."
- Usage meter (Free plan only).
- Tabs: **"Paste text"** (`file-text`) | **"Upload PDF"** (with `lock` + "Pro" badge for Free users).
- Paste tab: label "Your notes", 12-row textarea, counter "1,240 / 48,000 characters · at least 100 needed", primary "Generate cards" with `sparkles`.
- PDF tab (Pro): File dropzone, "Selected: chapter3.pdf", "Generate cards".
- PDF tab (Free): Locked panel "PDF upload is a Pro feature" + "Upgrade to turn whole PDFs into decks. Pasting text works on the free plan." + "See Pro".
- **States:** generating ("Generating…" / "Reading and generating…", button disabled), error line in `destructive`, out of quota (meter full + "You have used all your free generations this month. Upgrade to Pro or create decks manually.").

### 5.11 Review generated cards (`06 App: AI`)
- H2 "Review generated cards" + "Edit, remove, or untick anything you don't want. Nothing is saved until you confirm."
- Optional notice box (muted fill): "Your document was longer than the limit, so only the first part was used."
- "Deck title" input (max 448 wide).
- Stack of Generated card previews (show one unticked at 50% opacity).
- **Sticky bottom bar** with top border: "Save 18 cards" (primary) + "Discard all" (ghost).

### 5.12 Account (`07 App: Account`)
Max 576 wide. H2 "Account".
- **Past-due alert** (only when payment failed): `destructive` 10% box, `alert-triangle`, "Your last payment failed", explanation, small button "Update payment method".
- **Plan card:** title "Pro plan" + Pro badge (or "Free plan" + Free badge), email below. Lines: "Renews on November 4, 2026." or "Pro ends on November 4, 2026. You will not be charged again." Usage meter (Free) or "Unlimited AI generations (12 used this month)." (Pro). Buttons: "Upgrade to Pro" (Free) and/or "Manage billing" (outline).
- **Delete account card:** `destructive` 40% border, title "Delete account", "Permanently remove your account and everything in it.", destructive button "Delete account".
- **Delete dialog:** title "Delete your account?"; text "This permanently deletes your login, all your decks and cards, quiz results and study history. It cannot be undone."; Pro users also see a bold line "Your Pro subscription is cancelled immediately. There is no refund for the rest of the current period."; field "Type royce@example.com to confirm"; password field (email users) or "You'll be asked to sign in with Google once more to confirm." (Google users); footer "Cancel" + destructive "Delete forever" (disabled until confirmed).

### 5.13 Billing success / cancelled (`07 App: Account`)
Centred column, max 448, padding 48 top.
- **Activating:** spinning loader (40, primary), H2 "Activating Pro…", "Confirming your payment with Stripe."
- **Slow:** H2 "Still processing your payment", reassurance text, buttons "Check again" + "Go to account".
- **Success:** `check-circle` (48, primary), "You're on Pro", "Unlimited AI generations and PDF uploads are now unlocked.", buttons "Generate cards" + "Dashboard".
- **Cancelled:** "Checkout cancelled", "No payment was made and nothing has changed…", buttons "Back to pricing" + "Dashboard".

### 5.14 Analytics (`08 App: Analytics`)
- H2 "Analytics".
- Stat tiles, 4 columns (2 on tablet, 1 on mobile): Cards due · Total cards · Quizzes taken · Quiz accuracy. **Pro** adds Current streak (`flame`) and Longest streak (`trophy`).
- **Free version:** below the tiles, a Locked panel: "Full analytics is a Pro feature" / "See your accuracy trend, daily study activity, streaks, and how well you know each deck." / "See Pro".
- **Pro version:** three Chart cards stacked (specs in section 7):
  1. "Quiz accuracy": "Share of questions answered correctly, by day, over the last 30 days".
  2. "Cards reviewed": "Flashcard ratings and quiz answers per day, last 14 days".
  3. "Deck progress": "A card counts as mastered once it is scheduled 21+ days out".
- **States:** each chart's empty state ("No quizzes yet", "No reviews in the last 14 days", "No decks yet"), one chart in **table view**, a hover tooltip on each chart.

---

## 6. Mobile (page `09 Mobile`, 390 wide)

Design at least: Login, Dashboard (with hamburger sheet open as a second frame), Deck detail, Study session (back side), Quiz question, Generate, Account, Analytics (Pro).
Rules: one column; button rows wrap; side-by-side fields stack; stat tiles one per row (two per row is fine for short values); touch targets at least 44 px tall; no horizontal scrolling.

---

## 7. Chart specs (Analytics)

Charts use **one colour only (`primary`)**; there is never more than one data series, so no legend is needed except for Deck progress.

- **Accuracy line chart:** 2 px line, round joins; 8 px dots with a 2 px `card`-coloured ring; hairline gridlines at 0/25/50/75/100% (`border`); y labels left (Caption, muted); x labels only first and last date ("Mar 2", "Mar 14"). Label only the **last** point ("90%", Semi Bold, `foreground`). Hover: a 1 px vertical crosshair plus tooltip ("82%" bold, "Mar 10 · 20 questions" muted, short indigo line as key).
- **Cards reviewed column chart:** 14 columns, max 24 px wide, top corners rounded 4 px, flat at the baseline; y-axis 0 / half / max with clean numbers; x labels every other day ending on today. Hover: hovered column full opacity, others 55%, tooltip "14 cards · Mar 14".
- **Deck progress stacked bars:** legend row of 12 px square swatches: Mastered (`primary`), Learning (`primary` 55%), Not learned yet (`primary` 20%). Per deck: name (Medium, truncates) left, "43% mastered · 42 cards" (muted) right; a 12 px tall bar split into the three segments with **2 px gaps** and 4 px rounded ends. Deck with no cards shows "No cards yet."
- **Table view:** simple table, header row muted, rows separated by `border`, numbers tabular.
- Text in charts always uses text colours, never the indigo.

---

## 8. Accessibility checklist

- Text contrast at least 4.5:1 (3:1 for large text) in **both** Light and Dark modes; check `muted-foreground` on `muted`.
- Visible focus ring on every interactive element.
- Status never by colour alone: icons for correct/incorrect and lock icons on gated features.
- Minimum touch target 44 × 44 on mobile.
- Each chart has a table alternative.

---

## 9. Dark mode

Duplicate at least Dashboard, Study (back side), Quiz answered, and Analytics (Pro) and switch the frames to the `Dark` variable mode. Do not hand-pick dark colours; if something looks wrong, fix the variable value.

---

## 10. Handoff back to code

When the designs are ready:

1. Make sure components and variables use the names in this brief.
2. Share the file link with **"can view"** access, with node links to the frames that changed most.
3. List any intentional changes to copy, flows or new screens, since the code already implements everything above and only the visuals should change unless you note otherwise.

Reading designs through the Figma MCP counts against Figma's monthly call limit on the Starter plan, so sharing a **few key frames** (shell, dashboard, study, one form, analytics) is better than the whole file. The remaining screens can follow the same patterns.

---

## Appendix: one-shot prompt for Figma AI

Paste this into Figma's AI to get a first draft, then refine with the sections above:

> Design a clean, modern web app called **Flip**, an AI-powered flashcard and quiz builder for students. Style: minimal, generous whitespace, neutral greys with a single indigo brand colour **#4F39F6**, Inter font, 12 px rounded cards with 1 px light-grey borders and no shadows, 8 px rounded buttons. Desktop frame 1440 wide with content centred at max 1024 px; sticky top navigation with the logo "Flip" (a layers icon), links Dashboard, Create, AI generate, Analytics, Pricing, a "New deck" button and a round avatar. Create these screens: Login, Pricing (Free ₱0 and highlighted Pro ₱149/month cards), Dashboard (title "Your decks", three stat tiles, search, grid of deck cards with "42 cards" and "8 due" badges), Deck detail (Study, Quiz, Edit, Duplicate, Delete buttons and a list of front/back cards), Study session (large centred flashcard, progress bar, Again/Hard/Good/Easy buttons), Quiz question (four lettered answer options with correct-green and wrong-red states), Quiz results (big "80%" score and a review list), Generate with AI (tabs for Paste text and Upload PDF, a usage meter "2 / 5"), Account (plan card and a red-bordered Delete account section), and Analytics (stat tiles, a line chart of quiz accuracy, a column chart of cards reviewed per day, stacked progress bars per deck). Include empty and loading states for the dashboard, and mobile 390 px versions of Dashboard and Study.
