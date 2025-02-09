<!--
Hello!

This pull request template is designed to promote thoughtful development and ensure stable deployments.
The goal is to increase awareness around testing, monitoring, and the rollout process.

**Instructions**:
Please complete all sections thoughtfully. The code reviewer and code owners will assist you during the review process by suggesting additional tests, metrics, or improvements.

If you have suggestions for improving this template, please share them in `#github-rollout-plan-feedback`.
-->

### Background

<!--
Provide context for this pull request:

1. Why did you choose this approach to address the relevant Jira issue? This helps reviewers understand your solution and its constraints.
2. Highlight any open questions or problems in this PR that you would like the reviewer to focus on. For example, specific areas in the code or alternative approaches to consider.

Additionally, suggest how the reviewer should approach your PR. For instance:
* "Review `file_x.rb` first to understand the core logic, then proceed to other changes."
* "Review commit by commit for clarity."

Make your review process as efficient as possible.
-->


---

### Tests

<!--
Detail your testing strategy:

1. **Mark all relevant tests below**: 
   Indicate which types of tests have been executed or are planned for this change.

2. **Provide additional context where needed**:
* For automation tests, include a link to the Jira task if they are being tracked separately. If these tests won't be merged soon, explain why.
* For performance tests, describe your approach, e.g., load tests in staging, micro-benchmarks, or query execution plans with examples for different Merchant parameters.

3. **Consider both pre-merge and post-deployment testing**:
   Specify what sanity checks or validations are needed post-deployment (& pre-rollout).

Guideline: https://bringg.atlassian.net/wiki/spaces/RD/pages/3981214008/Testing+Guidelines
-->

* [ ] Unit tests
* [ ] Automation tests - will check if we have coverage in mobile automation suite, if so, will run it with this PR prior to merging.
* [ ] Manual tests (conducted in QA or Staging)
* [ ] Performance tests


---

### Monitoring

<!--
Define your monitoring strategy for this change:

1. List relevant alerts and metrics that will track the success of this change. 
* If no such alerts or metrics exist, make sure to create them before deployment.

2. For feature flag rollouts:
* Describe how you will **proactively monitor** the change during rollout.

This ensures that potential issues are caught early and resolved quickly.

We won't mention Airbrake/Sentry errors as "Monitoring", monitoring of those errors should be done by default.

Guideline: https://bringg.atlassian.net/wiki/spaces/RD/pages/3980394954/Monitoring+Guidelines

-->


---

### Rollout Plan

<!--
Describe your rollout strategy:

1. For feature flag rollouts:
* You will use FRM, so just specify "Using FRM for feature flag rollout"

2. If feature flags cannot be used, explain why:
* Detail the blockers preventing feature flag usage.

Emphasize safety and risk mitigation during the rollout.

Guidelines: https://bringg.atlassian.net/wiki/spaces/RD/pages/3982164053/Rollout+Plan and https://bringg.atlassian.net/wiki/spaces/RD/pages/3981738160/Rollback+Procedure
-->
