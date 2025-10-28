# Contentful CLI - Organization command

## Available subcommands:

- [list](./list) - List all Organizations you have access to
- [export](./export) - Export a organization data to a json file
- sec-check - Run organization security checks (permission, security contact, SSO, MFA)

## sec-check
Runs a series of security checks and outputs a JSON object keyed by check id.

| Check | Description |
|-------|-------------|
| `permission_check` | Validates user has sufficient privileges (owner/admin) to perform security checks  |
| `security_contact_set` | Ensures ≥1 security contact is configured |
| `audit_logging_configured` | Confirms audit logging is enabled |
| `active_tokens_without_expiry` | Flags non-expiring active access tokens |
| `sso_enabled` | Validates SSO is enabled |
| `sso_enforced` | Validates SSO restricted mode is on |
| `sso_exempt_users` | Flags users exempt from SSO enforcement |
| `sso_exempt_users_with_mfa_disabled` | Flags SSO-exempt users without MFA |

Example usage:
```
contentful organization sec-check --organization-id <org_id>
```
Outputs JSON with fields:
```
{
  "permission_check": {
    "description": "User has owner or admin role in the organization",
    "pass": true
  },
  "security_contact_set": {
    "description": "Security contact is configured for the organization",
    "pass": true,
    "data": {
      "contactCount": 1
    }
  },
  "audit_logging_configured": {
    "description": "Audit logging is configured for the organization",
    "pass": true,
    "data": {
      "itemCount": 1
    }
  },
  "active_tokens_without_expiry": {
    "description": "Active (not revoked) access tokens without an expiration date (revokedAt=null & sys.expiresAt=null).",
    "pass": false,
    "data": {
      "offendingCount": 6
    }
  },
  "sso_enabled": {
    "description": "SSO is enabled for the organization",
    "pass": true
  },
  "sso_enforced": {
    "description": "SSO is enforced (restricted) for the organization",
    "pass": true
  },
  "sso_exempt_users": {
    "description": "Check if users are exempted from SSO restricted mode (bypass SSO).",
    "pass": false,
    "data": {
      "exemptUserIds": [
        "2qEuWkv9GLQ8ypPK96xjZk"
      ],
      "exemptCount": 1
    }
  },
  "sso_exempt_users_with_mfa_disabled": {
    "description": "Exempt users have MFA (2FA) enabled (reports users without MFA).",
    "pass": false,
    "data": {
      "mfaDisabledUsers": [
        {
          "id": "2qEuWkv9GLQ8ypPK96xjZk",
          "email": "hussam.khrais+test@foo.com"
        }
      ],
      "mfaDisabledCount": 1
    }
  }
}
```
A check with pass:false indicates action required.
