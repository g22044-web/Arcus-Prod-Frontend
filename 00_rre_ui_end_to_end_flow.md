# RRE-UI End-to-End Business Process Flow

This high-level diagram summarizes the main lifecycle in RRE-UI from account and buying center setup through SOW creation, allocation, execution, utilization monitoring, NPS, reporting and exception handling.

```mermaid
flowchart TD
    A["Account & Org Setup\n(Account, Org Structure, URL Mapping)"] --> B["Buying Center & Stakeholders\n(Stakeholders, FS Partners, CNPS Planning)"]
    B --> C["SOW Lifecycle\n(Create, Approve, Team & Billing Setup)"]
    C --> D["Resource Planning & Allocation\n(Demand vs Supply, Bench, Priority Hiring)"]
    D --> E["Execution & Utilization\n(Monthly Utilization, Weekly Usage)"]
    E --> F["Revenue & Reporting\n(Recognised Revenue, Pipeline, Bench & Investment)"]
    F --> G["NPS & Account Health\n(CNPS Summary, Buying Center Heatmaps)"]
    G --> H["Workflow & Exceptions\n(Approvals, Revenue Loss, Allocation Conflicts)"]
    H --> D
    D --> I["Admin & Access Control\n(Roles, Permissions, Session Tracking)"]
    I --> B
```

This view is further elaborated and referenced in the master BUSINESS_REQUIREMENTS_DOCUMENT.md.
