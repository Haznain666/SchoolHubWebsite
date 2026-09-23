/**
 * ALL site copy.
 *
 * Two rules from CHANGES-V2 §H govern everything in this file:
 *
 *   §H.1 — no explainer filler. If a sentence only makes sense to someone who
 *   has read the schema, it is not here. No database columns, no permission
 *   keys, no routes, no storage types. State the benefit and stop.
 *
 *   §H.2 — every person named anywhere on the site has a Western name, and
 *   every figure is invented. Nothing is copied from the live tenant.
 *
 * Capabilities are still accurate to the product; only the framing changed.
 */

import type { SectionId } from './sections';

export interface FeatureCard {
  title: string;
  body: string;
}

/** A standard feature scene: 03–08 all share this shape. */
export interface FeatureSection {
  id: SectionId;
  heading: string;
  lead: string;
  cards: FeatureCard[];
  /**
   * How the points are laid out. `cards` is the six-card grid; `list` is the
   * full-width rule / title / text rows, for sections carrying four longer
   * points instead of six short ones. Defaults to `cards`.
   */
  layout?: 'cards' | 'list';
}

/* -------------------------------------------------------------------------- */
/* 00 — Hero                                                                   */
/* -------------------------------------------------------------------------- */

export const hero = {
  titleLines: ['School', 'Hub'],
  /** typed sub-heading; the tail is typed in the accent colour */
  typed: {
    full: 'One system that runs the whole school.',
    lead: 'One system that runs the ',
    accent: 'whole school.',
  },
  body: "Admissions, attendance, fees, staff, leave and messaging in one place — on your school's own subdomain, built for Pakistani schools.",
  chips: ['Academics', 'Admin', 'Accounts', 'HR', 'Parents', 'Students'],
  scrollHint: 'Scroll to explore',
} as const;

/* -------------------------------------------------------------------------- */
/* 01 — In numbers                                                             */
/* -------------------------------------------------------------------------- */

export interface Stat {
  label: string;
  figure: number;
  caption: string;
}

export const numbers = {
  heading: 'In numbers',
  lead: 'What the platform already carries.',
  stats: [
    { label: 'Modules', figure: 13, caption: 'switchable per school' },
    { label: 'Roles', figure: 12, caption: 'from Administrator to Parent' },
    { label: 'Portals', figure: 4, caption: 'office, teaching, student, family' },
    { label: 'Features', figure: 51, caption: 'live in the platform today' },
  ] as Stat[],
  footnote:
    'Thirteen modules: Academics & Timetable, LMS, Exams & Results, Events, Admissions & Enrollment, Fee Management, Accounts & Finance, HR & Payroll, Staff KPIs, Chat, Transport, Library, Hostel.',
} as const;

/* -------------------------------------------------------------------------- */
/* 02 — How it works (CHANGES-V2 §I)                                           */
/* -------------------------------------------------------------------------- */

export const howItWorks = {
  heading: 'Four portals, one system',
  lead: 'Office, teaching, family and platform each see their own view of the same records. Nothing is re-entered, and nothing is out of date.',
  second:
    "A fee taken at the counter shows in the parent's app before they reach the gate. A register marked in class is on the head's dashboard the same morning.",
  nodes: [
    { id: 'office', label: 'Office', blurb: 'Admissions, vouchers, registers, reports.' },
    { id: 'teaching', label: 'Teaching', blurb: 'Attendance, marks, lesson plans, leave.' },
    { id: 'family', label: 'Family', blurb: 'Fees, attendance, results, messages.' },
    { id: 'platform', label: 'Platform', blurb: 'Roles, campuses, modules, branding.' },
  ],
  hub: 'School Hub',
  out: 'Your school',
} as const;

/* -------------------------------------------------------------------------- */
/* 03–08 — the feature scenes                                                  */
/* -------------------------------------------------------------------------- */

export const featureSections: FeatureSection[] = [
  {
    id: 'students',
    heading: 'Every student, one record',
    lead: 'Bring four hundred students across from a spreadsheet, map the columns once, and see every problem before you commit to it.',
    cards: [
      {
        title: 'The student record',
        body: 'Profile, guardians, uploaded documents and academic history, in one place.',
      },
      {
        title: 'Spreadsheet import',
        body: 'Map your columns once and review every row before a single student is enrolled.',
      },
      {
        title: 'Admissions & enrolment',
        body: 'Applications through to a placed student, one active enrolment at a time.',
      },
      {
        title: 'Campus transfer',
        body: 'Move a student between campuses without losing their history.',
      },
      {
        title: 'Attendance',
        body: 'Present, absent, late, excused and holiday — marked in the classroom, visible to the family the same morning.',
      },
      {
        title: 'Report cards',
        body: 'Grading schemes, marks entry, promotions and printable report cards.',
      },
    ],
  },
  {
    id: 'teachers',
    heading: 'The staff room, on the record',
    lead: 'One record per member of staff, whether or not they have a login, and a salary built out of named components rather than a single figure.',
    cards: [
      { title: 'Personnel file', body: 'One person, one record, linked to their login.' },
      {
        title: 'Roles & permissions',
        body: 'Twelve roles, and a permission matrix each school can edit.',
      },
      {
        title: 'Timetable & teacher calendar',
        body: "A teacher's whole week across sections, with clashes caught as you build it.",
      },
      { title: 'Substitute cover', body: 'Who is covering, and what they are covering.' },
      { title: 'Lesson plans', body: 'Planned, submitted, reviewed.' },
      {
        title: 'Payroll',
        body: 'Salary components, payroll runs, payslips and approvals.',
      },
    ],
  },
  {
    id: 'messaging',
    heading: "Inside the school's own system",
    lead: "Parents and teachers message each other inside the school's own system, under the school's own rules — not on a phone number nobody controls.",
    layout: 'list',
    cards: [
      {
        title: 'Four portals',
        body: 'Office, teaching, student and family all write into the same thread list, so a conversation started by a parent reaches the right desk without anyone forwarding a screenshot.',
      },
      {
        title: 'Time-limited grants',
        body: 'Open a class for a fixed window when there is something to discuss, then let it close on its own. Nobody keeps a channel they stopped needing in March.',
      },
      {
        title: 'Moderation',
        body: 'Attachments are scanned, messages can be reported, and a reported message goes to someone whose job it is to read it — not into a group chat nobody moderates.',
      },
      {
        title: 'Oversight',
        body: 'A head of section sees what happens in their own part of the school, and nowhere else. Scope follows the role, so visibility is never a favour someone grants.',
      },
    ],
  },
  {
    id: 'performance',
    heading: 'Appraisal every month, not every year',
    lead: 'Appraisal that happens monthly instead of once a year, and a single number a salary review can actually turn on.',
    layout: 'list',
    cards: [
      {
        title: 'KPIs per role',
        body: 'Each role is measured on what that role actually does, and the school defines it, not us. A head of section and a bus driver never share one sheet.',
      },
      {
        title: 'Who rates whom',
        body: 'Seniority decides who may rate whom, and the system enforces it. Nobody can quietly rate a peer, rate themselves, or reach across a campus they do not run.',
      },
      {
        title: 'The board',
        body: 'Every member of staff, ranked and filtered by campus, updated monthly instead of once a year. The standing a salary review turns on is visible long before the review.',
      },
      {
        title: 'Reports',
        body: 'Performance sits next to attendance, fees and academics in the same report, so a weak month can be read against what else was happening rather than in isolation.',
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* 09 — The platform (CHANGES-V2 §G.1)                                         */
/* -------------------------------------------------------------------------- */

export const platform = {
  heading: 'One system, not six tools',
  lead: "Every campus, every module and every role on one subdomain of your own — and one bill instead of six.",
  portals: [
    {
      title: 'Office',
      body: 'Admissions, fees, registers, staff and reports, for the people who run the school day to day.',
    },
    {
      title: 'Teaching',
      body: 'Registers, marks, lesson plans and leave, on a phone if that is where the teacher is.',
    },
    {
      title: 'Family',
      body: "Fees, attendance, results and messages for every parent, in one app per family.",
    },
  ] as FeatureCard[],
} as const;

/* -------------------------------------------------------------------------- */
/* 10 — The dashboard (CHANGES-V2 §G.2)                                        */
/* -------------------------------------------------------------------------- */

export const dashboard = {
  heading: 'The morning view',
  lead: 'Everything the office needs to know before the first bell, on one screen.',
} as const;

/* -------------------------------------------------------------------------- */
/* 11 — Onboarding                                                             */
/* -------------------------------------------------------------------------- */

export const process = {
  heading: 'From demo to first term',
  lead: 'Four steps, and a named person with you through all of them.',
  steps: [
    {
      title: 'Demo',
      body: 'We walk your team through the system with your own kind of data.',
    },
    {
      title: 'Setup',
      body: 'Campuses, grades, sections, fee structure and roles configured with you.',
    },
    {
      title: 'Import',
      body: 'Students and staff brought across from your spreadsheets, checked before they go live.',
    },
    {
      title: 'Go live',
      body: 'Your subdomain opens, invitations go out, and we stay on support through the first term.',
    },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* 12 — FAQ (CHANGES-V2 §G.3)                                                  */
/* -------------------------------------------------------------------------- */

export const faq = {
  heading: 'Answers, up front',
  lead: 'The three questions every head asks first.',
  items: [
    {
      q: 'Does every school get its own system?',
      a: 'Yes. Each school runs on its own subdomain with its own data, its own branding and its own permission matrix. Nothing is shared between schools.',
    },
    {
      q: 'Can we run more than one campus?',
      a: 'Yes. Branches sit under one school, and every record belongs to the campus it came from — including who can see it. Fees, attendance and reports can be read per campus or across all of them.',
    },
    {
      q: 'Do we have to take all of it at once?',
      a: 'No. Thirteen modules, one switch each. Start with admissions, fees and attendance; turn on payroll, KPIs, messaging or transport whenever the school is ready.',
    },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* 13 — Contact                                                                */
/* -------------------------------------------------------------------------- */

export const contact = {
  heading: 'Ready to run the whole school?',
  lead: 'Tell us about your school in a few questions. We will come back to you personally — with an honest assessment, not a standard quote.',
  smallPrint: 'Takes about 60 seconds.',
  thanks: 'Thank you — we will be in touch',
  thanksBody:
    'This is a preview form, so nothing has been sent yet. Use Book a Demo, or write to us directly, and a person will answer.',
} as const;

/* -------------------------------------------------------------------------- */
/* 14 — Footer (CHANGES-V2 §G.4)                                               */
/* -------------------------------------------------------------------------- */

export const footer = {
  blurb:
    "One system per school: admissions, attendance, fees, staff, leave, messaging and KPIs. On your own subdomain, in your own branding, with your own permission matrix.",
  social: [
    { label: 'LinkedIn', glyph: 'linkedin', href: 'https://www.linkedin.com' },
    { label: 'X', glyph: 'x', href: 'https://x.com' },
    { label: 'YouTube', glyph: 'youtube', href: 'https://www.youtube.com' },
    { label: 'Email', glyph: 'mail', href: 'mailto:hello@getschoolhub.com' },
  ],
  columns: [
    {
      title: 'Navigation',
      links: [
        { label: 'Start', href: '#start' },
        { label: 'Features', href: '#students' },
        { label: 'Platform', href: '#platform' },
        { label: 'Process', href: '#onboarding' },
        { label: 'FAQ', href: '#faq' },
      ],
    },
    {
      title: 'Platform',
      links: [
        { label: 'In numbers', href: '#numbers' },
        { label: 'How it works', href: '#how-it-works' },
        { label: 'School portal', href: 'https://schoolhub.codexmill.com', external: true },
        {
          label: 'Super Admin',
          href: 'https://schoolhub.codexmill.com/super-admin',
          external: true,
        },
      ],
    },
    {
      title: 'Contact',
      links: [
        { label: 'hello@getschoolhub.com', href: 'mailto:hello@getschoolhub.com' },
        { label: 'Book a demo', href: '#contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '/privacy.html' },
        { label: 'Terms', href: '/terms.html' },
        { label: 'Cookies', href: '/cookies.html' },
        { label: 'Copyright', href: '/copyright.html' },
        { label: 'Cookie settings', href: '#cookie-settings' },
      ],
    },
  ],
  copyright: '© 2026 School Hub — All rights reserved.',
  renderNote: 'Rendered in real time · WebGL',
} as const;
