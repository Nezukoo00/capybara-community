Design Guidelines: Capybara Community Website
Design Approach
Reference-Based Approach drawing inspiration from community-focused platforms like Reddit (comment systems), Instagram (visual content), and Notion (friendly, approachable interface). The design should feel warm, welcoming, and playful to match the gentle nature of capybaras.

Core Design Principles
Warmth & Approachability: Soft edges, generous spacing, friendly typography
Content-First: Let capybara imagery shine without competing visual noise
Community Feel: Clear user attribution, conversational interfaces
Simplicity: Intuitive navigation, minimal cognitive load
Typography
Primary Font: 'Inter' or 'Plus Jakarta Sans' (Google Fonts)

Headings: 600-700 weight
Body: 400-500 weight
Small text: 400 weight
Hierarchy:

Page Titles: text-4xl to text-5xl, font-semibold
Section Headers: text-2xl to text-3xl, font-semibold
Card Titles: text-xl, font-medium
Body Text: text-base
Metadata (dates, usernames): text-sm
Captions: text-xs
Layout System
Spacing Units: Use Tailwind spacing of 2, 4, 6, 8, 12, 16, 20, 24

Component padding: p-4 to p-8
Section spacing: py-12 to py-20
Card gaps: gap-6 to gap-8
Element margins: m-2, m-4, m-6
Container Structure:

Max width: max-w-6xl
Content areas: max-w-4xl
Centered layouts: mx-auto
Side padding: px-4 md:px-8
Component Library
Navigation Header
Fixed top navigation: sticky top-0
Logo/site name on left
Navigation links center/right: Главная, О капибарах, Сообщество
Auth buttons on far right (Войти/Профиль)
Height: h-16 to h-20
Add subtle border-b for separation
Hero Section (Home Page)
Large hero image of capybara: h-96 to h-[500px]
Overlay with centered content
Hero heading: Large, bold text (text-5xl md:text-6xl)
Subtitle: text-xl, lighter weight
Primary CTA button with backdrop blur: backdrop-blur-sm with padding
Image should be warm, inviting capybara photo
Card Components
Comment Cards:

Rounded corners: rounded-lg to rounded-xl
Padding: p-4 to p-6
Border or subtle shadow for separation
Header row: Avatar (left) + Username + Timestamp (right)
Body: Comment text with comfortable line-height
Footer: Action buttons (Delete for own comments)
User Profile Cards:

Avatar: Circular, w-20 h-20 to w-24 h-24
User info block: Stack username, join date
Stats: Comment count
Rounded container with generous padding
Media Cards (Photos/Videos):

Aspect ratio maintained: aspect-square or aspect-video
Rounded corners: rounded-lg
Hover effect: subtle scale or opacity change
Grid layout: grid-cols-2 md:grid-cols-3 gap-4 to gap-6
Forms
Consistent Form Design:

Input fields: rounded-lg, p-3 to p-4, border with focus states
Label above input: text-sm font-medium, mb-2
Full width inputs: w-full
Spacing between fields: space-y-4 to space-y-6
Submit buttons: Full width or prominent, py-3 px-6
Error states: Red accent with text-sm below input
Pages: Login, Registration, Comment forms

Centered cards: max-w-md mx-auto
Card padding: p-8
Form title at top: text-2xl font-semibold mb-6
Comment Section
Section header: "Комментарии" with count
Comment input area (when logged in): Textarea + Submit button
Comments list: Stack with gap-4
Each comment in individual card
Pagination or "Load More" if needed
Footer
Multi-column layout: grid-cols-1 md:grid-cols-3
Sections: About, Links, Social/Contact
Centered copyright at bottom
Padding: py-12 to py-16
Links in vertical lists with spacing
Buttons
Primary: Larger, bold, for main actions (Войти, Зарегистрироваться, Отправить) Secondary: Outline or ghost style for less emphasis Sizes: py-2 px-4 (small), py-3 px-6 (medium), py-4 px-8 (large) Rounded: rounded-lg to rounded-xl

Images & Media
Hero Image:

Large, warm photo of happy capybara (preferably in water or relaxing)
Full-width, h-96 to h-[500px]
Overlay gradient for text readability
Gallery Images (About Page):

6-9 capybara photos in grid: grid-cols-2 md:grid-cols-3
Variety: capybaras in water, with friends, relaxing, eating
Aspect-ratio consistent
Videos:

Embedded videos: aspect-video wrapper
2-3 cute capybara clips
Include video controls
User Avatars:

Default: Capybara icon/illustration for users without photo
Circular: rounded-full
Icons: Use Heroicons via CDN

Navigation icons
User profile icon
Calendar icon (dates)
Trash icon (delete comments)
Page-Specific Layouts
Home Page:

Hero with capybara image + welcome message
Brief intro section (2-3 sentences about community)
Latest comments feed: Cards in vertical stack
CTA to join/login if not authenticated
About Capybaras:

Page header with title
Facts section: 2-column grid of fact cards
Photo gallery: 3-column grid
Video section: 1-2 embedded videos
Comment section at bottom
User Profile:

Profile header: Avatar + User info (centered or left-aligned)
Stats row: Join date, comment count
User's comments list: Same card style as main comment feed
Auth Pages (Login/Register):

Centered card: max-w-md
Logo/site name at top
Form fields stacked
Link to alternate action at bottom (Нет аккаунта? → Регистрация)
Animations
Minimal, Purposeful Only:

Hover states: Subtle opacity or scale (scale-105)
Page transitions: None (instant)
Button feedback: Simple transform on click
Card hover: Slight shadow increase
Accessibility
Semantic HTML throughout (header, nav, main, footer, article for comments)
Form labels associated with inputs
Alt text for all images
Focus states visible on all interactive elements
Consistent tab order