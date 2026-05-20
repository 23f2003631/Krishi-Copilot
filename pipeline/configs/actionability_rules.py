# Actionability classification rules for recommendations

def determine_actionability(blocked: bool, has_review_flags: bool, data_quality_warnings: list) -> str:
    """
    Determine the actionability status based on structured business logic.
    
    Parameters
    ----------
    blocked : bool
        Whether the recommendation is blocked by stock/guardrails.
    has_review_flags : bool
        Whether the recommendation has human review flags triggered.
    data_quality_warnings : list
        List of data quality warnings.
        
    Returns
    -------
    str
        "Ready to Execute" | "Needs Human Review" | "Blocked"
    """
    if blocked:
        return "Blocked"
    
    # If there are human review flags or high/medium data quality warnings,
    # prompt the operator for a review before executing.
    if has_review_flags or len(data_quality_warnings) > 0:
        return "Needs Human Review"
        
    return "Ready to Execute"
