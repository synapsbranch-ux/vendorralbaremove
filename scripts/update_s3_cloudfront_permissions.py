#!/usr/bin/env python3
"""
Update S3 bucket policy and CORS to allow a CloudFront distribution from .env.

Default mode is dry-run (no remote write).
Use --apply to push changes.

Expected .env keys:
  S3_ACCESS_KEY
  S3_SECRET_KEY
  S3_REGION
  S3BUCKET
  DISTRIBUTION
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Tuple

import boto3
from botocore.exceptions import ClientError


def parse_env_file(path: Path) -> Dict[str, str]:
    values: Dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        raw = line.strip()
        if not raw or raw.startswith("#") or "=" not in raw:
            continue
        key, val = raw.split("=", 1)
        values[key.strip()] = val.strip().strip('"').strip("'")
    return values


def required_env(env: Dict[str, str], key: str) -> str:
    val = env.get(key, "").strip()
    if not val:
        raise ValueError(f"Missing required env key: {key}")
    return val


def load_bucket_policy(s3: Any, bucket: str) -> Dict[str, Any]:
    try:
        resp = s3.get_bucket_policy(Bucket=bucket)
        return json.loads(resp["Policy"])
    except ClientError as err:
        code = err.response.get("Error", {}).get("Code", "")
        if code in {"NoSuchBucketPolicy", "NoSuchBucket", "404"}:
            return {"Version": "2012-10-17", "Statement": []}
        raise


def canonical_statement(statement: Any) -> List[Dict[str, Any]]:
    if isinstance(statement, list):
        return [s for s in statement if isinstance(s, dict)]
    if isinstance(statement, dict):
        return [statement]
    return []


def upsert_cloudfront_statement(
    policy: Dict[str, Any],
    bucket: str,
    distribution_arn: str,
    distribution_id: str,
) -> Tuple[Dict[str, Any], bool]:
    policy = dict(policy)
    statements = canonical_statement(policy.get("Statement", []))

    desired_resource = f"arn:aws:s3:::{bucket}/*"
    desired = {
        "Sid": f"AllowCloudFrontReadOnly{distribution_id}",
        "Effect": "Allow",
        "Principal": {"Service": "cloudfront.amazonaws.com"},
        "Action": "s3:GetObject",
        "Resource": desired_resource,
        "Condition": {"StringEquals": {"AWS:SourceArn": distribution_arn}},
    }

    changed = False
    replaced = False
    for idx, stmt in enumerate(statements):
        principal = stmt.get("Principal", {})
        service = (
            principal.get("Service")
            if isinstance(principal, dict)
            else None
        )
        action = stmt.get("Action")
        resource = stmt.get("Resource")
        cond = stmt.get("Condition", {})
        src_arn = (
            cond.get("StringEquals", {}).get("AWS:SourceArn")
            if isinstance(cond, dict)
            else None
        )

        action_match = action == "s3:GetObject" or (
            isinstance(action, list) and "s3:GetObject" in action
        )
        resource_match = resource == desired_resource

        if (
            service == "cloudfront.amazonaws.com"
            and action_match
            and resource_match
            and (src_arn == distribution_arn or stmt.get("Sid", "").endswith(distribution_id))
        ):
            if stmt != desired:
                statements[idx] = desired
                changed = True
            replaced = True
            break

    if not replaced:
        statements.append(desired)
        changed = True

    policy["Version"] = policy.get("Version", "2012-10-17")
    policy["Statement"] = statements
    return policy, changed


def load_bucket_cors(s3: Any, bucket: str) -> List[Dict[str, Any]]:
    try:
        resp = s3.get_bucket_cors(Bucket=bucket)
        return list(resp.get("CORSRules", []))
    except ClientError as err:
        code = err.response.get("Error", {}).get("Code", "")
        if code in {"NoSuchCORSConfiguration", "NoSuchBucket", "404"}:
            return []
        raise


def normalize_allowed_origins(aliases: List[str], cf_domain: str) -> List[str]:
    origins = set()
    if cf_domain:
        origins.add(f"https://{cf_domain}")
    for alias in aliases:
        a = alias.strip()
        if not a:
            continue
        origins.add(f"https://{a}")
    return sorted(origins)


def upsert_cors_rules(
    rules: List[Dict[str, Any]],
    origins_to_add: List[str],
) -> Tuple[List[Dict[str, Any]], bool]:
    rules = list(rules)
    changed = False

    target_idx = None
    for idx, rule in enumerate(rules):
        methods = set(rule.get("AllowedMethods", []))
        headers = set(rule.get("AllowedHeaders", []))
        if {"GET", "HEAD"}.issubset(methods) and ("*" in headers or not headers):
            target_idx = idx
            break

    if target_idx is None:
        rules.append(
            {
                "AllowedHeaders": ["*"],
                "AllowedMethods": ["GET", "HEAD"],
                "AllowedOrigins": origins_to_add,
                "ExposeHeaders": ["ETag", "x-amz-request-id", "x-amz-id-2"],
                "MaxAgeSeconds": 3000,
            }
        )
        return rules, True

    target = dict(rules[target_idx])
    current_origins = set(target.get("AllowedOrigins", []))
    merged_origins = sorted(current_origins.union(origins_to_add))
    if merged_origins != sorted(current_origins):
        target["AllowedOrigins"] = merged_origins
        rules[target_idx] = target
        changed = True
    return rules, changed


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Update S3 bucket policy/CORS for a CloudFront distribution."
    )
    parser.add_argument(
        "--env-file",
        default=".env",
        help="Path to .env file (default: ./.env)",
    )
    parser.add_argument(
        "--bucket",
        default="",
        help="Override S3 bucket target (default: S3BUCKET from env file).",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Apply changes to AWS (default is dry-run).",
    )
    args = parser.parse_args()

    env_path = Path(args.env_file).resolve()
    if not env_path.exists():
        raise FileNotFoundError(f".env file not found: {env_path}")

    env = parse_env_file(env_path)
    access_key = required_env(env, "S3_ACCESS_KEY")
    secret_key = required_env(env, "S3_SECRET_KEY")
    region = required_env(env, "S3_REGION")
    bucket = args.bucket.strip() or required_env(env, "S3BUCKET")
    distribution_id = required_env(env, "DISTRIBUTION")

    session = boto3.Session(
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name=region,
    )
    s3 = session.client("s3")
    cf = session.client("cloudfront")

    # Preflight checks
    s3.head_bucket(Bucket=bucket)
    dist_resp = cf.get_distribution(Id=distribution_id)
    dist = dist_resp["Distribution"]
    dist_arn = dist["ARN"]
    dist_domain = dist.get("DomainName", "")
    dist_aliases = dist.get("DistributionConfig", {}).get("Aliases", {}).get("Items", []) or []
    dist_origins = [
        o.get("DomainName", "")
        for o in dist.get("DistributionConfig", {}).get("Origins", {}).get("Items", [])
    ]

    print(f"Bucket: {bucket}")
    print(f"Distribution: {distribution_id}")
    print(f"Distribution ARN: {dist_arn}")
    print(f"Distribution aliases: {dist_aliases}")
    print(f"Distribution origins: {dist_origins}")
    if not any(bucket in origin for origin in dist_origins):
        print(
            f"WARNING: Distribution {distribution_id} does not appear to use bucket {bucket} as origin."
        )

    policy_before = load_bucket_policy(s3, bucket)
    policy_after, policy_changed = upsert_cloudfront_statement(
        policy_before, bucket, dist_arn, distribution_id
    )

    cors_before = load_bucket_cors(s3, bucket)
    origins_to_add = normalize_allowed_origins(dist_aliases, dist_domain)
    cors_after, cors_changed = upsert_cors_rules(cors_before, origins_to_add)

    print(f"Policy change needed: {policy_changed}")
    print(f"CORS change needed: {cors_changed}")

    if not args.apply:
        print("Dry-run complete. Use --apply to push changes.")
        return 0

    if policy_changed:
        s3.put_bucket_policy(Bucket=bucket, Policy=json.dumps(policy_after, separators=(",", ":")))
        print("Bucket policy updated.")
    else:
        print("Bucket policy unchanged.")

    if cors_changed:
        s3.put_bucket_cors(
            Bucket=bucket,
            CORSConfiguration={"CORSRules": cors_after},
        )
        print("Bucket CORS updated.")
    else:
        print("Bucket CORS unchanged.")

    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
