import random
from typing import List, Optional

def randomize_participant(arms: List[dict]) -> Optional[str]:
    """
    Pick a study arm based on randomization weights.
    Returns the string ID of the chosen arm.
    """
    if not arms:
        return None
        
    # Total weight
    total_weight = sum(arm.get("randomizationWeight", 1) for arm in arms)
    if total_weight == 0:
        return random.choice(arms).get("id")
        
    # Generate a random number from 0 to total_weight
    r = random.uniform(0, total_weight)
    
    upto = 0
    for arm in arms:
        weight = arm.get("randomizationWeight", 1)
        if upto + weight >= r:
            return arm.get("id")
        upto += weight
        
    return arms[-1].get("id")
