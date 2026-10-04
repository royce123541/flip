/** Shown instead of the app when client/.env has no Firebase keys (otherwise the page would just be blank). */
export function SetupNotice() {
  return (
    <main className="mx-auto max-w-xl space-y-4 p-8">
      <h1 className="text-2xl font-bold">Flip needs a little setup</h1>
      <p className="text-muted-foreground">The Firebase settings are missing, so sign-in cannot work yet.</p>
      <ol className="list-decimal space-y-2 pl-5">
        <li>
          Copy <code className="rounded bg-muted px-1">client/.env.example</code> to <code className="rounded bg-muted px-1">client/.env</code>.
        </li>
        <li>
          In the Firebase console, open Project settings, then your web app, and copy its config values into the four{' '}
          <code className="rounded bg-muted px-1">VITE_FIREBASE_*</code> lines.
        </li>
        <li>Stop and restart <code className="rounded bg-muted px-1">npm run dev</code> (Vite only reads .env on start).</li>
      </ol>
      <p className="text-sm text-muted-foreground">See the README for the full walkthrough.</p>
    </main>
  )
}
