import json
import statistics
from collections import Counter, defaultdict

PROFILE_PATH = "/Users/brunoafonso/Downloads/profiling-data.26-03-2026.22-40-05.json"


def main() -> None:
    with open(PROFILE_PATH) as f:
        data = json.load(f)

    root = data["dataForRoots"][0]
    commits = root["commitData"]

    name_by_id: dict[int, str] = {}
    for snapshot in root.get("snapshots", []):
        if isinstance(snapshot, list) and len(snapshot) >= 2 and isinstance(snapshot[1], dict):
            node = snapshot[1]
            node_id = node.get("id")
            node_name = node.get("displayName")
            if node_id is not None and node_name:
                name_by_id[node_id] = node_name

    for commit in commits:
        for updater in commit.get("updaters") or []:
            node_id = updater.get("id")
            node_name = updater.get("displayName")
            if node_id is not None and node_name:
                name_by_id[node_id] = node_name

    durations = [commit["duration"] for commit in commits]
    sorted_durations = sorted(durations)

    print("COMMITS", len(commits))
    print("TOTAL_MS", round(sum(durations), 2))
    print("AVG_MS", round(statistics.mean(durations), 3))
    print("MEDIAN_MS", round(statistics.median(durations), 3))

    for pctl in (90, 95, 99):
        idx = min(len(sorted_durations) - 1, int(round((pctl / 100) * (len(sorted_durations) - 1))))
        print(f"P{pctl}_MS", sorted_durations[idx])

    print("MAX_MS", max(durations))
    print("OVER_4MS", sum(1 for value in durations if value > 4))
    print("OVER_8MS", sum(1 for value in durations if value > 8))
    print("OVER_16MS", sum(1 for value in durations if value > 16))

    print("\nTOP_COMMITS")
    for commit in sorted(commits, key=lambda item: item["duration"], reverse=True)[:12]:
        updaters = sorted({(updater.get("displayName") or f"id:{updater.get('id')}") for updater in (commit.get("updaters") or [])})
        print(round(commit["duration"], 2), commit.get("priorityLevel"), "updaters=", ",".join(updaters))

    updater_count: Counter[str] = Counter()
    updater_duration: defaultdict[str, float] = defaultdict(float)
    for commit in commits:
        updaters = {(updater.get("displayName") or f"id:{updater.get('id')}") for updater in (commit.get("updaters") or [])}
        for updater in updaters:
            updater_count[updater] += 1
            updater_duration[updater] += commit["duration"]

    print("\nUPDATERS_BY_COUNT")
    for updater, count in updater_count.most_common(12):
        print(updater, count, round(updater_duration[updater], 2))

    fiber_actual: defaultdict[int, float] = defaultdict(float)
    fiber_self: defaultdict[int, float] = defaultdict(float)
    render_count: Counter[int] = Counter()

    for commit in commits:
        for fiber_id, ms in commit.get("fiberActualDurations") or []:
            fiber_actual[fiber_id] += ms
            render_count[fiber_id] += 1
        for fiber_id, ms in commit.get("fiberSelfDurations") or []:
            fiber_self[fiber_id] += ms

    print("\nTOP_FIBERS_BY_ACTUAL")
    for fiber_id, total in sorted(fiber_actual.items(), key=lambda kv: kv[1], reverse=True)[:25]:
        print(fiber_id, name_by_id.get(fiber_id, f"id:{fiber_id}"), round(total, 2), round(fiber_self[fiber_id], 2), render_count[fiber_id])

    print("\nTOP_FIBERS_BY_SELF")
    for fiber_id, total in sorted(fiber_self.items(), key=lambda kv: kv[1], reverse=True)[:25]:
        print(fiber_id, name_by_id.get(fiber_id, f"id:{fiber_id}"), round(total, 2), round(fiber_actual[fiber_id], 2), render_count[fiber_id])

    priorities = Counter(commit.get("priorityLevel") for commit in commits)
    print("\nPRIORITY", dict(priorities))

    effects = [commit.get("effectDuration") for commit in commits if commit.get("effectDuration") is not None]
    passive_effects = [commit.get("passiveEffectDuration") for commit in commits if commit.get("passiveEffectDuration") is not None]

    print("EFFECT_SUM_MAX", round(sum(effects), 2) if effects else 0, max(effects) if effects else 0)
    print("PASSIVE_SUM_MAX", round(sum(passive_effects), 2) if passive_effects else 0, max(passive_effects) if passive_effects else 0)


if __name__ == "__main__":
    main()
