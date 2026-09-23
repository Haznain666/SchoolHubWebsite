/**
 * Legal copy for the standalone pages.
 *
 * ⚠ These are DRAFTS written from what the product actually does (see
 * `STATE.md` and the product's own state file), not from a lawyer. They
 * describe real behaviour — per-school subdomains, tenant-scoped data,
 * Supabase as the processor, the Pakistani market — so they are a sound
 * starting point, but they must be reviewed before the site goes live.
 *
 * Deliberately free of implementation trivia: no column names, no permission
 * keys, no storage types.
 */

export interface LegalSection {
  heading: string;
  paragraphs?: readonly string[];
  bullets?: readonly string[];
}

export interface LegalDoc {
  slug: string;
  title: string;
  eyebrow: string;
  updated: string;
  intro: string;
  sections: readonly LegalSection[];
}

const CONTACT = 'hello@getschoolhub.com';
const UPDATED = '23 September 2026';

export const privacy: LegalDoc = {
  slug: 'privacy',
  title: 'Privacy Policy',
  eyebrow: 'Legal',
  updated: UPDATED,
  intro:
    'School Hub is a school management system. Schools use it to hold records about their students, families and staff. This policy explains what we hold, why, and what a school and a parent can each expect from us.',
  sections: [
    {
      heading: 'Who controls the data',
      paragraphs: [
        'Each school is the controller of its own records. We are the processor: we hold and process that data on the school’s instructions, and we do not decide what a school collects or what it does with it.',
        'If you are a parent, a student or a member of staff and you want to see, correct or remove a record, ask your school first. They can act on it directly. If they need us, they will come to us.',
      ],
    },
    {
      heading: 'What the system holds',
      bullets: [
        'Student records — profile, guardians, uploaded documents and academic history.',
        'Attendance, marks, report cards and promotion decisions.',
        'Fee structures, vouchers, payments and the finance records behind them.',
        'Staff records, salary components, leave and performance ratings.',
        'Messages sent between staff, parents and students inside the school’s own system.',
        'Sign-in details and a record of who did what, so a school can answer that question later.',
      ],
    },
    {
      heading: 'Separation between schools',
      paragraphs: [
        'Every school runs on its own subdomain with its own data. One school cannot read another school’s records. This is enforced by the system, not by convention, and it is the property we treat as non-negotiable.',
      ],
    },
    {
      heading: 'Where the data lives',
      paragraphs: [
        'Records are held in a managed database and file store operated by our infrastructure providers on our behalf. They process data only to run the service and are bound to keep it confidential.',
        'Data may be stored or backed up outside Pakistan. Where that happens, it stays under the same contractual protections.',
      ],
    },
    {
      heading: 'How long it is kept',
      paragraphs: [
        'A school’s data is kept for as long as the school uses School Hub. If a school leaves, they can ask us to export their records and delete them. We will do both, and deletion is permanent.',
        'Some records are kept longer where the law requires it — financial records in particular.',
      ],
    },
    {
      heading: 'What we do not do',
      bullets: [
        'We do not sell school, student or family data to anyone.',
        'We do not use student data to train machine learning models.',
        'We do not show advertising in the product, and we do not profile students for it.',
      ],
    },
    {
      heading: 'This website',
      paragraphs: [
        'This marketing site is separate from the product. It does not require an account and does not set advertising or tracking cookies. See the Cookies page for what it does store.',
        'If you send us a demo request, we keep what you give us — your name, school, email and phone — so we can reply. Nothing more.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [
        `Questions about this policy, or a request about a record: ${CONTACT}. If you are asking on behalf of a school, say which school.`,
      ],
    },
  ],
};

export const terms: LegalDoc = {
  slug: 'terms',
  title: 'Terms of Service',
  eyebrow: 'Legal',
  updated: UPDATED,
  intro:
    'These terms cover the use of School Hub by a school and by the people a school gives access to. A signed agreement with a school takes precedence over anything here.',
  sections: [
    {
      heading: 'The service',
      paragraphs: [
        'School Hub is provided as a hosted service. Each school gets its own subdomain, its own data and its own configuration. Which modules a school runs is a setting, agreed with the school.',
        'We may change or improve the service over time. We will not remove something a school depends on without telling them first.',
      ],
    },
    {
      heading: 'Accounts and access',
      paragraphs: [
        'A school decides who gets an account and what each role can reach. Accounts are personal: they are not to be shared, and a school should remove access when someone leaves.',
        'A school is responsible for what is done under its accounts. If you think an account has been compromised, tell us immediately.',
      ],
    },
    {
      heading: 'What a school agrees to',
      bullets: [
        'To hold only data it is entitled to hold, and to have a lawful basis for holding it.',
        'To keep its own records accurate, and to correct them when asked by the person they describe.',
        'Not to use the service to store material that is unlawful, or to send messages that are abusive or harassing.',
        'Not to attempt to reach another school’s data, or to probe or disrupt the service.',
      ],
    },
    {
      heading: 'Fees',
      paragraphs: [
        'Charges, billing period and notice are set out in the agreement with each school. Fees are payable in advance unless agreed otherwise.',
        'If an invoice is unpaid past the agreed period we may suspend access after giving notice. We will not delete a school’s data for non-payment without giving them a reasonable chance to export it.',
      ],
    },
    {
      heading: 'Availability',
      paragraphs: [
        'We aim to keep the service available during school hours and to schedule maintenance outside them. We do not guarantee uninterrupted availability, and we are not liable for interruptions outside our reasonable control.',
      ],
    },
    {
      heading: 'Your data stays yours',
      paragraphs: [
        'A school’s records belong to the school. We claim no ownership over them. A school can export its data at any time, and can ask for it to be deleted when it leaves.',
      ],
    },
    {
      heading: 'Ending the agreement',
      paragraphs: [
        'Either side can end the agreement in line with the notice in it. On termination we will make the school’s data available for export for an agreed period, then delete it.',
        'We may suspend an account immediately where it is being used unlawfully or is putting other schools at risk.',
      ],
    },
    {
      heading: 'Liability',
      paragraphs: [
        'Nothing here limits liability where the law does not allow it to be limited. Subject to that, our liability is limited as set out in the agreement with the school.',
        'The service is not a substitute for a school’s own record-keeping obligations. A school should keep the backups and returns its regulator requires.',
      ],
    },
    {
      heading: 'Governing law',
      paragraphs: [
        'These terms are governed by the laws of Pakistan, and the courts of Karachi have jurisdiction, unless the agreement with a school says otherwise.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [`Questions about these terms: ${CONTACT}.`],
    },
  ],
};

export const copyright: LegalDoc = {
  slug: 'copyright',
  title: 'Copyright Notice',
  eyebrow: 'Legal',
  updated: UPDATED,
  intro:
    'What belongs to us, what belongs to a school, and what you may do with either.',
  sections: [
    {
      heading: 'Our material',
      paragraphs: [
        'The School Hub software, this website, the School Hub name and logo, the interface designs and the written material on this site are ours and are protected by copyright and trade mark law.',
        'Using the service does not transfer any of that to a school. A school gets a licence to use it for the term of its agreement, and nothing more.',
      ],
    },
    {
      heading: 'A school’s material',
      paragraphs: [
        'A school’s records, its own logo and branding, and anything it uploads remain the school’s. We use them only to run the service for that school — for example, putting a school’s crest on its own vouchers and report cards.',
      ],
    },
    {
      heading: 'What you may do',
      bullets: [
        'Quote short extracts from this site with attribution and a link.',
        'Use the School Hub name to refer to the product factually.',
        'Share a link to any page on this site.',
      ],
    },
    {
      heading: 'What you may not do',
      bullets: [
        'Copy the interface designs or written material into a competing product.',
        'Use the School Hub name or logo in a way that suggests we endorse you.',
        'Alter the logo, or use it as part of another mark.',
        'Reverse engineer the software, except where the law expressly allows it.',
      ],
    },
    {
      heading: 'Third-party material',
      paragraphs: [
        'This site uses the Libre Baskerville and Poppins typefaces under the SIL Open Font License, and open-source libraries under their own licences. Those licences apply to that material, not this notice.',
      ],
    },
    {
      heading: 'Reporting infringement',
      paragraphs: [
        `If you believe something here infringes your copyright, write to ${CONTACT} with a description of the work, where it appears, and how to reach you. We will look into it promptly.`,
      ],
    },
  ],
};

export const cookies: LegalDoc = {
  slug: 'cookies',
  title: 'Cookies',
  eyebrow: 'Legal',
  updated: UPDATED,
  intro:
    'The short version: this site sets no advertising or tracking cookies. It stores one small preference in your browser, and only once you have told us what you want.',
  sections: [
    {
      heading: 'What this site stores',
      paragraphs: [
        'One entry, in your browser’s local storage, recording your cookie choice so we do not ask again on every visit. It never leaves your browser and it identifies nothing about you.',
        'That is all this site stores today. There is no analytics, no advertising network and no third-party script on this site.',
      ],
    },
    {
      heading: 'The categories',
      bullets: [
        'Essential — needed for the site to work and to remember your choice here. These cannot be switched off.',
        'Analytics — would tell us which pages are read and where people stop. Off unless you turn it on. Nothing in this category is active today.',
        'Marketing — would measure whether an advert led to a demo request. Off unless you turn it on. Nothing in this category is active today.',
      ],
    },
    {
      heading: 'Why the control exists if nothing uses it',
      paragraphs: [
        'We would rather ask before we ever add something, than add it and ask afterwards. Your choice is recorded now and will be honoured if analytics or marketing is ever introduced.',
      ],
    },
    {
      heading: 'Changing your mind',
      paragraphs: [
        'Open Cookie settings from the footer at any time. You can also clear your browser’s storage for this site, which removes the record and means we will ask again.',
      ],
    },
    {
      heading: 'The product is different',
      paragraphs: [
        'Once a school signs in, the product itself uses cookies that are necessary to keep the session secure. Those are not optional — without them, signing in would not work. They are covered by the agreement with the school, not by this page.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [`Questions: ${CONTACT}.`],
    },
  ],
};

export const LEGAL_DOCS = { privacy, terms, copyright, cookies } as const;
