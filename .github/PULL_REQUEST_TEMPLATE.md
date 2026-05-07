## What does this PR do?

<!-- Brief description of the change -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Security fix
- [ ] Performance improvement
- [ ] Refactor
- [ ] Chore / dependency update

## Checklist

- [ ] `npm run build` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] New API routes call `requireAuth()` or are intentionally public
- [ ] New public routes call `checkRateLimit()`
- [ ] Input validated with Zod
- [ ] No raw `error.message` returned to client
- [ ] No `console.log` left in code
- [ ] New DB tables have RLS policies
- [ ] No secrets committed

## Related issues

<!-- Closes #123 -->
