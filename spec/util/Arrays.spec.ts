import * as Arrays from "../../src/util/Arrays";

describe("Arrays", () => {
  it("should be defined", () => {
    expect(Arrays).toBeDefined();
  });

  describe("#flatten", () => {
    it("should be defined", () => {
      expect(Arrays.flatten).toBeDefined();
    });
    it("should return [] when flattening []", () => {
      const actual = Arrays.flatten([]);
      expect(actual).toEqual([]);
    });

    it("should do nothing on flat arrays", () => {
      const flatArray = [1, 2];
      expect(Arrays.flatten(flatArray)).toEqual(flatArray);
    });

    it("should flatten an array", () => {
      const bumpyArray = [1, [2, 3], [4, [5, 6]]];
      expect(Arrays.flatten(bumpyArray)).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("should flatten nested empty []", () => {
      const bumpyArray = [[]];
      expect(Arrays.flatten(bumpyArray)).toEqual([]);
    });
  });
});
