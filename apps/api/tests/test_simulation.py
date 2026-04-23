from app.services.simulation import simulation_service


def test_step_progression_raises_risk() -> None:
    initial = simulation_service.state_for_step(0)
    progressed = simulation_service.state_for_step(5)
    assert progressed["summary_metrics"]["city_risk_score"] > initial["summary_metrics"]["city_risk_score"]
    assert progressed["domain_scores"]["emergency_delay"] >= 83


def test_actions_reduce_after_peak_state() -> None:
    final_state = simulation_service.apply_actions(
        [
            "ambulance_green_wave",
            "reroute_general_traffic",
            "issue_sensitive_zone_alert",
            "reduce_non_critical_hvac_load",
        ]
    )
    assert final_state["summary_metrics"]["city_risk_score"] == 58
    assert final_state["impact_summary"]["energy_shift_kw"] == 74

