test("always passes", () => {
  expect(true).toBe(true);
});

test("always fails", () => {
  expect(true).toBe(false);
});

test("always throws an error", () => {
  throw new Error("This is an error");
});
