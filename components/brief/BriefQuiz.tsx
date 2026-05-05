'use client';

// ──────────────────────────────────────────────────────────────────────────
// BriefQuiz — the editorial 2-minute wedding-planning quiz at /brief.
//
// Structure:
//   welcome → 7 questions → transition → submit → redirect to /brief/[id]
//
// The flow is fully client-side until the final submit; only the last step
// hits Supabase via /api/brief. State lives in this component's reducer so
// back-arrow navigation preserves prior answers without a router round-trip.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useReducer } from 'react';
import { useRouter } from 'next/navigation';

import { Welcome } from './Welcome';
import { Transition } from './Transition';
import { Question1Events } from './questions/Q1Events';
import { Question2Guests } from './questions/Q2Guests';
import { Question3Budget } from './questions/Q3Budget';
import { Question4Vibe } from './questions/Q4Vibe';
import { Question5Destination } from './questions/Q5Destination';
import { Question6Priorities } from './questions/Q6Priorities';
import { Question7Timeline } from './questions/Q7Timeline';
import { BriefShell } from './BriefShell';
import type { BriefAnswers } from '@/lib/brief/types';

type Step =
  | 'welcome'
  | 'q1'
  | 'q2'
  | 'q3'
  | 'q4'
  | 'q5'
  | 'q6'
  | 'q7'
  | 'transition';

type State = {
  step: Step;
  answers: Partial<BriefAnswers>;
  submitting: boolean;
  error: string | null;
};

type Action =
  | { type: 'GO'; step: Step }
  | { type: 'BACK' }
  | { type: 'ANSWER'; patch: Partial<BriefAnswers> }
  | { type: 'SUBMITTING' }
  | { type: 'ERROR'; message: string };

const FLOW: Step[] = ['welcome', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'transition'];

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'GO':
      return { ...state, step: action.step, error: null };
    case 'BACK': {
      const idx = FLOW.indexOf(state.step);
      if (idx <= 0) return state;
      return { ...state, step: FLOW[idx - 1], error: null };
    }
    case 'ANSWER':
      return { ...state, answers: { ...state.answers, ...action.patch } };
    case 'SUBMITTING':
      return { ...state, submitting: true, error: null };
    case 'ERROR':
      return { ...state, submitting: false, error: action.message };
    default:
      return state;
  }
}

export function BriefQuiz() {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, {
    step: 'welcome',
    answers: {},
    submitting: false,
    error: null,
  });

  // When we hit the transition step, kick off the network save in parallel
  // with the loading animation. The animation has 3 lines (~2.5s); we want
  // to never beat it to the punch but also not leave them waiting if the
  // request is slow.
  useEffect(() => {
    if (state.step !== 'transition') return;
    const answers = state.answers as BriefAnswers;
    let cancelled = false;
    const animationMin = new Promise((r) => setTimeout(r, 2400));
    dispatch({ type: 'SUBMITTING' });

    (async () => {
      try {
        const res = await fetch('/api/brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answers),
        });
        const json = await res.json();
        if (!res.ok || !json.public_id) {
          throw new Error(json.error || 'Could not save your brief.');
        }
        await animationMin;
        if (!cancelled) router.push(`/brief/${json.public_id}`);
      } catch (err) {
        if (!cancelled) {
          dispatch({
            type: 'ERROR',
            message: err instanceof Error ? err.message : 'Something went wrong.',
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.step, state.answers, router]);

  // Auto-advance helper used by every question. 500ms pause so the user
  // sees their selection highlight before the slide.
  const advance = (next: Step, patch: Partial<BriefAnswers>) => {
    dispatch({ type: 'ANSWER', patch });
    setTimeout(() => dispatch({ type: 'GO', step: next }), 500);
  };

  const back = () => dispatch({ type: 'BACK' });

  if (state.step === 'welcome') {
    return <Welcome onStart={() => dispatch({ type: 'GO', step: 'q1' })} />;
  }

  if (state.step === 'transition') {
    return <Transition error={state.error} onRetry={() => dispatch({ type: 'GO', step: 'q7' })} />;
  }

  const stepIndex = FLOW.indexOf(state.step); // 1..7 for q1..q7

  return (
    <BriefShell stepIndex={stepIndex} onBack={back}>
      {state.step === 'q1' && (
        <Question1Events
          value={state.answers.events ?? null}
          onPick={(v) => advance('q2', { events: v })}
        />
      )}
      {state.step === 'q2' && (
        <Question2Guests
          value={state.answers.guests ?? null}
          onPick={(v) => advance('q3', { guests: v })}
        />
      )}
      {state.step === 'q3' && (
        <Question3Budget
          value={state.answers.budget ?? null}
          onPick={(v) => advance('q4', { budget: v })}
        />
      )}
      {state.step === 'q4' && (
        <Question4Vibe
          value={state.answers.vibe ?? null}
          onPick={(v) => advance('q5', { vibe: v })}
        />
      )}
      {state.step === 'q5' && (
        <Question5Destination
          value={state.answers.destination ?? null}
          onPick={(v) => advance('q6', { destination: v })}
        />
      )}
      {state.step === 'q6' && (
        <Question6Priorities
          value={state.answers.priorities ?? null}
          onSubmit={(v) => advance('q7', { priorities: v })}
        />
      )}
      {state.step === 'q7' && (
        <Question7Timeline
          value={state.answers.timeline ?? null}
          onPick={(v) => advance('transition', { timeline: v })}
        />
      )}
    </BriefShell>
  );
}
