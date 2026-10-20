-- Add structured, administrator-entered interview responses; existing RLS remains.
alter table public.texcontractor_showcase
 add column feedback_role text check (feedback_role in ('client','professional')),
 add column feedback_answers jsonb not null default '[]'::jsonb,
 add column rating smallint check (rating between 1 and 5),
 add constraint showcase_feedback_answers_valid check (
   jsonb_typeof(feedback_answers)='array'
   and jsonb_array_length(feedback_answers)<=10
   and length(feedback_answers::text)<=200000
   and not jsonb_path_exists(feedback_answers, '$[*] ? (@.type() != "object" || !exists(@.key) || !exists(@.answer) || @.key.type() != "number" || @.answer.type() != "string" || @.answer == "" || @.key < 1 || @.key > 10 || @.key.floor() != @.key)')
 ),
 add constraint showcase_feedback_role_required check (jsonb_array_length(feedback_answers)=0 or feedback_role is not null),
 add constraint showcase_feedback_testimonials_only check (kind='testimonial' or (feedback_role is null and feedback_answers='[]'::jsonb and rating is null));
alter table public.texcontractor_showcase
 drop constraint texcontractor_showcase_check1,
 add constraint showcase_testimonial_publication check (
   not published or kind<>'testimonial' or
   (verified and consent and length(attribution)>0 and (length(body)>0 or jsonb_array_length(feedback_answers)>0))
 );
