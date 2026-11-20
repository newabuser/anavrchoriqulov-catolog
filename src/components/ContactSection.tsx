import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ARTIST_PROFILE } from '../data/portfolioData';
import { InquiryFormErrors, InquiryFormValues } from '../types/artwork';
import { validateInquiryForm } from '../utils/galleryLogic';
import { useLanguage } from '../context/LanguageContext';

interface ContactSectionProps {
  prefilledSubject?: string;
  onReplayEntrance?: () => void;
}

export function ContactSection({
  prefilledSubject = '',
  onReplayEntrance,
}: ContactSectionProps) {
  const { t } = useLanguage();
  const [values, setValues] = useState<InquiryFormValues>({
    name: '',
    email: '',
    subject: prefilledSubject || t.contact.defaultSubject,
    message: '',
  });
  const [subjectEdited, setSubjectEdited] = useState(false);
  const [errors, setErrors] = useState<InquiryFormErrors>({});
  const [submittedRecord, setSubmittedRecord] = useState<InquiryFormValues | null>(null);

  useEffect(() => {
    if (prefilledSubject) {
      setValues((prev) => ({
        ...prev,
        subject: `${t.contact.inquiryPrefix} ${prefilledSubject}`,
      }));
      setSubjectEdited(true);
      setSubmittedRecord(null);
    }
  }, [prefilledSubject, t.contact.inquiryPrefix]);

  useEffect(() => {
    if (!prefilledSubject && !subjectEdited) {
      setValues((prev) => ({
        ...prev,
        subject: t.contact.defaultSubject,
      }));
    }
  }, [prefilledSubject, subjectEdited, t.contact.defaultSubject]);

  useEffect(() => {
    setErrors((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      return validateInquiryForm(values, t.contact.errors);
    });
  }, [t.contact.errors, values]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateInquiryForm(values, t.contact.errors);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setSubmittedRecord(values);
      setSubjectEdited(false);
      setValues({
        name: '',
        email: '',
        subject: t.contact.defaultSubject,
        message: '',
      });
    }
  };

  return (
    <footer
      id="contact"
      aria-labelledby="contact-heading"
      className="relative scroll-mt-16 overflow-hidden border-t border-[#eaeaea]/10 bg-gradient-to-b from-[#070709]/80 via-[#08080a]/84 to-[#050505]/92 px-5 pt-24 pb-12 sm:px-8 lg:pt-30"
    >
      {/* Collector Salon Lighting: Studio Top-Left Wash & Asymmetrical Crimson Reflection */}
      <div aria-hidden="true" className="contact-salon-lighting z-0" />

      <div className="relative z-10 mx-auto max-w-[1360px]">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Studio Contact Details */}
          <div className="lg:col-span-5">
            <p className="font-display text-xs font-normal uppercase tracking-[0.36em] text-[#e23c42]">
              {t.contact.sectionLabel}
            </p>
            <h2
              id="contact-heading"
              className="mt-3 font-mauline text-3xl font-normal uppercase tracking-[0.24em] text-[#eaeaea] sm:text-4xl [text-wrap:balance]"
            >
              {t.contact.heading}
            </h2>

            <p className="mt-6 max-w-md text-sm leading-relaxed text-neutral-400 sm:text-[15px]">
              {t.contact.lead}
            </p>

            <dl className="mt-10 divide-y divide-[#eaeaea]/10 border-y border-[#eaeaea]/10 text-sm">
              <div className="py-4">
                <dt className="font-display text-xs uppercase tracking-[0.22em] text-neutral-400">
                  {t.contact.directCorrespondence}
                </dt>
                <dd className="mt-1.5 text-[#eaeaea]">
                  <a
                    href={`mailto:${ARTIST_PROFILE.contactEmail}`}
                    className="transition-colors duration-200 hover:text-[#c81018] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c81018]"
                  >
                    {ARTIST_PROFILE.contactEmail}
                  </a>
                </dd>
              </div>
              <div className="py-4">
                <dt className="font-display text-xs uppercase tracking-[0.22em] text-neutral-400">
                  {t.contact.representation}
                </dt>
                <dd className="mt-1.5 text-neutral-200">
                  {t.contact.representationValue}
                </dd>
              </div>
              <div className="py-4">
                <dt className="font-display text-xs uppercase tracking-[0.22em] text-neutral-400">
                  {t.contact.journalNotes}
                </dt>
                <dd className="mt-1.5 uppercase tracking-[0.16em] text-neutral-400">
                  {t.contact.comingSoon}
                </dd>
              </div>
            </dl>

            {/* Direct Social & Studio Channels */}
            <div className="mt-8 flex items-center gap-4">
              {/* Instagram Icon with glowing red neon aura */}
              <a
                href="https://www.instagram.com/anvar_choriqulov571?utm_source=ig_web_button_share_sheet&dmpr=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Profile"
                className="group relative flex h-12 w-12 items-center justify-center rounded-xl border border-[#eaeaea]/18 bg-[#050505] transition-all duration-300 hover:border-[#c81018] hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c81018]"
              >
                <div className="absolute inset-0 rounded-xl bg-[#c81018]/25 opacity-70 blur-md transition-opacity duration-300 group-hover:opacity-100 group-hover:bg-[#c81018]/40" aria-hidden="true" />
                <svg
                  className="relative h-5 w-5 text-[#eaeaea] transition-colors duration-300 group-hover:text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              {/* Telegram Icon with glowing red neon aura */}
              <a
                href="https://t.me/AnvarArts"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram Channel"
                className="group relative flex h-12 w-12 items-center justify-center rounded-xl border border-[#eaeaea]/18 bg-[#050505] transition-all duration-300 hover:border-[#c81018] hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c81018]"
              >
                <div className="absolute inset-0 rounded-xl bg-[#c81018]/25 opacity-70 blur-md transition-opacity duration-300 group-hover:opacity-100 group-hover:bg-[#c81018]/40" aria-hidden="true" />
                <svg
                  className="relative h-5 w-5 text-[#eaeaea] transition-colors duration-300 group-hover:text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21.5 2L2 9.5l7.5 3.5L21.5 2z" />
                  <path d="M9.5 13L14 21.5l3.5-8.5-8.5 0z" />
                </svg>
              </a>

              {/* Gmail Icon / Direct Mail Link */}
              <a
                href="mailto:artistchoriqulov@gmail.com"
                aria-label="Email Studio"
                className="group relative flex h-12 w-12 items-center justify-center rounded-xl border border-[#eaeaea]/18 bg-[#050505] transition-all duration-300 hover:border-[#c81018] hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c81018]"
              >
                <div className="absolute inset-0 rounded-xl bg-[#c81018]/25 opacity-70 blur-md transition-opacity duration-300 group-hover:opacity-100 group-hover:bg-[#c81018]/40" aria-hidden="true" />
                <svg
                  className="relative h-5 w-5 text-[#eaeaea] transition-colors duration-300 group-hover:text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-10 7L2 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-2xl border border-[#eaeaea]/12 bg-[#101013]/88 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.7)] backdrop-blur-xs sm:p-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#eaeaea]/20 to-transparent"
              />

              {submittedRecord ? (
                <div
                  role="status"
                  data-testid="inquiry-confirmation"
                  className="py-8"
                >
                  <div className="flex items-center gap-3 text-[#eaeaea]">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#c81018]" />
                    <h3 className="font-display text-lg font-light uppercase tracking-[0.22em]">
                      {t.contact.inquirySent}
                    </h3>
                  </div>
                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-neutral-300">
                    {t.contact.inquiryConfirmation(
                      submittedRecord.name,
                      submittedRecord.subject,
                      ARTIST_PROFILE.contactEmail
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmittedRecord(null)}
                    className="mt-8 inline-flex min-h-[44px] items-center rounded-lg border border-[#eaeaea]/28 px-6 py-2.5 font-display text-xs uppercase tracking-[0.24em] text-[#eaeaea] transition-colors duration-200 hover:border-[#c81018] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c81018]"
                  >
                    {t.contact.sendAnotherMessage}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="inquiry-name"
                        className="block font-display text-xs uppercase tracking-[0.22em] text-neutral-300"
                      >
                        {t.contact.nameLabel}
                      </label>
                      <input
                        id="inquiry-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={values.name}
                        onChange={(e) => {
                          setValues((prev) => ({ ...prev, name: e.target.value }));
                          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        aria-invalid={Boolean(errors.name)}
                        placeholder={t.contact.namePlaceholder}
                        className="mt-2 block min-h-[44px] w-full rounded-xl border border-[#eaeaea]/14 bg-[#080808] px-4 py-2.5 text-sm text-[#eaeaea] placeholder:text-neutral-600 transition-all duration-200 hover:border-[#eaeaea]/26 focus:border-[#c81018] focus:bg-[#0a0a0c] focus:ring-1 focus:ring-[#c81018]/35 focus:outline-none"
                      />
                      {errors.name && (
                        <p role="alert" className="mt-1.5 text-xs text-[#c81018]">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="inquiry-email"
                        className="block font-display text-xs uppercase tracking-[0.22em] text-neutral-300"
                      >
                        {t.contact.emailLabel}
                      </label>
                      <input
                        id="inquiry-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={values.email}
                        onChange={(e) => {
                          setValues((prev) => ({ ...prev, email: e.target.value }));
                          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        aria-invalid={Boolean(errors.email)}
                        placeholder={t.contact.emailPlaceholder}
                        className="mt-2 block min-h-[44px] w-full rounded-xl border border-[#eaeaea]/14 bg-[#080808] px-4 py-2.5 text-sm text-[#eaeaea] placeholder:text-neutral-600 transition-all duration-200 hover:border-[#eaeaea]/26 focus:border-[#c81018] focus:bg-[#0a0a0c] focus:ring-1 focus:ring-[#c81018]/35 focus:outline-none"
                      />
                      {errors.email && (
                        <p role="alert" className="mt-1.5 text-xs text-[#c81018]">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="inquiry-subject"
                      className="block font-display text-xs uppercase tracking-[0.22em] text-neutral-300"
                    >
                      {t.contact.subjectLabel}
                    </label>
                    <input
                      id="inquiry-subject"
                      name="subject"
                      type="text"
                      value={values.subject}
                      onChange={(e) => {
                        setSubjectEdited(true);
                        setValues((prev) => ({ ...prev, subject: e.target.value }));
                      }}
                      className="mt-2 block min-h-[44px] w-full rounded-xl border border-[#eaeaea]/14 bg-[#080808] px-4 py-2.5 text-sm text-[#eaeaea] placeholder:text-neutral-600 transition-all duration-200 hover:border-[#eaeaea]/26 focus:border-[#c81018] focus:bg-[#0a0a0c] focus:ring-1 focus:ring-[#c81018]/35 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="inquiry-message"
                      className="block font-display text-xs uppercase tracking-[0.22em] text-neutral-300"
                    >
                      {t.contact.messageLabel}
                    </label>
                    <textarea
                      id="inquiry-message"
                      name="message"
                      rows={4}
                      value={values.message}
                      onChange={(e) => {
                        setValues((prev) => ({ ...prev, message: e.target.value }));
                        if (errors.message)
                          setErrors((prev) => ({ ...prev, message: undefined }));
                      }}
                      aria-invalid={Boolean(errors.message)}
                      placeholder={t.contact.messagePlaceholder}
                      className="mt-2 block w-full rounded-xl border border-[#eaeaea]/14 bg-[#080808] px-4 py-3 text-sm text-[#eaeaea] placeholder:text-neutral-600 transition-all duration-200 hover:border-[#eaeaea]/26 focus:border-[#c81018] focus:bg-[#0a0a0c] focus:ring-1 focus:ring-[#c81018]/35 focus:outline-none"
                    />
                    {errors.message && (
                      <p role="alert" className="mt-1.5 text-xs text-[#c81018]">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-[#eaeaea]/35 bg-transparent px-8 py-3 font-display text-xs font-normal uppercase tracking-[0.28em] text-[#eaeaea] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#c81018] hover:bg-[#c81018] hover:text-white hover:shadow-[0_10px_28px_rgba(200,16,24,0.24)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c81018]"
                  >
                    {t.contact.sendInquiry}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Quiet Editorial Footer */}
        <div className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-[#eaeaea]/10 pt-8 pb-12 text-xs tracking-[0.16em] text-neutral-400 sm:flex-row sm:pr-16 sm:pb-2">
          <p className="uppercase">
            &copy; {new Date().getFullYear()} {ARTIST_PROFILE.name} · {t.footer.rightsReserved}
          </p>
          <div className="flex items-center gap-6">
            {onReplayEntrance && (
              <button
                type="button"
                onClick={onReplayEntrance}
                className="uppercase transition-colors hover:text-[#eaeaea] focus-visible:outline-2 focus-visible:outline-[#c81018]"
              >
                {t.footer.entranceGate}
              </button>
            )}
            <a
              href="#home"
              className="uppercase transition-colors hover:text-[#eaeaea] focus-visible:outline-2 focus-visible:outline-[#c81018]"
            >
              {t.footer.backToTop}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
