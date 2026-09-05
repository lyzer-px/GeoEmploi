from enum import Enum


class Action(str, Enum):
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    CREATE_ANY = "create:any"
    READ_ANY = "read:any"
    UPDATE_ANY = "update:any"
    DELETE_ANY = "delete:any"


class Resource(str, Enum):
    OFFER = "offer"
    SKILL = "skill"
    ROLE = "role"
    EXPERIENCE = "experience"
    APPLICATION = "application"


ANY_ACTION: dict[Action] = {
    Action.UPDATE: Action.UPDATE_ANY,
    Action.DELETE: Action.DELETE_ANY,
}


def perm(action: Action, resource: Resource) -> str:
    """Generates the normalized permission string: example:'update:any_offer' or 'create:skill'"""
    if ":" in action.value:
        act, scope = action.value.split(":")
        return f"{act}:{scope}_{resource.value}"
    return f"{action.value}:{resource.value}"
