"use client";

import { useRef, useState } from "react";

const PROJECT_TYPES = ["Kitchen", "Bathroom", "Closet", "Outdoor", "Full Interior", "Other"];
const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

const size = (bytes: number) => (bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`);

type Field = "name" | "email" | "projectType" | "message";

export function ContactForm({ disabled = false }: { disabled?: boolean }) {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [bad, setBad] = useState<Set<Field>>(new Set());
  const [dragging, setDragging] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const done = useRef<HTMLDivElement>(null);

  const addFiles = (incoming: FileList | File[]) => {
    const next = [...files];
    let problem = "";
    for (const file of Array.from(incoming)) {
      if (next.length >= MAX_FILES) {
        problem = `You can attach up to ${MAX_FILES} files.`;
        break;
      }
      if (file.size > MAX_FILE_BYTES) {
        problem = `${file.name} is larger than 10 MB.`;
        continue;
      }
      next.push(file);
    }
    setFiles(next);
    setFileError(problem);
  };

  const check = (data: FormData): Set<Field> => {
    const problems = new Set<Field>();
    if (!String(data.get("name") ?? "").trim()) problems.add("name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.get("email") ?? "").trim())) problems.add("email");
    if (!data.get("projectType")) problems.add("projectType");
    if (!String(data.get("message") ?? "").trim()) problems.add("message");
    return problems;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const problems = check(data);
    setBad(problems);
    if (problems.size > 0) {
      event.currentTarget.querySelector<HTMLElement>(`[name="${[...problems][0]}"]`)?.focus();
      return;
    }
    data.delete("files");
    files.forEach((file) => data.append("files", file));
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/inquiry", { method: "POST", body: data });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(typeof body?.message === "string" ? body.message : "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
      setFiles([]);
      setTimeout(() => done.current?.focus({ preventScroll: true }), 0);
    } catch {
      setError("We could not send your inquiry right now. Please try again in a moment.");
    } finally {
      setPending(false);
    }
  };

  const field = (name: Field) => ({
    name,
    "aria-invalid": bad.has(name) || undefined,
    onInput: (event: React.FormEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const owner = event.currentTarget.form;
      if (bad.has(name) && owner) setBad(check(new FormData(owner)));
    },
  });

  if (sent) {
    return (
      <div ref={done} className="cf-panel !p-8 outline-none" role="status" tabIndex={-1}>
        <p className="eyebrow text-taupe-ink">Inquiry received</p>
        <p className="serif text-h3 mt-6 max-w-[30rem]">Thank you. We’ve received your project inquiry and will be in touch soon.</p>
      </div>
    );
  }

  return (
    <form ref={form} className="cf-panel" noValidate onSubmit={onSubmit}>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className={`cf-f ${bad.has("name") ? "bad" : ""}`}>
          <label className="cf-l" htmlFor="cf-name">
            Full Name <span aria-hidden="true">*</span>
          </label>
          <input id="cf-name" type="text" autoComplete="name" placeholder="Your name" required className="cf-i" {...field("name")} />
          <p className="cf-err" role="alert">
            Please enter your name.
          </p>
        </div>
        <div className={`cf-f ${bad.has("email") ? "bad" : ""}`}>
          <label className="cf-l" htmlFor="cf-email">
            Email Address <span aria-hidden="true">*</span>
          </label>
          <input id="cf-email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" required className="cf-i" {...field("email")} />
          <p className="cf-err" role="alert">
            Please enter a valid email address.
          </p>
        </div>
      </div>
      <div className={`cf-f ${bad.has("projectType") ? "bad" : ""}`}>
        <label className="cf-l" htmlFor="cf-type">
          Project Type <span aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <select id="cf-type" required defaultValue="" className="cf-i cf-sel" {...field("projectType")}>
            <option value="" disabled>
              Select a project type
            </option>
            {PROJECT_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-taupe-ink" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </div>
        <p className="cf-err" role="alert">
          Please choose a project type.
        </p>
      </div>
      <div className="cf-f">
        <div className="flex items-baseline justify-between gap-4">
          <span className="cf-l" id="cf-up-l">
            Upload Images
          </span>
          <span className="text-[0.75rem] text-taupe-ink">Optional</span>
        </div>
        <label
          htmlFor="cf-files"
          className={`cf-drop flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 cursor-pointer ${dragging ? "drag" : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            addFiles(event.dataTransfer.files);
          }}
        >
          <span className="text-[0.875rem] text-taupe-ink">Upload photos, plans, or inspiration</span>
          <span className="btn btn-line btn-sm pointer-events-none">+ Add files</span>
        </label>
        <input
          id="cf-files"
          type="file"
          multiple
          accept="image/*,.pdf"
          className="sr-only"
          aria-labelledby="cf-up-l"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = "";
          }}
        />
        {fileError && (
          <p className="text-[0.875rem] text-[#b42318]" role="alert">
            {fileError}
          </p>
        )}
        {files.length > 0 && (
          <ul className="flex flex-col gap-2">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="cf-file">
                <span className="min-w-0 truncate">
                  {file.name} <span className="text-taupe-ink">· {size(file.size)}</span>
                </span>
                <button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles(files.filter((_, i) => i !== index))}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={`cf-f ${bad.has("message") ? "bad" : ""}`}>
        <label className="cf-l" htmlFor="cf-msg">
          Tell us about your project <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="cf-msg"
          rows={5}
          required
          placeholder="Tell us about your space, ideas, needs, or what you're looking to create..."
          className="cf-i cf-ta"
          {...field("message")}
        />
        <p className="cf-err" role="alert">
          Please tell us a little about your project.
        </p>
      </div>
      {error && (
        <p className="text-[0.875rem] text-[#b42318]" role="alert">
          {error}
        </p>
      )}
      {disabled ? (
        <p className="text-[0.875rem] text-taupe-ink">The form is not active in this preview.</p>
      ) : (
        <button type="submit" className="btn btn-dark btn-lg w-full mt-1" disabled={pending}>
          {pending ? "Sending…" : "Send Project Inquiry"} <span className="arrow">→</span>
        </button>
      )}
    </form>
  );
}
