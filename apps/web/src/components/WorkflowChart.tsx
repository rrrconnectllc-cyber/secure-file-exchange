const steps = [
  {
    title: 'Open the matter',
    body: 'Name the case and the client. Documents filed after this stay on that matter.',
  },
  {
    title: 'File the document',
    body: 'Upload the contract, letter, or agreement onto the matter it belongs to.',
  },
];

function Node({ children }: { children: string }) {
  return (
    <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy font-mono text-sm text-white">
      {children}
    </span>
  );
}

function Arrow({ label }: { label?: string }) {
  return (
    <li className="flex gap-4" aria-hidden="true">
      <span className="flex w-9 justify-center">
        <svg viewBox="0 0 16 36" className="h-9 w-4 text-cerulean">
          <line x1="8" y1="0" x2="8" y2="24" stroke="currentColor" strokeWidth="2" />
          <path d="M3 22l5 10 5-10" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </span>
      {label && <span className="self-center text-sm font-medium text-success-800">{label}</span>}
    </li>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <li className="flex gap-4">
      <Node>{number}</Node>
      <div className="min-w-0 pt-0.5">
        <h3 className="font-display text-2xl font-medium leading-tight text-navy">{title}</h3>
        <p className="mt-2 max-w-xl text-ink">{body}</p>
      </div>
    </li>
  );
}

export function WorkflowChart() {
  return (
    <ol className="m-0 flex list-none flex-col gap-2 p-0">
      <Step number="1" title={steps[0].title} body={steps[0].body} />
      <Arrow />
      <Step number="2" title={steps[1].title} body={steps[1].body} />
      <Arrow />
      <li className="flex gap-4">
        <span className="relative mt-1 flex h-9 w-9 shrink-0 items-center justify-center" aria-hidden="true">
          <span className="absolute inset-0.5 rotate-45 border-2 border-navy bg-white" />
          <span className="relative font-mono text-sm text-navy">3</span>
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="font-display text-2xl font-medium leading-tight text-navy">Approve or send it back</h3>
          <p className="mt-2 max-w-xl text-ink">
            A colleague releases the document or rejects it. The decision keeps their name and the time.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="border-t-2 border-success-700 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-success-800">Approved</p>
              <p className="mt-1 text-sm text-ink">The document continues to the client.</p>
            </div>
            <div className="border-t-2 border-danger-600 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-danger-700">Rejected</p>
              <p className="mt-1 text-sm text-ink">The document stays on the matter.</p>
            </div>
          </div>
        </div>
      </li>
      <Arrow label="Approved" />
      <Step
        number="4"
        title="Ask the client to accept"
        body="The client opens a link and types their name. The acceptance is added to the activity report."
      />
    </ol>
  );
}
