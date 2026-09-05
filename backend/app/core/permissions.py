from enum import Enum

class Action(str, Enum):
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    UPDATE_ANY = "update:any"
    DELETE_ANY = "delete:any"

class Resource(str, Enum):
    OFFER = "offer"
    SKILL = "skill"
    ROLE = "role"
    EXPERIENCE = "experience"

def perm(action: Action, resource: Resource) -> str:
    """Generates the normalized permission string: example:'update:any_offer' or 'create:skill'"""        
    if ":" in action.value:
        act, scope = action.value.split(":")
        return f"{act}:{scope}_{resource.value}"
    return f"{action.value}:{resource.value}"
