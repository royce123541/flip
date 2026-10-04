import { useState } from 'react'
import { FileText, Lock, Sparkles } from '@/components/pixel/icons'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { FileDropzone } from '@/components/flip/FileDropzone'
import { UsageMeter } from '@/components/flip/UsageMeter'
import { useGenerate, useMe, type GenerateResult } from '@/hooks/useGenerate'
import { ApiError } from '@/lib/api'
import { saveDraft } from '@/lib/generated'

const MIN_CHARS = 100
const MAX_CHARS = 48_000

export default function Generate() {
  const navigate = useNavigate()
  const { data: me } = useMe()
  const generate = useGenerate()
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isPro = me?.plan === 'pro'
  const limit = me?.ai.limit ?? null
  const outOfQuota = limit !== null && (me?.ai.used ?? 0) >= limit
  const length = text.trim().length
  const textValid = length >= MIN_CHARS && length <= MAX_CHARS

  const run = (input: { text: string } | { file: File }) => {
    setError(null)
    generate.mutate(input, {
      onSuccess: (r: GenerateResult) => {
        saveDraft({ cards: r.cards, truncated: r.truncated })
        navigate('/generate/review')
      },
      onError: (e) => {
        const message = e instanceof ApiError || e instanceof Error ? e.message : 'Something went wrong'
        setError(message)
        toast.error(message)
      },
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Sparkles className="size-7" aria-hidden /> Generate with AI
        </h1>
        <p className="mt-1 text-muted-foreground">Turn your notes into flashcards and quiz questions. You can review everything before saving.</p>
      </div>

      {me && limit !== null && <UsageMeter used={me.ai.used} limit={limit} />}

      <Tabs defaultValue="text">
        <TabsList>
          <TabsTrigger value="text">
            <FileText /> Paste text
          </TabsTrigger>
          <TabsTrigger value="pdf">
            {!isPro && <Lock />} Upload PDF {!isPro && <Badge variant="secondary">Pro</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-3 pt-4">
          <Label htmlFor="notes">Your notes</Label>
          <Textarea
            id="notes"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            placeholder="Paste lecture notes, a textbook passage, or an article…"
            aria-describedby="notes-hint"
          />
          <p id="notes-hint" className={length > MAX_CHARS ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'}>
            {length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters{length < MIN_CHARS && ` · at least ${MIN_CHARS} needed`}
          </p>
          <Button onClick={() => run({ text: text.trim() })} disabled={!textValid || generate.isPending || outOfQuota}>
            <Sparkles /> {generate.isPending ? 'Generating…' : 'Generate cards'}
          </Button>
        </TabsContent>

        <TabsContent value="pdf" className="space-y-3 pt-4">
          {isPro ? (
            <>
              <FileDropzone onFile={setFile} onError={(m) => toast.error(m)} />
              {file && <p className="text-sm">Selected: <span className="font-medium">{file.name}</span></p>}
              <Button onClick={() => file && run({ file })} disabled={!file || generate.isPending || outOfQuota}>
                <Sparkles /> {generate.isPending ? 'Reading and generating…' : 'Generate cards'}
              </Button>
            </>
          ) : (
            <div className="space-y-2 border-3 border-dashed border-outline bg-card p-8 text-center">
              <Lock className="mx-auto size-8 text-muted-foreground" aria-hidden />
              <p className="font-medium">PDF upload is a Pro feature</p>
              <p className="text-sm text-muted-foreground">Upgrade to turn whole PDFs into decks. Pasting text works on the free plan.</p>
              <Button render={<Link to="/pricing" />} nativeButton={false}>See Pro</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {outOfQuota && <p role="alert" className="text-sm text-destructive">You have used all your free generations this month. <Link className="underline" to="/pricing">Upgrade to Pro</Link> or <Link className="underline" to="/decks/new">create decks manually</Link>.</p>}
    </div>
  )
}
