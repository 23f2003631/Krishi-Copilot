import json
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

from app.config import Settings
from app.models.contracts import CampaignContextRequest, ContentApprovalRequest, ContentGenerationRequest
from app.repositories.demo import DemoRepository


class SupabaseCampaignRepository:
    def __init__(self, settings: Settings, fallback: DemoRepository):
        self.settings = settings
        self.fallback = fallback
        self.rest_url = f"{settings.supabase_url.rstrip('/')}/rest/v1" if settings.supabase_url else ""
        self.headers = {
            "apikey": settings.supabase_service_role_key or "",
            "authorization": f"Bearer {settings.supabase_service_role_key or ''}",
            "content-type": "application/json",
        }

    def get_scenarios(self) -> dict:
        return self.fallback.get_scenarios()

    def create_campaign_context(self, request: CampaignContextRequest) -> dict:
        payload = self.fallback.create_campaign_context(request)
        row = {
            "context_id": payload["context_id"],
            "scenario_id": request.scenario_id,
            "crop": request.crop,
            "product": request.product,
            "objective": request.objective,
            "week_start_date": request.week_start_date,
            "state": request.geography.state,
            "district": request.geography.district,
            "tehsil": request.geography.tehsil,
            "territory_id": request.geography.territory_id,
            "languages": request.audience.languages,
            "device_types": request.audience.device_types,
            "max_target_count": request.audience.max_target_count,
            "channel_preferences": request.channel_preferences,
            "low_bandwidth": request.constraints.low_bandwidth,
            "human_review_required": request.constraints.human_review_required,
            "min_stock_cover_days": request.constraints.min_stock_cover_days,
            "crop_stage": payload["crop_stage"],
            "grower_summary": payload["grower_summary"],
            "weather_insights": payload["weather_insights"],
            "inventory_alerts": payload["inventory_alerts"],
            "source_mode": payload["source_mode"],
        }
        return self._try(lambda: self._upsert("campaign_contexts", row, "context_id") and payload, payload)

    def create_recommendations(self, context_id: str) -> dict:
        fallback = self.fallback.create_recommendations(context_id)

        def action() -> dict:
            rows = self._select("recommendations", {"context_id": context_id}, order="priority_score.desc")
            if rows:
                return self._recommendation_response(context_id, rows)
            for recommendation in fallback["recommendations"]:
                self._upsert(
                    "recommendations",
                    {
                        "recommendation_id": recommendation["recommendation_id"],
                        "plan_id": fallback["plan_id"],
                        "context_id": context_id,
                        **recommendation,
                        "source_mode": fallback["source_mode"],
                    },
                    "recommendation_id",
                )
            return fallback

        return self._try(action, fallback)

    def generate_content(self, request: ContentGenerationRequest) -> dict:
        def action() -> dict:
            rows = self._select("content_variants", {"plan_id": request.plan_id, "recommendation_id": request.recommendation_id})
            if rows:
                fallback = self.fallback.generate_content(request)
                response = {key: value for key, value in fallback.items() if key != "variants"}
                response["variants"] = []
                for row in rows:
                    flags = row.get("safety_flags") or []
                    src = next((f.split(":", 1)[1] for f in flags if f.startswith("source:")), "cache")
                    reason = next((f.split(":", 1)[1] for f in flags if f.startswith("reason:")), None)
                    clean_flags = [f for f in flags if not f.startswith("source:") and not f.startswith("reason:")]
                    
                    response["variants"].append({
                        "content_id": row["content_id"],
                        "format": row["format"],
                        "language": row["language"],
                        "text": row["content_text"],
                        "cta": row.get("cta"),
                        "estimated_read_time_sec": row.get("estimated_read_time_sec"),
                        "approval_state": row["approval_state"],
                        "safety_flags": clean_flags,
                        "generation_source": src,
                        "fallback_reason": reason,
                    })
                return response
            return {}
        
        try:
            return action()
        except Exception as exc:
            import logging
            logging.getLogger(__name__).warning("Supabase cache lookup failed: %s", exc)
            return {}

    def save_content(self, response: dict) -> dict:
        def action() -> dict:
            for variant in response["variants"]:
                flags = variant.get("safety_flags", [])
                src = variant.get("generation_source")
                if src:
                    flags.append(f"source:{src}")
                reason = variant.get("fallback_reason")
                if reason:
                    flags.append(f"reason:{reason}")
                    
                self._upsert(
                    "content_variants",
                    {
                        "content_id": variant["content_id"],
                        "content_batch_id": response.get("content_batch_id", ""),
                        "plan_id": response["plan_id"],
                        "recommendation_id": response["recommendation_id"],
                        "format": variant["format"],
                        "language": variant["language"],
                        "content_text": variant["text"],
                        "cta": variant.get("cta"),
                        "estimated_read_time_sec": variant.get("estimated_read_time_sec"),
                        "approval_state": variant["approval_state"],
                        "safety_flags": flags,
                    },
                    "content_id",
                )
            return response

        return self._try(action, response)

    def approve_content(self, request: ContentApprovalRequest) -> dict:
        fallback = self.fallback.approve_content(request)

        def action() -> dict:
            self._patch("content_variants", {"content_id": request.content_id}, {
                "approval_state": request.approval_state,
                "approved_by": request.reviewer,
                "approved_at": fallback["approved_at"],
            })
            return fallback

        return self._try(action, fallback)

    def get_field_actions(self, plan_id: str) -> dict:
        fallback = self.fallback.get_field_actions(plan_id)

        def action() -> dict:
            rows = self._select("field_actions", {"plan_id": plan_id}, order="priority.desc")
            if not rows:
                for action_row in fallback["actions"]:
                    self._upsert("field_actions", {"plan_id": plan_id, **action_row}, "action_id")
                return fallback
            response = {key: value for key, value in fallback.items() if key != "actions"}
            response["actions"] = [
                {
                    "action_id": row["action_id"],
                    "rep_id": row["rep_id"],
                    "territory_id": row["territory_id"],
                    "priority": row["priority"],
                    "due_date": row["due_date"],
                    "action_type": row["action_type"],
                    "summary": row["summary"],
                    "retailer_ids": row.get("retailer_ids") or [],
                    "recommended_script_id": row.get("recommended_script_id") or "",
                    "success_metric": row.get("success_metric") or "",
                }
                for row in rows
            ]
            return response

        return self._try(action, fallback)

    def get_analytics_summary(self, plan_id: str) -> dict:
        return self.fallback.get_analytics_summary(plan_id)

    def create_export(self, plan_id: str, export_type: str) -> dict:
        fallback = self.fallback.create_export(plan_id, export_type)
        row = {
            "plan_id": plan_id,
            "export_type": export_type,
            "storage_path": fallback["download_url"],
            "exported_by": "demo_user",
        }
        return self._try(lambda: self._insert("export_records", row) and fallback, fallback)

    def _try(self, action, fallback: dict) -> dict:
        try:
            return action()
        except urllib.error.HTTPError as exc:
            import logging
            logging.getLogger(__name__).warning("Supabase HTTP operation failed: %s - %s", exc, exc.read().decode())
            if self.settings.demo_cache_enabled:
                fallback["warnings"] = [*fallback.get("warnings", []), f"Supabase unavailable ({exc}); served demo cache"]
                return fallback
            raise
        except (urllib.error.URLError, TimeoutError, ValueError) as exc:
            import logging
            logging.getLogger(__name__).warning("Supabase operation failed: %s", exc)
            if self.settings.demo_cache_enabled:
                fallback["warnings"] = [*fallback.get("warnings", []), f"Supabase unavailable ({exc}); served demo cache"]
                return fallback
            raise

    def _recommendation_response(self, context_id: str, rows: list[dict[str, Any]]) -> dict:
        fallback = self.fallback.create_recommendations(context_id)
        response = {key: value for key, value in fallback.items() if key != "recommendations"}
        response["context_id"] = context_id
        response["plan_id"] = rows[0].get("plan_id") or fallback["plan_id"]
        response["source_mode"] = rows[0].get("source_mode") or "rules"
        response["recommendations"] = [
            {
                "recommendation_id": row["recommendation_id"],
                "priority_score": row["priority_score"],
                "segment_label": row["segment_label"],
                "target_count": row["target_count"],
                "crop": row["crop"],
                "product": row["product"],
                "channel_strategy": row["channel_strategy"],
                "timing": row["timing"],
                "receptivity": row["receptivity"],
                "expected_impact": row["expected_impact"],
                "reason_codes": row["reason_codes"],
                "human_review_flags": row.get("human_review_flags") or [],
                "blocked": row.get("blocked") or False,
            }
            for row in rows
        ]
        return response

    def _request(self, method: str, path: str, body: Any | None = None, prefer: str | None = None) -> Any:
        headers = dict(self.headers)
        if prefer:
            headers["prefer"] = prefer
        data = json.dumps(body).encode("utf-8") if body is not None else None
        request = urllib.request.Request(f"{self.rest_url}/{path}", data=data, method=method, headers=headers)
        with urllib.request.urlopen(request, timeout=8) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else None

    def _select(self, table: str, filters: dict[str, str], order: str | None = None) -> list[dict[str, Any]]:
        query = {"select": "*"}
        for key, value in filters.items():
            query[key] = f"eq.{value}"
        if order:
            query["order"] = order
        return self._request("GET", f"{table}?{urllib.parse.urlencode(query)}") or []

    def _insert(self, table: str, row: dict[str, Any]) -> Any:
        return self._request("POST", table, [row], prefer="return=representation")

    def _upsert(self, table: str, row: dict[str, Any], conflict_key: str) -> Any:
        path = f"{table}?on_conflict={urllib.parse.quote(conflict_key)}"
        return self._request("POST", path, [row], prefer="resolution=merge-duplicates,return=representation")

    def _patch(self, table: str, filters: dict[str, str], values: dict[str, Any]) -> Any:
        query = urllib.parse.urlencode({key: f"eq.{value}" for key, value in filters.items()})
        return self._request("PATCH", f"{table}?{query}", values, prefer="return=representation")
