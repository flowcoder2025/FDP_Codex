# Roadmap

Status: public baseline, pre-release.

This roadmap describes intended maturity gates. It is not a release schedule and does not authorize deployment, package publication, tagged releases, or OSS program submission.

## Public Bootstrap Baseline

Current focus:

- public repository metadata and license
- context hygiene and SSOT manifest
- WI/KI lifecycle policy
- GitHub issue and PR governance
- branch-first Git workflow
- validation workflow in GitHub Actions
- public contribution and security guidance

## v0.1 Release Candidate Boundary

A first tagged release candidate should wait until all of the following are true:

- core policies needed for public contributors are locked or explicitly marked accepted-v0
- validator behavior covers manifest, flow-state, GitHub template, and handoff hygiene without known false-green gaps
- context pack builder has a stable metadata contract
- at least one sample WI/KI cycle is documented and validated
- all Critical and High KIs that block public release are repaid or explicitly canceled
- release notes, tag policy, and artifact boundary are approved in a decision record

## v0.2 Workflow Kit Candidate

Potential scope after the first release candidate:

- stricter manifest parsing
- link and reference checker
- example target project workflow
- deferred verification repayment examples
- contributor-facing triage examples
- blind and adversarial review checklists per surface type

## OSS Program Readiness Candidate

OpenAI OSS program application remains out of scope until the project has evidence beyond repository hygiene:

- validated sample workflow
- clear maintainer story
- public contribution flow with issue/PR evidence
- security reporting path
- release or release-candidate evidence
- concise project narrative and differentiator

## Explicitly Out Of Scope For Current Approval

- deployment
- package publication
- release publication
- OSS program form submission
- importing private FDP_APP implementation history