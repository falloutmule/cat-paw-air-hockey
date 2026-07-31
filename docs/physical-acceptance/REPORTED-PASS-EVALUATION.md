# Exact canonical Galaxy S21 Ultra acceptance — evaluation trigger

Recorded: 2026-07-30T17:29:00-06:00

Status: `REPORTED PASS`

User report:

> Exact canonical Galaxy S21 Ultra acceptance is REPORTED PASS.

Known device context:

- Samsung Galaxy S21 Ultra
- model identifier: SM-G998U1
- Android 15
- stable Android Chrome

This report requests binding to the canonical artifact produced by the pinned SFHS toolchain and an official `sfhs release prepare` evaluation. Numeric Chrome version, measured portrait and landscape viewport dimensions/DPR, and bound screenshots were not supplied and must not be invented.

Evaluation retry: staged archive input is sanitized to the Base64 alphabet before exact SHA-256 validation.

Evaluation retry 2: each staged source chunk is truncated to its expected byte count and validated by exact per-part SHA-256 before reconstruction.
