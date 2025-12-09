import pick from "./pick";

const test = () => {
  // 1. Basic pick usage
  const p1 = pick({ a: 1, b: 2, c: 3 }, ["a", "c"]);
  console.log(
    "Test 1:",
    JSON.stringify(p1) === JSON.stringify({ a: 1, c: 3 }) ? "PASS" : "FAIL",
    p1
  );

  // 2. Sort string "date desc"
  const p2 = pick({ sort: "date desc", other: "ignore" }, ["sort"]);
  // Expected: { sort: { date: -1 } }
  console.log(
    "Test 2:",
    JSON.stringify(p2) === JSON.stringify({ sort: { date: -1 } })
      ? "PASS"
      : "FAIL",
    p2
  );

  // 3. Sort string "title asc"
  const p3 = pick({ sort: "title asc" }, ["sort"]);
  console.log(
    "Test 3:",
    JSON.stringify(p3) === JSON.stringify({ sort: { title: 1 } })
      ? "PASS"
      : "FAIL",
    p3
  );

  // 4. Sort string "simple"
  const p4 = pick({ sort: "simple" }, ["sort"]);
  console.log(
    "Test 4:",
    JSON.stringify(p4) === JSON.stringify({ sort: { simple: 1 } })
      ? "PASS"
      : "FAIL",
    p4
  );

  // 5. Empty sort
  const p5 = pick({ sort: "" }, ["sort"]);
  // "" split is [""] -> field="" -> likely { "": 1 } or similar. Ideally should be handled gracefully or produce empty object?
  // Current logic: field="", object becomes { "": 1 }. Mongoose might handle or ignore.
  console.log("Test 5 (Empty):", p5);
};

test();
