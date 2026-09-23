import { useId, useState, type FormEvent } from 'react';
import { contact } from '../data/content';

type Field = 'name' | 'school' | 'email' | 'phone' | 'campuses' | 'captcha';

interface Sum {
  a: number;
  b: number;
  op: '+' | '-';
  answer: number;
}

/**
 * A one-line arithmetic challenge: two whole numbers from 1 to 10, added or
 * subtracted.
 *
 * Subtraction is ordered so the larger number comes first. Left to chance it
 * would sometimes ask "what is 3 - 8", and a negative answer on a form that
 * says "numbers only" is a trap rather than a check.
 */
function makeSum(): Sum {
  const op: '+' | '-' = Math.random() < 0.5 ? '+' : '-';
  let a = 1 + Math.floor(Math.random() * 10);
  let b = 1 + Math.floor(Math.random() * 10);
  if (op === '-' && b > a) [a, b] = [b, a];
  return { a, b, op, answer: op === '+' ? a + b : a - b };
}

const FIELDS: { key: Field; label: string; type: string; placeholder: string }[] = [
  { key: 'name', label: 'Your name', type: 'text', placeholder: 'Alex Morgan' },
  { key: 'school', label: 'School', type: 'text', placeholder: 'Northgate Grammar School' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'head@yourschool.edu.pk' },
  { key: 'phone', label: 'Phone', type: 'tel', placeholder: '(0300) 000-0000' },
  { key: 'campuses', label: 'Campuses', type: 'number', placeholder: '3' },
];

const EMPTY: Record<Field, string> = {
  name: '',
  school: '',
  email: '',
  phone: '',
  campuses: '',
  captcha: '',
};

/**
 * INERT by design: it validates on the client, then shows a thank-you state.
 * Nothing is posted anywhere.
 */
export function ContactForm() {
  const base = useId();
  const [values, setValues] = useState<Record<Field, string>>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [sent, setSent] = useState(false);
  const [sum, setSum] = useState<Sum>(makeSum);

  const validate = (): boolean => {
    const next: Partial<Record<Field, string>> = {};
    if (!values.name.trim()) next.name = 'Please tell us your name.';
    if (!values.school.trim()) next.school = 'Please tell us the school.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      next.email = 'Please check the email address.';
    if (values.phone.trim().length < 7) next.phone = 'Please add a phone number.';

    const typed = values.captcha.trim();
    if (!typed) {
      next.captcha = 'Please answer the sum.';
    } else if (!/^-?\d+$/.test(typed)) {
      next.captcha = 'Numbers only, please.';
    } else if (Number(typed) !== sum.answer) {
      next.captcha = 'That is not right — here is a new one.';
      // a fresh sum, but only after a real wrong answer: reshuffling on a blank
      // or a stray letter would move the target while they are still typing
      setSum(makeSum());
      setValues((v) => ({ ...v, captcha: '' }));
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // nothing is ever sent
    if (validate()) setSent(true);
  };

  if (sent) {
    return (
      <div className="panel mt-8 p-6" role="status" aria-live="polite">
        <p className="display text-[1.2rem]">{contact.thanks}</p>
        <p className="body-copy mt-2 text-[0.82rem] text-steel-700">{contact.thanksBody}</p>
        <button
          type="button"
          className="cta-secondary mt-4"
          onClick={() => {
            setValues(EMPTY);
            setSum(makeSum());
            setSent(false);
          }}
        >
          Start again
        </button>
      </div>
    );
  }

  return (
    <form className="panel mt-8 p-5" onSubmit={onSubmit} noValidate>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => {
          const id = `${base}-${f.key}`;
          const err = errors[f.key];
          return (
            <div key={f.key} className={f.key === 'campuses' ? 'sm:col-span-2' : ''}>
              <label htmlFor={id} className="eyebrow block text-steel-500">
                {f.label}
              </label>
              <input
                id={id}
                name={f.key}
                type={f.type}
                inputMode={f.type === 'number' ? 'numeric' : undefined}
                placeholder={f.placeholder}
                value={values[f.key]}
                aria-invalid={err ? true : undefined}
                aria-describedby={err ? `${id}-err` : undefined}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                className={`body-copy mt-1.5 w-full rounded-md border bg-paper-2 px-3 py-2.5 text-[16px] text-ink outline-none transition-colors duration-300 placeholder:text-steel-300 focus:border-accent sm:py-2 sm:text-[0.85rem] ${
                  err ? 'border-brand-blue' : 'border-steel-100'
                }`}
              />
              {err ? (
                <p id={`${id}-err`} className="body-copy mt-1 text-[0.7rem] text-brand-blue">
                  {err}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="mt-4 max-w-[16rem]">
        <label htmlFor={`${base}-captcha`} className="eyebrow block text-steel-500">
          What is {sum.a} {sum.op} {sum.b}?
        </label>
        <input
          id={`${base}-captcha`}
          name="captcha"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Your answer"
          value={values.captcha}
          aria-invalid={errors.captcha ? true : undefined}
          aria-describedby={errors.captcha ? `${base}-captcha-err` : undefined}
          onChange={(e) => setValues((v) => ({ ...v, captcha: e.target.value }))}
          className={`body-copy mt-1.5 w-full rounded-md border bg-paper-2 px-3 py-2.5 text-[16px] text-ink outline-none transition-colors duration-300 placeholder:text-steel-300 focus:border-accent sm:py-2 sm:text-[0.85rem] ${
            errors.captcha ? 'border-brand-blue' : 'border-steel-100'
          }`}
        />
        {errors.captcha ? (
          <p id={`${base}-captcha-err`} className="body-copy mt-1 text-[0.7rem] text-brand-blue">
            {errors.captcha}
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-5">
        <button type="submit" className="cta-primary">
          Send the details
          <span className="cta-arrow" aria-hidden="true">
            →
          </span>
        </button>
        <p className="body-copy text-[0.7rem] text-steel-700">{contact.smallPrint}</p>
      </div>
    </form>
  );
}
