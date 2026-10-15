import test from "node:test";
import assert from "node:assert/strict";
import { getConstructionRevealTiming } from "../lib/building-progress/progress-animation";
import { planRevealWorker } from "../lib/building-progress/reveal-worker-motion";

test("Small reveals use one hammer contact; larger reveals spread work across the available time", () => {
  for (const [target, expectedHits, expectedPoints] of [[5, 1, 1], [25, 3, 2], [50, 6, 4], [100, 8, 8]]) {
    const { durationMs } = getConstructionRevealTiming(0, target);
    const stations = planRevealWorker(target, durationMs);
    assert.equal(stations.length, expectedPoints);
    assert.equal(stations.reduce((total, station) => total + station.hitsMs.length, 0), expectedHits);
    assert.equal(stations[0].startMs, 0);
    const last = stations.at(-1)!;
    assert.ok(Math.abs(last.startMs + last.workMs - durationMs) < .001, "Work must fit the actual reveal instead of delaying its completion");
    stations.forEach((station, index) => {
      assert.ok(station.x > .2 && station.x < .8, "The robot stays near the central building area");
      assert.ok(station.hitsMs.every((hit) => hit > station.startMs && hit < station.startMs + station.workMs), "Hammer contacts must happen while working, never during a displacement");
      if (index < stations.length - 1) {
        assert.ok(station.travelMs >= 40 && station.travelMs <= 75);
        assert.ok(Math.abs(stations[index + 1].startMs - station.startMs - station.workMs - station.travelMs) < .001);
      } else {
        assert.equal(station.travelMs, 0, "The final position holds for the confirmation gesture");
      }
    });
  }
});

test("Side changes follow the faster early frontier without staying on one side for most of a large reveal", () => {
  const { durationMs } = getConstructionRevealTiming(0, 100);
  const stations = planRevealWorker(100, durationMs);
  assert.ok(stations[1].startMs < durationMs * .1, "The robot must change sides early while the building is being revealed fastest");
  assert.ok(stations.every((station) => station.workMs + station.travelMs < durationMs * .3), "No position should occupy most of the reveal");
  assert.ok(stations[0].travelMs < stations.at(-2)!.travelMs, "Displacements must respond to the actual frontier speed instead of keeping one constant duration");
  assert.ok(stations[0].workMs < stations.at(-1)!.workMs, "The work cadence can settle as the frontier slows near completion");
  for (let index = 1; index < stations.length; index++) {
    assert.notEqual(stations[index].facing, stations[index - 1].facing);
  }
});

test("A zero or invalid result never schedules simulated construction", () => {
  assert.deepEqual(planRevealWorker(0, 0), []);
  assert.deepEqual(planRevealWorker(-5, 320), []);
  assert.deepEqual(planRevealWorker(Number.NaN, 320), []);
  assert.deepEqual(planRevealWorker(50, 0), []);
  assert.deepEqual(planRevealWorker(50, Number.NaN), []);
  assert.equal(planRevealWorker(1, getConstructionRevealTiming(0, 1).durationMs)[0].hitsMs.length, 1);
});
