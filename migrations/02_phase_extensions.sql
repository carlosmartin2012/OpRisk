-- Phase extensions: KRIs, Issues, Scenarios, Appetite, DORA (Vendors / BIA / ICT Incidents), Integrations
-- Run this in Supabase SQL editor when ready to share these entities across users.
-- Until then, the app will use localStorage as fallback for these tables.

create table if not exists kris (
    id text primary key,
    name text,
    description text,
    "riskId" text,
    owner text,
    unit text,
    "currentValue" numeric,
    "greenMax" numeric,
    "amberMax" numeric,
    frequency text,
    trend text,
    "lastUpdated" text
);

create table if not exists issues (
    id text primary key,
    title text,
    description text,
    source text,
    "sourceId" text,
    severity text,
    owner text,
    "createdDate" text,
    "dueDate" text,
    status text
);

create table if not exists scenarios (
    id text primary key,
    name text,
    description text,
    "eventType" text,
    "businessLine" text,
    "frequencyPerYear" numeric,
    "severityMin" numeric,
    "severityMode" numeric,
    "severityMax" numeric,
    owner text
);

create table if not exists appetite (
    id text primary key,
    scope text,
    metric text,
    threshold numeric,
    unit text,
    period text,
    actual numeric,
    status text
);

create table if not exists vendors (
    id text primary key,
    name text,
    service text,
    criticality text,
    country text,
    "contractEnd" text,
    "exitPlan" text,
    "ictThirdParty" boolean
);

create table if not exists bias (
    id text primary key,
    "processId" text,
    "rtoHours" numeric,
    "rpoHours" numeric,
    "mtpdHours" numeric,
    criticality text,
    "reviewedDate" text
);

create table if not exists ict_incidents (
    id text primary key,
    title text,
    "detectedDate" text,
    classification text,
    "durationHours" numeric,
    "clientsAffected" numeric,
    "servicesAffected" text,
    "rootCause" text,
    status text
);

create table if not exists integrations (
    id text primary key,
    name text,
    type text,
    description text,
    status text,
    "lastSync" text,
    endpoint text
);

-- Extend events with Basel fields (idempotent)
alter table events add column if not exists "dateOccurrence" text;
alter table events add column if not exists "dateAccounting" text;
alter table events add column if not exists "recoveryDirect" numeric;
alter table events add column if not exists "recoveryInsurance" numeric;
alter table events add column if not exists "isNearMiss" boolean;
alter table events add column if not exists "controlFailedId" text;

-- Extend risks with maker-checker fields (idempotent)
alter table risks add column if not exists "approvalStatus" text;
alter table risks add column if not exists "approvedBy" text;
alter table risks add column if not exists "approvedDate" text;
