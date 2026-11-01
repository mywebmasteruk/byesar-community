import type { Locale } from './resolve';

// Presentational copy for the public demo. Descriptions are not a database
// column yet (branding is a later batch), so known demo communities have a
// short line here and every other community gets the same calm fallback.

const DEMO_DESCRIPTIONS: Record<string, Record<Locale, string>> = {
  demo: {
    en: 'A sample community for practical questions in English.',
    ar: 'مجتمع نموذجي لأسئلة عملية بالإنجليزية.',
  },
  'demo-arabic': {
    en: 'A sample community for practical questions in Arabic, laid out right to left.',
    ar: 'مجتمع نموذجي لأسئلة عملية بالعربية، من اليمين إلى اليسار.',
  },
};

const FALLBACK: Record<Locale, string> = {
  en: 'A space for practical questions. A post appears after a moderator reads it.',
  ar: 'مساحة لأسئلة عملية. يظهر المنشور بعد أن يقرأه المشرف.',
};

export function communityBlurb(slug: string, locale: Locale): string {
  return DEMO_DESCRIPTIONS[slug]?.[locale] ?? FALLBACK[locale];
}

export function communityName(
  row: { name_en: string; name_ar: string | null },
  locale: Locale,
): string {
  return locale === 'ar' && row.name_ar ? row.name_ar : row.name_en;
}

export function communityInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0) : '';
}

export function excerpt(body: string, max = 180): string {
  const clean = body.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const base = (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd();
  return `${base}...`;
}

export type PublicStatus = 'pending' | 'published' | 'rejected' | 'hidden';

export function isPublicStatus(value: string): value is PublicStatus {
  return (
    value === 'pending' ||
    value === 'published' ||
    value === 'rejected' ||
    value === 'hidden'
  );
}

const STATUS_LABEL: Record<Locale, Record<PublicStatus, string>> = {
  en: {
    pending: 'Waiting for approval',
    published: 'Published',
    rejected: 'Not published',
    hidden: 'Hidden',
  },
  ar: {
    pending: 'بانتظار الموافقة',
    published: 'منشور',
    rejected: 'غير منشور',
    hidden: 'مخفي',
  },
};

export function statusLabel(locale: Locale, status: string): string {
  if (!isPublicStatus(status)) return status;
  switch (status) {
    case 'pending':
      return STATUS_LABEL[locale].pending;
    case 'published':
      return STATUS_LABEL[locale].published;
    case 'rejected':
      return STATUS_LABEL[locale].rejected;
    case 'hidden':
      return STATUS_LABEL[locale].hidden;
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export function answerCountLabel(locale: Locale, count: number): string {
  const safe = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  if (locale === 'ar') {
    if (safe === 0) return 'لا إجابات';
    if (safe === 1) return 'إجابة واحدة';
    if (safe === 2) return 'إجابتان';
    if (safe <= 10) return `${safe} إجابات`;
    return `${safe} إجابة`;
  }
  if (safe === 1) return '1 answer';
  return `${safe} answers`;
}

export function formatWhen(locale: Locale, iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(date);
}

export const headerCopy = {
  en: {
    product: 'Byesar Community',
    nav: 'Main',
    demo: 'Demo',
    arabicDemo: 'Arabic demo',
    moderation: 'Moderation',
    github: 'GitHub',
    language: 'Language',
  },
  ar: {
    product: 'مجتمع بيسار',
    nav: 'التنقل الرئيسي',
    demo: 'العرض التجريبي',
    arabicDemo: 'العرض التجريبي العربي',
    moderation: 'الإشراف',
    github: 'جيت هب',
    language: 'اللغة',
  },
} as const;

export const pageCopy = {
  en: {
    product: 'Community',
    disclaimer: 'Community opinion, not a fatwa or advice.',
    questions: 'Questions',
    ask: 'Ask a question',
    emptyTitle: 'No questions yet',
    emptyBody:
      'Be the first to ask. Your question waits for a moderator, then it appears here.',
    answers: 'Answers',
    noAnswersTitle: 'No answers yet',
    noAnswersBody:
      'If you can help, write below. Your answer waits for a moderator before it appears.',
    back: 'Back to questions',
    report: 'Report',
    language: 'Language',
    english: 'English',
    arabic: 'Arabic',
  },
  ar: {
    product: 'المجتمع',
    disclaimer: 'رأي المجتمع، وليس فتوى أو نصيحة.',
    questions: 'الأسئلة',
    ask: 'اطرح سؤالاً',
    emptyTitle: 'لا توجد أسئلة بعد',
    emptyBody: 'كن أول من يسأل. يبقى سؤالك لدى المشرف، ثم يظهر هنا.',
    answers: 'الإجابات',
    noAnswersTitle: 'لا توجد إجابات بعد',
    noAnswersBody:
      'إن استطعت المساعدة، اكتب أدناه. تبقى إجابتك لدى المشرف قبل أن تظهر.',
    back: 'العودة إلى الأسئلة',
    report: 'إبلاغ',
    language: 'اللغة',
    english: 'English',
    arabic: 'العربية',
  },
} as const;

export const formCopy = {
  en: {
    title: 'Title',
    titleHelp: 'A short, clear question. Up to 200 characters.',
    details: 'Details',
    detailsHelp:
      'What you have tried, and what you want to know. This is community opinion, not a fatwa or advice.',
    answer: 'Your answer',
    answerHelp:
      'Share a practical experience. Say clearly that it is community opinion, not a ruling.',
    send: 'Send for review',
    sending: 'Sending...',
    security: 'Security check',
    securityHelp: 'The Cloudflare check appears in the box below when it is enabled.',
    waitingTitle: 'Waiting for approval',
    waitingBody:
      'Thank you. A moderator will read this before it appears. You can leave this page.',
    publishedTitle: 'Published',
    publishedBody: 'Your post is public now.',
    another: 'Write another',
    err: 'Could not send. Please check your text and try again.',
    errCaptcha: 'The security check did not pass. Please try again.',
    errRate: 'Too many posts from this connection. Please wait and try again.',
    errRules: 'This text cannot be posted. Please rephrase and try again.',
    reportLegend: 'What are you reporting?',
    reportReason: 'Reason',
    reportHelp: 'Say briefly what is wrong. A moderator will read it. Up to 500 characters.',
    reportSend: 'Send report',
    reportOkTitle: 'Report received',
    reportOkBody: 'Thank you. A moderator will read this report.',
    thisQuestion: 'This question',
    thisAnswer: 'Answer',
  },
  ar: {
    title: 'العنوان',
    titleHelp: 'سؤال قصير وواضح. حتى 200 حرف.',
    details: 'التفاصيل',
    detailsHelp:
      'ما جربته، وما الذي تريد معرفته. هذا رأي المجتمع، وليس فتوى أو نصيحة.',
    answer: 'إجابتك',
    answerHelp: 'شارك تجربة عملية. اذكر بوضوح أنها رأي المجتمع، وليست حكماً.',
    send: 'إرسال للمراجعة',
    sending: 'جار الإرسال...',
    security: 'تحقق أمني',
    securityHelp: 'يظهر فحص Cloudflare في المربع أدناه عندما يكون مفعلاً.',
    waitingTitle: 'بانتظار الموافقة',
    waitingBody: 'شكراً لك. سيقرأ المشرف هذا قبل أن يظهر. يمكنك مغادرة الصفحة.',
    publishedTitle: 'منشور',
    publishedBody: 'منشورك ظاهر الآن.',
    another: 'اكتب مرة أخرى',
    err: 'تعذر الإرسال. تحقق من النص وحاول مرة أخرى.',
    errCaptcha: 'لم ينجح التحقق الأمني. حاول مرة أخرى.',
    errRate: 'محاولات كثيرة من هذا الاتصال. انتظر ثم حاول مرة أخرى.',
    errRules: 'لا يمكن نشر هذا النص. أعد الصياغة وحاول مرة أخرى.',
    reportLegend: 'عمّ تبلغ؟',
    reportReason: 'السبب',
    reportHelp: 'اذكر باختصار ما الخطأ. سيقرأه المشرف. حتى 500 حرف.',
    reportSend: 'إرسال البلاغ',
    reportOkTitle: 'وصل البلاغ',
    reportOkBody: 'شكراً لك. سيقرأ المشرف هذا البلاغ.',
    thisQuestion: 'هذا السؤال',
    thisAnswer: 'إجابة',
  },
} as const;

export const homeCopy = {
  en: {
    heroTitle: 'Questions and answers, read by a moderator first',
    heroLine:
      'An open-source forum for communities, in English and Arabic. Nothing is public until a moderator has approved it.',
    viewDemo: 'View the demo',
    install: 'Install',
    featuresTitle: 'Features',
    featuresIntro: 'Only what is built and working today.',
    built: 'Built',
    features: [
      'Many community spaces on one engine, each at its own address',
      'Questions and answers, with public reading of approved content',
      'Posting without an account, protected by a captcha and rate limits',
      'Moderation: every new post is held until a moderator approves or rejects it',
      'Reports, with a moderator queue',
      'A blocked-terms list and a limit of two links per post',
      'English and Arabic, with full right-to-left layout',
    ],
    stepsTitle: 'Moderation in 3 steps',
    steps: [
      {
        title: 'Someone posts',
        body: 'A visitor sends a question or an answer. It passes the rate limit, the captcha and the text checks, and is saved as waiting.',
      },
      {
        title: 'A moderator reads it',
        body: 'The moderator opens the queue and reads each waiting post. Reports from visitors go to the same queue.',
      },
      {
        title: 'Approve or reject',
        body: 'Only approved posts become public. Rejected posts are never shown.',
      },
    ],
    installTitle: 'Install',
    installBody:
      'You can put it online with a free database account and a free hosting account, without programming. Developers can also run it on their own computer. The steps are in the README.',
    installLink: 'Read the install steps',
    licenceTitle: 'Licence',
    licenceLine: 'Free and open source under the MIT licence.',
    licenceLink: 'Read the licence',
    footerDemo: 'This is a demo. Its data may be reset at any time.',
    footerSource: 'Source code on GitHub',
  },
  ar: {
    heroTitle: 'أسئلة وإجابات يقرؤها المشرف أولاً',
    heroLine:
      'منتدى مفتوح المصدر للمجتمعات، بالإنجليزية والعربية. لا يظهر شيء للعامة حتى يوافق عليه المشرف.',
    viewDemo: 'عرض النسخة التجريبية',
    install: 'التثبيت',
    featuresTitle: 'المزايا',
    featuresIntro: 'فقط ما هو مبني ويعمل اليوم.',
    built: 'جاهز',
    features: [
      'مجتمعات كثيرة على محرك واحد، لكل منها عنوانه',
      'أسئلة وإجابات، مع قراءة عامة للمحتوى المعتمد',
      'النشر دون حساب، مع حماية بالكابتشا وحدود للمعدل',
      'الإشراف: كل منشور جديد ينتظر حتى يوافق عليه المشرف أو يرفضه',
      'البلاغات، مع قائمة انتظار للمشرف',
      'قائمة كلمات محظورة وحد أقصى لرابطين في المنشور',
      'الإنجليزية والعربية، مع تخطيط كامل من اليمين إلى اليسار',
    ],
    stepsTitle: 'الإشراف في 3 خطوات',
    steps: [
      {
        title: 'شخص ينشر',
        body: 'يرسل الزائر سؤالاً أو إجابة. يمر بحد المعدل والكابتشا وفحص النص، ثم يُحفظ بانتظار المراجعة.',
      },
      {
        title: 'المشرف يقرأ',
        body: 'يفتح المشرف قائمة الانتظار ويقرأ كل منشور. وتصل بلاغات الزوار إلى القائمة نفسها.',
      },
      {
        title: 'موافقة أو رفض',
        body: 'المنشورات المعتمدة فقط تصبح عامة. والمرفوضة لا تظهر أبداً.',
      },
    ],
    installTitle: 'التثبيت',
    installBody:
      'يمكنك تشغيله على الإنترنت بحساب قاعدة بيانات مجاني وحساب استضافة مجاني، دون برمجة. ويمكن للمطورين تشغيله على حاسوبهم. الخطوات في ملف README.',
    installLink: 'اقرأ خطوات التثبيت',
    licenceTitle: 'الرخصة',
    licenceLine: 'مجاني ومفتوح المصدر بموجب رخصة MIT.',
    licenceLink: 'اقرأ الرخصة',
    footerDemo: 'هذه نسخة تجريبية. قد تُعاد تهيئة بياناتها في أي وقت.',
    footerSource: 'الشيفرة المصدرية على جيت هب',
  },
} as const;
