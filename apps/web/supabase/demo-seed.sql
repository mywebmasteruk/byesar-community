-- Hand-written DEMO content. Practical, non-fatwa questions only; answers say "community
-- opinion" and point people to qualified scholars for rulings. No AI-generated content.
-- Safe to re-run: it clears the demo communities first (demo data may be reset).
delete from communities where slug in ('demo-prayer','demo-mosque');

with c as (
  insert into communities (slug, name_en, name_ar, default_locale, pre_moderation, ai_seed_enabled) values
    ('demo-prayer', 'Prayer community demo', 'مجتمع الصلاة (تجريبي)', 'en', true, false),
    ('demo-mosque', 'Mosque community demo', 'مجتمع المسجد (تجريبي)', 'ar', true, false)
  returning id, slug
), q as (
  insert into questions (community_id, title, body, locale, tags, status)
  select c.id, v.title, v.body, v.locale, v.tags, 'published'
  from c join (values
    ('demo-prayer','How do I build a habit of morning adhkar?','I keep forgetting. What routines have worked for you?','en', array['habits','adhkar']),
    ('demo-prayer','Which prayer-time apps do you use while travelling?','Looking for something that works offline.','en', array['apps','travel']),
    ('demo-prayer','كيف أحافظ على أذكار الصباح؟','أنسى كثيراً، فما الطرق العملية التي ساعدتكم؟','ar', array['أذكار','عادات']),
    ('demo-mosque','كيف نعلن عن جدول دروس المسجد للجميع؟','نريد طريقة بسيطة لنشر الجدول الأسبوعي.','ar', array['مسجد','إعلانات']),
    ('demo-mosque','What should a small masjid website include first?','Prayer times, contact details, events. Anything else?','en', array['masjid','website'])
  ) as v(slug,title,body,locale,tags) on v.slug = c.slug
  returning id, community_id, locale
)
insert into answers (question_id, community_id, body, status)
select q.id, q.community_id,
  case q.locale
    when 'ar' then 'رأي من المجتمع، وليس فتوى: جرّبوا ربط الذكر بعادة ثابتة مثل شرب القهوة. وللأحكام الشرعية راجعوا أهل العلم.'
    else 'Community opinion, not a fatwa or advice: tie it to a habit you already have, like your morning coffee. For rulings, ask a qualified scholar.'
  end, 'published'
from q;

insert into blocked_terms (community_id, term, reason) values
  (null, 'riba loan', 'interest-based finance promotion'),
  (null, 'casino', 'gambling promotion'),
  (null, 'betting', 'gambling promotion');
